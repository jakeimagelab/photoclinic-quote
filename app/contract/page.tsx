"use client";
import { useEffect, useRef, useState } from "react";

interface QuoteData {
  hospitalName: string;
  contactName: string;
  phone: string;
  email: string;
  quoteNumber: string;
  quoteDate: string;
  shootDate: string | null;
  validUntil: string;
  items: { name: string; detail: string; unitPrice: number; qty: number; subtotal: number; note: string }[];
  supplyAmount: number;
  discountAmount: number;
  vat: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  memos: string | null;
}

const C = {
  teal: "#155855", orange: "#E85D2C",
  bg: "#EDF5F3", surface: "#FFFFFF", border: "#C8DDD9",
  muted: "#5A7470", hint: "#9BB5B0", txt: "#1C2B28", mint: "#EAF4F2",
};

const fmt = (n: number) => (n || 0).toLocaleString("ko-KR");

export default function ContractPage() {
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const [quote,      setQuote]      = useState<QuoteData | null>(null);
  const [contractHtml, setContractHtml] = useState("");
  const [sending,    setSending]    = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [sendResult, setSendResult] = useState("");
  const [toEmail,    setToEmail]    = useState("");
  const [toName,     setToName]     = useState("");
  const [mailMsg,    setMailMsg]    = useState("");
  const [error,      setError]      = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw    = params.get("data");
    if (!raw) return;
    try {
      const data: QuoteData = JSON.parse(decodeURIComponent(raw));
      setQuote(data);
      setToEmail(data.email || "");
      setToName(data.contactName || "");
      const html = buildContractHtml(data);
      setContractHtml(html);
    } catch (e) {
      setError("견적 데이터를 불러올 수 없습니다.");
    }
  }, []);

  const createContractPdf = async () => {
    if (!quote || !previewFrameRef.current?.contentDocument?.body) {
      throw new Error("계약서 미리보기를 불러온 뒤 다시 시도해주세요.");
    }

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf")
    ]);

    const doc = previewFrameRef.current.contentDocument;
    const body = doc.body;
    const html = doc.documentElement;
    const width = Math.max(body.scrollWidth, html.scrollWidth, body.offsetWidth, html.offsetWidth);
    const height = Math.max(body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight);

    if (doc.fonts?.ready) {
      await doc.fonts.ready;
    }

    const canvas = await html2canvas(body, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const image = canvas.toDataURL("image/png");

    let position = 0;
    let remainingHeight = imgHeight;
    pdf.addImage(image, "PNG", 0, position, imgWidth, imgHeight);
    remainingHeight -= pageHeight;

    while (remainingHeight > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(image, "PNG", 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
    }

    return pdf;
  };

  const contractFileName = () =>
    `포토클리닉_계약서_${quote?.hospitalName || "고객"}_${quote?.quoteDate || ""}.pdf`;

  const downloadPdf = async () => {
    if (!contractHtml || !quote) return;
    setPdfGenerating(true); setError("");
    try {
      const pdf = await createContractPdf();
      pdf.save(contractFileName());
    } catch (e: any) {
      setError(e.message || "PDF 생성에 실패했습니다.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const sendMail = async () => {
    if (!toEmail) { setError("수신 이메일을 입력해주세요"); return; }
    if (!contractHtml || !quote) return;
    setSending(true); setError(""); setSendResult("");
    try {
      const pdf = await createContractPdf();
      const contractPdfBase64 = pdf.output("datauristring").split(",")[1];
      const res  = await fetch("/api/send-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to:           toEmail,
          toName,
          hospitalName: quote.hospitalName,
          contractHtml,
          contractPdfBase64,
          fileName:      contractFileName(),
          message:      mailMsg,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSendResult("✓ 계약서 메일 발송 완료!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const iS: React.CSSProperties = {
    width: "100%", border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
    background: C.surface, color: C.txt, outline: "none",
  };

  if (error && !quote) return (
    <div style={{ padding: 40, textAlign: "center", color: C.orange }}>{error}</div>
  );

  if (!quote) return (
    <div style={{ padding: 60, textAlign: "center", color: C.muted }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
      견적 데이터를 불러오는 중...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, height: 54,
                    padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(21,88,85,.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#E85D2C"/>
            <circle cx="12" cy="12" r="11" fill="#155855" clipPath="url(#ncc)"/>
            <defs><clipPath id="ncc"><rect x="12" y="0" width="12" height="24"/></clipPath></defs>
            <circle cx="12" cy="12" r="7" fill="#EB8F22"/>
            <circle cx="12" cy="12" r="7" fill="#569082" clipPath="url(#ncc)"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>PHOTO CLINIC · 촬영 계약서</div>
            <div style={{ fontSize: 9, color: C.hint }}>{quote.hospitalName} · {quote.quoteNumber}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.history.back()}
            style={{ height: 34, padding: "0 14px", background: C.surface, border: `1px solid ${C.border}`,
                     borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: C.muted }}>
            ← 견적서로
          </button>
          <button onClick={downloadPdf} disabled={pdfGenerating}
            style={{ height: 34, padding: "0 14px", background: C.teal, color: "#fff",
                     border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
                     cursor: "pointer", fontFamily: "inherit" }}>
            {pdfGenerating ? "PDF 생성 중..." : "PDF 저장"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px", display: "grid",
                    gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* 계약서 미리보기 */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ background: C.mint, padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
                         display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>계약서 미리보기</div>
            <div style={{ fontSize: 11, color: C.muted }}>미리보기 내용 그대로 PDF 생성</div>
          </div>
          <div style={{ padding: 16, background: "#F8FAFA" }}>
            <iframe ref={previewFrameRef} srcDoc={contractHtml} style={{ width: "100%", height: 700,
                                                     border: `1px solid ${C.border}`,
                                                     borderRadius: 8, background: "#fff" }}
                    title="계약서 미리보기"/>
          </div>
        </div>

        {/* 오른쪽: 액션 패널 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 70 }}>

          {/* 견적 요약 */}
          <div style={{ background: C.teal, borderRadius: 14, padding: "16px 18px", color: "#fff" }}>
            <div style={{ fontSize: 11, opacity: .7, marginBottom: 6 }}>계약 금액</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>{fmt(quote.totalAmount)}원</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, opacity: .7, marginBottom: 2 }}>선금 (50%)</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(quote.depositAmount)}원</div>
              </div>
              <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, opacity: .7, marginBottom: 2 }}>잔금 (50%)</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(quote.balanceAmount)}원</div>
              </div>
            </div>
          </div>

          {/* PDF 다운로드 */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 8 }}>📄 PDF 저장</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
              계약서 미리보기 내용 그대로<br/>PDF 파일을 생성합니다.
            </div>
            <button onClick={downloadPdf} disabled={pdfGenerating}
              style={{ width: "100%", height: 42, background: C.teal, color: "#fff", border: "none",
                       borderRadius: 9, fontSize: 13, fontWeight: 700,
                       cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {pdfGenerating ? "PDF 생성 중..." : "계약서 PDF 다운로드"}
            </button>
          </div>

          {/* 메일 발송 */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 10 }}>📧 메일 발송</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, display: "block", marginBottom: 3 }}>
                  수신 이메일 *
                </label>
                <input value={toEmail} onChange={e => setToEmail(e.target.value)}
                  placeholder="hospital@email.com" style={iS}/>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, display: "block", marginBottom: 3 }}>
                  담당자명
                </label>
                <input value={toName} onChange={e => setToName(e.target.value)}
                  placeholder="홍길동 원장님" style={iS}/>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, display: "block", marginBottom: 3 }}>
                  메일 본문 (선택)
                </label>
                <textarea value={mailMsg} onChange={e => setMailMsg(e.target.value)} rows={3}
                  placeholder="계약서를 발송드립니다. 확인 후 서명하여 회신 부탁드립니다."
                  style={{ ...iS, resize: "vertical" }}/>
              </div>

              {error && (
                <div style={{ padding: "8px 12px", background: "#FFF0EB", border: `1px solid #FACCB8`,
                               borderRadius: 7, fontSize: 11, color: C.orange }}>⚠ {error}</div>
              )}
              {sendResult && (
                <div style={{ padding: "8px 12px", background: C.mint, border: `1px solid ${C.teal}`,
                               borderRadius: 7, fontSize: 12, fontWeight: 700, color: C.teal }}>
                  {sendResult}
                </div>
              )}

              <button onClick={sendMail} disabled={sending || !toEmail}
                style={{ width: "100%", height: 42, background: sending ? C.hint : C.orange,
                         color: "#fff", border: "none", borderRadius: 9, fontSize: 13,
                         fontWeight: 700, cursor: sending || !toEmail ? "not-allowed" : "pointer",
                         fontFamily: "inherit", display: "flex", alignItems: "center",
                         justifyContent: "center", gap: 6 }}>
                {sending ? "PDF 생성 및 발송 중..." : "📨 PDF 생성 후 메일 발송"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── 계약서 HTML 생성 (고정 템플릿 + 데이터 채우기) ──────────
function buildContractHtml(q: QuoteData): string {
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const itemRows = q.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${item.name}</strong>${item.detail ? `<br><span style="font-size:10px;color:#6B8B87;">${item.detail}</span>` : ""}</td>
      <td style="text-align:center;">${item.qty}</td>
      <td style="text-align:right;">${fmt(item.unitPrice)}원</td>
      <td style="text-align:right;font-weight:700;color:#155855;">${fmt(item.subtotal)}원</td>
      <td style="color:#9BB5B0;font-size:10px;">${item.note || ""}</td>
    </tr>`).join("");

  const section = (num: string, title: string, content: string) => `
  <div class="section">
    <h3><span class="art">${num}</span>${title}</h3>
    <div class="clause">${content}</div>
  </div>`;

  // 고정 조항 (병원 촬영 전문)
  const scope       = `을(포토클리닉)은 갑(${q.hospitalName})의 병원 브랜드 이미지 구축을 위한 전문 촬영 서비스를 제공합니다.\n촬영 범위는 본 계약서 제2조의 항목에 한하며, 납품 결과물은 색보정이 완료된 JPG 파일로 제공됩니다.\n촬영 항목 외 추가 촬영 시 별도 견적을 협의합니다.`;
  const deliverables = `납품 파일: 색보정 완료 JPG (고해상도, 인쇄 및 디지털 사용 가능)\n전달 방법: 클라우드 링크(Google Drive 또는 WeTransfer) 또는 USB 전달\n납품 수량: 촬영 항목별 협의된 수량 기준 (현장 상황에 따라 ±10% 조정 가능)\n파일 보관: 납품 후 60일간 원본 보관, 이후 삭제`;
  const schedule     = `촬영 예정일: ${q.shootDate || "상호 협의 후 확정"}\n촬영 당일 준비사항은 사전 협의된 촬영 가이드를 따릅니다.\n최종 납품은 촬영 완료일로부터 영업일 기준 10~14일 이내를 원칙으로 합니다.\n보정 기간 중 천재지변 등 불가항력 사유 발생 시 일정은 상호 협의합니다.`;
  const payment      = `계약 체결 시 선금(계약금) ${fmt(q.depositAmount)}원을 납부하며, 잔금 ${fmt(q.balanceAmount)}원은 최종 납품 파일 전달 전 납부합니다.\n입금 계좌: ○○은행 000-000-000000 (예금주: 정연호)\n계약금 입금 확인 후 촬영 일정이 공식 확정됩니다.\n세금계산서는 요청 시 발행 가능합니다.`;
  const copyright    = `촬영 결과물의 저작권은 을(포토클리닉)에게 귀속되며, 갑에게는 비독점적 사용권을 부여합니다.\n갑은 결과물을 병원 홈페이지, SNS, 인쇄물, 홍보물 등 자체 마케팅 목적으로 자유롭게 사용할 수 있습니다.\n결과물의 제3자 판매, 양도, 재허가는 금지됩니다.\n을은 포트폴리오 및 마케팅 목적으로 결과물 일부를 사용할 수 있으며, 갑은 이에 동의합니다.\n민감한 의료 정보가 포함된 이미지는 갑의 사전 동의 없이 공개하지 않습니다.`;
  const cancellation = `촬영 30일 전 취소: 계약금 전액 환불\n촬영 14일 전 취소: 계약금의 50% 환불\n촬영 7일 전 취소: 계약금 환불 불가\n촬영 3일 전 취소: 계약금 환불 불가 + 총 금액의 20% 위약금 청구\n촬영 당일 취소: 계약금 환불 불가 + 총 금액의 30% 위약금 청구\n단, 을의 귀책 사유로 인한 취소 시에는 계약금 전액 환불 및 동일 금액의 손해배상을 지급합니다.\n천재지변, 코로나 등 불가항력 사유는 상호 협의하여 처리합니다.`;
  const retake       = `납품 후 색보정 수정은 1회에 한해 무상으로 제공합니다.\n구도·구성·인물 등 촬영 자체의 문제가 을의 귀책 사유인 경우 재촬영을 무상으로 진행합니다.\n갑의 요청에 의한 추가 수정 또는 재촬영은 별도 비용이 발생합니다.\n납품 파일 수령 후 14일이 지난 수정 요청은 유상으로 처리합니다.`;
  const confidential = `을은 촬영 과정에서 취득한 병원 내부 정보(환자 정보, 경영 정보 등)를 외부에 공개하지 않습니다.\n결과물은 갑의 승인 전 SNS 등 외부 채널에 공개하지 않습니다.\n갑의 승인 후 을의 포트폴리오 채널(@photoclinic_kr)에 게시될 수 있으며, 갑은 이에 동의합니다.`;
  const dispute      = `본 계약과 관련한 분쟁은 상호 협의를 우선으로 하며, 협의가 이루어지지 않을 경우 서울중앙지방법원을 관할 법원으로 합니다.\n본 계약서에 명시되지 않은 사항은 상관습 및 민법의 관련 규정에 따릅니다.`;
  const special      = `${q.memos ? `【메모】 ${q.memos}\n\n` : ""}본 계약서는 양 당사자가 서명(또는 날인)한 시점부터 법적 효력이 발생합니다.\n구두 합의 사항은 본 계약서에 반영된 경우에 한하여 효력을 인정합니다.\n촬영 현장에서의 안전사고에 대한 책임은 각 당사자가 부담합니다.`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>포토클리닉 촬영 계약서 · ${q.hospitalName}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Noto Sans KR',sans-serif;color:#1C2B28;background:#fff;
       padding:40px 52px;font-size:12px;line-height:1.8;max-width:900px;margin:0 auto;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;
          margin-bottom:28px;padding-bottom:16px;border-bottom:2.5px solid #155855;}
  .brand{font-size:13px;font-weight:700;color:#155855;letter-spacing:1.5px;}
  .brand-sub{font-size:10px;color:#9BB5B0;margin-top:3px;}
  .doc-title{font-size:22px;font-weight:700;color:#1C2B28;letter-spacing:4px;text-align:right;}
  .doc-meta{font-size:11px;color:#6B8B87;text-align:right;margin-top:4px;line-height:1.6;}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;}
  .party{border:1px solid #C8DDD9;border-radius:8px;padding:13px 15px;background:#FAFCFC;}
  .party h3{font-size:9px;font-weight:700;color:#9BB5B0;text-transform:uppercase;
            letter-spacing:.1em;margin-bottom:9px;padding-bottom:5px;border-bottom:1px solid #EEF4F3;}
  .party .row{display:flex;gap:8px;padding:2.5px 0;font-size:11px;}
  .party .k{color:#6B8B87;min-width:48px;flex-shrink:0;}
  .party .v{font-weight:600;color:#1C2B28;}
  .section{margin-bottom:18px;}
  .section h3{font-size:12px;font-weight:700;color:#155855;margin-bottom:7px;
              padding-bottom:5px;border-bottom:1px solid #C8DDD9;
              display:flex;align-items:center;gap:7px;}
  .art{display:inline-block;background:#155855;color:#fff;font-size:9px;font-weight:700;
       padding:2px 7px;border-radius:10px;flex-shrink:0;}
  .clause{background:#F8FAFE;border-left:3px solid #155855;padding:10px 14px;
          border-radius:0 7px 7px 0;font-size:11px;line-height:1.9;color:#2C3E3D;
          white-space:pre-line;}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:10px;}
  th{background:#EAF4F2;padding:7px 10px;text-align:left;font-size:10px;
     font-weight:700;color:#155855;border-bottom:2px solid #C8DDD9;}
  td{padding:7px 10px;border-bottom:1px solid #EEF4F3;vertical-align:top;}
  .amt-wrap{display:flex;justify-content:flex-end;margin-top:6px;}
  .amt-box{min-width:260px;}
  .amt-row{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;
           border-bottom:.5px solid #EEF4F3;}
  .amt-row .l{color:#6B8B87;}
  .amt-total{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;
             font-weight:700;color:#155855;border-top:2px solid #155855;margin-top:2px;}
  .pay-boxes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;}
  .pay-box{border:1px solid #C8DDD9;border-radius:7px;padding:12px;text-align:center;background:#FAFCFC;}
  .pay-box .pt{font-size:10px;color:#9BB5B0;margin-bottom:3px;}
  .pay-box .pa{font-size:18px;font-weight:700;color:#155855;}
  .pay-box .ps{font-size:10px;color:#9BB5B0;margin-top:2px;}
  .effect-box{background:#EAF4F2;border:1px solid #C8DDD9;border-radius:7px;
              padding:12px 16px;margin:24px 0 16px;font-size:11px;
              color:#2C3E3D;line-height:1.9;text-align:center;}
  .sign-area{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
  .sign-box{border:1px solid #C8DDD9;border-radius:9px;padding:16px 18px;}
  .sign-box h4{font-size:11px;font-weight:700;color:#6B8B87;margin-bottom:12px;
               padding-bottom:5px;border-bottom:1px solid #EEF4F3;}
  .sl{display:flex;gap:7px;align-items:center;margin-bottom:8px;}
  .sl .sk{font-size:11px;color:#9BB5B0;min-width:44px;}
  .sl .sv{font-size:12px;font-weight:600;color:#1C2B28;border-bottom:1px solid #C8DDD9;
          flex:1;padding-bottom:2px;min-height:18px;}
  .stamp{margin-top:12px;height:56px;border:1px dashed #C8DDD9;border-radius:6px;
         display:flex;align-items:center;justify-content:center;font-size:10px;color:#C8DDD9;}
  .footer{margin-top:24px;text-align:center;font-size:10px;color:#9BB5B0;
          padding-top:12px;border-top:1px solid #EEF4F3;}
  @media print{body{padding:16px 24px;} @page{size:A4;margin:1cm;}}
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">PHOTO CLINIC</div>
    <div class="brand-sub">제이크이미지연구소 · 병원 전문 브랜드 촬영</div>
    <div class="brand-sub">사업자번호: 000-00-00000</div>
  </div>
  <div>
    <div class="doc-title">촬 영 계 약 서</div>
    <div class="doc-meta">
      계약일: ${today}<br>
      견적번호: ${q.quoteNumber || "PC-" + new Date().toISOString().slice(0,10).replace(/-/g,"")}
    </div>
  </div>
</div>

<div class="parties">
  <div class="party">
    <h3>발주자 (갑)</h3>
    <div class="row"><span class="k">병원명</span><span class="v">${q.hospitalName || "-"}</span></div>
    <div class="row"><span class="k">담당자</span><span class="v">${q.contactName || "-"}</span></div>
    <div class="row"><span class="k">연락처</span><span class="v">${q.phone || "-"}</span></div>
    <div class="row"><span class="k">이메일</span><span class="v">${q.email || "-"}</span></div>
  </div>
  <div class="party">
    <h3>수탁자 (을)</h3>
    <div class="row"><span class="k">상호</span><span class="v">포토클리닉 (제이크이미지연구소)</span></div>
    <div class="row"><span class="k">대표자</span><span class="v">정연호</span></div>
    <div class="row"><span class="k">연락처</span><span class="v">010-0000-0000</span></div>
    <div class="row"><span class="k">계좌</span><span class="v">○○은행 000-000-000000 (정연호)</span></div>
  </div>
</div>

${section("제1조", "계약 목적 및 촬영 범위", scope)}

<div class="section">
  <h3><span class="art">제2조</span>촬영 항목 및 계약 금액</h3>
  <table>
    <thead>
      <tr>
        <th style="width:28px;">No.</th>
        <th>항목명</th>
        <th style="width:44px;text-align:center;">수량</th>
        <th style="width:100px;text-align:right;">단가</th>
        <th style="width:105px;text-align:right;">소계</th>
        <th style="width:60px;">비고</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="amt-wrap">
    <div class="amt-box">
      <div class="amt-row"><span class="l">공급가액</span><span>${fmt(q.supplyAmount)}원</span></div>
      ${q.discountAmount > 0 ? `<div class="amt-row"><span class="l">할인금액</span><span style="color:#E85D2C;">-${fmt(q.discountAmount)}원</span></div>` : ""}
      <div class="amt-row"><span class="l">부가세 (10%)</span><span>${fmt(q.vat)}원</span></div>
      <div class="amt-total"><span>최종 계약금액</span><span>${fmt(q.totalAmount)}원</span></div>
    </div>
  </div>
</div>

<div class="section">
  <h3><span class="art">제3조</span>결제 조건</h3>
  <div class="clause">${payment}</div>
  <div class="pay-boxes">
    <div class="pay-box">
      <div class="pt">계약금 (선금 50%)</div>
      <div class="pa">${fmt(q.depositAmount)}원</div>
      <div class="ps">계약 체결 시 납부</div>
    </div>
    <div class="pay-box">
      <div class="pt">잔금 (50%)</div>
      <div class="pa">${fmt(q.balanceAmount)}원</div>
      <div class="ps">납품 파일 전달 전 납부</div>
    </div>
  </div>
</div>

${section("제4조", "납품물 및 전달 방식", deliverables)}
${section("제5조", "촬영 일정 및 납품 기한", schedule)}
${section("제6조", "저작권 및 사용권", copyright)}
${section("제7조", "취소 및 변경 규정", cancellation)}
${section("제8조", "재촬영 및 수정 요청", retake)}
${section("제9조", "비밀유지 및 결과물 공개", confidential)}
${section("제10조", "분쟁 해결", dispute)}
${section("제11조", "특약사항", special)}

<div class="effect-box">
  위 계약의 성립을 증명하기 위하여 본 계약서를 2부 작성하고, 각 1부씩 보관합니다.<br>
  <strong>${today}</strong>
</div>

<div class="sign-area">
  <div class="sign-box">
    <h4>발주자 (갑)</h4>
    <div class="sl"><span class="sk">병원명</span><span class="sv">${q.hospitalName || ""}</span></div>
    <div class="sl"><span class="sk">담당자</span><span class="sv">${q.contactName || ""}</span></div>
    <div class="sl"><span class="sk">서명일</span><span class="sv"></span></div>
    <div class="sl"><span class="sk">서명</span><span class="sv"></span></div>
    <div class="stamp">직인 / 서명</div>
  </div>
  <div class="sign-box">
    <h4>수탁자 (을)</h4>
    <div class="sl"><span class="sk">상호</span><span class="sv">포토클리닉</span></div>
    <div class="sl"><span class="sk">대표자</span><span class="sv">정연호</span></div>
    <div class="sl"><span class="sk">서명일</span><span class="sv">${today}</span></div>
    <div class="sl"><span class="sk">서명</span><span class="sv"></span></div>
    <div class="stamp">직인 / 서명</div>
  </div>
</div>

<div class="footer">
  PHOTO CLINIC · 제이크이미지연구소 · 병원 전문 브랜드 촬영 · @photoclinic_kr<br>
  본 계약서는 양 당사자가 서명한 시점부터 법적 효력이 발생합니다.
</div>
</body>
</html>`;
}
