import { setLang, getLang } from './shared.js'
import { useEffect, useRef, useState } from 'react'
import Axolotl from './Axolotl.jsx'
import { Greeting, SeasonLayer } from './Season.jsx'
import { MOVES, loadHum, reducedMotion, audioCtx } from './shared.js'
import { Rain, Moon, Sun, Play } from './icons.jsx'

const NAP = 'house-nap'
function namba(d = new Date()) {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: 'numeric', hourCycle: 'h23' }).format(d))
  const phase = h < 5 || h >= 20 ? 'night' : h < 8 ? 'dawn' : h >= 17 ? 'dusk' : 'day'
  return { phase, label: { dawn: 'Morning', dusk: 'Evening', night: 'Night', day: 'Afternoon' }[phase] }
}

export default function House() {
  const [phase, setPhase] = useState('day')
  const [label, setLabel] = useState('Afternoon')
  const [morph, setMorph] = useState('pink')
  const [asleep, setAsleep] = useState(false)
  const [raining, setRaining] = useState(false)
  const [humming, setHumming] = useState(false)
  const [waving, setWaving] = useState(false)
  const [blink, setBlink] = useState(false)
  const [hum, setHum] = useState(null)
  const [clip, setClip] = useState(MOVES[3])
  const [lotl, setLotl] = useState({ x: 36, y: 64 })
  const [cooker, setCooker] = useState(false)
  const [kettle, setKettle] = useState(false)
  const [pan, setPan] = useState(false)
  const [noren, setNoren] = useState(false)
  const [msg, setMsg] = useState('Tap the bell. They both come.')
  const video = useRef(null), audio = useRef(null), stopRain = useRef(null), url = useRef('')

  useEffect(() => {
    const m = localStorage.getItem('mizu-morph'); if (['pink', 'gold', 'wild', 'dark'].includes(m)) setMorph(m)
    setAsleep(localStorage.getItem(NAP) === '1')
    loadHum().then(setHum).catch(() => {})
    const tick = () => { const n = namba(); setPhase(n.phase); setLabel(n.label) }
    tick()
    const t1 = setInterval(tick, 60000)
    const t2 = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140) }, 4600)
    const t3 = setInterval(() => {
      if (localStorage.getItem(NAP) === '1') return
      setLotl({ x: 30, y: 62 }); setClip(MOVES[0])
    }, 18000)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); stopRain.current?.(); audio.current?.pause(); if (url.current) URL.revokeObjectURL(url.current) }
  }, [])

  useEffect(() => { const v = video.current; if (v) { v.src = clip.src; v.muted = true; v.play().catch(() => {}) } }, [clip])

  const wake = () => { setAsleep(false); localStorage.removeItem(NAP); setMsg(m => m.startsWith('Lights down') ? "They're up." : m) }

  function bell() {
    const ctx = audioCtx()
    if (ctx) {
      const g = ctx.createGain(); g.connect(ctx.destination); const t = ctx.currentTime
      g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.02); g.gain.exponentialRampToValueAtTime(1e-4, t + 1.6)
      for (const f of [880, 1318]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + 1.7) }
      setTimeout(() => ctx.close(), 1800)
    }
    wake(); setClip(MOVES[3]); setLotl({ x: 24, y: 60 })
    setWaving(true); setTimeout(() => setWaving(false), 2200)
    setMsg('Both of them. Right here.')
  }

  function playHum() {
    if (!hum) { setMsg("Hum it on Mugi's page first. They'll share it."); return }
    if (url.current) URL.revokeObjectURL(url.current)
    url.current = URL.createObjectURL(hum)
    const a = audio.current ?? new Audio(); audio.current = a
    a.src = url.current; a.onended = () => setHumming(false)
    setHumming(!reducedMotion()); setWaving(true); setMsg('Her tune. Both of them know it.')
    a.play().catch(() => { setHumming(false); setMsg('Tap Play again so the phone allows it.') })
  }

  function goodnight() {
    if (asleep) { wake(); setMsg("They're up."); return }
    setAsleep(true); localStorage.setItem(NAP, '1')
    setRaining(false); stopRain.current?.(); stopRain.current = null
    setClip(MOVES[3]); setLotl({ x: 55, y: 74 }); setHumming(false); audio.current?.pause()
    setMsg('Lights down. Tap the room to wake them.')
  }

  function rain() {
    if (raining) { stopRain.current?.(); stopRain.current = null; setRaining(false); setMsg('The window cleared.'); return }
    const ctx = audioCtx()
    if (ctx) {
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900
      const g = ctx.createGain(); g.gain.value = 0.04
      src.connect(lp); lp.connect(g); g.connect(ctx.destination)
      ctx.resume().then(() => src.start())
      stopRain.current = () => { try { src.stop() } catch {} ctx.close() }
    }
    setRaining(true); setMsg('Rain on the glass.')
  }

  const look = asleep ? 'night' : phase
  return (
    <main className={`page house house-${look}`}>
      <div className="col">
        <header className="bar">
          <div>
            <button type="button" className="title" onClick={bell}>House</button>
            <p className="sub">Namba · {label}</p>
          </div>
          <div className="chips">
            <button type="button" className="chip langchip" onClick={() => setLang(getLang() === 'ja' ? 'en' : 'ja')} aria-label="Language">{getLang() === 'ja' ? 'EN' : '日本語'}</button>
            <button type="button" className="chip" aria-pressed={raining} onClick={rain} title={raining ? 'Stop the rain' : 'Rain'}>
              <Rain /><span className="sr">{raining ? 'Stop the rain' : 'Rain'}</span>
            </button>
            <button type="button" className="chip" aria-pressed={asleep} onClick={goodnight} title={asleep ? 'Wake them' : 'Goodnight'}>
              {asleep ? <Sun /> : <Moon />}<span className="sr">{asleep ? 'Wake them' : 'Goodnight'}</span>
            </button>
          </div>
        </header>

        <Greeting phase={phase} onHello={bell} />
        <div className="house-room" onPointerDown={() => { if (asleep) { wake(); setMsg("They're up.") } }}>
          <div className="house-sky" />
          {look === 'night' && <div className="house-stars" />}
          <SeasonLayer />
          {raining && <div className="house-rain" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <span key={i} style={{ left: `${(i * 7) % 100}%`, animationDelay: `${(i % 5) * 0.2}s` }} />)}</div>}
          <button type="button" className="house-bell" aria-label="Bell" onClick={e => { e.stopPropagation(); bell() }}><span /></button>
          <div className="house-kitchen" onPointerDown={e => e.stopPropagation()}>
            <div className="house-canal" aria-hidden="true"><i /><i /><b>道頓堀</b></div>
            <p className="house-midosuji">御堂筋</p>
            <button type="button" className={`house-noren ${noren ? 'is-open' : ''}`} aria-label="Noren" onClick={() => { setNoren(true); setTimeout(() => setNoren(false), 700); setMsg('Noren. 難波.') }}>難波</button>
            <i className={`house-lantern ${look === 'night' || look === 'dusk' ? 'is-lit' : ''}`} />
            <div className="house-counter">
              <button type="button" className={`house-cooker ${cooker ? 'is-on' : ''}`} aria-label="Rice cooker" onClick={() => { setCooker(true); setTimeout(() => setCooker(false), 2600); setClip(MOVES[0]); setMsg('Rice is ready.') }}><span /></button>
              <button type="button" className={`house-kettle ${kettle ? 'is-on' : ''}`} aria-label="Kettle" onClick={() => { setKettle(true); setTimeout(() => setKettle(false), 1800); setMsg("Kettle's on.") }} />
              <button type="button" className={`house-pan ${pan ? 'is-hot' : ''}`} aria-label="Takoyaki" onClick={() => { setPan(true); setClip(MOVES[0]); setMsg('Takoyaki. She wants one.') }}>
                {Array.from({ length: 6 }, (_, i) => <span key={i} />)}
              </button>
            </div>
          </div>
          <div className="house-floor" />
          <div className={`house-dog ${humming ? 'is-nod' : ''}`}>
            <img src={clip.poster} alt="" />
            <video ref={video} poster={clip.poster} playsInline muted loop />
          </div>
          <div className="house-tank">
            <div className="house-sand" />
            <div className={`house-lotl mizu-${morph} ${waving ? 'is-waving' : ''}`} style={{ left: `${lotl.x}%`, top: `${lotl.y}%` }}>
              <div className={humming ? 'house-bob' : undefined}><Axolotl blinking={blink} /></div>
            </div>
          </div>
        </div>

        <div className="dock">
          <p className="msg" aria-live="polite">{msg}</p>
          <div className="row">
            {hum ? <button type="button" className="pill" onClick={playHum}><Play size={16} />Play</button>
              : <span className="muted small">Hum a tune with Mugi and they’ll share it.</span>}
          </div>
        </div>
      </div>
    </main>
  )
}
