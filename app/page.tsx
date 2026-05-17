import Image from "next/image";
import Link from "next/link";

export default function QuoteVersionSelect() {
  return (
    <main className="version-select-page">
      <section className="version-select-hero">
        <p className="version-eyebrow">QUOTE BUILDER</p>
        <h1>견적서 버전을 선택하세요</h1>
        <span>
          브랜드 성격에 맞는 견적서를 선택하면, 해당 작성 페이지로 이동합니다.
        </span>
      </section>

      <section className="version-select-grid" aria-label="견적서 버전 선택">
        <Link href="/photoclinic" className="version-card version-card-photoclinic">
          <div className="version-card-top">
            <div className="version-logo-box version-logo-photoclinic">
              <Image
                src="/assets/photoclinic-logo.png"
                alt="포토클리닉 로고"
                width={92}
                height={72}
                priority
              />
            </div>
            <small>01</small>
          </div>

          <div className="version-card-body">
            <h2>포토클리닉 견적서</h2>
            <p>병원 전문 브랜드 촬영 견적서</p>
          </div>

          <strong>작성하기 →</strong>
        </Link>

        <Link href="/jakeimage" className="version-card version-card-jakeimage">
          <div className="version-card-top">
            <div className="version-logo-box version-logo-jakeimage">
              <Image
                src="/assets/jakeimage-logo.png"
                alt="제이크이미지연구소 로고"
                width={136}
                height={92}
                priority
              />
            </div>
            <small>02</small>
          </div>

          <div className="version-card-body">
            <h2>제이크이미지연구소 견적서</h2>
            <p>기업·브랜드 이미지 촬영 견적서</p>
          </div>

          <strong>작성하기 →</strong>
        </Link>
      </section>
    </main>
  );
}
