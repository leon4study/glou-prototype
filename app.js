/* GLOU 리뷰 프로토타입 — Yelp 느낌 (바닐라 JS)
 * 검색 + 카테고리 + 빠른필터/정렬 + (리스트 | 실지도) + 상세(지도·가게정보·평점집계) + 로그인/리뷰쓰기·투표(데모).
 * 핵심: group_by(race|country)에 따라 리뷰를 인종/국가로 필터.
 */
const D = GLOU_DATA;
const byId = (l, id) => l.find(x => x.id === id);
const catOf = id => byId(D.categories, id);
const stars = n => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
const avgNum = rs => rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0;
const avg = rs => rs.length ? avgNum(rs).toFixed(1) : "–";
const reviewsFor = pid => D.reviews.filter(r => r.place === pid);
const esc = s => (s || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
function distKm(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const state = {
  profileCountry: "us", profileRace: "white",
  category: "restaurant", region: "all", search: "", sort: "rating",
  countryFilter: "us", raceFilter: "white",
  quick: { kr: false, english: false, noPhone: false, solo: false },
  savedOnly: false, saved: new Set(["p8"]),
  userLoc: null, showAll: false, reviewSort: "recent",
  votes: {}, voted: new Set(), translated: new Set(),
  app: "reviews", ambRegion: "all", likedPosts: new Set(),
  selectedPost: null, commFilter: "all",
  likedShorts: new Set(), savedShorts: new Set(), focusShort: null,
  selectedPlace: null, page: null, theme: "ohou",
  loggedIn: false, nick: "", modal: null, pendingModal: null,
  compose: null, pendingCompose: false,
  myTab: "posts", profileNick: null, ambInit: false, demoEmpty: false
};

function setProfile(country) {
  const c = byId(D.countries, country);
  state.profileCountry = country; state.countryFilter = country;
  if (c) { state.profileRace = c.race; state.raceFilter = c.race; }
  render();
}
function goHome() { state.selectedPlace = null; state.page = null; state.search = ""; state.showAll = false; state.savedOnly = false; render(); }
function toggleSave(id) { state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id); renderResults(); }
function useMyLocation() {
  const fb = () => { state.userLoc = { lat: 37.5559, lng: 126.9368, mock: true }; state.sort = "distance"; render(); };
  if (!navigator.geolocation) return fb();
  navigator.geolocation.getCurrentPosition(
    p => { state.userLoc = { lat: p.coords.latitude, lng: p.coords.longitude }; state.sort = "distance"; render(); },
    fb, { timeout: 5000 });
}

const groupKey = cat => catOf(cat).group_by === "race" ? state.raceFilter : state.countryFilter;
const groupField = cat => catOf(cat).group_by === "race" ? "race" : "country";
const groupMatches = p => reviewsFor(p.id).filter(r => r[groupField(p.category)] === groupKey(p.category));
const detailReviews = p => state.showAll ? reviewsFor(p.id) : groupMatches(p);
const isProduct = p => catOf(p.category).kind === "product";
const raceReviews = (p, race) => reviewsFor(p.id).filter(r => r.race === race);
const raceAvg = p => avgNum(raceReviews(p, state.profileRace));
function PopSignal(p) {
  if (!p.pop) return "";
  const age = NOW_YEAR - p.pop.since;
  return `<div class="pop">🔥 리뷰 ${p.pop.reviews.toLocaleString()} · 저장 ${p.pop.saves.toLocaleString()} · ${isProduct(p) ? "출시 " + age + "년" : "업력 " + age + "년"}</div>`;
}
function FitBadge(p) {
  const raceKo = byId(D.races, state.profileRace).ko, g = raceReviews(p, state.profileRace);
  if (!g.length) return `<div class="fit none">🎯 ${raceKo} 피부 리뷰 아직 없음</div>`;
  const a = avgNum(g), cls = a >= 4 ? "good" : a >= 3 ? "mid" : "bad", v = a >= 4 ? "잘 맞아요" : a >= 3 ? "무난" : "주의";
  return `<div class="fit ${cls}">🎯 ${raceKo} 피부에 ${v} · ${a.toFixed(1)}★ (${g.length})</div>`;
}

function placesInView() {
  const q = state.search.trim().toLowerCase(), qf = state.quick;
  let ps = D.places.filter(p =>
    p.category === state.category &&
    (state.region === "all" || p.region === state.region) &&
    (!q || p.name.toLowerCase().includes(q) || catOf(p.category).ko.includes(q) || byId(D.regions, p.region).ko.toLowerCase().includes(q)) &&
    (!qf.kr || p.localFav) && (!qf.english || p.tags.english) && (!qf.noPhone || p.tags.noPhone) && (!qf.solo || p.tags.solo) &&
    (!state.savedOnly || state.saved.has(p.id)));
  const s = state.sort;
  return ps.slice().sort((a, b) =>
    s === "fit" ? raceAvg(b) - raceAvg(a) :
    s === "distance" && state.userLoc ? distKm(state.userLoc, a) - distKm(state.userLoc, b) :
    s === "reviews" ? reviewsFor(b.id).length - reviewsFor(a.id).length :
    s === "name" ? a.name.localeCompare(b.name, "ko") :
    avgNum(reviewsFor(b.id)) - avgNum(reviewsFor(a.id)));
}

/* ---------- 조각 ---------- */
const ExtRatings = p => `<div class="ext">한국 평점 · 네이버 ${p.ratings.naver} · 카카오 ${p.ratings.kakao} · 구글 ${p.ratings.google}</div>`;
function Badges(p) {
  const b = [];
  if (p.localFav) b.push(`<span class="badge kr">🇰🇷 한국인 추천</span>`);
  if (p.tags.english) b.push(`<span class="badge ok">🌐 영어</span>`);
  if (p.tags.noPhone) b.push(`<span class="badge ok">📵 번호 불필요</span>`);
  if (p.tags.solo) b.push(`<span class="badge">🧍 혼자 OK</span>`);
  return `<div class="badges">${b.join("")}</div>`;
}
function TopNav() {
  const tabs = [["reviews", "📝 리뷰"], ["community", "💬 커뮤니티"], ["shorts", "🎬 쇼츠"], ["ambassadors", "🌟 앰배서더"]];
  const themes = [["ohou", "오늘의집"], ["yelp", "Yelp"], ["slim", "슬림"]];
  const sw = themes.map(([id, l]) => `<button class="theme-btn ${state.theme === id ? "on" : ""}" data-theme-btn="${id}">${l}</button>`).join("");
  return `<nav class="topnav">
      <div class="tn-brand" id="navHome" title="홈으로">GL<span>OU</span></div>
      <div class="tn-tabs">${tabs.map(([id, l]) => `<button class="tn-tab ${state.app === id ? "on" : ""}" data-app="${id}">${l}</button>`).join("")}</div>
      <div class="theme-sw" title="디자인 프리셋">${sw}</div>
      ${state.app === "shorts" ? "" : `<button id="loginBtn" class="login-btn">${state.loggedIn ? "👤 " + esc(state.nick) : "🔑 로그인"}</button>`}
    </nav>`;
}
function Header() {
  return `<header class="hdr"><p class="tag">내 주변 <b>한국인 맛집·로컬 스팟</b>을 내 국가·인종 리뷰로. 지방까지.</p></header>`;
}
function SearchBar() {
  const regionOpts = `<option value="all">📍 내 주변(전체)</option>` +
    D.regions.map(r => `<option value="${r.id}" ${r.id === state.region ? "selected" : ""}>${r.ko}</option>`).join("");
  return `<section class="searchbar">
      <input id="search" class="s-what" placeholder="한국인 맛집, 카페, 화장품… 검색" value="${esc(state.search)}">
      <select id="region" class="s-where">${regionOpts}</select>
      <button class="s-go">검색</button></section>`;
}
function ProfileBar() {
  const co = D.countries.map(c => `<option value="${c.id}" ${c.id === state.profileCountry ? "selected" : ""}>${c.flag} ${c.ko}</option>`).join("");
  const ra = D.races.map(r => `<option value="${r.id}" ${r.id === state.profileRace ? "selected" : ""}>${r.ko}</option>`).join("");
  return `<section class="profile">👤 <b>내 프로필(필터)</b>
      <label>국적 <select id="profileCountry">${co}</select></label>
      <label>인종 <select id="profileRace">${ra}</select></label>
      <span class="hint">→ 내 국가/인종 리뷰가 먼저</span></section>`;
}
function CategoryPills() {
  return `<nav class="pills">` + D.categories.map(c =>
    `<button class="pill ${c.id === state.category ? "on" : ""}" data-cat="${c.id}">
       <span class="pill-emoji">${c.emoji}</span><span>${c.ko}</span></button>`).join("") + `</nav>`;
}
function FilterRow() {
  const gb = catOf(state.category).group_by;
  let grp;
  if (gb === "race") {
    const o = D.races.map(r => `<option value="${r.id}" ${r.id === state.raceFilter ? "selected" : ""}>${r.ko}</option>`).join("");
    grp = `<label class="grp"><span>🧬 인종</span><select id="raceFilter">${o}</select></label>`;
  } else {
    const o = D.countries.map(c => `<option value="${c.id}" ${c.id === state.countryFilter ? "selected" : ""}>${c.flag} ${c.ko}</option>`).join("");
    grp = `<label class="grp"><span>🏳️ 국가</span><select id="countryFilter">${o}</select></label>`;
  }
  const sorts = [["rating", "평점 높은순"], ["reviews", "리뷰 많은순"], ["name", "이름순"]];
  if (state.userLoc) sorts.unshift(["distance", "거리순(내 주변)"]);
  if (catOf(state.category).kind === "product") sorts.unshift(["fit", "내 피부 맞춤"]);
  const sortOpts = sorts.map(([v, l]) => `<option value="${v}" ${state.sort === v ? "selected" : ""}>${l}</option>`).join("");
  return `<section class="filters">${grp}
    <label class="grp"><span>↕️ 정렬</span><select id="sort">${sortOpts}</select></label>
    <button id="myloc" class="chip loc">📍 ${state.userLoc ? (state.userLoc.mock ? "내 주변(데모)" : "내 주변 ✓") : "내 주변"}</button></section>`;
}
function ChipsRow() {
  const chips = [["kr", "🇰🇷 한국인 추천"], ["english", "🌐 영어"], ["noPhone", "📵 번호 불필요"], ["solo", "🧍 혼자 OK"]];
  const c = chips.map(([k, l]) => `<button class="chip ${state.quick[k] ? "on" : ""}" data-chip="${k}">${l}</button>`).join("");
  const saved = `<button class="chip ${state.savedOnly ? "on" : ""}" data-savedonly>❤️ 저장한 곳 (${state.saved.size})</button>`;
  return `<section class="chips">${c}${saved}</section>`;
}
function Card(p) {
  const rs = reviewsFor(p.id), prod = isProduct(p);
  const dist = (!prod && state.userLoc) ? ` · ${distKm(state.userLoc, p).toFixed(1)}km` : "";
  const metaLine = prod ? `${p.brand} · ${p.ptype}` : `${catOf(p.category).ko} · ${byId(D.regions, p.region).ko}${dist}`;
  return `<div class="card" data-place="${p.id}">
      <div class="thumb">${p.emoji}</div>
      <div class="card-body">
        <div class="card-top"><span class="name">${p.name}</span>
          <button class="save-btn ${state.saved.has(p.id) ? "on" : ""}" data-save="${p.id}" title="저장">${state.saved.has(p.id) ? "❤️" : "🤍"}</button></div>
        <div class="rating-line"><span class="stars">${stars(Math.round(avgNum(rs)))}</span>
          <b>${avg(rs)}</b> <span class="rc">(${rs.length})</span> · <span class="price">${p.price}</span></div>
        <div class="meta">${metaLine}</div>
        ${prod ? FitBadge(p) : ""}${PopSignal(p)}${ExtRatings(p)}${Badges(p)}
        <div class="mine">내 그룹(${byId(D.countries, state.profileCountry).ko}/${byId(D.races, state.profileRace).ko}) 리뷰 ${groupMatches(p).length}개</div>
      </div></div>`;
}
function List() {
  const places = placesInView();
  if (!places.length) return `<section class="list"><p class="empty">조건에 맞는 장소가 없어요.</p></section>`;
  return `<section class="list">${places.map(Card).join("")}</section>`;
}
function MapPane() {
  if (typeof L !== "undefined")
    return `<aside class="mappane"><div class="map-note">🗺️ 실제 지도 (Leaflet · OpenStreetMap) — 핀 클릭 시 상세</div>
      <div id="map" class="leaflet-map"></div></aside>`;
  const pins = placesInView().map((p, i) =>
    `<button class="pin" data-place="${p.id}" style="left:${10 + (i * 19) % 74}%; top:${14 + (i * 29) % 68}%">
       <span class="pin-dot">${p.emoji}</span><span class="pin-label">${p.name}</span></button>`).join("");
  return `<aside class="mappane"><div class="map-note">🗺️ 지도(오프라인) — 인터넷 연결 시 실제 지도</div><div class="map-canvas">${pins}</div></aside>`;
}
function DetailMap(p) {
  if (typeof L !== "undefined")
    return `<aside class="mappane detail-map"><div class="map-note">🗺️ ${p.addr}</div><div id="detail-map" class="leaflet-map dmap"></div></aside>`;
  return `<aside class="mappane detail-map"><div class="map-note">🗺️ ${p.addr}</div>
      <div class="map-canvas"><button class="pin" style="left:50%;top:50%"><span class="pin-dot">${p.emoji}</span><span class="pin-label">${p.name}</span></button></div></aside>`;
}
function BizInfo(p) {
  const menu = (p.menu || []).map(m => `<li><span>${m[0]}</span><b>${m[1]}</b></li>`).join("");
  return `<div class="biz-info">
      <div class="biz-row">🕒 <b>영업시간</b> ${p.hours || "정보 없음"}</div>
      ${menu ? `<div class="biz-row menu">📋 <b>대표 메뉴</b><ul>${menu}</ul></div>` : ""}
      <div class="biz-row">${ExtRatings(p)}</div></div>`;
}
function ProductInfo(p) {
  return `<aside class="mappane product-info">
    <div class="pi-row"><b>브랜드</b> ${p.brand}</div>
    <div class="pi-row"><b>타입</b> ${p.ptype}</div>
    <div class="pi-row"><b>주요 성분</b> ${p.ingredients}</div>
    <div class="pi-row"><b>구매처</b> ${p.buy}</div>
    <div class="pi-row">${ExtRatings(p)}</div>${PopSignal(p)}</aside>`;
}
function PersonalRec(p) {
  const raceKo = byId(D.races, state.profileRace).ko, g = raceReviews(p, state.profileRace), a = avgNum(g);
  const verdict = !g.length ? `${raceKo} 피부 리뷰가 아직 없어요. 아래 전체 리뷰를 참고하세요.`
    : a >= 4 ? `${raceKo} 피부에 잘 맞아요 — ${a.toFixed(1)}★ (${g.length}명).`
    : a >= 3 ? `${raceKo} 피부엔 무난해요 — ${a.toFixed(1)}★ (${g.length}명).`
    : `⚠️ ${raceKo} 피부 평가가 낮아요 — ${a.toFixed(1)}★ (${g.length}명). 신중히.`;
  const alt = D.places.filter(x => x.category === p.category && x.id !== p.id)
    .map(x => ({ x, a: raceAvg(x), n: raceReviews(x, state.profileRace).length })).filter(o => o.n)
    .sort((m, n) => n.a - m.a)[0];
  const altHtml = (alt && (!g.length || alt.a > a)) ? `<button class="rec-alt" data-place="${alt.x.id}">💡 ${raceKo} 피부엔 <b>${alt.x.name}</b> (${alt.a.toFixed(1)}★)가 더 맞을 수 있어요 →</button>` : "";
  return `<div class="personal"><h3>🎯 ${raceKo} 피부 맞춤 요약</h3><p>${verdict}</p>${altHtml}</div>`;
}
function TopThree() {
  if (catOf(state.category).kind !== "product") return "";
  const raceKo = byId(D.races, state.profileRace).ko;
  const top = D.places.filter(p => p.category === state.category)
    .map(p => ({ p, a: raceAvg(p), n: raceReviews(p, state.profileRace).length }))
    .sort((x, y) => y.a - x.a).slice(0, 3);
  return `<section class="top3"><h3>🏆 ${raceKo} 피부 Top 3 <span>내 인종 리뷰 기준</span></h3>
    <div class="top3-row">${top.map((t, i) => `<button class="top3-card" data-place="${t.p.id}">
      <span class="t3-rank">${i + 1}</span><span class="t3-emoji">${t.p.emoji}</span>
      <span class="t3-name">${t.p.name}</span><span class="t3-brand">${t.p.brand} · ${t.p.ptype}</span>
      <span class="t3-score">${t.n ? t.a.toFixed(1) + "★" : "–"}</span></button>`).join("")}</div></section>`;
}
function Breakdown(p) {
  const gb = catOf(p.category).group_by;
  const field = gb === "race" ? "race" : "country";
  const dict = gb === "race" ? D.races : D.countries;
  const groups = {};
  reviewsFor(p.id).forEach(r => { (groups[r[field]] = groups[r[field]] || []).push(r); });
  const mine = groupKey(p.category);
  const rows = Object.keys(groups).map(k => {
    const g = groups[k], item = byId(dict, k);
    return { key: k, label: item ? ((item.flag || "") + item.ko) : k, a: avgNum(g), n: g.length };
  }).sort((x, y) => y.a - x.a);
  return `<div class="breakdown"><h3>${gb === "race" ? "인종별" : "국가별"} 평점 종합 <span>같은 곳도 문화·피부·입맛 따라 평이 갈려요</span></h3>
    ${rows.map(r => `<div class="bd-row ${r.key === mine ? "me" : ""}">
      <span class="bd-label">${r.label}${r.key === mine ? " (나)" : ""}</span>
      <div class="bar"><div style="width:${r.a / 5 * 100}%"></div></div>
      <span class="bd-val">${r.a.toFixed(1)}★ · ${r.n}개</span></div>`).join("")}</div>`;
}
function Detail(p) {
  const all = reviewsFor(p.id), gb = catOf(p.category).group_by;
  const groupLabel = gb === "race" ? byId(D.races, state.raceFilter).ko + " (인종)" : byId(D.countries, state.countryFilter).ko + " (국가)";
  const idx = r => D.reviews.indexOf(r);
  const shown = detailReviews(p).slice().sort((a, b) =>
    state.reviewSort === "high" ? b.rating - a.rating : state.reviewSort === "low" ? a.rating - b.rating : idx(b) - idx(a));
  const hidden = all.length - groupMatches(p).length;
  const dist = [5, 4, 3, 2, 1].map(s => {
    const n = all.filter(r => r.rating === s).length, pct = all.length ? Math.round(n / all.length * 100) : 0;
    return `<div class="dist-row"><span>${s}★</span><div class="bar"><div style="width:${pct}%"></div></div><span class="dn">${n}</span></div>`;
  }).join("");
  const list = shown.map(r => {
    const c = byId(D.countries, r.country), race = byId(D.races, r.race);
    const vc = state.votes[r.id] || 0;
    const t = state.translated.has(r.id);
    return `<div class="review"><div class="avatar">${(r.nick[0] || "?").toUpperCase()}</div>
        <div class="rv-main"><div class="rv-top"><b>${esc(r.nick)}</b> <span class="rv-tag">${c ? c.flag + c.ko : r.country} · ${race ? race.ko : ""}</span>
          <span class="rv-star">${stars(r.rating)}</span></div><p class="rv-body">${esc(r.body)}</p>${r.tags && r.tags.length ? `<div class="rv-tags">${r.tags.map(t => `<span class="rv-tag-chip">#${esc(t)}</span>`).join("")}</div>` : ""}
          ${r.photo ? `<img class="rv-photo" src="${r.photo}" alt="review photo">` : ""}
          ${r.trans ? `${t ? `<p class="trans">↳ ${esc(r.trans)}</p>` : ""}<button class="trans-btn" data-trans="${r.id}">${t ? "원문 보기" : "🌐 번역 보기"}</button>` : ""}
          <button class="vote ${state.voted.has(r.id) ? "on" : ""}" data-vote="${r.id}">👍 유용해요 ${vc || ""}</button></div></div>`;
  }).join("");
  const acs = D.ambassadorContents.filter(a => a.place === p.id).map(a => {
    const amb = byId(D.ambassadors, a.ambassador);
    return `<a class="amb" href="${a.url}">🎬 <b>${amb.nick}</b><br>${a.title}</a>`;
  }).join("");
  const rsOpts = [["recent", "최신순"], ["high", "높은 별점"], ["low", "낮은 별점"]]
    .map(([v, l]) => `<option value="${v}" ${state.reviewSort === v ? "selected" : ""}>${l}</option>`).join("");
  return `<button class="back" id="back">← 목록으로</button>
    <section class="detail">
      <div class="detail-cols">
        <div class="hero"><div class="hero-thumb">${p.emoji}</div>
          <div class="hero-info"><h2>${p.name}</h2>
            <div class="rating-line big"><span class="stars">${stars(Math.round(avgNum(all)))}</span> <b>${avg(all)}</b>
              <span class="rc">(${all.length} reviews)</span> · <span class="price">${p.price}</span></div>
            <div class="meta">${isProduct(p) ? `${catOf(p.category).ko} · ${p.brand} · ${p.ptype}` : `${catOf(p.category).ko} · ${byId(D.regions, p.region).ko} · ${p.addr}`}</div>
            ${Badges(p)}
            <div class="actions">${isProduct(p)
                ? `<button class="act">🛒 구매처</button><button class="act">📍 판매점 재고 문의</button>`
                : `<button class="act">🧭 길찾기</button><button class="act">📞 전화</button>`}
              <button class="act ${state.saved.has(p.id) ? "saved" : ""}" data-save="${p.id}">${state.saved.has(p.id) ? "❤️ 저장됨" : "🤍 저장"}</button></div>
          </div></div>
        ${isProduct(p) ? ProductInfo(p) : DetailMap(p)}
      </div>
      ${isProduct(p) ? PersonalRec(p) : BizInfo(p)}
      ${acs ? `<div class="amb-wrap"><h3>🌏 앰배서더 콘텐츠</h3>${acs}</div>` : ""}
      <div class="dist">${dist}</div>
      ${Breakdown(p)}
      <div class="reviews-head"><h3>📝 리뷰 (${all.length})</h3>
        <div class="rv-controls">
          <button class="rv-toggle ${!state.showAll ? "on" : ""}" id="grpOnly">👤 내 그룹만</button>
          <button class="rv-toggle ${state.showAll ? "on" : ""}" id="allRv">🌐 전체</button>
          <select id="reviewSort" class="rv-sort">${rsOpts}</select>
          <button class="write-btn" id="writeReview">✍️ 리뷰 쓰기</button>
        </div></div>
      ${!state.showAll && hidden > 0 ? `<div class="filter-note">${groupLabel} 리뷰만 보는 중 · 다른 그룹 ${hidden}개 숨김</div>` : ""}
      <div class="reviews">${list || `<p class="empty">이 그룹의 리뷰가 아직 없어요. 🌐전체를 눌러보세요.</p>`}</div>
    </section>`;
}
function myContentGrid(nick) {
  if (state.demoEmpty && nick === "You") return `<p class="empty">아직 올린 게시물이 없어요.</p>`;
  const items = D.posts.filter(p => p.authorNick === nick).map(p => ({ t: "post", id: p.id, e: p.thumb, likes: p.likes }))
    .concat(D.shorts.filter(s => s.authorNick === nick).map(s => ({ t: "short", id: s.id, e: s.emoji, likes: s.likes })));
  if (!items.length) return `<p class="empty">아직 올린 게시물이 없어요.</p>`;
  return `<div class="pg-grid">${items.map(it => `<button class="pg-cell" data-pg="${it.t}:${it.id}"><span class="pg-emoji">${it.e}</span>${it.t === "short" ? `<span class="pg-badge">🎬</span>` : ""}<span class="pg-likes">❤️ ${it.likes.toLocaleString()}</span></button>`).join("")}</div>`;
}
function openPgItem(pg) {
  const idx = pg.indexOf(":"), t = pg.slice(0, idx), id = pg.slice(idx + 1);
  state.profileNick = null; state.page = null;
  if (t === "post") { state.app = "community"; state.selectedPost = id; }
  else { state.app = "shorts"; state.focusShort = id; }
  render();
}
function InfluencerProfile() {
  const nick = state.profileNick;
  const a = D.ambassadors.find(x => x.nick === nick) || {};
  const anyPost = D.posts.find(p => p.authorNick === nick);
  const c = byId(D.countries, a.country || (anyPost && anyPost.country));
  const rg = byId(D.regions, a.region);
  const myPosts = D.posts.filter(p => p.authorNick === nick), myShorts = D.shorts.filter(s => s.authorNick === nick);
  const likes = myPosts.reduce((s, p) => s + p.likes, 0) + myShorts.reduce((s, x) => s + x.likes, 0);
  return `<div class="composer profile-ov">
    <header class="cz-bar"><button class="cz-cancel" id="profBack">← 뒤로</button><span class="cz-title">${esc(nick)}</span><span style="width:40px"></span></header>
    <div class="cz-body">
      <div class="prof-head">
        <div class="prof-avatar">${nick[0].toUpperCase()}</div>
        <div class="prof-id"><h2>${esc(nick)}</h2><div class="prof-meta">${c ? c.flag + c.ko : ""}${rg ? " · " + rg.ko : ""}</div>
          <div class="prof-stats"><b>${myPosts.length + myShorts.length}</b> 게시물 · ❤️ <b>${likes.toLocaleString()}</b>${a.followers ? ` · 팔로워 <b>${a.followers.toLocaleString()}</b>` : ""}</div></div>
      </div>
      ${myContentGrid(nick)}
    </div>
  </div>`;
}
function bindProfile() {
  const back = document.getElementById("profBack"); if (back) back.addEventListener("click", () => { state.profileNick = null; render(); });
  document.querySelectorAll(".profile-ov [data-pg]").forEach(b => b.addEventListener("click", () => openPgItem(b.dataset.pg)));
}
function MyPage() {
  const c = byId(D.countries, state.profileCountry), race = byId(D.races, state.profileRace);
  const nick = state.loggedIn ? (state.nick || "You") : "Guest";
  const savedPlaces = D.places.filter(p => state.saved.has(p.id));
  const myReviews = D.reviews.filter(r => String(r.id).startsWith("u"));
  const nPosts = D.posts.filter(p => p.authorNick === nick).length + D.shorts.filter(s => s.authorNick === nick).length;
  const tab = state.myTab || "posts";
  const tabbar = [["posts", `게시물 ${nPosts}`], ["reviews", `리뷰 ${myReviews.length}`], ["saved", `저장 ${savedPlaces.length}`]]
    .map(([k, l]) => `<button class="mp-tab ${tab === k ? "on" : ""}" data-mytab="${k}">${l}</button>`).join("");
  let body;
  if (tab === "reviews") body = myReviews.length ? `<section class="list">${myReviews.map(r => { const p = byId(D.places, r.place); return `<div class="my-review" data-place="${r.place}"><div class="rv-top"><b>${p ? p.name : ""}</b><span class="rv-star">${stars(r.rating)}</span></div><p>${esc(r.body)}</p>${r.tags && r.tags.length ? `<div class="rv-tags">${r.tags.map(t => `<span class="rv-tag-chip">#${esc(t)}</span>`).join("")}</div>` : ""}</div>`; }).join("")}</section>` : `<p class="empty">아직 쓴 리뷰가 없어요. 장소 상세에서 ✍️ 리뷰 쓰기로 남겨보세요.</p>`;
  else if (tab === "saved") body = savedPlaces.length ? `<section class="list">${savedPlaces.map(Card).join("")}</section>` : `<p class="empty">저장한 곳이 없어요. 카드의 🤍를 눌러 저장하세요.</p>`;
  else body = myContentGrid(nick);
  return `<button class="back" id="backHome">← 홈으로</button>
    <section class="mypage">
      <div class="mp-head">
        <div class="mp-avatar">${state.loggedIn ? (nick[0] || "U").toUpperCase() : "👤"}</div>
        <div class="mp-id"><h2>${esc(nick)}</h2>
          <div class="meta">${c.flag}${c.ko} · ${race.ko} · ${state.loggedIn ? "로그인됨" : "비로그인"}</div></div>
        <div class="mp-actions">${state.loggedIn
          ? `<button class="btn-ghost" id="editProfile">프로필 수정</button><button class="btn-ghost" id="logout2">로그아웃</button>`
          : `<button class="btn-primary" id="loginHere">로그인</button>`}</div>
      </div>
      <div class="mp-tabs">${tabbar}</div>
      <div class="mp-tabbody">${body}</div>
    </section>`;
}
function Modal() {
  if (!state.modal) return "";
  if (state.modal === "login") {
    const co = D.countries.map(c => `<option value="${c.id}" ${c.id === state.profileCountry ? "selected" : ""}>${c.flag} ${c.ko}</option>`).join("");
    return `<div class="modal-ov" id="ov"><div class="modal"><h3>로그인 / 가입 <span>한국번호 없이 이메일로</span></h3>
      <label>이메일<input id="li-email" type="email" placeholder="you@example.com"></label>
      <label>닉네임<input id="li-nick" placeholder="Nickname"></label>
      <label>국적<select id="li-country">${co}</select></label>
      <div class="modal-btns">${state.loggedIn ? `<button id="logout" class="btn-ghost">로그아웃</button>` : ""}
        <button id="loginCancel" class="btn-ghost">취소</button><button id="loginSubmit" class="btn-primary">로그인</button></div></div></div>`;
  }
  if (state.modal === "post") {
    const regionOpts = D.regions.filter(r => r.id !== "online").map(r => `<option value="${r.id}">${r.ko}</option>`).join("");
    const placeOpts = `<option value="">(장소 연결 안 함)</option>` + D.places.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
    return `<div class="modal-ov" id="ov"><div class="modal"><h3>콘텐츠 올리기 <span>내 지역 홍보</span></h3>
      <label>제목<input id="po-title" placeholder="예: 성수 감성 카페 투어"></label>
      <label>지역<select id="po-region">${regionOpts}</select></label>
      <label>장소 연결(선택)<select id="po-place">${placeOpts}</select></label>
      <label>내용<textarea id="po-body" rows="4" placeholder="현지인처럼 즐기는 법을 공유하세요"></textarea></label>
      <p class="modal-note">작성자: ${esc(state.nick)} — 게시물·좋아요가 앰배서더 랭킹을 올립니다</p>
      <div class="modal-btns"><button id="postCancel" class="btn-ghost">취소</button><button id="postSubmit" class="btn-primary">올리기</button></div></div></div>`;
  }
  const p = byId(D.places, state.selectedPlace) || {}, c = byId(D.countries, state.profileCountry);
  return `<div class="modal-ov" id="ov"><div class="modal"><h3>리뷰 쓰기 <span>${p.name || ""}</span></h3>
      <label>별점<select id="rv-rating">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${stars(n)} (${n})</option>`).join("")}</select></label>
      <label>내용<textarea id="rv-body" rows="4" placeholder="솔직한 후기를 남겨주세요"></textarea></label>
      <label>📷 사진 (선택)<input type="file" accept="image/*" id="rv-photo"></label>
      <p class="modal-note">작성자: ${esc(state.nick)} · ${c.flag}${c.ko} · ${byId(D.races, state.profileRace).ko} — 프로토타입이라 새로고침 시 초기화</p>
      <div class="modal-btns"><button id="rvCancel" class="btn-ghost">취소</button><button id="rvSubmit" class="btn-primary">등록</button></div></div></div>`;
}

/* ---------- 렌더 ---------- */
function bindTop() {
  document.querySelectorAll("[data-app]").forEach(b => b.addEventListener("click", () => { state.app = b.dataset.app; state.selectedPlace = null; state.page = null; state.selectedPost = null; render(); }));
  const nh = document.getElementById("navHome"); if (nh) nh.addEventListener("click", () => { state.app = "reviews"; state.selectedPost = null; goHome(); });
  document.querySelectorAll("[data-theme-btn]").forEach(b => b.addEventListener("click", () => { state.theme = b.dataset.themeBtn; render(); }));
  document.querySelectorAll("[data-bn]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.bn;
    if (id === "mypage") { if (state.loggedIn) { state.app = "reviews"; state.page = "mypage"; state.selectedPlace = null; state.selectedPost = null; } else { state.modal = "login"; } }
    else { state.app = id; state.selectedPlace = null; state.page = null; state.selectedPost = null; }
    render();
  }));
  const lb = document.getElementById("loginBtn");
  if (lb) lb.addEventListener("click", () => {
    if (!state.loggedIn) { state.modal = "login"; render(); }
    else { state.app = "reviews"; state.page = "mypage"; state.selectedPlace = null; render(); }
  });
}
function bindModal() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on("ov", "click", e => { if (e.target.id === "ov") { state.modal = null; render(); } });
  on("loginCancel", "click", () => { state.modal = null; render(); });
  on("logout", "click", () => { state.loggedIn = false; state.nick = ""; state.modal = null; render(); });
  on("loginSubmit", "click", () => {
    const nick = (document.getElementById("li-nick").value || "").trim() || "You";
    const country = document.getElementById("li-country").value, c = byId(D.countries, country);
    state.loggedIn = true; state.nick = nick;
    state.profileCountry = country; state.countryFilter = country;
    if (c) { state.profileRace = c.race; state.raceFilter = c.race; }
    if (state.pendingCompose) { state.pendingCompose = false; state.compose = { rating: 5, tags: [], body: "", photo: null }; state.modal = null; state.pendingModal = null; }
    else { state.modal = state.pendingModal || null; state.pendingModal = null; } // 로그인 후 하려던 동작으로 바로 이어감
    render();
  });
  on("rvCancel", "click", () => { state.modal = null; render(); });
  on("rvSubmit", "click", () => {
    const body = (document.getElementById("rv-body").value || "").trim();
    if (!body) return document.getElementById("rv-body").focus();
    const rating = +document.getElementById("rv-rating").value;
    const fi = document.getElementById("rv-photo"), file = fi && fi.files && fi.files[0];
    const finish = photo => {
      D.reviews.push({ id: "u" + Date.now(), place: state.selectedPlace, nick: state.nick || "You", country: state.profileCountry, race: state.profileRace, rating, body, photo });
      state.modal = null; render();
    };
    if (file) { const fr = new FileReader(); fr.onload = e => finish(e.target.result); fr.readAsDataURL(file); }
    else finish(undefined);
  });
  on("postCancel", "click", () => { state.modal = null; render(); });
  on("postSubmit", "click", () => {
    const title = (document.getElementById("po-title").value || "").trim();
    if (!title) return document.getElementById("po-title").focus();
    const body = (document.getElementById("po-body").value || "").trim();
    const region = document.getElementById("po-region").value;
    const placeId = document.getElementById("po-place").value || null;
    const pl = placeId ? byId(D.places, placeId) : null;
    D.posts.unshift({ id: "post" + Date.now(), authorNick: state.nick || "You", country: state.profileCountry, region, place: placeId, tag: (state.commFilter && state.commFilter !== "all") ? state.commFilter : "food", title, body, thumb: pl ? pl.emoji : "📸", likes: 0 });
    state.modal = null; render();
  });
}
function regionsInScope(scope) {
  if (scope === "all") return D.regions.filter(r => r.lat).map(r => r.id);
  const prov = (D.provinces || []).find(p => p.id === scope);
  return prov ? prov.regions : [scope];
}
function provinceOf(scope) {
  if (scope === "all") return null;
  const prov = (D.provinces || []).find(p => p.id === scope);
  if (prov) return prov;
  const r = byId(D.regions, scope);
  return r ? (D.provinces || []).find(p => p.id === r.province) : null;
}
function rankings(scope) {
  const ids = regionsInScope(scope), inScope = id => ids.includes(id), map = {};
  D.ambassadors.forEach(a => { if (inScope(a.region)) map[a.nick] = { nick: a.nick, country: a.country, region: a.region, followers: a.followers, posts: 0, likes: 0 }; });
  D.posts.forEach(p => {
    if (state.demoEmpty && p.authorNick === "You") return;
    if (!inScope(p.region)) return;
    if (!map[p.authorNick]) map[p.authorNick] = { nick: p.authorNick, country: p.country, region: p.region, followers: 0, posts: 0, likes: 0 };
    map[p.authorNick].posts++; map[p.authorNick].likes += p.likes + (state.likedPosts.has(p.id) ? 1 : 0);
  });
  return Object.values(map).map(x => ({ ...x, score: Math.round(x.followers / 50 + x.posts * 10 + x.likes) })).sort((a, b) => b.score - a.score);
}
function AmbassadorApp() {
  return `<div class="amb-app">
    <div class="amb-hero"><h1>🌟 GLOU 앰배서더</h1><p>지역별 크리에이터 랭킹 · 현지인 콘텐츠 — 게시물·좋아요가 랭킹을 올립니다.</p></div>
    ${AmbRank()}${AmbFeed()}</div>`;
}
function AmbRank() {
  if (!state.ambInit) { state.ambInit = true; const top = rankings("all")[0]; if (top) state.ambRegion = top.region; }
  const opts = [`<option value="all" ${state.ambRegion === "all" ? "selected" : ""}>🌍 전체 (전국)</option>`];
  (D.provinces || []).forEach(pr => {
    opts.push(`<option value="${pr.id}" ${state.ambRegion === pr.id ? "selected" : ""}>📍 ${pr.ko}</option>`);
    D.regions.filter(r => r.province === pr.id && r.lat).forEach(r => opts.push(`<option value="${r.id}" ${state.ambRegion === r.id ? "selected" : ""}>　└ ${r.ko}</option>`));
  });
  const rank = rankings(state.ambRegion), medal = i => ["🥇", "🥈", "🥉"][i] || (i + 1);
  const prov = provinceOf(state.ambRegion), rgSel = byId(D.regions, state.ambRegion);
  const scope = state.ambRegion === "all" ? "전국" : (rgSel ? rgSel.ko : (prov ? prov.ko : ""));
  const rows = rank.map((a, i) => {
    const c = byId(D.countries, a.country), rg = byId(D.regions, a.region);
    return `<div class="rank-row ${a.nick === state.nick ? "is-me" : ""}" data-nick="${esc(a.nick)}"><span class="rk">${medal(i)}</span>
      <span class="rk-avatar">${a.nick[0].toUpperCase()}</span>
      <span class="rk-name">${esc(a.nick)}${a.nick === state.nick ? ` <em class="me-badge">나</em>` : ""}<em>${c ? c.flag + c.ko : ""} · ${rg ? rg.ko : ""}</em></span>
      <span class="rk-stats">게시물 ${a.posts} · ❤️ ${a.likes} · 팔로워 ${a.followers.toLocaleString()}</span>
      <span class="rk-score">${a.score}</span></div>`;
  }).join("");
  const myIdx = rank.findIndex(a => a.nick === state.nick);
  const myRankBanner = state.loggedIn ? `<div class="my-rank">${myIdx >= 0 ? `내 랭킹 <b>#${myIdx + 1}</b> — ${scope}에서 활동 중` : `${scope} 내 랭킹 아직 없음 — ✍️ 글을 올려 도전하세요`}</div>` : "";
  const back = state.ambRegion !== "all" ? `<button class="rank-back" id="ambBack">← 전국(도 단위)</button>` : "";
  const note = prov ? `${prov.ko} — 시·구 단위 (핀 클릭 → 그 지역 랭킹)` : "도 단위 (핀 클릭 → 시·구로 확대)";
  return `<section class="rank"><div class="rank-head"><h2>🏆 앰배서더 랭킹</h2>
      <select id="ambRegion">${opts.join("")}</select></div>
    <div class="map-note">🗺️ ${scope} · ${note} ${back}</div>
    ${myRankBanner}
    <div id="amb-map" class="amb-map"></div>
    <div class="rank-list">${rows || `<p class="empty">이 지역 앰배서더가 아직 없어요.</p>`}</div></section>`;
}
function AmbFeed() {
  const posts = D.posts.filter(p => state.ambRegion === "all" || p.region === state.ambRegion);
  const cards = posts.map(p => {
    const c = byId(D.countries, p.country), rg = byId(D.regions, p.region), pl = p.place ? byId(D.places, p.place) : null;
    const liked = state.likedPosts.has(p.id), likes = p.likes + (liked ? 1 : 0);
    return `<article class="post"><div class="post-thumb">${p.thumb}</div>
      <div class="post-body"><div class="post-title">${esc(p.title)}</div>
        <div class="post-meta">${esc(p.authorNick)} · ${c ? c.flag + c.ko : ""} · ${rg ? rg.ko : ""}${pl ? " · 📍" + pl.name : ""}</div>
        <p class="post-text">${esc(p.body)}</p>
        <div class="post-actions"><button class="like-btn ${liked ? "on" : ""}" data-like="${p.id}">❤️ ${likes}</button>
          ${pl ? `<button class="post-place" data-place="${p.place}">장소 보기 →</button>` : ""}</div>
      </div></article>`;
  }).join("");
  return `<section class="feed"><div class="feed-head"><h2>📸 인플루언서 콘텐츠</h2>
      <button class="write-btn" id="newPost">✍️ 콘텐츠 올리기</button></div>
    <div class="feed-list">${cards || `<p class="empty">이 지역 콘텐츠가 아직 없어요.</p>`}</div></section>`;
}
function bindAmbassador() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on("ambRegion", "change", e => { state.ambRegion = e.target.value; render(); });
  on("ambBack", "click", () => { state.ambRegion = "all"; render(); });
  on("newPost", "click", () => { if (state.loggedIn) state.modal = "post"; else { state.pendingModal = "post"; state.modal = "login"; } render(); });
  document.querySelectorAll("[data-like]").forEach(b => b.addEventListener("click", () => { const id = b.dataset.like; state.likedPosts.has(id) ? state.likedPosts.delete(id) : state.likedPosts.add(id); render(); }));
  document.querySelectorAll(".post-place[data-place]").forEach(b => b.addEventListener("click", () => { state.app = "reviews"; state.selectedPlace = b.dataset.place; render(); }));
  document.querySelectorAll(".rank-row[data-nick]").forEach(b => b.addEventListener("click", () => { state.profileNick = b.dataset.nick; render(); }));
  initAmbMap();
}
function ShortsApp() {
  const cards = D.shorts.map(s => {
    const c = byId(D.countries, s.country);
    const liked = state.likedShorts.has(s.id), saved = state.savedShorts.has(s.id);
    const likes = s.likes + (liked ? 1 : 0), saves = s.saves + (saved ? 1 : 0);
    const shop = (s.tags || []).map(pid => {
      const pl = byId(D.places, pid);
      return pl ? `<button class="sshop-card" data-place="${pid}"><span class="sshop-emoji">${pl.emoji}</span><span><span class="sshop-name">${esc(pl.name)}</span><br><span class="sshop-tag">장소 보기 →</span></span></button>` : "";
    }).join("");
    return `<section class="short" data-short="${s.id}">
      <div class="short-cover"><span>${s.emoji}</span></div>
      <div class="short-top"><span>🎬 쇼츠</span><span>⋯</span></div>
      <div class="short-rail">
        <button class="srail-btn like ${liked ? "on" : ""}" data-slike="${s.id}">❤️<span>${likes.toLocaleString()}</span></button>
        <button class="srail-btn save ${saved ? "on" : ""}" data-ssave="${s.id}">🔖<span>${saves.toLocaleString()}</span></button>
        <button class="srail-btn">💬<span>${s.comments}</span></button>
        <button class="srail-btn">↗<span>공유</span></button>
      </div>
      <div class="short-info">
        <div class="short-author"><span class="cpost-av">${s.authorNick[0].toUpperCase()}</span>${esc(s.authorNick)} · ${c ? c.flag + c.ko : ""}</div>
        <div class="short-cap">${esc(s.caption)}</div>
      </div>
      <div class="short-shop">${shop}</div>
      <div class="short-next">↓ 다음 영상</div>
    </section>`;
  }).join("");
  return `<div class="shorts-feed">${cards}</div>`;
}
function bindShorts() {
  const toggle = (set, id) => { set.has(id) ? set.delete(id) : set.add(id); state.focusShort = id; render(); };
  document.querySelectorAll("[data-slike]").forEach(b => b.addEventListener("click", () => toggle(state.likedShorts, b.dataset.slike)));
  document.querySelectorAll("[data-ssave]").forEach(b => b.addEventListener("click", () => toggle(state.savedShorts, b.dataset.ssave)));
  document.querySelectorAll(".short .sshop-card[data-place]").forEach(b => b.addEventListener("click", () => { state.app = "reviews"; state.selectedPlace = b.dataset.place; render(); }));
  if (state.focusShort) { const el = document.querySelector(`.short[data-short="${state.focusShort}"]`); if (el) el.scrollIntoView(); state.focusShort = null; }
}
function CommunityApp() {
  if (state.selectedPost) return PostDetail(byId(D.posts, state.selectedPost));
  const filters = [["all", "전체"], ["food", "맛집"], ["cafe", "카페"], ["beauty", "뷰티"], ["travel", "여행"]];
  const chips = filters.map(([k, l]) => `<button class="cchip ${state.commFilter === k ? "on" : ""}" data-cfilter="${k}">${l}</button>`).join("");
  const posts = D.posts.filter(p => state.commFilter === "all" || p.tag === state.commFilter);
  const cards = posts.map(p => {
    const c = byId(D.countries, p.country), liked = state.likedPosts.has(p.id), likes = p.likes + (liked ? 1 : 0);
    return `<article class="cpost" data-post="${p.id}">
      <div class="cpost-thumb"><span>${p.thumb}</span></div>
      <div class="cpost-b"><div class="cpost-title">${esc(p.title)}</div>
        <div class="cpost-meta"><span class="cpost-av">${p.authorNick[0].toUpperCase()}</span>${esc(p.authorNick)} · ${c ? c.flag : ""}</div>
        <button class="cpost-like ${liked ? "on" : ""}" data-like="${p.id}">❤️ ${likes}</button></div>
    </article>`;
  }).join("");
  return `<div class="comm">
    <div class="comm-head"><h1>커뮤니티</h1><p>같은 나라 사람들의 진짜 로컬 콘텐츠</p></div>
    <div class="comm-filters">${chips}</div>
    <div class="comm-grid">${cards || `<p class="empty">콘텐츠가 아직 없어요.</p>`}</div>
    <button class="fab" id="newPost" title="콘텐츠 올리기">✍️</button></div>`;
}
function PostDetail(p) {
  if (!p) { state.selectedPost = null; return CommunityApp(); }
  const c = byId(D.countries, p.country), rg = byId(D.regions, p.region), pl = p.place ? byId(D.places, p.place) : null;
  const liked = state.likedPosts.has(p.id), likes = p.likes + (liked ? 1 : 0);
  return `<div class="comm">
    <button class="cback" id="postBack">← 커뮤니티</button>
    <article class="cdetail">
      <div class="cdetail-hero"><span>${p.thumb}</span></div>
      <h1>${esc(p.title)}</h1>
      <div class="cdetail-meta"><span class="cpost-av">${p.authorNick[0].toUpperCase()}</span>${esc(p.authorNick)} · ${c ? c.flag + c.ko : ""}${rg ? " · " + rg.ko : ""}</div>
      <p class="cdetail-body">${esc(p.body)}</p>
      <div class="cdetail-actions"><button class="like-btn ${liked ? "on" : ""}" data-like="${p.id}">❤️ ${likes}</button>
        ${pl ? `<button class="post-place" data-place="${p.place}">📍 ${esc(pl.name)} 보기 →</button>` : ""}</div>
    </article></div>`;
}
function bindCommunity() {
  document.querySelectorAll("[data-cfilter]").forEach(b => b.addEventListener("click", () => { state.commFilter = b.dataset.cfilter; render(); }));
  document.querySelectorAll(".cpost[data-post]").forEach(b => b.addEventListener("click", e => { if (e.target.closest("[data-like]")) return; state.selectedPost = b.dataset.post; render(); }));
  const back = document.getElementById("postBack"); if (back) back.addEventListener("click", () => { state.selectedPost = null; render(); });
  document.querySelectorAll("[data-like]").forEach(b => b.addEventListener("click", ev => { ev.stopPropagation(); const id = b.dataset.like; state.likedPosts.has(id) ? state.likedPosts.delete(id) : state.likedPosts.add(id); render(); }));
  document.querySelectorAll(".post-place[data-place]").forEach(b => b.addEventListener("click", () => { state.app = "reviews"; state.selectedPlace = b.dataset.place; state.selectedPost = null; render(); }));
  const np = document.getElementById("newPost"); if (np) np.addEventListener("click", () => { if (state.loggedIn) state.modal = "post"; else { state.pendingModal = "post"; state.modal = "login"; } render(); });
}
function BottomNav() {
  const items = [["reviews", "📝", "리뷰"], ["community", "💬", "커뮤니티"], ["shorts", "🎬", "쇼츠"], ["ambassadors", "🌟", "앰배서더"], ["mypage", "👤", "마이"]];
  return `<nav class="bottomnav">${items.map(([id, ic, l]) => {
    const on = id === "mypage" ? state.page === "mypage" : (state.app === id && state.page !== "mypage");
    return `<button class="bn-item ${on ? "on" : ""}" data-bn="${id}"><span class="bn-ic">${ic}</span><span class="bn-l">${l}</span></button>`;
  }).join("")}</nav>`;
}
function ReviewComposer() {
  const p = byId(D.places, state.selectedPlace) || {};
  const cz = state.compose;
  const stars5 = [1, 2, 3, 4, 5].map(n => `<button class="cz-star ${n <= cz.rating ? "on" : ""}" data-czrating="${n}">★</button>`).join("");
  const suggested = ["영어가능", "혼밥OK", "외국인친화", "가성비", "분위기좋음", "할랄", "예약필요", "번호없이OK"];
  const sugg = suggested.filter(t => !cz.tags.includes(t)).map(t => `<button class="cz-sugg" data-czadd="${t}">#${t}</button>`).join("");
  const chips = cz.tags.map(t => `<button class="cz-chip" data-czdel="${t}">#${esc(t)} ✕</button>`).join("");
  return `<div class="composer">
    <header class="cz-bar">
      <button class="cz-cancel" id="czCancel">취소</button>
      <span class="cz-title">리뷰 쓰기</span>
      <button class="cz-submit" id="czSubmit">등록</button>
    </header>
    <div class="cz-body">
      <div class="cz-place">${p.emoji || "📍"} <b>${esc(p.name || "")}</b></div>
      <div class="cz-field"><label>별점</label><div class="cz-stars">${stars5}</div></div>
      <div class="cz-field"><label>내용</label>
        <textarea id="cz-text" class="cz-text" rows="6" placeholder="외국인 시각에서 좋았던 점·불편했던 점을 적어주면 큰 도움이 돼요.">${esc(cz.body)}</textarea>
      </div>
      <div class="cz-field"><label>해시태그</label>
        <div class="cz-chips">${chips}</div>
        <div class="cz-taginput"><input id="cz-tag" placeholder="#태그 입력" maxlength="20"><button id="czTagAdd" class="cz-tagadd">추가</button></div>
        <div class="cz-suggs">${sugg}</div>
      </div>
      <div class="cz-field"><label>사진 (선택)</label>
        ${cz.photo ? `<div class="cz-photo"><img src="${cz.photo}" alt=""><button id="czPhotoDel" class="cz-photodel">✕</button></div>` : `<label class="cz-photoadd">📷 사진 추가<input type="file" accept="image/*" id="cz-photo" hidden></label>`}
      </div>
    </div>
  </div>`;
}
function bindComposer() {
  const cz = state.compose;
  const readBody = () => { const t = document.getElementById("cz-text"); if (t) cz.body = t.value; };
  document.querySelectorAll("[data-czrating]").forEach(b => b.addEventListener("click", () => { readBody(); cz.rating = +b.dataset.czrating; render(); }));
  document.querySelectorAll("[data-czadd]").forEach(b => b.addEventListener("click", () => { readBody(); if (!cz.tags.includes(b.dataset.czadd)) cz.tags.push(b.dataset.czadd); render(); }));
  document.querySelectorAll("[data-czdel]").forEach(b => b.addEventListener("click", () => { readBody(); cz.tags = cz.tags.filter(t => t !== b.dataset.czdel); render(); }));
  const addTag = () => { readBody(); const i = document.getElementById("cz-tag"); const v = (i.value || "").trim().replace(/^#+/, ""); if (v && !cz.tags.includes(v)) cz.tags.push(v); render(); };
  const ta = document.getElementById("czTagAdd"); if (ta) ta.addEventListener("click", addTag);
  const ti = document.getElementById("cz-tag"); if (ti) ti.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } });
  const pf = document.getElementById("cz-photo"); if (pf) pf.addEventListener("change", () => { const f = pf.files && pf.files[0]; if (!f) return; readBody(); const fr = new FileReader(); fr.onload = e => { cz.photo = e.target.result; render(); }; fr.readAsDataURL(f); });
  const pd = document.getElementById("czPhotoDel"); if (pd) pd.addEventListener("click", () => { readBody(); cz.photo = null; render(); });
  const cc = document.getElementById("czCancel"); if (cc) cc.addEventListener("click", () => { state.compose = null; render(); });
  const cs = document.getElementById("czSubmit"); if (cs) cs.addEventListener("click", () => {
    readBody();
    if (!cz.body.trim()) { const t = document.getElementById("cz-text"); if (t) t.focus(); return; }
    D.reviews.push({ id: "u" + Date.now(), place: state.selectedPlace, nick: state.nick || "You", country: state.profileCountry, race: state.profileRace, rating: cz.rating, body: cz.body.trim(), tags: cz.tags.slice(), photo: cz.photo || undefined });
    state.compose = null; render();
  });
}
function render() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById("app").innerHTML = TopNav() +
    (state.app === "ambassadors"
      ? AmbassadorApp()
      : state.app === "community"
      ? CommunityApp()
      : state.app === "shorts"
      ? ShortsApp()
      : state.page === "mypage"
      ? `<div id="results"></div>`
      : Header() + SearchBar() + (state.loggedIn ? "" : ProfileBar()) + CategoryPills() + `<div id="results"></div>`)
    + BottomNav() + Modal() + (state.compose ? ReviewComposer() : "") + (state.profileNick ? InfluencerProfile() : "");
  bindTop(); bindModal();
  if (state.compose) bindComposer();
  if (state.profileNick) bindProfile();
  if (state.app === "ambassadors") bindAmbassador();
  else if (state.app === "community") bindCommunity();
  else if (state.app === "shorts") bindShorts();
  else { bindControls(); renderResults(); }
}
function renderResults() {
  document.getElementById("results").innerHTML = state.selectedPlace
    ? Detail(byId(D.places, state.selectedPlace))
    : state.page === "mypage" ? MyPage()
    : FilterRow() + ChipsRow() + TopThree() + (catOf(state.category).kind === "product"
        ? `<div class="split">${List()}</div>`
        : `<div class="split">${List()}${MapPane()}</div>`);
  bindResults();
  initMaps();
}
function initMaps() {
  if (typeof L === "undefined") return;
  const tiles = () => L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" });
  const icon = p => L.divIcon({ html: `<div class="lpin">${p.emoji}</div>`, className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
  const listEl = document.getElementById("map");
  if (listEl) {
    const ps = placesInView(), m = L.map(listEl, { scrollWheelZoom: false });
    tiles().addTo(m); const pts = [];
    ps.forEach(p => { L.marker([p.lat, p.lng], { icon: icon(p) }).addTo(m).bindTooltip(p.name).on("click", () => { state.selectedPlace = p.id; render(); }); pts.push([p.lat, p.lng]); });
    if (state.userLoc) { L.circleMarker([state.userLoc.lat, state.userLoc.lng], { radius: 8, color: "#2b7", fillOpacity: .9 }).addTo(m).bindTooltip("내 위치"); pts.push([state.userLoc.lat, state.userLoc.lng]); }
    if (pts.length) m.fitBounds(pts, { padding: [30, 30], maxZoom: 14 }); else m.setView([37.55, 126.97], 11);
  }
  const detEl = document.getElementById("detail-map");
  if (detEl && state.selectedPlace) {
    const p = byId(D.places, state.selectedPlace), m = L.map(detEl, { scrollWheelZoom: false }).setView([p.lat, p.lng], 15);
    tiles().addTo(m); L.marker([p.lat, p.lng], { icon: icon(p) }).addTo(m).bindTooltip(p.name).openTooltip();
  }
}
function initAmbMap() {
  if (typeof L === "undefined") return;
  const el = document.getElementById("amb-map"); if (!el) return;
  const m = L.map(el, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
  const pts = [], prov = provinceOf(state.ambRegion);
  if (!prov) {
    // 1단계: 도/광역시 핀 (클릭 → 그 도로 확대)
    (D.provinces || []).forEach(pr => {
      const n = rankings(pr.id).length;
      const icon = L.divIcon({ html: `<div class="rpin big">${n}</div>`, className: "", iconSize: [42, 42], iconAnchor: [21, 21] });
      L.marker([pr.lat, pr.lng], { icon }).addTo(m).bindTooltip(`<b>${pr.ko}</b><br>앰배서더 ${n}명 · 클릭해 확대`).on("click", () => { state.ambRegion = pr.id; render(); });
      pts.push([pr.lat, pr.lng]);
    });
    pts.length ? m.fitBounds(pts, { padding: [50, 50], maxZoom: 8 }) : m.setView([36.5, 127.8], 7);
  } else {
    // 2단계: 그 도의 시·구 핀
    D.regions.filter(r => r.province === prov.id && r.lat).forEach(r => {
      const rk = rankings(r.id), top = rk[0], sel = state.ambRegion === r.id;
      const icon = L.divIcon({ html: `<div class="rpin ${sel ? "on" : ""}">${rk.length}</div>`, className: "", iconSize: [34, 34], iconAnchor: [17, 17] });
      L.marker([r.lat, r.lng], { icon }).addTo(m).bindTooltip(`<b>${r.ko}</b><br>${top ? "🥇 " + esc(top.nick) + " · " + rk.length + "명" : "앰배서더 없음"}`).on("click", () => { state.ambRegion = r.id; render(); });
      pts.push([r.lat, r.lng]);
    });
    pts.length ? m.fitBounds(pts, { padding: [60, 60], maxZoom: 13 }) : m.setView([prov.lat, prov.lng], 11);
  }
}

/* ---------- 바인딩 ---------- */
function bindControls() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on("home", "click", goHome);
  on("search", "input", e => { state.search = e.target.value; state.selectedPlace = null; state.page = null; renderResults(); });
  on("region", "change", e => { state.region = e.target.value; state.selectedPlace = null; state.page = null; renderResults(); });
  on("profileCountry", "change", e => setProfile(e.target.value));
  on("profileRace", "change", e => { state.profileRace = e.target.value; state.raceFilter = e.target.value; render(); });
  document.querySelectorAll("[data-cat]").forEach(b => b.addEventListener("click", () => {
    state.category = b.dataset.cat; state.selectedPlace = null; state.page = null;
    state.sort = catOf(b.dataset.cat).kind === "product" ? "fit" : (state.sort === "fit" ? "rating" : state.sort);
    render();
  }));
}
function bindResults() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on("back", "click", () => { state.selectedPlace = null; state.showAll = false; render(); });
  on("backHome", "click", goHome);
  on("editProfile", "click", () => { state.modal = "login"; render(); });
  on("logout2", "click", () => { state.loggedIn = false; state.nick = ""; render(); });
  document.querySelectorAll("[data-mytab]").forEach(b => b.addEventListener("click", () => { state.myTab = b.dataset.mytab; render(); }));
  document.querySelectorAll(".mp-tabbody [data-pg]").forEach(b => b.addEventListener("click", () => openPgItem(b.dataset.pg)));
  on("loginHere", "click", () => { state.modal = "login"; render(); });
  document.querySelectorAll("#results .my-review[data-place], #results .top3-card, #results .rec-alt").forEach(el => el.addEventListener("click", () => { state.selectedPlace = el.dataset.place; render(); }));
  on("raceFilter", "change", e => { state.raceFilter = e.target.value; renderResults(); });
  on("countryFilter", "change", e => { state.countryFilter = e.target.value; renderResults(); });
  on("sort", "change", e => { state.sort = e.target.value; renderResults(); });
  on("myloc", "click", useMyLocation);
  on("grpOnly", "click", () => { state.showAll = false; renderResults(); });
  on("allRv", "click", () => { state.showAll = true; renderResults(); });
  on("reviewSort", "change", e => { state.reviewSort = e.target.value; renderResults(); });
  on("writeReview", "click", () => { if (state.loggedIn) state.compose = { rating: 5, tags: [], body: "", photo: null }; else { state.pendingCompose = true; state.modal = "login"; } render(); });
  document.querySelectorAll("[data-chip]").forEach(b => b.addEventListener("click", () => { const k = b.dataset.chip; state.quick[k] = !state.quick[k]; renderResults(); }));
  document.querySelectorAll("[data-savedonly]").forEach(b => b.addEventListener("click", () => { state.savedOnly = !state.savedOnly; renderResults(); }));
  document.querySelectorAll("[data-trans]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.trans; state.translated.has(id) ? state.translated.delete(id) : state.translated.add(id); renderResults();
  }));
  document.querySelectorAll("[data-vote]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.vote;
    if (state.voted.has(id)) { state.voted.delete(id); state.votes[id] = (state.votes[id] || 1) - 1; }
    else { state.voted.add(id); state.votes[id] = (state.votes[id] || 0) + 1; }
    renderResults();
  }));
  document.querySelectorAll("#results [data-save]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); toggleSave(b.dataset.save); }));
  document.querySelectorAll("#results .card").forEach(el => el.addEventListener("click", e => {
    if (e.target.closest("[data-save]")) return;
    state.selectedPlace = el.dataset.place; render();
  }));
}

// 딥링크 / 스크린샷용 초기 화면: ?app=community|ambassadors · ?place=p1 · ?post=po3 · ?cat=cosmetics · ?race=black
(function () {
  try {
    const q = new URLSearchParams(location.search);
    if (["ambassadors", "community", "shorts"].includes(q.get("app"))) state.app = q.get("app");
    if (["ohou", "yelp", "slim"].includes(q.get("theme"))) state.theme = q.get("theme");
    if (q.get("cat") && catOf(q.get("cat"))) state.category = q.get("cat");
    if (q.get("race")) { state.profileRace = q.get("race"); state.raceFilter = q.get("race"); }
    if (q.get("place") && byId(D.places, q.get("place"))) state.selectedPlace = q.get("place");
    if (q.get("post") && byId(D.posts, q.get("post"))) { state.app = "community"; state.selectedPost = q.get("post"); }
    if (q.get("short") && byId(D.shorts, q.get("short"))) { state.app = "shorts"; state.focusShort = q.get("short"); }
    if (q.get("compose") && byId(D.places, q.get("compose"))) { state.loggedIn = true; state.nick = state.nick || "You"; state.selectedPlace = q.get("compose"); state.compose = { rating: 5, tags: [], body: "", photo: null }; }
    if (q.get("empty")) state.demoEmpty = true;
    if (q.get("mypage")) { state.loggedIn = true; state.nick = state.nick || "You"; state.app = "reviews"; state.page = "mypage"; if (q.get("mypage") === "empty") state.demoEmpty = true; }
    if (q.get("profile")) state.profileNick = q.get("profile");
  } catch (e) { }
})();
render();
