/* GLOU 리뷰 프로토타입 — 목업 데이터
 * 식당·문화·여가·병원 = 장소(place, 지도O). 화장품 = 제품(product, 지도X · brand/ptype/성분).
 * group_by: 화장품·병원=race(인종·피부), 식당·문화·여가=country(국가).
 * pop = 인기 신호(전체 리뷰수·저장수·업력/출시연도). 원문=모국어 + trans(번역).
 */
const NOW_YEAR = 2026;
const GLOU_DATA = {
  categories: [
    { id: "restaurant", ko: "식당·카페",  en: "Food & Cafe", emoji: "🍽️", group_by: "country", kind: "place" },
    { id: "cosmetics",  ko: "화장품",     en: "Cosmetics", emoji: "🧴", group_by: "race", kind: "product" },
    { id: "clinic",     ko: "피부과·병원", en: "Clinic",    emoji: "🏥", group_by: "race", kind: "place" },
    { id: "culture",    ko: "문화생활",    en: "Culture",   emoji: "🏯", group_by: "country", kind: "place" },
    { id: "leisure",    ko: "취미·여가",   en: "Leisure",   emoji: "🎲", group_by: "country", kind: "place" }
  ],
  races: [
    { id: "white", ko: "백인", en: "White" }, { id: "black", ko: "흑인", en: "Black" },
    { id: "east_asian", ko: "동아시아", en: "East Asian" }, { id: "southeast_asian", ko: "동남아", en: "SE Asian" },
    { id: "south_asian", ko: "남아시아", en: "S Asian" }, { id: "latino", ko: "라틴", en: "Latino" }
  ],
  countries: [
    { id: "us", ko: "미국", en: "USA", flag: "🇺🇸", race: "white" },
    { id: "jp", ko: "일본", en: "Japan", flag: "🇯🇵", race: "east_asian" },
    { id: "vn", ko: "베트남", en: "Vietnam", flag: "🇻🇳", race: "southeast_asian" },
    { id: "fr", ko: "프랑스", en: "France", flag: "🇫🇷", race: "white" },
    { id: "mn", ko: "몽골", en: "Mongolia", flag: "🇲🇳", race: "east_asian" },
    { id: "cn", ko: "중국", en: "China", flag: "🇨🇳", race: "east_asian" }
  ],
  regions: [
    { id: "seoul_mapo", ko: "서울 마포(연남·홍대)" }, { id: "seoul_sdm", ko: "서울 서대문(신촌)" },
    { id: "seoul_gn", ko: "서울 강남" }, { id: "seoul_seongsu", ko: "서울 성수" },
    { id: "busan", ko: "부산" }, { id: "jeonju", ko: "전주" }, { id: "online", ko: "온라인/전국" }
  ],
  places: [
    // ---- 식당·카페 (장소) ----
    { id: "p3", name: "연남 삼겹살집", category: "restaurant", region: "seoul_mapo", addr: "서울 마포구 연남동", source: "naver", emoji: "🍖", price: "₩₩", localFav: true, lat: 37.5626, lng: 126.9255, ratings: { naver: 4.3, kakao: 4.1, google: 4.4 }, pop: { reviews: 210, saves: 890, since: 2015 }, hours: "매일 16:00–24:00", menu: [["삼겹살 1인분", "13,000원"], ["된장찌개", "7,000원"], ["소주", "5,000원"]], tags: { english: true, noPhone: false, solo: false } },
    { id: "p4", name: "부산 돼지국밥 노포", category: "restaurant", region: "busan", addr: "부산 부산진구", source: "kakao", emoji: "🍲", price: "₩", localFav: true, lat: 35.1577, lng: 129.0594, ratings: { naver: 4.5, kakao: 4.4, google: 4.6 }, pop: { reviews: 480, saves: 1500, since: 2005 }, hours: "매일 08:00–22:00", menu: [["돼지국밥", "9,000원"], ["수육백반", "12,000원"]], tags: { english: false, noPhone: false, solo: true } },
    { id: "p8", name: "성수 감성 카페", category: "restaurant", region: "seoul_seongsu", addr: "서울 성동구 성수동", source: "naver", emoji: "☕", price: "₩₩", localFav: true, lat: 37.5445, lng: 127.0559, ratings: { naver: 4.6, kakao: 4.5, google: 4.7 }, pop: { reviews: 320, saves: 2100, since: 2021 }, hours: "매일 11:00–22:00", menu: [["플랫화이트", "5,500원"], ["바스크 치즈케이크", "8,000원"]], tags: { english: true, noPhone: true, solo: true } },
    { id: "p9", name: "강남 소문난 삼겹살", category: "restaurant", region: "seoul_gn", addr: "서울 강남구", source: "naver", emoji: "🥩", price: "₩₩₩", localFav: true, lat: 37.4979, lng: 127.0276, ratings: { naver: 4.4, kakao: 4.3, google: 4.5 }, pop: { reviews: 650, saves: 1800, since: 2012 }, hours: "매일 17:00–02:00", menu: [["한돈 삼겹살", "18,000원"], ["냉면", "9,000원"]], tags: { english: false, noPhone: false, solo: false } },
    { id: "p10", name: "홍대 비건 식당", category: "restaurant", region: "seoul_mapo", addr: "서울 마포구 홍대", source: "kakao", emoji: "🥗", price: "₩₩", localFav: false, lat: 37.5563, lng: 126.9236, ratings: { naver: 4.2, kakao: 4.0, google: 4.5 }, pop: { reviews: 140, saves: 620, since: 2022 }, hours: "화–일 11:30–21:00 (월 휴무)", menu: [["비건 비빔밥", "12,000원"], ["두부 스테이크", "15,000원"]], tags: { english: true, noPhone: true, solo: true } },
    // ---- 화장품 (제품) ----
    { id: "p1", name: "헤라 블랙 쿠션", category: "cosmetics", region: "online", brand: "HERA", ptype: "쿠션 파운데이션", ingredients: "SPF34/PA++ · 13·21·23호 등 쉐이드", buy: "올리브영 · 백화점", source: "naver", emoji: "💠", price: "₩₩₩", localFav: false, ratings: { naver: 4.2, kakao: 4.1, google: 4.3 }, pop: { reviews: 5400, saves: 12000, since: 2019 }, tags: { english: true, noPhone: true, solo: true } },
    { id: "p2", name: "닥터지 레드 블레미쉬 크림", category: "cosmetics", region: "online", brand: "Dr.G", ptype: "진정 크림", ingredients: "센텔라, 마데카소사이드", buy: "올리브영 · 다이소", source: "naver", emoji: "🧪", price: "₩₩", localFav: false, ratings: { naver: 4.4, kakao: 4.3, google: 4.4 }, pop: { reviews: 3200, saves: 8700, since: 2016 }, tags: { english: true, noPhone: true, solo: true } },
    { id: "p12", name: "토리든 다이브인 세럼", category: "cosmetics", region: "online", brand: "토리든", ptype: "수분 세럼", ingredients: "히알루론산 5종", buy: "올리브영 · 쿠팡", source: "naver", emoji: "💧", price: "₩₩", localFav: true, ratings: { naver: 4.5, kakao: 4.4, google: 4.6 }, pop: { reviews: 4100, saves: 9800, since: 2020 }, tags: { english: true, noPhone: true, solo: true } },
    // ---- 피부과·병원 (장소) ----
    { id: "p5", name: "신촌 스킨 클리닉", category: "clinic", region: "seoul_sdm", addr: "서울 서대문구", source: "naver", emoji: "🏥", price: "₩₩₩", localFav: false, lat: 37.5571, lng: 126.9425, ratings: { naver: 4.3, kakao: 4.2, google: 4.4 }, pop: { reviews: 260, saves: 700, since: 2011 }, hours: "월–토 10:00–19:00 (일 휴무)", tags: { english: true, noPhone: false, solo: true } },
    { id: "p11", name: "강남 유명 피부과", category: "clinic", region: "seoul_gn", addr: "서울 강남구", source: "naver", emoji: "💉", price: "₩₩₩", localFav: true, lat: 37.5011, lng: 127.0246, ratings: { naver: 4.6, kakao: 4.5, google: 4.5 }, pop: { reviews: 900, saves: 3200, since: 2009 }, hours: "월–토 10:00–20:00", tags: { english: true, noPhone: false, solo: true } },
    // ---- 문화 (장소) ----
    { id: "p6", name: "전주 한옥마을 한복체험", category: "culture", region: "jeonju", addr: "전주 한옥마을", source: "manual", emoji: "🏯", price: "₩₩", localFav: false, lat: 35.8150, lng: 127.1530, ratings: { naver: 4.4, kakao: 4.3, google: 4.5 }, pop: { reviews: 540, saves: 2600, since: 2010 }, hours: "매일 09:00–19:00", tags: { english: true, noPhone: true, solo: true } },
    { id: "p13", name: "부산 감천문화마을", category: "culture", region: "busan", addr: "부산 사하구", source: "manual", emoji: "🎨", price: "₩", localFav: true, lat: 35.0973, lng: 129.0107, ratings: { naver: 4.5, kakao: 4.4, google: 4.6 }, pop: { reviews: 720, saves: 4100, since: 2009 }, hours: "상시 개방", tags: { english: true, noPhone: true, solo: true } },
    { id: "p15", name: "경복궁 한복 대여", category: "culture", region: "seoul_sdm", addr: "서울 종로구", source: "manual", emoji: "👘", price: "₩₩", localFav: false, lat: 37.5796, lng: 126.9770, ratings: { naver: 4.3, kakao: 4.2, google: 4.4 }, pop: { reviews: 610, saves: 3300, since: 2013 }, hours: "매일 09:00–18:00", tags: { english: true, noPhone: true, solo: true } },
    // ---- 여가 (장소) ----
    { id: "p7", name: "홍대 방탈출 카페", category: "leisure", region: "seoul_mapo", addr: "서울 마포구 홍대", source: "manual", emoji: "🔐", price: "₩₩", localFav: false, lat: 37.5558, lng: 126.9230, ratings: { naver: 4.4, kakao: 4.3, google: 4.5 }, pop: { reviews: 380, saves: 1200, since: 2018 }, hours: "매일 10:00–24:00", tags: { english: true, noPhone: true, solo: false } },
    { id: "p14", name: "한강 자전거 대여", category: "leisure", region: "seoul_mapo", addr: "서울 마포구 한강공원", source: "manual", emoji: "🚲", price: "₩", localFav: true, lat: 37.5510, lng: 126.9968, ratings: { naver: 4.2, kakao: 4.1, google: 4.4 }, pop: { reviews: 290, saves: 1500, since: 2016 }, hours: "매일 09:00–21:00", tags: { english: false, noPhone: true, solo: true } }
  ],
  reviews: [
    { id: "r1", place: "p1", nick: "Emily", country: "us", race: "white", rating: 5, body: "Shade 13 is perfect for my fair skin — natural glow, great coverage.", photo: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='110'><rect width='150' height='110' fill='%23f4c9c0'/><text x='75' y='70' font-size='44' text-anchor='middle'>💠</text></svg>" },
    { id: "r2", place: "p1", nick: "Jasmine", country: "us", race: "black", rating: 2, body: "Shade range too light. Nothing matched my deep skin tone." },
    { id: "r3", place: "p1", nick: "Yuki", country: "jp", race: "east_asian", rating: 4, body: "21호 잘 맞아요. 커버력 좋고 자연스러워요." },
    { id: "r4", place: "p1", nick: "Linh", country: "vn", race: "southeast_asian", rating: 3, body: "Coverage is nice but oxidizes a bit darker on me." },
    { id: "r5", place: "p2", nick: "Chloé", country: "fr", race: "white", rating: 4, body: "Calmed my sensitive, red skin. Light texture." },
    { id: "r6", place: "p2", nick: "Marcus", country: "us", race: "black", rating: 2, body: "Didn't do much for my skin, I prefer richer creams." },
    { id: "r7", place: "p2", nick: "Wei", country: "cn", race: "east_asian", rating: 5, body: "价格实惠，成分也很好，很适合我。", trans: "값도 착하고 성분도 좋아요. 잘 맞아요." },
    { id: "r8", place: "p3", nick: "Haruto", country: "jp", race: "east_asian", rating: 5, body: "Loved the pork belly! Perfect with soju. Very Korean vibe." },
    { id: "r9", place: "p3", nick: "Minh", country: "vn", race: "southeast_asian", rating: 2, body: "Too greasy and salty for my taste." },
    { id: "r10", place: "p3", nick: "Jake", country: "us", race: "white", rating: 4, body: "Fun! Staff spoke some English, easy to order." },
    { id: "r11", place: "p4", nick: "Aki", country: "jp", race: "east_asian", rating: 4, body: "Rich broth, authentic. A bit strong smell at first." },
    { id: "r12", place: "p4", nick: "Sara", country: "us", race: "white", rating: 3, body: "Strong pork smell — took time to get used to." },
    { id: "r13", place: "p4", nick: "Bo", country: "cn", race: "east_asian", rating: 5, body: "浓汤最棒，很有本地人美食的感觉。", trans: "진한 국물 최고. 현지인 맛집 느낌." },
    { id: "r14", place: "p5", nick: "Anna", country: "us", race: "white", rating: 4, body: "Laser worked well, doctor explained in English." },
    { id: "r15", place: "p5", nick: "Kwame", country: "us", race: "black", rating: 2, body: "Ask carefully — laser settings weren't ideal for darker skin." },
    { id: "r16", place: "p5", nick: "Mio", country: "jp", race: "east_asian", rating: 5, body: "清潔で親切。外国人対応にも慣れています。", trans: "깔끔하고 친절해요. 외국인 응대도 익숙해요." },
    { id: "r17", place: "p6", nick: "Bat", country: "mn", race: "east_asian", rating: 5, body: "Hanbok experience was amazing. Few tourists, felt authentic!" },
    { id: "r18", place: "p6", nick: "Tom", country: "us", race: "white", rating: 4, body: "Beautiful area. English signage was limited though." },
    { id: "r19", place: "p6", nick: "Ren", country: "jp", race: "east_asian", rating: 4, body: "きれいです。写真を撮るのにいいです。", trans: "예뻐요. 사진 찍기 좋아요." },
    { id: "r20", place: "p7", nick: "Mia", country: "us", race: "white", rating: 5, body: "English version available, super fun escape room!" },
    { id: "r21", place: "p7", nick: "Trang", country: "vn", race: "southeast_asian", rating: 4, body: "Good puzzles, staff helpful." },
    { id: "r22", place: "p7", nick: "Léa", country: "fr", race: "white", rating: 3, body: "Some hints were Korean-only, a bit hard." },
    { id: "r23", place: "p8", nick: "Sophie", country: "us", race: "white", rating: 5, body: "Aesthetic cafe, great latte. Where locals actually hang out.", photo: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='110'><rect width='150' height='110' fill='%23d9c7a3'/><text x='75' y='70' font-size='44' text-anchor='middle'>☕</text></svg>" },
    { id: "r24", place: "p8", nick: "Kenji", country: "jp", race: "east_asian", rating: 4, body: "きれいなカフェ。少し高いです。", trans: "예쁜 카페예요. 조금 비싸요." },
    { id: "r25", place: "p8", nick: "Manon", country: "fr", race: "white", rating: 5, body: "Loved the vibe and dessert. Instagrammable." },
    { id: "r26", place: "p9", nick: "Ryan", country: "us", race: "white", rating: 4, body: "Real local BBQ spot, packed with Koreans. Little English." },
    { id: "r27", place: "p9", nick: "Xiao", country: "cn", race: "east_asian", rating: 5, body: "本地人排队的店，肉质一流。", trans: "현지인이 줄 서는 집. 고기 질 최고." },
    { id: "r28", place: "p9", nick: "Sota", country: "jp", race: "east_asian", rating: 5, body: "Authentic! Go where Koreans go." },
    { id: "r29", place: "p9", nick: "Duc", country: "vn", race: "southeast_asian", rating: 3, body: "Great meat but too smoky inside." },
    { id: "r30", place: "p10", nick: "Grace", country: "us", race: "white", rating: 5, body: "Finally a solid vegan option in Seoul!" },
    { id: "r31", place: "p10", nick: "Camille", country: "fr", race: "white", rating: 4, body: "Good but limited menu." },
    { id: "r32", place: "p10", nick: "Huong", country: "vn", race: "southeast_asian", rating: 5, body: "Fresh and healthy, English menu." },
    { id: "r33", place: "p11", nick: "Olivia", country: "us", race: "white", rating: 5, body: "Popular clinic, clean results. English coordinator." },
    { id: "r34", place: "p11", nick: "Zoe", country: "us", race: "black", rating: 3, body: "Good but confirm laser suits darker skin first." },
    { id: "r35", place: "p11", nick: "Hana", country: "jp", race: "east_asian", rating: 4, body: "人気で予約必須。結果に満足しています。", trans: "인기 많아 예약 필수. 결과 만족해요." },
    { id: "r36", place: "p12", nick: "Ella", country: "us", race: "white", rating: 4, body: "Lightweight hydration, layers well under makeup." },
    { id: "r37", place: "p12", nick: "Jin", country: "cn", race: "east_asian", rating: 5, body: "补水很棒，一直回购。", trans: "보습 최고예요. 계속 재구매해요." },
    { id: "r38", place: "p12", nick: "Nadia", country: "vn", race: "southeast_asian", rating: 4, body: "Nice for humid weather, not sticky." },
    { id: "r39", place: "p13", nick: "Chris", country: "us", race: "white", rating: 5, body: "Colorful hillside village, great photos, very walkable." },
    { id: "r40", place: "p13", nick: "Naoki", country: "jp", race: "east_asian", rating: 4, body: "いいけど階段が多いです。眺めは最高。", trans: "좋은데 계단이 많아요. 뷰는 최고." },
    { id: "r41", place: "p13", nick: "Suvd", country: "mn", race: "east_asian", rating: 5, body: "Loved it, less crowded than Seoul spots." },
    { id: "r42", place: "p14", nick: "Ben", country: "us", race: "white", rating: 5, body: "Han River bike ride at sunset — a must!" },
    { id: "r43", place: "p14", nick: "Fang", country: "cn", race: "east_asian", rating: 4, body: "租自行车很方便，不用手机号。", trans: "자전거 빌리기 쉬워요. 번호 없이 돼요." },
    { id: "r44", place: "p15", nick: "Kate", country: "us", race: "white", rating: 4, body: "Hanbok + palace was magical. Rental was easy." }
  ],
  ambassadors: [
    { id: "a1", nick: "Jake", country: "us", region: "seoul_mapo", followers: 12000 },
    { id: "a2", nick: "Bat", country: "mn", region: "jeonju", followers: 3400 },
    { id: "a3", nick: "Yuki", country: "jp", region: "seoul_seongsu", followers: 8700 },
    { id: "a4", nick: "Chloé", country: "fr", region: "busan", followers: 5600 },
    { id: "a5", nick: "Minh", country: "vn", region: "seoul_gn", followers: 2100 }
  ],
  ambassadorContents: [
    { id: "ac1", ambassador: "a1", place: "p3", type: "video", title: "How to eat Korean BBQ like a local 🇰🇷", url: "#" },
    { id: "ac2", ambassador: "a2", place: "p6", type: "video", title: "몽골인이 간 전주 한옥마을 (Mongolian in Jeonju)", url: "#" },
    { id: "ac3", ambassador: "a1", place: "p9", type: "video", title: "Where Koreans REALLY eat samgyeopsal 🥩", url: "#" }
  ],
  // 인플루언서 콘텐츠(게시물) — 지역별 앰배서더 랭킹의 근거
  posts: [
    { id: "po1", authorNick: "Jake", country: "us", region: "seoul_mapo", place: "p3", title: "Real Korean BBQ in Yeonnam", body: "Where locals actually go for samgyeopsal — not the tourist spots.", thumb: "🍖", likes: 230 },
    { id: "po2", authorNick: "Bat", country: "mn", region: "jeonju", place: "p6", title: "몽골인이 간 전주 한옥마을", body: "Hanbok + hanok stay, barely any tourists. Loved it.", thumb: "🏯", likes: 180 },
    { id: "po3", authorNick: "Yuki", country: "jp", region: "seoul_seongsu", place: "p8", title: "성수 감성 카페 투어", body: "5 aesthetic cafes in Seongsu, ranked.", thumb: "☕", likes: 410 },
    { id: "po4", authorNick: "Chloé", country: "fr", region: "busan", place: "p13", title: "Busan hidden gems", body: "Gamcheon culture village + local seafood.", thumb: "🎨", likes: 150 },
    { id: "po5", authorNick: "Jake", country: "us", region: "seoul_mapo", place: "p7", title: "English escape rooms in Hongdae", body: "Fun for foreigners — English version available.", thumb: "🔐", likes: 90 },
    { id: "po6", authorNick: "Minh", country: "vn", region: "seoul_gn", place: null, title: "Gangnam on a budget", body: "Cheap eats near Gangnam station for students.", thumb: "🍜", likes: 60 }
  ]
};
if (typeof module !== "undefined") { module.exports = GLOU_DATA; }
