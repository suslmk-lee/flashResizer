# ⚡ FlashResizer

Cloudflare Edge 인프라를 활용한 서버리스 이미지 변환 서비스.
서버 관리 없이 전 세계 어디서나 빠르게 이미지를 리사이징하고 포맷을 변환합니다.

---

## 주요 기능

- **드래그 앤 드롭** 다중 파일 업로드
- **리사이징** — Width / Height 슬라이더, 비율 잠금(Lock Aspect Ratio) 지원
- **포맷 변환** — WebP, PNG, JPG, AVIF, **BMP** 상호 변환
- **품질 조정** — 압축률 슬라이더 (1–100%)
- **즉시 다운로드** — 변환 완료 후 브라우저에서 바로 저장
- **CDN 캐싱** — 동일 설정 재요청 시 Cloudflare Edge Cache 즉시 응답
- **설정 재처리** — Configuration을 변경한 뒤 Process All로 전체 재변환 가능

---

## 지원 포맷

| 입력 | 출력 |
|------|------|
| JPG, PNG, WebP, AVIF, BMP | WebP, PNG, JPG, BMP |

> AVIF 출력은 Phase 2에서 추가 예정 (현재 WebP로 폴백).

---

## BMP 변환 상세

FlashResizer의 BMP 출력은 단순한 24-bit BMP가 아닌 **32-bit BGRA Premultiplied Alpha** 규격으로 생성됩니다.

### 규격

| 항목 | 값 |
|------|----|
| 헤더 | BITMAPINFOHEADER (40 bytes) |
| 비트 깊이 | 32-bit (BGRA) |
| 알파 방식 | Premultiplied Alpha |
| 픽셀 순서 | Bottom-up (표준 BMP 호환) |
| 압축 | BI_RGB (무압축) |

### 투명도(알파 채널) 처리

투명 배경이 있는 **PNG 파일을 BMP로 변환할 때 투명도가 보존**됩니다.

- 완전 투명 픽셀 (`A=0`) → `(R=0, G=0, B=0, A=0)` 그대로 저장
- 반투명 픽셀 → RGB 값에 알파를 사전 곱셈(premultiply)하여 저장
- 불투명 픽셀 → 원본 색상 그대로 유지

**Premultiplied Alpha 방식이란?**

```
저장되는 R = 원본 R × Alpha / 255
저장되는 G = 원본 G × Alpha / 255
저장되는 B = 원본 B × Alpha / 255
저장되는 A = Alpha
```

이 방식은 Pixelformer, WPF, GDI+ 등 Premultiplied Alpha를 지원하는 프로그램에서
올바르게 투명도가 렌더링됩니다.

### 주의사항

- **BMP 소스 파일**을 입력으로 사용하면 알파 채널이 손실됩니다 (photon 라이브러리의 BMP 알파 로딩 미지원).
  투명도 보존이 필요한 경우 **반드시 PNG를 입력 파일로 사용**하세요.
- 일반 이미지 뷰어(Windows 사진, 탐색기 미리보기)는 32-bit BMP의 알파를 무시해 검정 배경으로 보일 수 있습니다.

---

## 삼국지 14 신무장 초상화 등록

FlashResizer로 변환한 BMP 파일은 **삼국지 14(ROMANCE OF THE THREE KINGDOMS XIV) 신무장 커스텀 초상화** 등록에 사용할 수 있습니다.

### 사용 방법

1. 원하는 초상화 이미지(PNG 권장)를 준비합니다.
2. FlashResizer에 파일을 업로드합니다.
3. Configuration에서 아래와 같이 설정합니다.

| 항목 | 설정값 |
|------|--------|
| Output Format | **BMP** |
| Width | 게임 요구 사양에 맞게 설정 |
| Height | 게임 요구 사양에 맞게 설정 |
| Lock Aspect Ratio | 필요에 따라 설정 |

4. **Process All** 버튼을 클릭합니다.
5. 변환된 `.bmp` 파일을 다운로드합니다.
6. 삼국지 14 설치 경로의 초상화 폴더에 파일을 복사합니다.
7. 게임 내 신무장 편집에서 해당 초상화를 선택합니다.

### 왜 FlashResizer BMP인가?

삼국지 14의 신무장 초상화는 **32-bit BMP + Premultiplied Alpha** 규격을 요구합니다.
FlashResizer는 Pixelformer와 동일한 헤더 구조로 BMP를 생성하므로,
Pixelformer 없이도 투명 배경이 있는 초상화를 바로 만들 수 있습니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Cloudflare Pages Functions (Workers) |
| Image Engine | `@cf-wasm/photon` (Rust/WASM 기반) |
| Storage | 결과물 R2 저장 없음, Response 직접 반환 |
| Cache | Cloudflare Workers Cache API (SHA-256 해시 키) |
| 파일 제한 | 최대 10MB |
| CI/CD | GitHub → Cloudflare Pages 자동 배포 |

---

## 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 터미널 1 — Vite 프론트엔드 (http://localhost:5173)
npm run dev

# 터미널 2 — Cloudflare Worker (http://localhost:8788)
npm run dev:worker
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.
(`/api/*` 요청은 Vite 프록시를 통해 자동으로 `:8788` Worker로 전달됩니다.)

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# Cloudflare Pages 배포
npm run deploy
```

---

## 로드맵

- **Phase 1 (완료)** — 단일/다중 파일 업로드 → 리사이징 → 포맷 변환 → 다운로드
- **Phase 2** — 일괄 Zip 다운로드, AVIF 인코딩(`@cf-wasm/squoosh` 전환)
- **Phase 3** — Cloudflare D1 연동, 변환 히스토리 대시보드

---

## 라이선스

MIT
