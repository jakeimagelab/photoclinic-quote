"use client";

import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Plus,
  RefreshCcw,
  Trash2,
  UserRound,
  WalletCards,
  ZoomIn,
  ZoomOut
} from "lucide-react";

type CustomerInfo = {
  companyName: string;
  managerName: string;
  phone: string;
  email: string;
  quoteDate: string;
  validUntil: string;
  shootDate: string;
  quoteNumber: string;
};

type QuoteItem = {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  amount: number;
};

type DiscountItem = {
  id: string;
  name: string;
  amount: number;
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayValue = () => toDateInputValue(new Date());

const addDays = (date: string, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toDateInputValue(next);
};

const createQuoteNumber = () => {
  const date = todayValue().replaceAll("-", "");
  return `JI-${date}-001`;
};

const initialCustomer = (): CustomerInfo => {
  const quoteDate = todayValue();

  return {
    companyName: "",
    managerName: "",
    phone: "",
    email: "",
    quoteDate,
    validUntil: addDays(quoteDate, 14),
    shootDate: "",
    quoteNumber: createQuoteNumber()
  };
};

const amount = (value: number) =>
  new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(value);

const won = (value: number) => `${amount(value)}원`;

const numberValue = (value: string) => {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  const parsed = Number(digitsOnly);
  return Number.isFinite(parsed) ? parsed : 0;
};

const displayDate = (date: string) => date || "-";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const createEmptyItem = (): QuoteItem => ({
  id: crypto.randomUUID(),
  name: "",
  detail: "",
  quantity: 1,
  amount: 0
});

export default function JakeImageQuoteBuilder() {
  const previewRef = useRef<HTMLDivElement>(null);
  const previewShellRef = useRef<HTMLDivElement>(null);
  const [customer, setCustomer] = useState<CustomerInfo>(() => initialCustomer());
  const [quoteTitle, setQuoteTitle] = useState("제이크이미지연구소 브랜드사진 견적서");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    {
      id: crypto.randomUUID(),
      name: "기업 프로필 촬영",
      detail: "대표 및 임직원 프로필 촬영",
      quantity: 1,
      amount: 0
    }
  ]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [memo, setMemo] = useState("촬영 범위와 일정은 상담 후 최종 확정됩니다.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [basePreviewScale, setBasePreviewScale] = useState(0.48);
  const [previewZoom, setPreviewZoom] = useState(1);
  const previewScale = Number((basePreviewScale * previewZoom).toFixed(3));
  const previewPercent = Math.round(previewZoom * 100);

  useEffect(() => {
    const shell = previewShellRef.current;
    if (!shell) return;

    const updateScale = () => {
      const style = window.getComputedStyle(shell);
      const paddingX =
        Number.parseFloat(style.paddingLeft || "0") + Number.parseFloat(style.paddingRight || "0");
      const borderX =
        Number.parseFloat(style.borderLeftWidth || "0") + Number.parseFloat(style.borderRightWidth || "0");
      const shellWidth = shell.getBoundingClientRect().width;
      const availableWidth = Math.max(0, shellWidth - paddingX - borderX - 2);
      const nextScale = Math.min(1, Math.max(0.12, availableWidth / 1123));
      setBasePreviewScale(Number(nextScale.toFixed(3)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(shell);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const visibleQuoteItems = quoteItems.filter(
    (item) => item.name.trim() || item.detail.trim() || item.amount > 0
  );
  const itemSubtotal = quoteItems.reduce(
    (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.amount),
    0
  );
  const visibleDiscountItems = discountItems.filter((item) => item.name.trim() || item.amount > 0);
  const discountTotal = discountItems.reduce((sum, item) => sum + Math.max(0, item.amount), 0);
  const supplyAmount = Math.max(itemSubtotal - discountTotal, 0);
  const vat = Math.round(supplyAmount * 0.1);

  // 추가할인은 부가세 계산까지 끝난 금액에서 입력한 원 단위 그대로 차감합니다.
  // 예: 3,240,000 - 40,000 = 3,200,000
  const beforeExtraDiscountTotal = supplyAmount + vat;
  const extraDiscountAmount = Math.min(Math.max(Number(extraDiscount) || 0, 0), beforeExtraDiscountTotal);
  const finalQuoteAmount = Math.max(beforeExtraDiscountTotal - extraDiscountAmount, 0);
  const finalAmount = finalQuoteAmount;

  const updateCustomer = (key: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const updateQuoteItem = (id: string, key: keyof QuoteItem, value: string | number) => {
    setQuoteItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const addQuoteItem = () => setQuoteItems((items) => [...items, createEmptyItem()]);
  const removeQuoteItem = (id: string) =>
    setQuoteItems((items) => items.filter((item) => item.id !== id));

  const addDiscountItem = () =>
    setDiscountItems((items) => [...items, { id: crypto.randomUUID(), name: "협의 할인", amount: 0 }]);

  const updateDiscountItem = (id: string, key: keyof DiscountItem, value: string | number) => {
    setDiscountItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeDiscountItem = (id: string) =>
    setDiscountItems((items) => items.filter((item) => item.id !== id));

  const resetForm = () => {
    setCustomer(initialCustomer());
    setQuoteTitle("제이크이미지연구소 브랜드사진 견적서");
    setQuoteItems([
      {
        id: crypto.randomUUID(),
        name: "기업 프로필 촬영",
        detail: "대표 및 임직원 프로필 촬영",
        quantity: 1,
        amount: 0
      }
    ]);
    setDiscountItems([]);
    setExtraDiscount(0);
    setMemo("촬영 범위와 일정은 상담 후 최종 확정됩니다.");
  };

  const getPreviewZoomMax = () => {
    if (typeof window === "undefined") return 1.8;
    return window.matchMedia("(max-width: 768px)").matches ? 1.35 : 1.8;
  };

  const keepZoomControlsReachable = () => {
    window.requestAnimationFrame(() => {
      const shell = previewShellRef.current;
      if (!shell) return;
      const maxScrollLeft = Math.max(0, shell.scrollWidth - shell.clientWidth);
      shell.scrollLeft = Math.min(shell.scrollLeft, maxScrollLeft);
    });
  };

  const zoomOutPreview = () => {
    setPreviewZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))));
    keepZoomControlsReachable();
  };

  const zoomInPreview = () => {
    setPreviewZoom((value) => Math.min(getPreviewZoomMax(), Number((value + 0.1).toFixed(1))));
    keepZoomControlsReachable();
  };

  const resetPreviewZoom = () => {
    setPreviewZoom(1);
    window.requestAnimationFrame(() => {
      if (previewShellRef.current) previewShellRef.current.scrollLeft = 0;
    });
  };

  const downloadPdf = async () => {
    if (!previewRef.current || isGenerating) return;

    const pdfWindow = window.open("", "_blank");

    const writeGeneratingWindow = () => {
      if (!pdfWindow) return;
      pdfWindow.document.open();
      pdfWindow.document.write(`
        <!doctype html>
        <html lang="ko">
          <head>
            <title>제이크이미지연구소 견적서 생성 중</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; background: #f3f4f6; color: #162238; }
              .box { text-align: center; padding: 32px; border-radius: 18px; background: #fff; box-shadow: 0 18px 50px rgba(22,34,56,0.12); }
              strong { display: block; margin-bottom: 8px; font-size: 18px; }
              span { color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body><div class="box"><strong>PDF 견적서를 생성하고 있습니다.</strong><span>잠시만 기다려주세요.</span></div></body>
        </html>
      `);
      pdfWindow.document.close();
    };

    const writeErrorWindow = (message: string) => {
      if (!pdfWindow) return;
      pdfWindow.document.open();
      pdfWindow.document.write(`
        <!doctype html>
        <html lang="ko">
          <head>
            <title>제이크이미지연구소 견적서 생성 실패</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; background: #f3f4f6; color: #1f2933; }
              .box { max-width: 520px; margin: 24px; padding: 28px; border-radius: 18px; background: #fff; box-shadow: 0 18px 50px rgba(22,34,56,0.12); }
              strong { display: block; margin-bottom: 10px; color: #162238; font-size: 18px; }
              p { margin: 0 0 10px; color: #6b7280; line-height: 1.6; }
              code { display: block; padding: 12px; border-radius: 10px; background: #f3f4f6; color: #162238; white-space: pre-wrap; word-break: break-word; }
            </style>
          </head>
          <body><div class="box"><strong>PDF 생성에 실패했습니다.</strong><p>아래 오류 내용을 확인해주세요.</p><code>${escapeHtml(message)}</code></div></body>
        </html>
      `);
      pdfWindow.document.close();
    };

    writeGeneratingWindow();
    setIsGenerating(true);

    let captureRoot: HTMLDivElement | null = null;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);

      captureRoot = document.createElement("div");
      captureRoot.setAttribute("aria-hidden", "true");
      captureRoot.style.position = "fixed";
      captureRoot.style.left = "-10000px";
      captureRoot.style.top = "0";
      captureRoot.style.width = "1123px";
      captureRoot.style.height = "794px";
      captureRoot.style.overflow = "hidden";
      captureRoot.style.background = "#ffffff";
      captureRoot.style.pointerEvents = "none";
      captureRoot.style.zIndex = "-1";

      const captureTarget = previewRef.current.cloneNode(true) as HTMLElement;
      captureTarget.style.width = "1123px";
      captureTarget.style.height = "794px";
      captureTarget.style.minHeight = "794px";
      captureTarget.style.margin = "0";
      captureTarget.style.transform = "none";
      captureTarget.style.transformOrigin = "top left";
      captureTarget.style.zoom = "1";

      captureRoot.appendChild(captureTarget);
      document.body.appendChild(captureRoot);

      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const canvas = await html2canvas(captureTarget, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: 1123,
        height: 794,
        windowWidth: 1123,
        windowHeight: 794,
        scrollX: 0,
        scrollY: 0
      });

      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      pdf.addImage(image, "PNG", 0, 0, 297, 210);

      const company = customer.companyName.trim() || "고객";
      const fileName = `${company}_제이크이미지연구소_견적서_${customer.quoteDate}.pdf`;
      // 속도 우선: PDF 파일을 바로 저장하고, 새 창/iframe 렌더링은 생략합니다.
      // 기존 새 창 미리보기 방식은 모바일과 일부 브라우저에서 느리거나 멈출 수 있습니다.
      pdf.save(fileName);

      if (pdfWindow) {
        pdfWindow.close();
      }
    } catch (error) {
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      console.error("PDF generation failed", error);
      writeErrorWindow(message);
    } finally {
      if (captureRoot) captureRoot.remove();
      setIsGenerating(false);
    }
  };

  return (
    <main className="jake-quote-app min-h-screen bg-[#f3f4f6] text-[#1f2933]">
      <section className="mx-auto grid max-w-[1500px] min-w-0 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(440px,0.9fr)_minmax(560px,1.1fr)] lg:py-8">
        <div className="min-w-0 space-y-5">
          <header className="rounded-lg border border-[#162238]/15 bg-white px-5 py-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f6f93]">
              Jake Image Institute Admin
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#162238] sm:text-3xl">
              제이크이미지연구소 견적서 자동 생성
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5f6673]">
              기업 · 브랜드 촬영 항목을 직접 추가하면 공급가액, 부가세, 최종 견적금액이 자동 계산됩니다.
            </p>
            <div className="mt-5">
              <Field label="견적서 제목">
                <input
                  value={quoteTitle}
                  onChange={(event) => setQuoteTitle(event.target.value)}
                  placeholder="브랜드사진 견적서"
                />
              </Field>
            </div>
          </header>

          <Panel title="고객 정보" icon={<UserRound size={18} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="회사명">
                <input
                  value={customer.companyName}
                  onChange={(event) => updateCustomer("companyName", event.target.value)}
                  placeholder="제이크이미지연구소"
                />
              </Field>
              <Field label="담당자명">
                <input
                  value={customer.managerName}
                  onChange={(event) => updateCustomer("managerName", event.target.value)}
                  placeholder="정연호"
                />
              </Field>
              <Field label="연락처">
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer("phone", event.target.value)}
                  placeholder="010-0000-0000"
                />
              </Field>
              <Field label="이메일">
                <input
                  type="email"
                  value={customer.email}
                  onChange={(event) => updateCustomer("email", event.target.value)}
                  placeholder="contact@jakeimage.com"
                />
              </Field>
              <Field label="견적일">
                <input
                  type="date"
                  value={customer.quoteDate}
                  onChange={(event) => updateCustomer("quoteDate", event.target.value)}
                />
              </Field>
              <Field label="견적 유효기간">
                <input
                  type="date"
                  value={customer.validUntil}
                  onChange={(event) => updateCustomer("validUntil", event.target.value)}
                />
              </Field>
              <Field label="촬영 예정일">
                <input
                  type="date"
                  value={customer.shootDate}
                  onChange={(event) => updateCustomer("shootDate", event.target.value)}
                />
              </Field>
              <Field label="견적번호">
                <input
                  value={customer.quoteNumber}
                  onChange={(event) => updateCustomer("quoteNumber", event.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <Panel
            title="촬영 항목"
            icon={<WalletCards size={18} />}
            action={
              <button type="button" className="icon-button" onClick={addQuoteItem} aria-label="촬영 항목 추가">
                <Plus size={16} />
              </button>
            }
          >
            <div className="grid gap-3">
              {quoteItems.map((item, index) => (
                <div key={item.id} className="jake-item-card">
                  <div className="jake-item-card-head">
                    <strong>촬영 항목 {index + 1}</strong>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => removeQuoteItem(item.id)}
                      aria-label="촬영 항목 삭제"
                      disabled={quoteItems.length === 1}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="항목명">
                      <input
                        value={item.name}
                        onChange={(event) => updateQuoteItem(item.id, "name", event.target.value)}
                        placeholder="예: 기업 프로필 촬영"
                      />
                    </Field>
                    <Field label="세부 내용">
                      <input
                        value={item.detail}
                        onChange={(event) => updateQuoteItem(item.id, "detail", event.target.value)}
                        placeholder="예: 대표 및 임직원 프로필"
                      />
                    </Field>
                    <Field label="수량">
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(event) => updateQuoteItem(item.id, "quantity", Math.max(0, Number(event.target.value)))}
                      />
                    </Field>
                    <Field label="단가">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9,]*"
                        value={item.amount > 0 ? amount(item.amount) : ""}
                        onChange={(event) => updateQuoteItem(item.id, "amount", numberValue(event.target.value))}
                        placeholder="금액"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="할인 항목"
            action={
              <button type="button" className="icon-button" onClick={addDiscountItem} aria-label="할인 항목 추가">
                <Plus size={16} />
              </button>
            }
          >
            {discountItems.length === 0 ? (
              <p className="empty-text">추가된 할인 항목이 없습니다.</p>
            ) : (
              <div className="grid gap-3">
                {discountItems.map((item) => (
                  <div key={item.id} className="item-row">
                    <input
                      value={item.name}
                      onChange={(event) => updateDiscountItem(item.id, "name", event.target.value)}
                      placeholder="예: 협의 할인"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      value={item.amount > 0 ? amount(item.amount) : ""}
                      onChange={(event) => updateDiscountItem(item.id, "amount", numberValue(event.target.value))}
                      placeholder="금액"
                    />
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => removeDiscountItem(item.id)}
                      aria-label="삭제"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="추가할인(절삭)">
            <div className="grid gap-3">
              <Field label="추가할인 금액">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,]*"
                  value={extraDiscount > 0 ? amount(extraDiscount) : ""}
                  onChange={(event) => setExtraDiscount(numberValue(event.target.value))}
                  placeholder="예: 40,000"
                />
              </Field>
              <p className="empty-text">
                최종 견적금액에서 직접 차감됩니다. 예: 3,240,000원 → 3,200,000원으로 맞출 때 40,000 입력
              </p>
            </div>
          </Panel>

          <Panel title="메모">
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="견적서 하단에 표시할 메모를 입력하세요."
            />
          </Panel>

          <div className="action-button-bar">
            <button type="button" className="primary-button" onClick={downloadPdf} disabled={isGenerating}>
              <Download size={18} />
              {isGenerating ? "생성 중" : "PDF 다운로드"}
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
              <RefreshCcw size={18} />
              초기화
            </button>
          </div>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4f6f93]">
                Live Preview
              </p>
              <h2 className="text-lg font-bold text-[#162238]">실시간 견적서 미리보기</h2>
            </div>
            <div className="preview-zoom-controls" aria-label="미리보기 확대 축소">
              <button type="button" onClick={zoomOutPreview} aria-label="미리보기 축소">
                <ZoomOut size={16} />
              </button>
              <button type="button" onClick={resetPreviewZoom} className="zoom-percent" aria-label="미리보기 배율 초기화">
                {previewPercent}%
              </button>
              <button type="button" onClick={zoomInPreview} aria-label="미리보기 확대">
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <div ref={previewShellRef} className="preview-shell jake-preview-shell">
            <div
              className="quote-preview-viewport"
              style={{ width: `${1123 * previewScale}px`, height: `${794 * previewScale}px` }}
            >
              <div
                ref={previewRef}
                className="quote-page jake-quote-page"
                style={{ transform: `scale(${previewScale})` }}
              >
                <aside className="jake-brand-rail">
                  <div className="jake-rail-logo">
                    <img src="/jakeimage-logo.png" alt="Jake Image Institute" />
                  </div>
                  <div className="jake-rail-text">
                    <strong>BRAND IMAGE DIRECTION</strong>
                    <span>Portrait · Brand · Editorial</span>
                  </div>
                  <div className="jake-rail-notice">
                    <strong>Jake Image Institute</strong>
                    <span>기업과 개인 브랜드의 이미지를 설계합니다.</span>
                  </div>
                </aside>

                <div className="jake-quote-content">
                  <header className="jake-quote-hero">
                    <div className="invoice-meta jake-invoice-meta">
                      <div>
                        <span>견적번호</span>
                        <strong>{customer.quoteNumber}</strong>
                      </div>
                      <div>
                        <span>견적일</span>
                        <strong>{displayDate(customer.quoteDate)}</strong>
                      </div>
                      <div>
                        <span>촬영 예정일</span>
                        <strong>{displayDate(customer.shootDate)}</strong>
                      </div>
                      <div>
                        <span>견적 유효기간</span>
                        <strong>{displayDate(customer.validUntil)}</strong>
                      </div>
                    </div>
                    <h2>{quoteTitle || "제이크이미지연구소 브랜드사진 견적서"}</h2>
                  </header>

                  <section className="client-strip jake-client-strip">
                    <Info label="회사명" value={customer.companyName || "-"} />
                    <Info label="담당자명" value={customer.managerName || "-"} />
                    <Info label="연락처" value={customer.phone || "-"} />
                    <Info label="이메일" value={customer.email || "-"} />
                  </section>

                  <section className="estimate-table-wrap jake-table-wrap">
                    <table className="quote-table jake-quote-table">
                      <thead>
                        <tr>
                          <th>항목</th>
                          <th>세부 내용</th>
                          <th>수량</th>
                          <th>단가</th>
                          <th>소계</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="category-row jake-category-row">
                          <td colSpan={5}>촬영 항목</td>
                        </tr>
                        {visibleQuoteItems.map((item, index) => {
                          const itemTotal = Math.max(0, item.quantity) * Math.max(0, item.amount);

                          return (
                            <tr key={item.id}>
                              <td>{index + 1}. {item.name || "촬영 항목"}</td>
                              <td>{item.detail || "-"}</td>
                              <td>{item.quantity || 0}</td>
                              <td>{amount(item.amount)}</td>
                              <td>{amount(itemTotal)}</td>
                            </tr>
                          );
                        })}
                        {visibleDiscountItems.length > 0 ? (
                          <tr className="category-row jake-category-row">
                            <td colSpan={5}>할인 항목</td>
                          </tr>
                        ) : null}
                        {visibleDiscountItems.map((item) => (
                          <tr key={item.id} className="discount-row">
                            <td>{item.name || "할인"}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-{amount(item.amount)}</td>
                          </tr>
                        ))}
                        {itemSubtotal === 0 ? (
                          <tr>
                            <td>입력된 촬영 항목 없음</td>
                            <td>-</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                          </tr>
                        ) : null}
                        <tr className="blank-row"><td colSpan={5}></td></tr>
                      </tbody>
                    </table>
                  </section>

                  <footer className="quote-bottom jake-quote-bottom">
                    <div className="payment-box jake-payment-box">
                      <div>
                        <strong>선금50%</strong>
                        <span>{amount(Math.round(finalAmount / 2))}</span>
                      </div>
                      <div>
                        <strong>잔금50%</strong>
                        <span>{amount(finalAmount - Math.round(finalAmount / 2))}</span>
                      </div>
                      <p>세부 결제 조건은 상호 협의에 따라 조정될 수 있습니다.</p>
                    </div>

                    <div className="total-signature">
                      <div className="total-box jake-total-box">
                        <div>
                          <span>공급가액</span>
                          <strong>{amount(supplyAmount)}</strong>
                        </div>
                        <div>
                          <span>할인 합계</span>
                          <strong>{discountTotal ? `-${amount(discountTotal)}` : "0"}</strong>
                        </div>
                        <div>
                          <span>부가세/10%</span>
                          <strong>{amount(vat)}</strong>
                        </div>
                        <div>
                          <span>추가할인</span>
                          <strong>{extraDiscountAmount ? `-${amount(extraDiscountAmount)}` : "0"}</strong>
                        </div>
                        <div className="grand-total">
                          <span>KRW</span>
                          <strong>{amount(finalAmount)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="contract-note jake-contract-note">
                      <div>
                        <strong>계약 안내</strong>
                        <p>
                          본 견적서는 상호 협의 및 선금 입금 시 계약서의 효력을 대신할 수 있습니다. 촬영 범위 변경 시 최종 금액은 조정될 수 있습니다.
                        </p>
                        {memo.trim() ? <small>{memo}</small> : null}
                      </div>
                    </div>
                  </footer>

                  <div className="jake-quote-brand-mark">
                    <img src="/jakeimage-logo.png" alt="Jake Image Institute" />
                    <p>Jake Image Institute · Brand Image Direction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Panel({
  title,
  icon,
  action,
  children
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d8dde5] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#162238]">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactElement }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
