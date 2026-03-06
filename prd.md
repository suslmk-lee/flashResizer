# [PRD] Cloudflare 기반 서버리스 이미지 변환 서비스

## 1. 프로젝트 개요

* **서비스명:** (가칭) **FlashResizer**
* **한 줄 요약:** Cloudflare Edge 인프라를 활용하여 이미지 크기 조정 및 포맷 변환을 수행하는 초고속 서버리스 웹 애플리케이션.
* **목표:** 서버 관리 부담 없이(Zero-Ops), 전 세계 어디서나 빠른 속도로 이미지를 최적화하는 도구 제공.

---

## 2. 사용자 타겟 및 유즈케이스

* **개발자/마케터:** 웹사이트 로딩 속도 최적화를 위해 이미지를 차세대 포맷(WebP, AVIF)으로 변환하려는 사용자.
* **일반 사용자:** SNS 업로드나 문서 첨부를 위해 고해상도 이미지의 용량을 줄이고자 하는 사용자.

---

## 3. 핵심 기능 (Functional Requirements)

### 3.1. 이미지 업로드 및 관리

* **드래그 앤 드롭:** UI를 통해 다중 파일 업로드 지원.
* **스토리지 연동:** 업로드된 원본 파일을 **Cloudflare R2**에 안전하게 저장.

### 3.2. 이미지 처리 (Core Logic)

* **리사이징:** 사용자가 입력한 Width/Height 값에 따라 크기 조절 (비율 유지 옵션 포함).
* **포맷 변환:** JPG, PNG, WebP, AVIF 간의 상호 변환 지원.
* **품질 설정:** 변환 시 압축률(Quality) 조정 기능 제공.

### 3.3. 결과물 제공

* **즉시 다운로드:** 변환 완료 후 브라우저를 통한 직접 다운로드.
* **CDN 캐싱:** 동일한 설정의 변환 요청 시 **Cloudflare Cache**를 활용해 연산 없이 즉시 응답.

---

## 4. 기술 스택 (Technical Stack)

| 구분 | 선택 기술 | 비고 |
| --- | --- | --- |
| **Frontend** | React + Tailwind CSS | Cloudflare Pages 호스팅 |
| **Backend** | Cloudflare Workers (TypeScript) | Edge Runtime 기반 API |
| **Storage** | Cloudflare R2 | 원본 및 결과물 저장 (S3 호환) |
| **Image Engine** | Cloudflare Images (Resizing) | Workers 내 `fetch` 옵션 또는 Wasm 기반 처리 |
| **CI/CD** | GitHub Integration | Pages/Workers 자동 배포 연동 |

---

## 5. 아키텍처 설계 (High-Level)

1. **Request Flow:** User → Cloudflare Pages (UI) → Cloudflare Workers (API).
2. **Processing Flow:** Workers가 R2에서 원본을 읽거나 Request Body를 직접 처리.
3. **Optimization:** 변환된 이미지는 특정 TTL(Time To Live) 동안 Edge Cache에 저장되어 재연산 방지.
4. **Security:** Workers 내에서 업로드 파일의 매직 넘버(Magic Number)를 체크하여 실행 파일 업로드 차단.

---

## 6. 비기능적 요구사항 (Non-Functional Requirements)

* **성능:** 이미지 변환 응답 시간은 평균 500ms 이내(네트워크 제외 연산 기준).
* **가용성:** Cloudflare 인프라를 활용한 99.9% 이상의 가용성 확보.
* **비용:** Free Tier 범위 내 운영을 최우선으로 하되, 대용량 처리를 위한 확장성 확보.

---

## 7. 로드맵 (Milestones)

* **Phase 1 (MVP):** 단일 이미지 업로드 → 리사이징 → 다운로드 기본 흐름 구축.
* **Phase 2:** 다중 이미지 일괄 처리(Batch Processing) 및 Zip 다운로드 기능 추가.
* **Phase 3:** Cloudflare D1(DB)을 연동한 사용자 변환 히스토리 관리 및 대시보드 제공.

---

> **민규 님을 위한 다음 단계 제안:** > 이 서비스의 핵심인 **Cloudflare Workers에서 이미지를 리사이징하고 R2에 저장하는 Backend API의 샘플 코드**를 먼저 작성해 볼까요? 아니면 프론트엔드 UI 구성을 위한 와이어프레임을 논의해 볼까요?