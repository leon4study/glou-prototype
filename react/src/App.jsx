import { useState } from 'react'
import DATA from './data.js'

// 바닐라 app.js 와 같은 헬퍼 (그대로 재사용)
const byId = (l, id) => l.find(x => x.id === id)
const catOf = id => byId(DATA.categories, id)
const stars = n => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n)
const avg = rs => rs.length ? (rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(1) : "–"
const reviewsFor = pid => DATA.reviews.filter(r => r.place === pid)

export default function App() {
  const [profileCountry, setProfileCountry] = useState("us")
  const [profileRace, setProfileRace] = useState("white")
  const [category, setCategory] = useState("cosmetics")
  const [region, setRegion] = useState("all")
  const [countryFilter, setCountryFilter] = useState("us")
  const [raceFilter, setRaceFilter] = useState("white")
  const [showAll, setShowAll] = useState(false)
  const [selected, setSelected] = useState(null)

  function setProfile(country) {
    const c = byId(DATA.countries, country)
    setProfileCountry(country)
    setCountryFilter(country)
    if (c) { setProfileRace(c.race); setRaceFilter(c.race) }
  }

  function filteredReviews(place) {
    const all = reviewsFor(place.id)
    if (showAll) return all
    const gb = catOf(place.category).group_by
    const key = gb === "race" ? raceFilter : countryFilter
    const field = gb === "race" ? "race" : "country"
    const match = all.filter(r => r[field] === key)
    const rest = all.filter(r => r[field] !== key).map(r => ({ ...r, _dim: true }))
    return match.concat(rest)
  }

  const gb = catOf(category).group_by
  const places = DATA.places.filter(p => p.category === category && (region === "all" || p.region === region))

  return (
    <div id="app">
      <header className="hdr">
        <div className="brand">GL<span>OU</span> <em>Reviews</em></div>
        <p className="tag">외국인을 위한 한국 로컬 리뷰 — <b>국가·인종별로 나에게 맞는 정보</b>. 지방까지.</p>
      </header>

      {/* 로그인 시뮬레이션 */}
      <section className="profile">
        🔑 <b>로그인 시뮬레이션</b>
        <label>국적 <select value={profileCountry} onChange={e => setProfile(e.target.value)}>
          {DATA.countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.ko}</option>)}
        </select></label>
        <label>인종 <select value={profileRace} onChange={e => { setProfileRace(e.target.value); setRaceFilter(e.target.value) }}>
          {DATA.races.map(r => <option key={r.id} value={r.id}>{r.ko}</option>)}
        </select></label>
        <span className="hint">→ 내 국가/인종 리뷰가 먼저 보입니다</span>
      </section>

      {/* 카테고리 탭 */}
      <nav className="tabs">
        {DATA.categories.map(c =>
          <button key={c.id} className={"tab" + (c.id === category ? " on" : "")}
            onClick={() => { setCategory(c.id); setSelected(null) }}>{c.ko}</button>)}
      </nav>

      {/* 필터 */}
      <section className="filters">
        <label className="grp"><span>📍 지역</span>
          <select value={region} onChange={e => setRegion(e.target.value)}>
            <option value="all">전체 지역</option>
            {DATA.regions.map(r => <option key={r.id} value={r.id}>{r.ko}</option>)}
          </select></label>
        {gb === "race" ? (
          <>
            <label className="grp"><span>🧬 인종 필터</span>
              <select value={raceFilter} onChange={e => setRaceFilter(e.target.value)}>
                {DATA.races.map(r => <option key={r.id} value={r.id}>{r.ko}</option>)}
              </select></label>
            <span className="hint">화장품·병원은 <b>인종</b>으로 묶여요</span>
          </>
        ) : (
          <>
            <label className="grp"><span>🏳️ 국가 필터</span>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
                {DATA.countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.ko}</option>)}
              </select></label>
            <span className="hint">식당·문화·여가는 <b>국가</b>로 묶여요</span>
          </>
        )}
        <button className={"toggle" + (showAll ? " on" : "")} onClick={() => setShowAll(v => !v)}>
          {showAll ? "전체 리뷰 보는 중" : "내 그룹만 보기"}
        </button>
      </section>

      {/* 목록 or 상세 */}
      {selected
        ? <PlaceDetail place={byId(DATA.places, selected)} onBack={() => setSelected(null)}
            filteredReviews={filteredReviews} showAll={showAll} raceFilter={raceFilter} countryFilter={countryFilter} />
        : <PlaceList places={places} onOpen={setSelected} filteredReviews={filteredReviews} />}
    </div>
  )
}

function PlaceList({ places, onOpen, filteredReviews }) {
  if (!places.length) return <p className="empty">이 조건에 맞는 장소가 없어요.</p>
  return (
    <section className="list">
      {places.map(p => {
        const mine = filteredReviews(p).filter(r => !r._dim)
        return (
          <button key={p.id} className="card" onClick={() => onOpen(p.id)}>
            <div className="card-top"><span className="name">{p.name}</span><span className="rate">{avg(reviewsFor(p.id))} ★</span></div>
            <div className="meta">{byId(DATA.regions, p.region).ko} · {catOf(p.category).ko} · {p.source}</div>
            <div className="mine">내 그룹 리뷰 {mine.length}개 · 전체 {reviewsFor(p.id).length}개</div>
          </button>
        )
      })}
    </section>
  )
}

function PlaceDetail({ place, onBack, filteredReviews, showAll, raceFilter, countryFilter }) {
  const gb = catOf(place.category).group_by
  const groupLabel = gb === "race"
    ? byId(DATA.races, raceFilter).ko + " (인종)"
    : byId(DATA.countries, countryFilter).ko + " (국가)"
  const rs = filteredReviews(place)
  const acs = DATA.ambassadorContents.filter(a => a.place === place.id)
  return (
    <>
      <button className="back" onClick={onBack}>← 목록</button>
      <section className="detail">
        <h2>{place.name}</h2>
        <div className="meta">{byId(DATA.regions, place.region).ko} · {place.addr} · {catOf(place.category).ko}</div>
        <div className="filter-note">지금 <b>{showAll ? "전체" : groupLabel}</b> 리뷰를 보고 있어요 {showAll ? "" : "· 나머지는 흐리게"}</div>
        {acs.length > 0 &&
          <div className="amb-wrap"><h3>🌏 앰배서더 콘텐츠</h3>
            {acs.map(a => {
              const amb = byId(DATA.ambassadors, a.ambassador)
              return <a key={a.id} className="amb" href={a.url}>🎬 <b>{amb.nick}</b><br />{a.title}</a>
            })}
          </div>}
        <h3>📝 리뷰 ({reviewsFor(place.id).length})</h3>
        <div className="reviews">
          {rs.map(r => {
            const c = byId(DATA.countries, r.country)
            return (
              <div key={r.id} className={"review" + (r._dim ? " dim" : "")}>
                <div className="rv-top"><b>{r.nick}</b> <span className="rv-tag">{c.flag}{c.ko} · {byId(DATA.races, r.race).ko}</span>
                  <span className="rv-star">{stars(r.rating)}</span></div>
                <p>{r.body}</p>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
