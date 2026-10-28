import { useState } from 'react'
import { useLang } from './shared.js'
// Gentle needs. Nothing is ever lost or punished; reminders just appear now and then.
const H = 3600e3
const get = k => { try { return +localStorage.getItem(k) || 0 } catch { return 0 } }
const put = (k, v) => { try { localStorage.setItem(k, String(v)) } catch {} }
export const tokyoHour = (d = new Date()) => +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: 'numeric', hourCycle: 'h23' }).format(d)
export const isSleepy = () => { const h = tokyoHour(); return h >= 22 || h < 6 }
// first visit: pretend the last walk/clean was recently, so no nag on day one
const since = (k, first) => { let v = get(k); if (!v) { v = Date.now() - first; put(k, v) } return Date.now() - v }
export const wantsWalk = () => since('ph-walk', 2 * H) > 6 * H
export const tankCloudy = () => since('ph-clean', 24 * H) > 3 * 24 * H
export const doneWalk = () => put('ph-walk', Date.now())
export const doneClean = () => put('ph-clean', Date.now())

export function TankCard({ onClean }) {
  const lang = useLang(), [show, setShow] = useState(tankCloudy)
  if (!show) return null
  return (
    <div className="need-card">
      <span>🫧 {lang === 'ja' ? 'ミズの水そう、ちょっとくもってるよ。' : "Mizu's tank looks a little cloudy."}</span>
      <button className="pill on" onClick={() => { doneClean(); setShow(false); onClean?.() }}>{lang === 'ja' ? 'おそうじ' : 'Clean'}</button>
    </div>
  )
}
