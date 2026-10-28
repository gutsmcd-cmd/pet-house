import { useState } from 'react'
import { useLang } from './shared.js'
// Seasonal touches and a once-a-day hello for Rie. Everything is by Tokyo date.
const tokyo = (d = new Date()) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]))
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, key: `${p.year}-${p.month}-${p.day}` }
}
export function season(t = tokyo()) {
  const { m, d } = t
  if (m === 10 && d >= 24) return 'halloween'
  if ((m === 12 && d >= 20) || (m === 1 && d <= 7)) return 'winterfest'
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter'
}
const BITS = { spring: '🌸', summer: '✨', autumn: '🍁', halloween: '🍁', winter: '❄️', winterfest: '❄️' }
export function SeasonLayer() {
  const s = season(), b = BITS[s]
  return (
    <div className={`season season-${s}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <span key={i} style={{ left: `${6 + i * 11}%`, animationDelay: `${(i * 1.7) % 9}s`, animationDuration: `${9 + (i % 4) * 2}s` }}>{b}</span>)}
      {s === 'halloween' && <i className="season-pumpkin">🎃</i>}
      {s === 'winterfest' && <i className="season-pumpkin">🎍</i>}
    </div>
  )
}
const G = {
  en: { dawn: 'Good morning, Rie!', day: 'Hello, Rie!', dusk: 'Good evening, Rie!', night: 'Hi Rie, it’s late!',
    spring: 'Cherry blossoms are out. Mugi keeps sneezing at the petals.', summer: 'Hot day. Mizu says the water is perfect.', autumn: 'Maple leaves are falling. Mugi wants to jump in the pile.',
    halloween: 'Halloween is coming! Mugi found a pumpkin.', winter: 'Chilly out. Mugi is curled up and cosy.', winterfest: 'Happy holidays! Mugi and Mizu are staying warm.',
    ok: 'Hi Mugi, hi Mizu!', streak: n => `Day ${n} in a row. They’re so happy you came.` },
  ja: { dawn: 'りえちゃん、おはよう！', day: 'りえちゃん、こんにちは！', dusk: 'りえちゃん、こんばんは！', night: 'りえちゃん、夜ふかしだね！',
    spring: '桜がさいたよ。ムギは花びらでくしゃみしてる。', summer: 'あついね。ミズは水がちょうどいいって。', autumn: 'もみじがおちてるよ。ムギは落ち葉にとびこみたいって。',
    halloween: 'もうすぐハロウィン！ムギがかぼちゃを見つけたよ。', winter: 'さむいね。ムギはまるくなってぬくぬく。', winterfest: 'たのしい年末年始を！ムギとミズはあったかくしてるよ。',
    ok: 'ムギ、ミズ、やっほー！', streak: n => `${n}日れんぞく！来てくれてうれしいって。` },
}
const KEY = 'ph-hello', SK = 'ph-streak'
function streakFor(t) {
  try {
    const prev = JSON.parse(localStorage.getItem(SK) || 'null')
    if (prev?.key === t.key) return prev.n
    const y = tokyo(new Date(Date.now() - 864e5)).key
    const n = prev?.key === y ? prev.n + 1 : 1
    localStorage.setItem(SK, JSON.stringify({ key: t.key, n })); return n
  } catch { return 1 }
}
export function Greeting({ phase, onHello }) {
  const lang = useLang(), t = tokyo(), T = G[lang] ?? G.en
  const [show, setShow] = useState(() => { try { return localStorage.getItem(KEY) !== t.key } catch { return false } })
  const [n] = useState(() => streakFor(t))
  if (!show) return null
  return (
    <div className="hello-card" role="status">
      <div className="hello-text"><b>{T[phase] ?? T.day}</b><span>{T[season(t)]}</span>{n > 1 && <small>{T.streak(n)}</small>}</div>
      <button type="button" className="pill on" onClick={() => { try { localStorage.setItem(KEY, t.key) } catch {} setShow(false); onHello?.() }}>{T.ok}</button>
    </div>
  )
}
