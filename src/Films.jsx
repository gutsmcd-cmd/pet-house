import { useRef, useState } from 'react'
import { useLang, setLang } from './shared.js'

const FILMS = [['box', 'The box', '箱'], ['floor', 'Back up', 'よいしょ'], ['zoomies', 'Zoomies', 'ダッシュ'], ['pair', 'Two of them', 'ふたり'], ['garden', 'The butterfly', 'ちょうちょ'], ['puddle', 'The puddle', '水たまり']]
  .map(([id, en, ja]) => ({ id, en, ja, src: `./films/${id}.mp4`, poster: `./films/${id}.jpg` }))
const T = {
  en: { title: 'Home videos', sub: 'For Rie · the corgi films', newF: c => `${c} new`, seenF: 'Watched', next: 'Next new film', again: 'Start another round', done: 'All watched! A new round shows them again in a new order.', hist: 'History', none: 'Nothing watched yet.', clear: 'Clear history', fail: "This film didn't load." },
  ja: { title: 'ホームビデオ', sub: 'りえちゃんへ・コーギー動画', newF: c => `新しい ${c} 本`, seenF: '見た', next: '次の新しい動画', again: 'もう一回まわす', done: 'ぜんぶ見たね！もう一回まわすと順番を変えてまた見られるよ。', hist: '見たもの', none: 'まだ何もないよ。', clear: '記録を消す', fail: 'この動画が読み込めなかったよ。' },
}
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} } }

export default function Films() {
  const lang = useLang(), t = T[lang]
  const [seen, setSeen] = useState(() => ls.get('ph-films-seen', [])), [hist, setHist] = useState(() => ls.get('ph-films-hist', []))
  const [cur, setCur] = useState(null), [fail, setFail] = useState(false), v = useRef(null)
  const left = FILMS.filter(f => !seen.includes(f.id))
  function play(f) { setFail(false); setCur(f); setTimeout(() => v.current?.play().catch(() => {}), 50) }
  function nextNew() { if (left.length) play(left[Math.floor(Math.random() * left.length)]) }
  function ended() {
    if (!cur) return
    const s = seen.includes(cur.id) ? seen : [...seen, cur.id], h = [{ id: cur.id, at: Date.now() }, ...hist].slice(0, 80)
    setSeen(s); setHist(h); ls.set('ph-films-seen', s); ls.set('ph-films-hist', h)
  }
  return (
    <main className="page films">
      <div className="col scroll">
        <header className="bar">
          <div><h1 className="title">{t.title}</h1><p className="sub">{t.sub}</p></div>
          <div className="chips"><button className="chip langchip" onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')} aria-label="Language">{lang === 'ja' ? 'EN' : '日本語'}</button></div>
        </header>
        <div className="films-player">
          {cur ? <video ref={v} key={cur.id} src={cur.src} poster={cur.poster} controls playsInline onEnded={ended} onError={() => setFail(true)} />
            : <button className="films-start" onClick={nextNew} disabled={!left.length}>▶ {left.length ? t.next : t.seenF}</button>}
          {fail && <p className="msg">{t.fail}</p>}
        </div>
        <div className="dock">
          <div className="row between"><strong>{t.newF(left.length)}</strong>
            {left.length ? <button className="primary" onClick={nextNew}>{t.next}</button> : <button className="primary" onClick={() => { setSeen([]); ls.set('ph-films-seen', []) }}>{t.again}</button>}</div>
          {!left.length && <p className="msg">{t.done}</p>}
          <div className="films-grid">
            {FILMS.map(f => (
              <button key={f.id} className={'film' + (seen.includes(f.id) ? ' seen' : '') + (cur?.id === f.id ? ' cur' : '')} onClick={() => play(f)}>
                <img src={f.poster} alt="" /><span>{f[lang]}{seen.includes(f.id) ? ' ✓' : ''}</span>
              </button>
            ))}
          </div>
          <h2 className="h2">{t.hist}</h2>
          {hist.length ? <ul className="films-hist">{hist.slice(0, 12).map((h, i) => { const f = FILMS.find(x => x.id === h.id); return f && <li key={i}><button className="link" onClick={() => play(f)}>{f[lang]}</button> <span className="muted small">{new Date(h.at).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></li> })}</ul>
            : <p className="msg">{t.none}</p>}
          {hist.length > 0 && <button className="link" onClick={() => { setHist([]); ls.set('ph-films-hist', []) }}>{t.clear}</button>}
        </div>
      </div>
    </main>
  )
}
