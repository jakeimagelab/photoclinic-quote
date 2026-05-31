import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY 미설정" }, { status: 500 });

  const body = await req.json();
  const { to, toName, hospitalName, contractHtml, message } = body;
  if (!to) return NextResponse.json({ ok: false, error: "수신 이메일 없음" }, { status: 400 });

  const emailHtml = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Apple SD Gothic Neo',sans-serif;background:#F0F7F5;padding:32px 16px;margin:0;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="background:#155855;border-radius:14px 14px 0 0;padding:24px 28px;text-align:center;">
      <div style="font-size:10px;color:rgba(255,255,255,.6);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px;">PHOTO CLINIC</div>
      <div style="font-size:20px;font-weight:700;color:#fff;">촬영 계약서 안내</div>
    </div>
    <div style="background:#fff;padding:28px;border:1px solid #C8DDD9;border-top:none;">
      <p style="font-size:15px;font-weight:700;color:#1C2B28;margin-bottom:7px;">
        안녕하세요, ${toName || hospitalName} 담당자님
      </p>
      <p style="font-size:13px;color:#5A7470;line-height:1.8;margin-bottom:18px;">
        ${message || "포토클리닉 촬영 계약서를 발송드립니다.<br>내용 확인 후 서명하여 회신 부탁드립니다."}
      </p>
      <div style="background:#EAF4F2;border-left:4px solid #155855;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:18px;">
        <div style="font-size:11px;font-weight:700;color:#155855;margin-bottom:5px;">📋 계약서 확인 방법</div>
        <div style="font-size:11px;color:#5A7470;line-height:1.8;">
          1. 첨부된 계약서 파일(.html)을 Chrome으로 열어주세요<br>
          2. 내용 검토 후 서명란에 서명·날인하여 회신해 주세요<br>
          3. 계약금 입금 확인 후 촬영 일정이 확정됩니다
        </div>
      </div>
      <p style="font-size:11px;color:#9BB5B0;line-height:1.8;border-top:1px solid #EEF4F3;padding-top:14px;">
        문의사항은 언제든지 연락 주세요.<br>감사합니다. 포토클리닉 드림
      </p>
    </div>
    <div style="background:#EAF4F2;border-radius:0 0 14px 14px;padding:14px 28px;text-align:center;
                border:1px solid #C8DDD9;border-top:none;">
      <div style="font-size:10px;color:#9BB5B0;">PHOTO CLINIC · 제이크이미지연구소 · @photoclinic_kr</div>
    </div>
  </div>
</body>
</html>`;

  const attachmentBase64 = Buffer.from(contractHtml, "utf-8").toString("base64");

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    "포토클리닉 <contract@photoclinic.kr>",
      to:      [to],
      subject: `[포토클리닉] ${hospitalName} 촬영 계약서`,
      html:    emailHtml,
      attachments: [{
        filename: `포토클리닉_계약서_${hospitalName}.html`,
        content:  attachmentBase64,
      }],
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    return NextResponse.json({ ok: false, error: `메일 발송 실패: ${err}` }, { status: 500 });
  }

  const result = await resendRes.json();
  return NextResponse.json({ ok: true, id: result.id });
}
