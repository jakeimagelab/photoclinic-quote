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

type PackageOption = {
  id: string;
  name: string;
  price: number;
  composition: string;
};

type SingleItem = {
  id: string;
  name: string;
  price: number;
};

type CustomItem = {
  id: string;
  name: string;
  amount: number;
};

type CustomerInfo = {
  hospitalName: string;
  managerName: string;
  phone: string;
  email: string;
  quoteDate: string;
  validUntil: string;
  shootDate: string;
  quoteNumber: string;
};

const packages: PackageOption[] = [
  {
    id: "standard",
    name: "스탠다드",
    price: 1350000,
    composition: "프로필 + 연출사진"
  },
  {
    id: "premium",
    name: "프리미엄",
    price: 2000000,
    composition: "프로필 + 연출사진 + 인테리어"
  },
  {
    id: "premium-plus-1",
    name: "프리미엄 플러스 1",
    price: 3600000,
    composition: "프로필 + 연출사진 + 인테리어 + 포인트영상"
  },
  {
    id: "premium-plus-2",
    name: "프리미엄 플러스 2",
    price: 4500000,
    composition: "프로필 + 연출사진 + 인테리어 + 브랜드필름"
  }
];

const singleItems: SingleItem[] = [
  {
    id: "studio-profile",
    name: "프로필촬영",
    price: 350000
  },
  {
    id: "directing",
    name: "연출 촬영",
    price: 1200000
  },
  {
    id: "interior",
    name: "인테리어 촬영",
    price: 750000
  },
  {
    id: "brand-film",
    name: "브랜드필름",
    price: 2800000
  },
  {
    id: "point-video",
    name: "포인트영상",
    price: 1800000
  }
];

const discountRates = [0, 10, 15, 20];

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
  return `PC-${date}-001`;
};

const initialCustomer = (): CustomerInfo => {
  const quoteDate = todayValue();

  return {
    hospitalName: "",
    managerName: "",
    phone: "",
    email: "",
    quoteDate,
    validUntil: addDays(quoteDate, 14),
    shootDate: "",
    quoteNumber: createQuoteNumber()
  };
};

const won = (value: number) =>
  `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(value)}원`;

const amount = (value: number) =>
  new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(value);

const numberValue = (value: string) => {
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const displayDate = (date: string) => date || "-";

export default function QuoteBuilder() {
  const previewRef = useRef<HTMLDivElement>(null);
  const previewShellRef = useRef<HTMLDivElement>(null);
  const [customer, setCustomer] = useState<CustomerInfo>(() => initialCustomer());
  const [quoteTitle, setQuoteTitle] = useState("포토클리닉 브랜드사진 견적서");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(packages[0].id);
  const [selectedSingleItemIds, setSelectedSingleItemIds] = useState<string[]>([]);
  const [profileCount, setProfileCount] = useState(0);
  const [stagedCount, setStagedCount] = useState(0);
  const [floorCount, setFloorCount] = useState(0);
  const [largeHospital, setLargeHospital] = useState(false);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [memo, setMemo] = useState("");
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

  const zoomOutPreview = () => {
    setPreviewZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))));
  };

  const zoomInPreview = () => {
    setPreviewZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(1))));
  };

  const resetPreviewZoom = () => {
    setPreviewZoom(1);
  };

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) ?? null,
    [selectedPackageId]
  );

  const selectedSingleItems = useMemo(
    () => singleItems.filter((item) => selectedSingleItemIds.includes(item.id)),
    [selectedSingleItemIds]
  );

  const optionItems = useMemo(() => {
    const items = [
      {
        name: "프로필 인원 추가",
        detail: `${profileCount}인`,
        amount: profileCount * 250000,
        visible: profileCount > 0
      },
      {
        name: "연출 인원 추가",
        detail: `${stagedCount}인`,
        amount: stagedCount * 450000,
        visible: stagedCount > 0
      },
      {
        name: "인테리어 층수 추가",
        detail: `${floorCount}층`,
        amount: floorCount * 250000,
        visible: floorCount > 0
      },
      {
        name: "병원급 규모 추가",
        detail: "적용",
        amount: 750000,
        visible: largeHospital
      }
    ];

    return items.filter((item) => item.visible);
  }, [floorCount, largeHospital, profileCount, stagedCount]);

  const packageTotal = selectedPackage?.price ?? 0;
  const singleItemsTotal = selectedSingleItems.reduce((sum, item) => sum + item.price, 0);
  const optionsTotal = optionItems.reduce((sum, item) => sum + item.amount, 0);
  const customTotal = customItems.reduce((sum, item) => sum + item.amount, 0);
  const contentSubtotal = packageTotal + singleItemsTotal + optionsTotal + customTotal;
  const discountTotal = Math.round(contentSubtotal * (discountRate / 100));
  const rawSupplyAmount = Math.max(contentSubtotal - discountTotal, 0);
  const supplyAmount = Math.floor(rawSupplyAmount / 10000) * 10000;
  const vat = Math.round(supplyAmount * 0.1);
  const finalAmount = supplyAmount + vat;

  const updateCustomer = (key: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSingleItem = (id: string) => {
    setSelectedSingleItemIds((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id]
    );
  };

  const addCustomItem = () => {
    setCustomItems((items) => [
      ...items,
      { id: crypto.randomUUID(), name: "", amount: 0 }
    ]);
  };

  const updateCustomItem = (
    id: string,
    key: keyof CustomItem,
    value: string | number
  ) => {
    setCustomItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeCustomItem = (id: string) => {
    setCustomItems((items) => items.filter((item) => item.id !== id));
  };

  const resetForm = () => {
    setCustomer(initialCustomer());
    setQuoteTitle("포토클리닉 브랜드사진 견적서");
    setSelectedPackageId(packages[0].id);
    setSelectedSingleItemIds([]);
    setProfileCount(0);
    setStagedCount(0);
    setFloorCount(0);
    setLargeHospital(false);
    setCustomItems([]);
    setDiscountRate(0);
    setMemo("");
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;

    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);

      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        width: 1123,
        height: 794,
        windowWidth: 1440,
        windowHeight: 1000,
        onclone: (documentClone) => {
          const quotePage = documentClone.querySelector(".quote-page") as HTMLElement | null;

          if (quotePage) {
            quotePage.style.zoom = "1";
            quotePage.style.transform = "none";
            quotePage.style.transformOrigin = "top left";
            quotePage.style.width = "1123px";
            quotePage.style.height = "794px";
            quotePage.style.minHeight = "794px";
          }
        }
      });

      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      pdf.addImage(image, "PNG", 0, 0, 297, 210);

      const hospital = customer.hospitalName.trim() || "고객";
      pdf.save(`${hospital}_포토클리닉_견적서_${customer.quoteDate}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#222222]">
      <section className="mx-auto grid max-w-[1500px] gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(440px,0.9fr)_minmax(560px,1.1fr)] lg:py-8">
        <div className="space-y-5">
          <header className="rounded-lg border border-[#155855]/15 bg-white px-5 py-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e85d2c]">
              Photo Clinic Admin
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#155855] sm:text-3xl">
              포토클리닉 견적서 자동 생성
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5f5b56]">
              상담 후 확정된 촬영 항목을 선택하면 공급가액, 부가세, 최종 견적금액이 자동 계산됩니다.
            </p>
            <div className="mt-5">
              <Field label="견적서 제목">
                <input
                  value={quoteTitle}
                  onChange={(event) => setQuoteTitle(event.target.value)}
                  placeholder="오블리브의원 브랜드사진 견적서"
                />
              </Field>
            </div>
          </header>

          <Panel title="고객 정보" icon={<UserRound size={18} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="병원명">
                <input
                  value={customer.hospitalName}
                  onChange={(event) => updateCustomer("hospitalName", event.target.value)}
                  placeholder="포토클리닉"
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
                  placeholder="photoclnic@gmail.com"
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

          <Panel title="패키지 선택" icon={<WalletCards size={18} />}>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setSelectedPackageId(null)}
                className={`package-button ${selectedPackageId === null ? "package-button-active" : ""}`}
              >
                <span>
                  <strong>패키지 선택 안 함</strong>
                  <small>단일항목 또는 추가 옵션만으로 견적 구성</small>
                </span>
                <b>{won(0)}</b>
              </button>
              {packages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPackageId(item.id)}
                  className={`package-button ${
                    selectedPackageId === item.id ? "package-button-active" : ""
                  }`}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.composition}</small>
                  </span>
                  <b>{won(item.price)}</b>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="단일항목 선택">
            <div className="single-item-grid">
              {singleItems.map((item) => {
                const isSelected = selectedSingleItemIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSingleItem(item.id)}
                    className={`single-item-button ${isSelected ? "single-item-button-active" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <span>{item.name}</span>
                    <strong>{won(item.price)}</strong>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="추가 옵션">
            <div className="grid gap-3">
              <QuantityField
                label="프로필 인원 추가"
                unit="인"
                price="1인당 250,000원"
                value={profileCount}
                onChange={setProfileCount}
              />
              <QuantityField
                label="연출 인원 추가"
                unit="인"
                price="1인당 450,000원"
                value={stagedCount}
                onChange={setStagedCount}
              />
              <QuantityField
                label="인테리어 층수 추가"
                unit="층"
                price="1층당 250,000원"
                value={floorCount}
                onChange={setFloorCount}
              />
              <label className="flex items-center justify-between rounded-lg border border-[#ddd5c9] bg-[#faf7f2] px-4 py-3">
                <span>
                  <span className="block text-sm font-bold text-[#155855]">
                    병원급 규모 추가
                  </span>
                  <span className="text-xs text-[#6f6961]">750,000원</span>
                </span>
                <input
                  type="checkbox"
                  checked={largeHospital}
                  onChange={(event) => setLargeHospital(event.target.checked)}
                  className="h-5 w-5 accent-[#155855]"
                />
              </label>
              <div className="custom-items-box">
                <div className="custom-items-head">
                  <div>
                    <strong>기타 항목</strong>
                    <span>항목명과 금액을 직접 입력합니다.</span>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={addCustomItem}
                    aria-label="기타 항목 추가"
                    title="기타 항목 추가"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {customItems.length === 0 ? (
                  <p className="empty-text">추가된 기타 항목이 없습니다.</p>
                ) : (
                  <div className="grid gap-3">
                    {customItems.map((item) => (
                      <div key={item.id} className="item-row">
                        <input
                          value={item.name}
                          onChange={(event) =>
                            updateCustomItem(item.id, "name", event.target.value)
                          }
                          placeholder="예: 특수 촬영 구성"
                        />
                        <input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(event) =>
                            updateCustomItem(
                              item.id,
                              "amount",
                              numberValue(event.target.value)
                            )
                          }
                          placeholder="금액"
                        />
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => removeCustomItem(item.id)}
                          aria-label="삭제"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="할인 선택">
            <div className="discount-rate-grid">
              {discountRates.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setDiscountRate(rate)}
                  className={`discount-rate-button ${discountRate === rate ? "discount-rate-button-active" : ""}`}
                >
                  <span>{rate === 0 ? "할인 없음" : `${rate}% 할인`}</span>
                  <strong>{rate === 0 ? won(0) : `-${won(Math.round(contentSubtotal * (rate / 100)))}`}</strong>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="메모">
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="견적서에 함께 남길 메모를 입력하세요."
              rows={4}
            />
          </Panel>

          <div className="sticky bottom-3 grid gap-3 rounded-lg border border-[#155855]/15 bg-white/95 p-3 shadow-lg backdrop-blur sm:grid-cols-2">
            <button className="primary-button" type="button" onClick={downloadPdf}>
              <Download size={18} />
              {isGenerating ? "PDF 생성 중" : "PDF 다운로드"}
            </button>
            <button className="secondary-button" type="button" onClick={resetForm}>
              <RefreshCcw size={18} />
              초기화
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-bold text-[#155855]">실시간 견적서 미리보기</p>
              <p className="text-xs text-[#797168]">A4 가로형 1페이지 · 100%는 화면 맞춤</p>
            </div>
            <div className="preview-zoom-controls" aria-label="견적서 미리보기 확대 축소">
              <button type="button" onClick={zoomOutPreview} aria-label="미리보기 축소">
                <ZoomOut size={16} />
              </button>
              <button type="button" onClick={resetPreviewZoom} className="zoom-percent" aria-label="미리보기 확대 비율 초기화">
                {previewPercent}%
              </button>
              <button type="button" onClick={zoomInPreview} aria-label="미리보기 확대">
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <div className="preview-shell" ref={previewShellRef}>
            <div
              className="quote-preview-viewport"
              style={{
                width: `${1123 * previewScale}px`,
                height: `${794 * previewScale}px`
              }}
            >
            <div
              ref={previewRef}
              className="quote-page"
              style={{ transform: `scale(${previewScale})` }}
            >
              <aside className="brand-rail">
                <div className="rail-slogan">
                  <p>브랜드를 담습니다.</p>
                  <p>정직하고,</p>
                  <p>자연스럽게.</p>
                </div>
                <div className="rail-address">
                  <span>TO.</span>
                  <strong>{customer.hospitalName || "병원명"}</strong>
                  <small>{customer.managerName || "담당자"} 님</small>
                </div>
                <div className="rail-notice">
                  <strong>결제 조건</strong>
                  <span>선금 50%, 잔금 50% 기준</span>
                  <span>세부 조건은 상호 협의 가능</span>
                </div>
                <div className="rail-notice">
                  <strong>포토클리닉</strong>
                  <span>제이크이미지연구소</span>
                  <span>병원 전문 브랜드 촬영</span>
                </div>
              </aside>

              <div className="quote-content">
                <header className="quote-hero">
                  <div className="invoice-meta">
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
                  <h2>
                    {quoteTitle || "포토클리닉 브랜드사진 견적서"}
                  </h2>
                </header>

                <section className="client-strip">
                  <Info label="병원명" value={customer.hospitalName || "-"} />
                  <Info label="담당자명" value={customer.managerName || "-"} />
                  <Info label="연락처" value={customer.phone || "-"} />
                  <Info label="이메일" value={customer.email || "-"} />
                </section>

                <section className="estimate-table-wrap">
                  <table className="quote-table">
                    <thead>
                      <tr>
                        <th>항목</th>
                        <th>수량</th>
                        <th>가격</th>
                        <th>소계</th>
                        <th>비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="category-row">
                        <td colSpan={5}>촬영 콘텐츠</td>
                      </tr>
                      {selectedPackage ? (
                        <tr>
                          <td>
                            1. {selectedPackage.name} 패키지
                            <small>{selectedPackage.composition}</small>
                          </td>
                          <td></td>
                          <td>{amount(selectedPackage.price)}</td>
                          <td>{amount(selectedPackage.price)}</td>
                          <td>촬영 패키지</td>
                        </tr>
                      ) : null}
                      {selectedSingleItems.length > 0 ? (
                        <tr className="category-row">
                          <td colSpan={5}>단일 항목</td>
                        </tr>
                      ) : null}
                      {selectedSingleItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}. {item.name}</td>
                          <td></td>
                          <td>{amount(item.price)}</td>
                          <td>{amount(item.price)}</td>
                          <td>단일 콘텐츠</td>
                        </tr>
                      ))}
                      {optionItems.map((item, index) => (
                        <tr key={item.name}>
                          <td>{index + 2}. {item.name}</td>
                          <td>{item.detail}</td>
                          <td>{amount(item.amount)}</td>
                          <td>{amount(item.amount)}</td>
                          <td>-</td>
                        </tr>
                      ))}
                      {customItems
                        .filter((item) => item.name || item.amount > 0)
                        .map((item, index) => (
                          <tr key={item.id}>
                            <td>{optionItems.length + index + 2}. {item.name || "기타 항목"}</td>
                            <td></td>
                            <td>{amount(item.amount)}</td>
                            <td>{amount(item.amount)}</td>
                            <td>기타</td>
                          </tr>
                        ))}
                      {discountRate > 0 ? (
                        <tr className="discount-row">
                          <td>{discountRate}% 할인</td>
                          <td>-</td>
                          <td>-{amount(discountTotal)}</td>
                          <td>-{amount(discountTotal)}</td>
                          <td>촬영콘텐츠 합계 기준</td>
                        </tr>
                      ) : null}
                      {contentSubtotal === 0 ? (
                        <tr>
                          <td>선택된 촬영 항목 없음</td>
                          <td>-</td>
                          <td>0</td>
                          <td>0</td>
                          <td>-</td>
                        </tr>
                      ) : null}
                      <tr className="blank-row"><td colSpan={5}></td></tr>
                    </tbody>
                  </table>
                </section>

                <footer className="quote-bottom">
                  <div className="payment-box">
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
                    <div className="total-box">
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
                      <div className="grand-total">
                        <span>KRW</span>
                        <strong>{amount(finalAmount)}</strong>
                      </div>
                    </div>
                    <div className="signature-area">
                      <span>CEO Signature</span>
                      <img src="/assets/ceo-signature.png" alt="CEO Signature" />
                    </div>
                  </div>

                  <div className="contract-note">
                    <div>
                      <strong>계약 안내</strong>
                      <p>
                        본 견적서는 상호 협의 및 선금 입금 시 계약서의 효력을 대신할 수 있습니다. 촬영 범위 변경 시 최종 금액은 조정될 수 있습니다.
                      </p>
                      {memo.trim() ? <small>{memo}</small> : null}
                    </div>
                  </div>
                </footer>

                <div className="quote-brand-mark">
                  <img
                    src="/assets/photoclinic-logo.png?v=3"
                    alt="PHOTO CLINIC"
                    className="brand-logo-image"
                  />
                  <p>제이크이미지연구소 · 병원 전문 브랜드 촬영</p>
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
    <section className="rounded-lg border border-[#ded7cc] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#155855]">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: ReactElement;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function QuantityField({
  label,
  price,
  unit,
  value,
  onChange
}: {
  label: string;
  price: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="quantity-field">
      <div>
        <strong>{label}</strong>
        <span>{price}</span>
      </div>
      <div className="stepper" aria-label={`${label} 수량`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`${label} 줄이기`}
          disabled={value === 0}
        >
          -
        </button>
        <output>
          {value}
          <em>{unit}</em>
        </output>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`${label} 늘리기`}
        >
          +
        </button>
      </div>
    </div>
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
