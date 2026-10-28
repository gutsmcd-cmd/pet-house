import { useEffect, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Corgi from './Corgi.jsx'
import { useLang, clamp } from './shared.js'

const T = { en: { title: 'Photo with Mugi', hint: 'Drag Mugi into place. Pinch (or use the slider) to resize.', save: 'Save photo', saved: 'Saved to your phone! 📸', noCam: "The camera didn't open. Allow camera access and try again.", close: 'Close', flip: 'Flip' },
  ja: { title: 'ムギと写真', hint: 'ムギをドラッグして置いてね。ピンチ（またはスライダー）で大きさを変えられるよ。', save: '写真を保存', saved: 'スマホに保存したよ！📸', noCam: 'カメラが開かなかったよ。カメラを許可してもう一度。', close: '閉じる', flip: '向き' } }

export default function Photo({ onClose }) {
  const lang = useLang(), t = T[lang]
  const vid = useRef(null), box = useRef(null), ptr = useRef(new Map()), start = useRef(null)
  const [pos, setPos] = useState({ x: 50, y: 70, s: 0.5 }), [face, setFace] = useState(1), [msg, setMsg] = useState(t.hint), [err, setErr] = useState(false)
  useEffect(() => {
    let st, alive = true
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(s => {
      st = s; if (!alive) return s.getTracks().forEach(k => k.stop())
      vid.current.srcObject = s; vid.current.play().catch(() => {})
    }).catch(() => setErr(true))
    return () => { alive = false; st?.getTracks().forEach(k => k.stop()) }
  }, [])
  const down = e => { e.currentTarget.setPointerCapture?.(e.pointerId); ptr.current.set(e.pointerId, [e.clientX, e.clientY]); start.current = null }
  const move = e => {
    if (!ptr.current.has(e.pointerId)) return
    const r = box.current.getBoundingClientRect(), old = ptr.current.get(e.pointerId); ptr.current.set(e.pointerId, [e.clientX, e.clientY])
    const ps = [...ptr.current.values()]
    if (ps.length >= 2) { const d = Math.hypot(ps[0][0] - ps[1][0], ps[0][1] - ps[1][1]); if (!start.current) start.current = { d, s: pos.s }; setPos(p => ({ ...p, s: clamp(start.current.s * d / start.current.d, 0.15, 1.4) })) }
    else setPos(p => ({ ...p, x: clamp(p.x + (e.clientX - old[0]) / r.width * 100, 0, 100), y: clamp(p.y + (e.clientY - old[1]) / r.height * 100, 0, 100) }))
  }
  const up = e => { ptr.current.delete(e.pointerId); start.current = null }
  async function save() {
    const v = vid.current, r = box.current.getBoundingClientRect()
    const W = v.videoWidth || r.width, H = v.videoHeight || r.height
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d')
    if (v.videoWidth) x.drawImage(v, 0, 0, W, H); else { x.fillStyle = '#a8dcb6'; x.fillRect(0, 0, W, H) }
    // video is shown with object-fit:cover; map screen box onto the frame
    const k = Math.max(r.width / W, r.height / H), ox = (r.width - W * k) / 2, oy = (r.height - H * k) / 2
    const dw = Math.min(r.width * 0.6, 260) * pos.s / k, dh = dw * 0.75
    const cx = (pos.x / 100 * r.width - ox) / k, cy = (pos.y / 100 * r.height - oy) / k
    const svg = renderToStaticMarkup(<Corgi />).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"')
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode()
    x.save(); x.translate(cx, cy); x.scale(face, 1); x.drawImage(img, -dw / 2, -dh, dw, dh); x.restore()
    x.font = `${Math.round(W / 40)}px sans-serif`; x.fillStyle = '#fff'; x.fillText('Mugi 🐾', W * 0.03, H * 0.96)
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.92)), name = `mugi-${Date.now()}.jpg`
    const file = new File([blob], name, { type: 'image/jpeg' })
    window.__phLastPhoto = blob.size
    if (navigator.canShare?.({ files: [file] }) && /Android|iPhone|iPad/.test(navigator.userAgent)) { try { await navigator.share({ files: [file] }); setMsg(t.saved); return } catch {} }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000)
    setMsg(t.saved)
  }
  return (
    <div className="vision photo" role="dialog" aria-label={t.title}>
      <div className="photo-box" ref={box}>
        <video ref={vid} playsInline muted className="photo-vid" />
        <div className="photo-dog" style={{ left: pos.x + '%', top: pos.y + '%', width: `min(${60 * pos.s}vw, ${260 * pos.s}px)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Mugi sticker">
          <div style={{ transform: `scaleX(${face})` }}><Corgi /></div>
        </div>
      </div>
      <div className="vision-top"><div><strong>{t.title}</strong><p>{msg}</p></div><button className="pill" onClick={onClose}>✕ {t.close}</button></div>
      {err && <p className="vision-err">{t.noCam}</p>}
      <div className="photo-bar">
        <input type="range" min="15" max="140" value={Math.round(pos.s * 100)} onChange={e => setPos(p => ({ ...p, s: e.target.value / 100 }))} aria-label="Size" />
        <button className="pill" onClick={() => setFace(f => -f)}>↔ {t.flip}</button>
        <button className="primary" onClick={save}>📸 {t.save}</button>
      </div>
    </div>
  )
}
