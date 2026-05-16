import Link from "next/link";

export default function QuoteVersionSelect() {
  return (
    <main className="version-select-page">
      <section className="version-select-hero">
        <p>QUOTE BUILDER</p>
        <h1>견적서 버전을 선택하세요</h1>
        <span>
          포토클리닉 병원 촬영 견적서와 제이크이미지연구소 기업 촬영 견적서를
          브랜드 성격에 맞게 각각 작성할 수 있습니다.
        </span>
      </section>

      <section className="version-select-grid" aria-label="견적서 버전 선택">
        <Link href="/photoclinic" className="version-card version-card-photoclinic">
          <small>01</small>
          <div>
            <h2>포토클리닉 견적서</h2>
            <p>병원 전문 브랜드 촬영 견적서</p>
          </div>
          <strong>작성하기 →</strong>
        </Link>

        <Link href="/jakeimage" className="version-card version-card-jakeimage">
          <small>02</small>
          <div>
            <h2>제이크이미지연구소 견적서</h2>
            <p>기업 · 브랜드 이미지 촬영 견적서</p>
          </div>
          <strong>작성하기 →</strong>
        </Link>
      </section>
    </main>
  );
}
