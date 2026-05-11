# 포토클리닉 견적서 자동 생성 웹 프로그램

포토클리닉 관리자용 내부 견적서 생성 웹앱입니다. 고객 진단페이지, 로그인, DB 저장 없이 브라우저에서 상담 확정 항목을 입력하고 A4 견적서 PDF를 바로 다운로드할 수 있습니다.

## 주요 기능

- 고객 정보 입력
- 견적번호 자동 생성
- 촬영 패키지 단일 선택
- 추가 옵션 수량 입력 및 체크박스 선택
- 기타 항목 여러 개 추가
- 할인 항목 여러 개 추가
- 공급가액, 부가세 10%, 최종 견적금액 자동 계산
- 실시간 A4 견적서 미리보기
- 미리보기 영역 PDF 다운로드
- 모바일/데스크톱 반응형 화면

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```bash
http://localhost:3000
```

배포 전 빌드 확인:

```bash
npm run build
```

## GitHub 업로드 방법

1. GitHub에서 새 저장소를 만듭니다.
2. 로컬 프로젝트 폴더에서 Git을 초기화합니다.

```bash
git init
git add .
git commit -m "Initial Photo Clinic quote app"
```

3. GitHub 저장소 주소를 연결합니다.

```bash
git remote add origin https://github.com/사용자명/저장소명.git
git branch -M main
git push -u origin main
```

## Vercel 배포 방법

1. [Vercel](https://vercel.com)에 로그인합니다.
2. `Add New Project`를 선택합니다.
3. GitHub에 올린 저장소를 선택합니다.
4. Framework Preset이 `Next.js`인지 확인합니다.
5. 별도 환경 변수 없이 `Deploy`를 누릅니다.

## 수정 후 재배포 방법

코드를 수정한 뒤 아래 순서로 GitHub에 올립니다.

```bash
git add .
git commit -m "Update quote app"
git push
```

Vercel은 연결된 GitHub 저장소의 변경사항을 감지해 자동으로 다시 배포합니다.

## 기술 구성

- Next.js App Router
- React
- Tailwind CSS
- html2canvas
- jsPDF

## 향후 2차 개발 후보

- 관리자 로그인
- 고객별 견적 이력 저장
- 견적서 템플릿 관리
- 고객 진단페이지 연동
- 계약서 자동 생성
