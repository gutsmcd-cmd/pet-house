import { useEffect, useRef, useState } from 'react'
import { MOVES, move, loadHum, saveHum, speak, clamp, reducedMotion } from './shared.js'
import { go } from './App.jsx'
import { Camera, CameraOff, Volume, VolumeX, Mic, Play, Pause } from './icons.jsx'

const DANCE = 'mugi-dance-v1'
function loadDance() {
  try { const v = JSON.parse(localStorage.getItem(DANCE) || 'null'); if (Array.isArray(v) && v.every(x => typeof x === 'string')) return v.slice(0, 6) } catch {}
  return []
}

// Offline stand-in for the original's cloud "what is it?": reads the camera frame's colours on the phone.
const HUES = [[15, 'red'], [40, 'orange'], [65, 'yellow'], [160, 'green'], [200, 'teal'], [255, 'blue'], [290, 'purple'], [335, 'pink'], [360, 'red']]
function lookAt(video, prev) {
  const c = document.createElement('canvas'); c.width = 48; c.height = 48
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(video, 0, 0, 48, 48)
  const d = x.getImageData(0, 0, 48, 48).data
  let r = 0, g = 0, b = 0, n = d.length / 4
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
  r /= n * 255; g /= n * 255; b /= n * 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (mx !== mn) { h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360 }
  const colour = l < 0.16 ? 'dark' : l > 0.86 ? 'bright and white' : s < 0.18 ? 'grey' : HUES.find(([lim]) => h <= lim)[1]
  const lines = {
    dark: "It's dark. She sniffs it anyway.", 'bright and white': "Something bright. She squints and wags.", grey: 'Something grey. She tilts her head.',
    red: 'Something red. Is it a ball?', orange: 'Something orange. She thinks it might be a snack.', yellow: 'Something yellow. Her tail goes.',
    green: 'Something green. Grass? She wants to roll in it.', teal: "Something blue-green. She thinks it's Mizu's water.", blue: 'Something blue. She stares at it.',
    purple: 'Something purple. Very fancy.', pink: 'Something pink. Her favourite.',
  }
  const text = lines[colour]
  return prev && prev.startsWith(text.split('.')[0]) ? `Still ${colour}. She's watching it closely.` : text
}

export default function Mugi() {
  const [clip, setClip] = useState(MOVES[0])
  const [dist, setDist] = useState(0)
  const [pinching, setPinching] = useState(false)
  const [muted, setMuted] = useState(true)
  const [broken, setBroken] = useState(false)
  const [msg, setMsg] = useState('Pinch her back. Tap her. Drag the ball.')
  const [text, setText] = useState('')
  const [teaching, setTeaching] = useState(false)
  const [draft, setDraft] = useState([])
  const [dance, setDance] = useState([])
  const [hum, setHum] = useState(null)
  const [recording, setRecording] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [nod, setNod] = useState(false)
  const [scratch, setScratch] = useState(false)
  const [ball, setBall] = useState({ x: 76, y: 78 })
  const [cam, setCam] = useState(false)
  const [seen, setSeen] = useState('')
  const [looking, setLooking] = useState(false)

  const vid = useRef(null), camVid = useRef(null), room = useRef(null)
  const wantSound = useRef(true), distRef = useRef(0), pointers = useRef(new Map()), pinch = useRef(null), tap = useRef(null)
  const ballRef = useRef(ball), dragging = useRef(false), run = useRef(0), humRef = useRef(null), rec = useRef(null), player = useRef(null), urlRef = useRef(''), nodUntil = useRef(0)

  useEffect(() => { distRef.current = dist }, [dist])
  useEffect(() => { ballRef.current = ball }, [ball])
  useEffect(() => { setDance(loadDance()); loadHum().then(b => { humRef.current = b; setHum(b) }).catch(() => {}) }, [])

  function play(m) {
    const v = vid.current; setClip(m); setBroken(false); if (!v) return
    v.poster = m.poster
    if (v.getAttribute('src') === m.src) v.currentTime = 0; else v.src = m.src
    v.muted = !wantSound.current; setMuted(v.muted)
    const p = v.play(); p?.catch(() => { v.muted = true; setMuted(true); v.play().catch(() => setBroken(true)) })
  }

  useEffect(() => {
    play(MOVES[0])
    const el = room.current
    const wheel = e => { e.preventDefault(); setDist(d => clamp(d + e.deltaY * 0.0015, 0, 1)) }
    el?.addEventListener('wheel', wheel, { passive: false })
    return () => {
      run.current += 1; el?.removeEventListener('wheel', wheel)
      if (rec.current?.state === 'recording') rec.current.stop()
      player.current?.pause(); if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      camVid.current?.srcObject?.getTracks().forEach(t => t.stop())
    }
  }, [])

  function call() {
    const from = distRef.current, id = ++run.current
    play(move('zoom'))
    if (reducedMotion() || from < 0.04) { setDist(0); setMsg("She's here."); speak("I'm here."); return }
    setMsg("She's coming.")
    const t0 = performance.now()
    const step = now => {
      if (run.current !== id) return
      const k = Math.min(1, (now - t0) / 780), e = 1 - (1 - k) ** 3
      setDist(from * (1 - e))
      if (k < 1) requestAnimationFrame(step)
      else { setMsg("She's here."); speak("I'm here."); play(move('look')) }
    }
    requestAnimationFrame(step)
  }

  function nodFor(ms) { nodUntil.current = performance.now() + ms; const mark = nodUntil.current; setNod(true); setTimeout(() => { if (nodUntil.current === mark) setNod(false) }, ms) }

  async function doDance() {
    const steps = dance.length ? dance : ['zoom'], id = ++run.current
    setMsg(dance.length ? 'The dance she learned.' : 'She only knows a little spin so far.')
    if (!dance.length) nodFor(4200)
    for (const s of steps) { if (run.current !== id) return; play(move(s)); await new Promise(r => setTimeout(r, 1700)) }
  }

  function say(raw) {
    const t = raw.trim(); if (!t) return
    const lo = t.toLowerCase()
    if (/^(mugi|come|come here|here girl)\b/.test(lo) || lo === 'むぎ') return call()
    if (/^(house|home|mizu)\b/.test(lo) || lo.includes('go home')) return go(lo.startsWith('mizu') ? 'mizu' : 'house')
    if (lo.includes('dance') || lo.includes('ダンス')) return doDance()
    if (lo.includes('apt') || t.includes('아파트') || t.includes('アパート')) {
      if (humRef.current) playClip(humRef.current); else { setMsg('Hum it first. A few seconds is enough.'); nodFor(4000) }
      return
    }
    if (lo.startsWith('read ')) { const r = t.slice(5).trim(); setMsg(r); speak(r); return }
    if (cam && /\b(what|see|this|that|look)\b/i.test(t)) return ask()
    setMsg(t); speak(t)
  }

  function ask() {
    const v = camVid.current
    if (!v || v.readyState < 2) { setMsg("The camera isn't ready."); return }
    setLooking(true); setMsg("She's looking…")
    setTimeout(() => {
      try { const r = lookAt(v, seen); setSeen(r); setMsg(r); speak(r); play(move('look')) } catch { setMsg('She lost the picture. Try again.') }
      setLooking(false)
    }, 600)
  }

  async function toggleCam() {
    if (cam) { camVid.current?.srcObject?.getTracks().forEach(t => t.stop()); if (camVid.current) camVid.current.srcObject = null; setCam(false); setSeen(''); setMsg('Camera off.'); return }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      if (camVid.current) { camVid.current.srcObject = s; await camVid.current.play() }
      setCam(true); setSeen(''); setMsg("You're both looking. Ask her what it is.")
    } catch { setMsg('The camera needs a yes.') }
  }

  function playClip(blob) {
    play(move('sit'))
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = URL.createObjectURL(blob)
    const a = player.current ?? new Audio(); player.current = a
    a.onended = () => { setNod(false); setPlaying(false) }
    a.src = urlRef.current; setPlaying(true); setNod(!reducedMotion()); setMsg('Her tune. Head move.')
    a.play().catch(() => { setNod(false); setPlaying(false); setMsg('Tap Play again so the phone allows the sound.') })
  }
  function resume() {
    const a = player.current, b = humRef.current; if (!b) return
    if (a && a.src && !a.ended && a.paused && a.currentTime > 0) {
      setPlaying(true); setNod(!reducedMotion()); setMsg('Her tune. Head move.')
      a.play().catch(() => { setNod(false); setPlaying(false); setMsg('Tap Play again so the phone allows the sound.') }); return
    }
    playClip(b)
  }
  function pause() { const a = player.current; if (a && !a.paused) { a.pause(); setPlaying(false); setNod(false); setMsg('Paused.') } }

  async function humBtn() {
    if (recording) { rec.current?.stop(); return }
    if (typeof MediaRecorder === 'undefined') { setMsg("This phone can't record. Type APT and she'll still nod."); return }
    try {
      player.current?.pause(); setNod(false); setPlaying(false)
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported(t))
      const r = new MediaRecorder(s, type ? { mimeType: type } : undefined), parts = []
      r.ondataavailable = e => { if (e.data.size) parts.push(e.data) }
      const cap = setTimeout(() => { if (r.state === 'recording') r.stop() }, 6000)
      r.onstop = () => {
        clearTimeout(cap); s.getTracks().forEach(t => t.stop()); setRecording(false)
        const blob = new Blob(parts, { type: r.mimeType || type || 'audio/webm' })
        if (blob.size < 800) { setMsg('That was too short. Hum a little longer.'); return }
        humRef.current = blob; setHum(blob); saveHum(blob).catch(() => {}); playClip(blob)
      }
      rec.current = r; r.start(); setRecording(true); setMsg('Hum it. Six seconds, then she uses that.')
    } catch { setRecording(false); setMsg('The microphone needs a yes.') }
  }

  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setMsg("This phone won't listen. Type it instead."); return }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false
    r.onresult = e => say(e.results[0]?.[0]?.transcript ?? '')
    r.onerror = () => setMsg("She didn't catch that.")
    setMsg('Listening…'); r.start()
  }

  function down(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { span: Math.hypot(a.x - b.x, a.y - b.y), d: distRef.current }; setPinching(true); tap.current = null; return
    }
    tap.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  function moveP(e) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size < 2 || !pinch.current) return
    const [a, b] = [...pointers.current.values()]
    const k = (Math.hypot(a.x - b.x, a.y - b.y) || 1) / pinch.current.span
    setDist(clamp(pinch.current.d + (1 - k) * 0.9, 0, 1))
  }
  function up(e) {
    pointers.current.delete(e.pointerId)
    const t = tap.current; tap.current = null
    if (pointers.current.size < 2) {
      const was = pinch.current !== null; pinch.current = null; setPinching(false)
      if (was || !t || t.id !== e.pointerId || Math.hypot(e.clientX - t.x, e.clientY - t.y) > 14) return
      setScratch(true); play(move('look')); setMsg('Right there.'); setTimeout(() => setScratch(false), 520)
    }
  }
  function ballDown(e) { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); dragging.current = true }
  function ballMove(e) {
    if (!dragging.current) return
    const r = room.current?.getBoundingClientRect(); if (!r) return
    const p = { x: clamp((e.clientX - r.left) / r.width * 100, 8, 92), y: clamp((e.clientY - r.top) / r.height * 100, 16, 88) }
    ballRef.current = p; setBall(p)
  }
  function ballUp(e) {
    e.stopPropagation(); if (!dragging.current) return; dragging.current = false
    const d = clamp((78 - ballRef.current.y) / 55, 0, 1); setDist(d)
    play(move(d > 0.35 ? 'zoom' : 'trot')); setMsg(d > 0.35 ? 'She chased it.' : 'She got the ball.')
  }

  const scale = 1 - dist * 0.62, bottom = 6 + dist * 34
  return (
    <main className="page mugi">
      <div className="col">
        <header className="bar">
          <div>
            <button type="button" className="title" onClick={call}>Mugi</button>
            <p className="sub">Tap her name to call her</p>
          </div>
          <div className="chips">
            <button type="button" className="chip" aria-pressed={cam} onClick={toggleCam} title={cam ? 'Stop the camera' : 'Look together'}>
              {cam ? <CameraOff /> : <Camera />}<span className="sr">{cam ? 'Stop the camera' : 'Look together'}</span>
            </button>
            <button type="button" className="chip" title={muted ? 'Sound on' : 'Sound off'} onClick={() => {
              const v = vid.current, m = !muted; wantSound.current = !m; setMuted(m); if (v) { v.muted = m; if (!m) v.play().catch(() => {}) }
            }}>
              {muted ? <VolumeX /> : <Volume />}<span className="sr">{muted ? 'Sound on' : 'Sound off'}</span>
            </button>
          </div>
        </header>

        <div ref={room} className="mugi-room" onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerCancel={up}>
          <video ref={camVid} className={`mugi-cam ${cam ? '' : 'hidden'}`} playsInline muted />
          <div className={`mugi-dog ${pinching ? 'is-pinching' : ''}`} style={{ bottom: `${bottom}%`, transform: `translateX(-50%) scale(${scale})` }}>
            <div className={scratch ? 'mugi-scratch fill' : nod ? 'mugi-nod fill' : 'fill'}>
              <img src={clip.poster} alt="Mugi the corgi" />
              <video ref={vid} className="mugi-clip" key="clip" poster={clip.poster} playsInline loop muted={muted} onError={() => setBroken(true)} />
            </div>
          </div>
          <button type="button" className="mugi-ball" style={{ left: `${ball.x}%`, top: `${ball.y}%` }} aria-label="Ball"
            onPointerDown={ballDown} onPointerMove={ballMove} onPointerUp={ballUp} onPointerCancel={ballUp} />
        </div>

        <div className="dock">
          <p className="msg" aria-live="polite">{broken ? "This move didn't load. Try another." : msg}</p>
          <div className="row wrap">
            <button type="button" aria-pressed={recording} className={`pill ${recording ? 'on' : ''}`} onClick={humBtn}>{recording ? 'Stop' : 'Hum'}</button>
            {hum && !recording && <button type="button" aria-pressed={playing} className={`pill ${playing ? 'on' : ''}`} onClick={resume}><Play size={16} />Play</button>}
            {hum && !recording && <button type="button" className="pill" onClick={pause}><Pause size={16} />Pause</button>}
          </div>
          <form className="say" onSubmit={e => { e.preventDefault(); say(text); setText('') }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder={cam ? 'Ask what you both see' : 'Read this, or say dance'} aria-label="Say something to Mugi" />
            <button type="button" className="sq" onClick={listen} aria-label="Listen" title="Listen"><Mic /></button>
            <button type="submit" className="primary">Say</button>
          </form>
          {cam && <button type="button" className="wide" disabled={looking} onClick={ask}>{looking ? 'Looking…' : 'What is it?'}</button>}
          <div className="grid5">
            {MOVES.map(m => (
              <button key={m.id} type="button" aria-pressed={m.id === clip.id} className={m.id === clip.id ? 'on' : ''} onClick={() => {
                if (teaching) { const n = draft.length >= 6 ? draft : [...draft, m.id]; setDraft(n); setMsg(`Learning: ${n.join(', ')}`) }
                play(m)
              }}>{m.title}</button>
            ))}
          </div>
          <div className="row between">
            {teaching ? (
              <>
                <button type="button" className="primary" onClick={() => { localStorage.setItem(DANCE, JSON.stringify(draft.slice(0, 6))); setDance(draft); setTeaching(false); setMsg(draft.length ? "She'll remember that dance." : 'Nothing new. She still knows the old one.') }}>Remember</button>
                <button type="button" className="link" onClick={() => setTeaching(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button type="button" className="link" onClick={() => { setDraft([]); setTeaching(true); setMsg('Tap moves in order. Then remember.') }}>{dance.length ? 'Teach a new dance' : 'Teach a dance'}</button>
                {dance.length > 0 && <button type="button" className="link" onClick={doDance}>Dance</button>}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
