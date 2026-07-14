/* GLOU 리뷰 목업 데이터 (React용 ES 모듈).
 * ⚠️ 프로토타입 스캐폴드라 ../../data.js 와 내용이 동일 — 한쪽 수정 시 다른 쪽도 맞춰주세요.
 * (백엔드 붙이면 이 파일은 API 호출로 대체됨) */
const GLOU_DATA = {
  categories: [
    { id: "cosmetics",  ko: "화장품",     en: "Cosmetics", group_by: "race" },
    { id: "restaurant", ko: "식당·카페",  en: "Food & Cafe", group_by: "country" },
    { id: "clinic",     ko: "피부과·병원", en: "Clinic",    group_by: "race" },
    { id: "culture",    ko: "문화생활",    en: "Culture",   group_by: "country" },
    { id: "leisure",    ko: "취미·여가",   en: "Leisure",   group_by: "country" }
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
    { id: "busan", ko: "부산" }, { id: "jeonju", ko: "전주" }
  ],
  places: [
    { id: "p1", name: "올리브영 신촌점", category: "cosmetics", region: "seoul_sdm", addr: "서울 서대문구 신촌로", source: "naver" },
    { id: "p2", name: "톤업 코스메틱 전주점", category: "cosmetics", region: "jeonju", addr: "전주 완산구", source: "kakao" },
    { id: "p3", name: "연남 삼겹살집", category: "restaurant", region: "seoul_mapo", addr: "서울 마포구 연남동", source: "naver" },
    { id: "p4", name: "부산 돼지국밥 노포", category: "restaurant", region: "busan", addr: "부산 부산진구", source: "kakao" },
    { id: "p5", name: "신촌 스킨 클리닉", category: "clinic", region: "seoul_sdm", addr: "서울 서대문구", source: "naver" },
    { id: "p6", name: "전주 한옥마을 한복체험", category: "culture", region: "jeonju", addr: "전주 한옥마을", source: "manual" },
    { id: "p7", name: "홍대 방탈출 카페", category: "leisure", region: "seoul_mapo", addr: "서울 마포구 홍대", source: "manual" }
  ],
  reviews: [
    { id: "r1", place: "p1", nick: "Emily", country: "us", race: "white", rating: 5, body: "The brightening toner is perfect for my fair skin — glowy, no irritation." },
    { id: "r2", place: "p1", nick: "Jasmine", country: "us", race: "black", rating: 2, body: "Shade range too light. Nothing matched my deep skin tone." },
    { id: "r3", place: "p1", nick: "Yuki", country: "jp", race: "east_asian", rating: 4, body: "Gentle and works well for my skin type." },
    { id: "r4", place: "p1", nick: "Linh", country: "vn", race: "southeast_asian", rating: 3, body: "Okay, but a little drying in humid weather." },
    { id: "r5", place: "p2", nick: "Chloé", country: "fr", race: "white", rating: 4, body: "Nice local shop, staff tried English. Good for sensitive skin." },
    { id: "r6", place: "p2", nick: "Marcus", country: "us", race: "black", rating: 2, body: "Same problem as everywhere — no foundation for darker tones." },
    { id: "r7", place: "p2", nick: "Wei", country: "cn", race: "east_asian", rating: 5, body: "값도 착하고 성분도 좋아요. 잘 맞아요." },
    { id: "r8", place: "p3", nick: "Haruto", country: "jp", race: "east_asian", rating: 5, body: "Loved the pork belly! Perfect with soju. Very Korean vibe." },
    { id: "r9", place: "p3", nick: "Minh", country: "vn", race: "southeast_asian", rating: 2, body: "Too greasy and salty for my taste." },
    { id: "r10", place: "p3", nick: "Jake", country: "us", race: "white", rating: 4, body: "Fun! Staff spoke some English, easy to order." },
    { id: "r11", place: "p4", nick: "Aki", country: "jp", race: "east_asian", rating: 4, body: "Rich broth, authentic. A bit strong smell at first." },
    { id: "r12", place: "p4", nick: "Sara", country: "us", race: "white", rating: 3, body: "Strong pork smell — took time to get used to." },
    { id: "r13", place: "p4", nick: "Bo", country: "cn", race: "east_asian", rating: 5, body: "진한 국물 최고. 현지인 맛집 느낌." },
    { id: "r14", place: "p5", nick: "Anna", country: "us", race: "white", rating: 4, body: "Laser worked well, doctor explained in English." },
    { id: "r15", place: "p5", nick: "Kwame", country: "us", race: "black", rating: 2, body: "Ask carefully — laser settings weren't ideal for darker skin." },
    { id: "r16", place: "p5", nick: "Mio", country: "jp", race: "east_asian", rating: 5, body: "깔끔하고 친절. 외국인 응대 익숙함." },
    { id: "r17", place: "p6", nick: "Bat", country: "mn", race: "east_asian", rating: 5, body: "Hanbok experience was amazing. Few tourists, felt authentic!" },
    { id: "r18", place: "p6", nick: "Tom", country: "us", race: "white", rating: 4, body: "Beautiful area. English signage was limited though." },
    { id: "r19", place: "p6", nick: "Ren", country: "jp", race: "east_asian", rating: 4, body: "예뻐요. 사진 찍기 좋음." },
    { id: "r20", place: "p7", nick: "Mia", country: "us", race: "white", rating: 5, body: "English version available, super fun escape room!" },
    { id: "r21", place: "p7", nick: "Trang", country: "vn", race: "southeast_asian", rating: 4, body: "Good puzzles, staff helpful." },
    { id: "r22", place: "p7", nick: "Léa", country: "fr", race: "white", rating: 3, body: "Some hints were Korean-only, a bit hard." }
  ],
  ambassadors: [
    { id: "a1", nick: "Jake (US Ambassador · Seoul)", country: "us", region: "seoul_mapo" },
    { id: "a2", nick: "Bat (Mongolia Ambassador · Jeonju)", country: "mn", region: "jeonju" }
  ],
  ambassadorContents: [
    { id: "ac1", ambassador: "a1", place: "p3", type: "video", title: "How to eat Korean BBQ like a local 🇰🇷", url: "#" },
    { id: "ac2", ambassador: "a2", place: "p6", type: "video", title: "몽골인이 간 전주 한옥마을 (Mongolian in Jeonju)", url: "#" }
  ]
};
export default GLOU_DATA;
