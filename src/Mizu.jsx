import { useEffect, useRef, useState } from 'react'
import Axolotl from './Axolotl.jsx'
import { speak, clamp, MORPHS, audioCtx } from './shared.js'
import { go } from './App.jsx'
import { Moon, Sun, Volume, VolumeX } from './icons.jsx'

const NAMES = { pink: 'Pink', gold: 'Gold', wild: 'Wild', dark: 'Dark' }
const LINES = { pink: 'Leucistic. The pink one.', gold: 'Golden albino.', wild: 'Wild type.', dark: 'Melanoid. Almost black.' }

export default function Mizu() {
  const [morph, setMorph] = useState('pink')
  const [depth, setDepth] = useState(0)
  const [pos, setPos] = useState({ x: 58, y: 64 })
  const [face, setFace] = useState(1)
  const [pinching, setPinching] = useState(false)
  const [waving, setWaving] = useState(false)
  const [blink, setBlink] = useState(false)
  const [bubbles, setBubbles] = useState(false)
  const [night, setNight] = useState(false)
  const [sway, setSway] = useState(false)
  const [popped, setPopped] = useState([false, false, false])
  const [pellet, setPellet] = useState(null)
  const [msg, setMsg] = useState('Drag her. Tap the plant, the stone, or a bubble.')
  const [text, setText] = useState('')
  const tank = useRef(null), depthRef = useRef(0), posRef = useRef(pos), pointers = useRef(new Map()), pinch = useRef(null), tap = useRef(null), stopBubbles = useRef(null), waveT = useRef(0)

  useEffect(() => { depthRef.current = depth }, [depth])
  useEffect(() => { posRef.current = pos }, [pos])
  useEffect(() => {
    const m = localStorage.getItem('mizu-morph'); if (MORPHS.includes(m)) setMorph(m)
    const el = tank.current
    const wheel = e => { e.preventDefault(); setDepth(d => clamp(d + e.deltaY * 0.0015, 0, 1)) }
    el?.addEventListener('wheel', wheel, { passive: false })
    const t = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140) }, 4200)
    return () => { el?.removeEventListener('wheel', wheel); clearInterval(t); clearTimeout(waveT.current); stopBubbles.current?.() }
  }, [])

  function pick(m) { setMorph(m); localStorage.setItem('mizu-morph', m); setMsg(LINES[m]) }
  function swim(x, y) { const nx = clamp(x, 18, 82), ny = clamp(y, 38, 74); setFace(nx < posRef.current.x - 1 ? -1 : 1); setPos({ x: nx, y: ny }) }
  function call() { setDepth(0); swim(62, 66); setMsg("She's at the glass."); speak("I'm here.", 1.55, 0.94) }
  function wave() { setWaving(true); setMsg('Gills up.'); clearTimeout(waveT.current); waveT.current = setTimeout(() => setWaving(false), 2600) }
  function pop() {
    const ctx = audioCtx(); if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = 640; o.connect(g); g.connect(ctx.destination)
    const t = ctx.currentTime; g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.01); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.12)
    o.start(t); o.stop(t + 0.13); o.onended = () => ctx.close()
  }
  function feed() {
    const x = 28 + Math.random() * 44
    setPellet({ x, fall: false }); setTimeout(() => setPellet({ x, fall: true }), 40)
    setTimeout(() => { setDepth(0.08); swim(x, 68); setMsg('She found it.') }, 520)
    setTimeout(() => setPellet(null), 1400)
  }
  function dragTo(e) {
    const r = tank.current?.getBoundingClientRect(); if (!r) return
    const x = clamp((e.clientX - r.left) / r.width * 100, 18, 82), y = clamp((e.clientY - r.top) / r.height * 100, 38, 74)
    if (Math.abs(x - posRef.current.x) > 2) setFace(x < posRef.current.x ? -1 : 1)
    setPos({ x, y })
  }
  function say(raw) {
    const t = raw.trim(); if (!t) return
    const lo = t.toLowerCase()
    if (/^(mizu|come|come here|here)\b/.test(lo) || lo === 'みず') return call()
    if (/^(house|home|mugi)\b/.test(lo) || lo.includes('go home')) return go(lo.startsWith('mugi') ? 'mugi' : 'house')
    if (lo.includes('wave') || lo.includes('dance')) return wave()
    if (lo.includes('feed') || lo.includes('food') || lo.includes('eat')) return feed()
    if (lo.includes('hide') || lo.includes('stone')) { setDepth(0.42); swim(78, 70); setMsg('Behind the stone.'); return }
    if (lo.includes('night') || lo.includes('lights off') || lo.includes('sleep')) { setNight(true); setDepth(0.2); swim(50, 72); setMsg('Lights down. She rests.'); return }
    if (lo.includes('light') || lo.includes('morning')) { setNight(false); setMsg('Lights up.'); return }
    const m = MORPHS.find(k => lo.includes(k)); if (m) return pick(m)
    const r = lo.startsWith('read ') ? t.slice(5).trim() : t
    setMsg(r); speak(r, 1.55, 0.94)
  }
  function toggleBubbles() {
    if (bubbles) { stopBubbles.current?.(); stopBubbles.current = null; setBubbles(false); return }
    const ctx = audioCtx(); let on = true
    const blip = () => {
      if (!on || !ctx) return
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = 480 + Math.random() * 520; o.connect(g); g.connect(ctx.destination)
      const t = ctx.currentTime; g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.02); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.16)
      o.start(t); o.stop(t + 0.18); setTimeout(blip, 600 + Math.random() * 1200)
    }
    ctx?.resume().then(blip)
    stopBubbles.current = () => { on = false; ctx?.close() }
    setBubbles(true); setMsg('Quiet bubbles. They stay on this phone.')
  }
  function down(e) {
    e.currentTarget.setPointerCapture(e.pointerId); pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; pinch.current = { span: Math.hypot(a.x - b.x, a.y - b.y), d: depthRef.current }; setPinching(true); tap.current = null; return }
    tap.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  function moveP(e) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size < 2 || !pinch.current) return
    const [a, b] = [...pointers.current.values()]
    setDepth(clamp(pinch.current.d + (1 - (Math.hypot(a.x - b.x, a.y - b.y) || 1) / pinch.current.span) * 0.9, 0, 1))
  }
  function up(e) {
    pointers.current.delete(e.pointerId)
    const t = tap.current; tap.current = null
    if (pointers.current.size < 2) {
      const was = pinch.current !== null; pinch.current = null; setPinching(false)
      if (was) { setMsg(depthRef.current > 0.45 ? 'Back of the tank.' : 'Closer to the glass.'); return }
    }
    if (!t || t.id !== e.pointerId || Math.hypot(e.clientX - t.x, e.clientY - t.y) > 14) return
    const r = e.currentTarget.getBoundingClientRect()
    swim((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); setMsg('She swam over.')
  }

  const s = 1 - depth * 0.48
  return (
    <main className="page mizu">
      <div className="col">
        <header className="bar">
          <div>
            <button type="button" className="title" onClick={call}>Mizu</button>
            <p className="sub">Tap her name. She comes to the glass.</p>
          </div>
          <div className="chips">
            <button type="button" className="chip" aria-pressed={night} title={night ? 'Lights on' : 'Lights off'} onClick={() => { const n = !night; setNight(n); setMsg(n ? 'Lights down. She rests.' : 'Lights up.') }}>
              {night ? <Sun /> : <Moon />}<span className="sr">{night ? 'Lights on' : 'Lights off'}</span>
            </button>
            <button type="button" className="chip" aria-pressed={bubbles} title={bubbles ? 'Bubbles off' : 'Bubbles on'} onClick={toggleBubbles}>
              {bubbles ? <Volume /> : <VolumeX />}<span className="sr">{bubbles ? 'Bubbles off' : 'Bubbles on'}</span>
            </button>
          </div>
        </header>

        <div className="mizu-wrap">
          <div ref={tank} className={`mizu-tank ${night ? 'is-night' : ''}`} onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerCancel={up}>
            <button type="button" className={`mizu-plant ${sway ? 'is-sway' : ''}`} aria-label="Plant" onPointerDown={e => { e.stopPropagation(); setSway(true); setTimeout(() => setSway(false), 700); swim(24, 66); setMsg('In the plants.') }}>
              <svg viewBox="0 0 64 140" aria-hidden="true">
                <path d="M32 140 C32 90 12 78 10 46" fill="none" stroke="#1d6a4c" strokeWidth="5" strokeLinecap="round" />
                <path d="M32 140 C34 88 54 72 52 34" fill="none" stroke="#1d6a4c" strokeWidth="5" strokeLinecap="round" />
                <ellipse cx="10" cy="40" rx="14" ry="22" fill="#2f8f68" transform="rotate(-24 10 40)" />
                <ellipse cx="54" cy="30" rx="13" ry="22" fill="#247a56" transform="rotate(20 54 30)" />
                <ellipse cx="32" cy="70" rx="11" ry="18" fill="#3aa37a" />
              </svg>
            </button>
            <button type="button" className="mizu-stone" aria-label="Stone" onPointerDown={e => { e.stopPropagation(); setDepth(0.42); swim(78, 70); setMsg('Behind the stone.') }} />
            <div className="mizu-sand" />
            {[18, 46, 72].map((left, i) => (
              <button key={left} type="button" className={`mizu-bubble ${popped[i] ? 'is-popped' : ''}`} style={{ left: `${left}%`, animationDelay: `${i * 1.1}s` }} aria-label="Bubble"
                onPointerDown={e => { e.stopPropagation(); if (popped[i]) return; setPopped(p => p.map((v, j) => j === i || v)); pop(); setMsg('Pop.'); setTimeout(() => setPopped(p => p.map((v, j) => j !== i && v)), 1500) }} />
            ))}
            {pellet && <span className={`mizu-pellet ${pellet.fall ? 'is-falling' : ''}`} style={{ left: `${pellet.x}%` }} />}
            <div className={`mizu-lotl mizu-${morph} ${pinching ? 'is-pinching' : ''} ${waving ? 'is-waving' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y - depth * 12}%`, transform: `translate(-50%, -60%) scale(${s * face}, ${s})` }}
              onPointerDown={e => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); setPinching(true) }}
              onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) dragTo(e) }}
              onPointerUp={e => { e.stopPropagation(); setPinching(false) }}>
              <Axolotl blinking={blink} />
            </div>
            <div className="mizu-depth" style={{ background: `rgba(10, 58, 64, ${depth * 0.35})` }} />
          </div>
        </div>

        <div className="dock">
          <p className="msg" aria-live="polite">{msg}</p>
          <form className="say" onSubmit={e => { e.preventDefault(); say(text); setText('') }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Read this, or say wave" aria-label="Say something to Mizu" />
            <button type="submit" className="primary">Say</button>
          </form>
          <div className="grid4">
            {MORPHS.map(m => <button key={m} type="button" aria-pressed={morph === m} className={morph === m ? 'on' : ''} onClick={() => pick(m)}>{NAMES[m]}</button>)}
          </div>
          <div className="row between">
            <button type="button" className="link" onClick={wave}>Wave</button>
            <button type="button" className="link" onClick={feed}>Feed</button>
          </div>
        </div>
      </div>
    </main>
  )
}
