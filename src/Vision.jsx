import { useEffect, useRef, useState } from 'react'
import Corgi from './Corgi.jsx'
import { useLang, bark } from './shared.js'

// Dogs have two kinds of colour cones (blue + yellow), so reds and greens look alike and things are a bit blurry.
const W = 160, H = 120, MW = 32, MH = 24
const LINES = {
  en: { title: 'Corgi vision', sub: 'What Mugi sees: blues and yellows, a little blurry.', calm: 'She is watching…', move: ['Something moved! Woof!', 'Ears up. What was that?', 'Tail going. Is it a friend?'], noCam: 'The camera didn\'t open. Allow camera access and try again.', close: 'Close' },
  ja: { title: 'コーギーの目', sub: 'むぎの見え方：青と黄色、ちょっとぼんやり。', calm: 'じーっと見てるよ…', move: ['何か動いた！ワン！', '耳ピーン。今のなに？', 'しっぽフリフリ。おともだち？'], noCam: 'カメラが開かなかったよ。カメラを許可してもう一度。', close: '閉じる' },
}
export default function Vision({ onClose }) {
  const lang = useLang(), t = LINES[lang]
  const vid = useRef(null), cv = useRef(null), [react, setReact] = useState(0), [msg, setMsg] = useState(t.calm), [err, setErr] = useState(false), [side, setSide] = useState(50)
  useEffect(() => {
    let stream, raf, prev = null, last = 0, alive = true
    const small = document.createElement('canvas'); small.width = MW; small.height = MH
    const sx = small.getContext('2d', { willReadFrequently: true })
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (!alive) return stream.getTracks().forEach(k => k.stop())
        const v = vid.current; v.srcObject = stream; await v.play()
        const x = cv.current.getContext('2d', { willReadFrequently: true })
        const loop = now => {
          raf = requestAnimationFrame(loop)
          if (v.readyState < 2) return
          x.drawImage(v, 0, 0, W, H)
          const img = x.getImageData(0, 0, W, H), d = img.data
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2], y = 0.625 * r + 0.375 * g
            d[i] = y; d[i + 1] = 0.7 * r + 0.3 * g; d[i + 2] = 0.3 * g + 0.7 * b
          }
          x.putImageData(img, 0, 0)
          // motion: compare a tiny grey frame with the last one
          sx.drawImage(v, 0, 0, MW, MH)
          const m = sx.getImageData(0, 0, MW, MH).data, grey = new Float32Array(MW * MH)
          let diff = 0, cx = 0, n = 0
          for (let p = 0; p < MW * MH; p++) {
            grey[p] = (m[p * 4] + m[p * 4 + 1] + m[p * 4 + 2]) / 3
            if (prev) { const dd = Math.abs(grey[p] - prev[p]); diff += dd; if (dd > 25) { cx += p % MW; n++ } }
          }
          prev = grey
          const mean = diff / (MW * MH)
          if (mean > 6 && n > 8 && now - last > 1800) {
            last = now; setReact(k => k + 1); setSide(10 + (cx / n / MW) * 80)
            const lines = LINES[document.documentElement.lang === 'ja' ? 'ja' : 'en'].move
            setMsg(lines[Math.floor(Math.random() * lines.length)]); bark(2)
          } else if (now - last > 4000) setMsg(LINES[document.documentElement.lang === 'ja' ? 'ja' : 'en'].calm)
        }
        raf = requestAnimationFrame(loop)
      } catch { setErr(true) }
    })()
    return () => { alive = false; cancelAnimationFrame(raf); stream?.getTracks().forEach(k => k.stop()) }
  }, [])
  const excited = react > 0 && msg !== t.calm
  return (
    <div className="vision" role="dialog" aria-label={t.title}>
      <video ref={vid} playsInline muted className="sr" />
      <canvas ref={cv} width={W} height={H} className="vision-cv" />
      <div className="vision-vignette" />
      <div className="vision-top"><div><strong>{t.title}</strong><p>{t.sub}</p></div><button className="pill" onClick={onClose}>✕ {t.close}</button></div>
      {err && <p className="vision-err">{t.noCam}</p>}
      <div key={react} className={'vision-dog' + (excited ? ' a-happy' : '')} style={{ left: side + '%' }}>
        <Corgi ears={excited} />
      </div>
      <p className="vision-msg" aria-live="polite">{msg}</p>
    </div>
  )
}
