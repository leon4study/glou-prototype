# GLOU 프로토타입 (읽기 중심 MVP + 데모 쓰기)

> [2026-07-11 결정](../docs/meetings/2026-07-11_신촌_멘토링.md) = 외국인 특화 로컬 리뷰 + 지역 앰배서더. UX 근거: [14_ux_competitor_review](../data/research/market/14_ux_competitor_review.md).
> 바닐라 HTML/JS + 목업 데이터. **백엔드 없음** — 로그인·저장·리뷰·콘텐츠는 인메모리(새로고침 시 초기화). React 준비본 = [`react/`](react/).

## ▶️ 실행
- `prototype/index.html` **더블클릭** (또는 `python3 -m http.server 8000`). 지도는 인터넷 연결 필요(Leaflet·OSM).

## 화면 구성
**상단 탭**: 📝 리뷰 / 🌟 앰배서더 / 🔑 로그인(계정 공유)

### 📝 리뷰 앱
- **검색바** + **카테고리 아이콘 pill**(식당·화장품·병원·문화·여가) + **팔레트 3종**(Red/Blue/Coral)
- **로그인 시뮬**(국적·인종) → 내 국가/인종 리뷰 먼저 + 빠른필터(🇰🇷한국인추천·영어·번호불필요·혼자OK) + **정렬**
- **리스트 + 실지도(Leaflet)** · 카드에 별점·리뷰수·**인기배지(리뷰·저장·업력)**·외국인친화 배지·저장(❤️)·거리
- **📍 내 주변**(현위치→거리순) · **저장한 곳**
- **상세**: 히어로 + 지도/제품정보 + 가게정보(영업시간·메뉴) + **국가/인종별 평점 종합** + 앰배서더 콘텐츠 + 리뷰(원문**모국어+🌐번역**·**📷사진**·👍유용해요·정렬) + **✍️리뷰쓰기**(사진 업로드)
- **화장품 = 제품 페이지**: 지도X, 브랜드·타입·성분·구매처 + **🎯개인화 맞춤도** + **🏆인종별 Top3**
- **마이페이지**: 저장한 곳 + 내가 쓴 리뷰 + 프로필

### 🌟 앰배서더 앱 (지역 활성화)
- **지역별 앰배서더 랭킹**(게시물·좋아요·팔로워 점수) + **인플루언서 콘텐츠 피드**(👍좋아요, 장소 연결) + **✍️콘텐츠 올리기**(로그인)

## 데이터 모델 (= DB 스키마)
```
users        (id, email, nickname, 국적, 인종, role[user|ambassador|admin])
places       (id, name, category, kind[place|product], region, addr | brand·ptype·성분·buy, lat/lng, ratings{naver,kakao,google}, pop{reviews,saves,since}, hours, menu, tags)
reviews      (id, place_id, user_id, rating, body, trans, photo, reviewer_country, reviewer_race)
ambassadors  (id, nickname, country, region, followers)
posts        (id, authorNick, country, region, place_id?, title, body, thumb, likes)
```

## 현황 / 다음 (자세히 → 대화 리포트)
- ✅ **완료**: 리뷰 앱 전체(발견·필터·지도·상세·리뷰쓰기·사진·번역·투표·국가별 종합·인기배지·마이페이지) + 제품 개인화 + 앰배서더 앱 + 팔레트
- 🅿️ **보류/스텁**: 장소 추가(영업신고 기반) · 판매점 재고 문의 · 실제 번역 API
- ⬜ **다음**: ① localStorage(영속성) ② Supabase(로그인·DB) ③ 실데이터(Google Places·공공 인허가/생활인구) ④ 장소 추가(공공데이터 인허가) ⑤ React 이관·배포

## 무료 링크 공유 (서버 구매 X)
정적이라 무료 정적호스팅이면 됨: **Netlify Drop**(폴더 드래그→즉시 링크) · **GitHub Pages** · Vercel · Cloudflare Pages. 전부 HTTPS라 **내 주변(geolocation)도 실제 작동**.
