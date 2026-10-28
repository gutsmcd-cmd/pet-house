import { useEffect, useRef, useState } from 'react'
import Corgi from './Corgi.jsx'
import Vision from './Vision.jsx'
import Photo from './Photo.jsx'
import { isSleepy, wantsWalk, doneWalk } from './Needs.jsx'
import { useLang, setLang, bark, clamp } from './shared.js'

// Tricks unlock in this order; each needs PRACTICE goes before the next opens.
const PRACTICE = 3
export const TRICKS = [
  { id: 'sit', en: 'Sit', ja: 'おすわり', words: ['sit', 'おすわり', 'お座り', 'すわれ'] },
  { id: 'paw', en: 'Paw', ja: 'お手', words: ['paw', 'shake', 'お手', 'おて', 'オテ'] },
  { id: 'spin', en: 'Spin', ja: 'くるくる', words: ['spin', 'turn around', 'くるくる', 'くるっ', '回って', 'まわって'] },
  { id: 'roll', en: 'Roll over', ja: 'ごろん', words: ['roll', 'ごろん', 'ゴロン', 'ごろごろ'] },
  { id: 'dead', en: 'Play dead', ja: 'バーン', words: ['play dead', 'dead', 'bang', 'ばーん', 'バーン', 'バン', '死んだふり', 'しんだふり'] },
]
const APT = ['apt', 'a.p.t', 'apateu', 'apatu', 'apartment', 'アパトゥ', 'アパテュ', 'アパート', '아파트']
const COME = ['come', 'here', 'おいで', 'こっち', 'おいでー', 'come here']
const PK = 'ph-tricks-v1'
const loadP = () => { try { const v = JSON.parse(localStorage.getItem(PK) || '{}'); return v && typeof v === 'object' ? v : {} } catch { return {} } }
export const unlockedOf = p => { const out = []; for (const t of TRICKS) { out.push(t.id); if ((p[t.id] || 0) < PRACTICE) break } return out }
export function matchSpeech(text) {
  const s = (text || '').toLowerCase()
  if (APT.some(w => s.includes(w))) return 'apt'
  if (COME.some(w => s.includes(w))) return 'come'
  for (const t of [...TRICKS].reverse()) if (t.words.some(w => s.includes(w.toLowerCase()))) return t.id // "play dead" before "dead"/"roll over" before etc.
  return null
}

const L = {
  en: {
    sleepy: 'It is late in Japan. Mugi is sleepy… 💤 (she still plays if you ask)', walkQ: 'Mugi brings her lead. Walk?', walk: 'Walk', walking: 'Walkies! Sniff, sniff, sniff…', walked: 'Great walk. Happy corgi.', photo: 'Photo',
    apt: 'APT. dance! Head tilt left, right, left, right…', hum: 'Hum APT.', humOn: 'Hum the chorus beat (a-pa-teu, a-pa-teu)…', aptBtn: 'APT. dance',
    title: 'Play with Mugi', hint: 'Tap Mugi and drag up to send her far away. Flick the ball to throw it.',
    away: 'She is way out there. Say "come here" (or press Come here).', come: 'Come here', running: 'Here she comes!', home: 'Good girl! Tail going like crazy.',
    talk: 'Talk', listening: 'Listening… say a trick or "come here".', noMic: 'Speech isn\'t available here. Use the buttons.', heard: w => `Heard: "${w}"`,
    notYet: n => `She doesn't know "${n}" yet. Keep practising the last trick.`, far: 'She\'s too far to hear tricks. Call her first.',
    learnt: n => `New trick unlocked: ${n}!`, did: n => `${n}! Good girl.`, chase: 'Ball! She\'s off!', fetch: 'Got it. Bringing it back…', back: 'She dropped it at your feet. Again?',
    weak: 'Flick it harder, upward.', tricks: 'Tricks', practise: (n, k) => `${n}: practised ${k}/${PRACTICE}`, locked: 'locked', vision: 'Corgi vision', huh: 'Didn\'t catch a trick there.',
  },
  ja: {
    sleepy: '日本はもう夜。むぎはねむねむ… 💤（呼べば遊ぶよ）', walkQ: 'むぎがリードを持ってきたよ。おさんぽ？', walk: 'おさんぽ', walking: 'おさんぽ！くんくん…', walked: 'いいおさんぽだった！ごきげん。', photo: '写真',
    apt: 'APT.ダンス！首をかしげて右、左、右、左…', hum: 'APT.をハミング', humOn: 'サビのリズムをハミングしてね（ア・パ・トゥ）…', aptBtn: 'APT.ダンス',
    title: 'むぎとあそぶ', hint: 'むぎをタップして上にドラッグすると遠くへ。ボールははじいて投げてね。',
    away: '遠くにいるよ。「おいで」って言ってみて（ボタンでもOK）。', come: 'おいで', running: '走ってくるよ！', home: 'いい子！しっぽブンブン。',
    talk: '話す', listening: '聞いてるよ… 技の名前か「おいで」を言ってね。', noMic: 'ここでは音声が使えないよ。ボタンを使ってね。', heard: w => `聞こえた：「${w}」`,
    notYet: n => `「${n}」はまだ知らないよ。前の技をもっと練習しよう。`, far: '遠すぎて聞こえないよ。先に呼んでね。',
    learnt: n => `新しい技：${n}！`, did: n => `${n}！いい子！`, chase: 'ボールだ！ダッシュ！', fetch: 'くわえた！持ってくるよ…', back: '足もとに置いたよ。もう一回？',
    weak: 'もっと強く上にはじいてね。', tricks: '技', practise: (n, k) => `${n}：練習 ${k}/${PRACTICE}`, locked: 'まだ', vision: 'コーギーの目', huh: '技が聞き取れなかったよ。',
  },
}
const HOME = { x: 50, z: 0 }
const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export default function Play() {
  const lang = useLang(), t = L[lang]
  const [dog, setDog] = useState(HOME), [dur, setDur] = useState(0), [face, setFace] = useState(1)
  const [act, setAct] = useState(''), [trick, setTrick] = useState(''), [mouth, setMouth] = useState(false), [ears, setEars] = useState(false)
  const [ball, setBall] = useState({ x: 80, z: -0.08, lift: 0, show: true })
  const [msg, setMsg] = useState(t.hint), [prog, setProg] = useState(loadP), [listen, setListen] = useState(false), [vision, setVision] = useState(false)
  const scene = useRef(null), drag = useRef(null), flick = useRef(null), rec = useRef(null), busy = useRef(false), dogRef = useRef(dog), timers = useRef([])
  dogRef.current = dog
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id) }
  useEffect(() => () => { timers.current.forEach(clearTimeout); try { rec.current?.abort() } catch {} }, [])
  useEffect(() => { setMsg(L[lang].hint) }, [lang])
  const unlocked = unlockedOf(prog)
  const [sleepy] = useState(isSleepy), [walkQ, setWalkQ] = useState(wantsWalk), [photo, setPhoto] = useState(false)
  useEffect(() => { if (sleepy) setMsg(L[lang].sleepy) }, [sleepy, lang])
  function goWalk() {
    if (busy.current) return
    busy.current = true; setWalkQ(false); setMsg(t.walking)
    runTo(20, 0.5, () => runTo(80, 0.7, () => runTo(HOME.x, HOME.z, () => { doneWalk(); busy.current = false; setMsg(t.walked); wag(); bark(1) })))
  }

  // screen position from ground coords: z=0 near, z=1 at the horizon
  const pos = (x, z) => ({ left: x + '%', top: (88 - z * 52) + '%', s: 1 - clamp(z, -0.2, 1) * 0.82 })

  function runTo(x, z, then) {
    const d = dogRef.current, dist = Math.hypot((x - d.x) / 100, z - d.z)
    const ms = Math.round(350 + dist * 1500)
    setFace(x >= d.x ? 1 : -1); setDur(ms); setAct('run'); setDog({ x, z })
    later(() => { setAct(''); then?.() }, ms)
  }
  function comeHere() {
    if (busy.current) return
    if (dogRef.current.z < 0.08) { setMsg(t.home); wag(); return }
    busy.current = true; setMsg(t.running); setTrick('')
    runTo(HOME.x, HOME.z, () => { busy.current = false; setFace(1); setMsg(t.home); wag(); bark(2) })
  }
  function wag() { setAct('happy'); later(() => setAct(a => a === 'happy' ? '' : a), 1400) }

  function doTrick(id) {
    const tr = TRICKS.find(x => x.id === id), name = tr[lang]
    if (busy.current) return
    if (!unlocked.includes(id)) { setMsg(t.notYet(name)); return }
    if (dogRef.current.z > 0.3) { setMsg(t.far); return }
    busy.current = true; setTrick(id)
    const p = { ...prog, [id]: (prog[id] || 0) + 1 }
    try { localStorage.setItem(PK, JSON.stringify(p)) } catch {}
    const before = unlockedOf(prog).length, after = unlockedOf(p).length
    setProg(p)
    setMsg(after > before ? t.learnt(TRICKS[after - 1][lang]) : t.did(name))
    if (id === 'paw' || id === 'sit') bark(1)
    later(() => { setTrick(''); busy.current = false }, id === 'dead' ? 2600 : 1700)
  }
  function aptDance() {
    if (busy.current) return
    if (dogRef.current.z > 0.3) { setMsg(t.far); return }
    busy.current = true; setTrick('apt'); setMsg(t.apt)
    later(() => { setTrick(''); busy.current = false }, 3300)
  }
  // Rhythm listener: mic loudness onsets; 3+ evenly spaced pulses (a-pa-teu) => dance. No song audio is used.
  const humRef = useRef(null)
  const [humming, setHumming] = useState(false)
  async function toggleHum() {
    if (humRef.current) { humRef.current(); humRef.current = null; setHumming(false); return }
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true })
      const A = window.AudioContext || window.webkitAudioContext, ac = new A(), an = ac.createAnalyser(); an.fftSize = 512
      ac.createMediaStreamSource(st).connect(an)
      const buf = new Float32Array(an.fftSize); let raf, floor = 0.01, was = false, on = [], cool = 0
      const loop = now => {
        raf = requestAnimationFrame(loop); an.getFloatTimeDomainData(buf)
        let e = 0; for (const v of buf) e += v * v; e = Math.sqrt(e / buf.length)
        floor = floor * 0.98 + Math.min(e, floor * 3) * 0.02
        const loud = e > Math.max(0.02, floor * 2.5)
        if (loud && !was) { on = [...on.filter(x => now - x < 2500), now]
          if (on.length >= 4 && now > cool) { const g = on.slice(-4).map((x, i, a) => i ? x - a[i - 1] : 0).slice(1)
            if (g.every(x => x > 150 && x < 700) && Math.max(...g) / Math.min(...g) < 1.8) { cool = now + 4000; on = []; window.__phSay?.('apt') } } }
        was = loud
      }
      raf = requestAnimationFrame(loop)
      humRef.current = () => { cancelAnimationFrame(raf); st.getTracks().forEach(k => k.stop()); ac.close() }
      setHumming(true); setMsg(t.humOn)
    } catch { setMsg(t.noMic) }
  }
  useEffect(() => () => humRef.current?.(), [])
  function heard(text) {
    const m = matchSpeech(text)
    if (m === 'come') comeHere(); else if (m === 'apt') aptDance(); else if (m) doTrick(m); else setMsg(t.heard(text) + ' ' + t.huh)
  }
  useEffect(() => { window.__phSay = heard })

  function startListen() {
    if (!SR) { setMsg(t.noMic); return }
    if (rec.current) { try { rec.current.stop() } catch {} ; return }
    const r = new SR(); r.lang = lang === 'ja' ? 'ja-JP' : 'en-US'; r.continuous = true; r.interimResults = false
    r.onresult = e => { const res = e.results[e.results.length - 1]; heard(res[0].transcript) }
    r.onerror = e => { if (e.error !== 'no-speech' && e.error !== 'aborted') setMsg(t.noMic) }
    r.onend = () => { rec.current = null; setListen(false) }
    try { r.start(); rec.current = r; setListen(true); setMsg(t.listening) } catch { setMsg(t.noMic) }
  }

  // --- drag Mugi up into the distance ---
  function dogDown(e) {
    if (busy.current) return
    e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId)
    const h = scene.current.getBoundingClientRect()
    drag.current = { y: e.clientY, x: e.clientX, z: dogRef.current.z, dx: dogRef.current.x, h: h.height, w: h.width }
    setDur(0); setTrick(''); setEars(true)
  }
  function dogMove(e) {
    const d = drag.current; if (!d) return
    const z = clamp(d.z + (d.y - e.clientY) / (d.h * 0.55), 0, 1), x = clamp(d.dx + (e.clientX - d.x) / d.w * 100, 8, 92)
    setDog({ x, z })
  }
  function dogUp() {
    const d = drag.current; drag.current = null; setEars(false); if (!d) return
    if (dogRef.current.z > 0.25) { setMsg(t.away); if (SR && !rec.current) startListen() }
    else { setDur(400); setDog(HOME); wag(); setMsg(t.hint) }
  }

  // --- flick the ball ---
  function ballDown(e) {
    if (busy.current || !ball.show) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    flick.current = { pts: [[e.clientX, e.clientY, performance.now()]] }
  }
  function ballMove(e) { flick.current?.pts.push([e.clientX, e.clientY, performance.now()]) }
  function ballUp() {
    const f = flick.current; flick.current = null; if (!f) return
    const pts = f.pts.slice(-5), a = pts[0], b = pts[pts.length - 1], dt = Math.max(16, b[2] - a[2])
    const vx = (b[0] - a[0]) / dt, vy = (b[1] - a[1]) / dt
    if (vy > -0.25) { setMsg(t.weak); return }
    const z = clamp(-vy * 0.45, 0.2, 1), x = clamp(80 + vx * 40, 8, 92)
    throwTo(x, z)
  }
  function throwTo(x, z) {
    if (busy.current) return
    busy.current = true; setTrick(''); setMsg(t.chase); setEars(true); bark(1)
    const start = performance.now(), from = { x: 80, z: -0.08 }, T = 700
    const step = now => {
      const k = clamp((now - start) / T, 0, 1)
      setBall({ x: from.x + (x - from.x) * k, z: from.z + (z - from.z) * k, lift: Math.sin(k * Math.PI) * 30 * (1 - z * 0.5), show: true })
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    later(() => runTo(x, z, () => {
      setBall(b => ({ ...b, show: false })); setMouth(true); setEars(false); setMsg(t.fetch)
      later(() => runTo(HOME.x, HOME.z, () => {
        setMouth(false); setFace(1); setBall({ x: 80, z: -0.08, lift: 0, show: true }); setMsg(t.back); wag(); busy.current = false
      }), 300)
    }), 250)
  }

  const p = pos(dog.x, dog.z), bp = pos(ball.x, ball.z)
  return (
    <main className="page play">
      <div className="col">
        <header className="bar">
          <div><h1 className="title">{t.title}</h1><p className="sub">🐕 Mugi · {lang === 'ja' ? 'コーギー' : 'corgi'}</p></div>
          <div className="chips">
            <button className="chip langchip" onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')} aria-label="Language">{lang === 'ja' ? 'EN' : '日本語'}</button>
            <button className="chip" title={t.photo} aria-label={t.photo} onClick={() => setPhoto(true)}>📷</button>
            <button className="chip" title={t.vision} aria-label={t.vision} onClick={() => setVision(true)}>👁️</button>
          </div>
        </header>
        <div className="play-scene" ref={scene}>
          <div className="play-sky" /><div className="play-ground" />
          <div className="play-tree" style={{ left: '12%' }} /><div className="play-tree" style={{ left: '78%', transform: 'scale(.7)' }} />
          {ball.show && (
            <div className="play-ball" style={{ left: bp.left, top: `calc(${bp.top} - ${ball.lift}%)`, transform: `translate(-50%,-100%) scale(${bp.s})` }}
              onPointerDown={ballDown} onPointerMove={ballMove} onPointerUp={ballUp} onPointerCancel={ballUp} aria-label="Ball" role="button" />
          )}
          <div className={'play-dog' + (sleepy && !act && !trick ? ' sleepy' : '') + (act ? ' a-' + act : '') + (trick ? ' t-' + trick : '')}
            style={{ left: p.left, top: p.top, transform: `translate(-50%,-100%) scale(${p.s})`, transition: dur ? `left ${dur}ms ease-in-out, top ${dur}ms ease-in-out, transform ${dur}ms ease-in-out` : 'none', zIndex: Math.round(100 - dog.z * 50) }}
            onPointerDown={dogDown} onPointerMove={dogMove} onPointerUp={dogUp} onPointerCancel={dogUp} aria-label="Mugi" role="button">
            <div className="dog-flip" style={{ transform: `scaleX(${face})` }}><div className="dog-body"><Corgi ball={mouth} dead={trick === 'dead'} ears={ears || act === 'happy'} /></div></div>
          </div>
        </div>
        <div className="dock">
          {walkQ && <div className="need-card"><span>🦮 {t.walkQ}</span><button className="pill on" onClick={goWalk}>{t.walk}</button></div>}
          <p className="msg" aria-live="polite">{msg}</p>
          <div className="row">
            <button className={'primary grow' + (listen ? ' on-listen' : '')} onClick={startListen}>🎤 {listen ? (lang === 'ja' ? '止める' : 'Stop') : t.talk}</button>
            <button className="pill" onClick={comeHere}>👋 {t.come}</button>
          </div>
          <div className="row">
            <button className={'pill grow' + (humming ? ' on' : '')} onClick={toggleHum} aria-pressed={humming}>🎵 {t.hum}</button>
            <button className="pill grow" onClick={aptDance}>💃 {t.aptBtn}</button>
          </div>
          <div className="tricks" role="group" aria-label={t.tricks}>
            {TRICKS.map(tr => {
              const open = unlocked.includes(tr.id), k = Math.min(PRACTICE, prog[tr.id] || 0)
              return (
                <button key={tr.id} className={'trick' + (open ? '' : ' locked')} onClick={() => doTrick(tr.id)} title={open ? t.practise(tr[lang], k) : t.locked} aria-label={tr.en}>
                  <span>{open ? tr[lang] : '🔒'}</span>
                  <i aria-hidden="true">{Array.from({ length: PRACTICE }, (_, j) => <b key={j} className={j < k ? 'on' : ''} />)}</i>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      {photo && <Photo onClose={() => setPhoto(false)} />}
      {vision && <Vision onClose={() => setVision(false)} />}
    </main>
  )
}
