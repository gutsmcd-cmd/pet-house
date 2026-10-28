export const MOVES = [
  { id: 'look', title: 'Look', line: 'Ears, a glance, a wag.' },
  { id: 'trot', title: 'Trot', line: 'Steps in place.' },
  { id: 'zoom', title: 'Zoom', line: 'One fast circle, then a stop.' },
  { id: 'sit', title: 'Sit', line: 'Sits and offers a paw.' },
  { id: 'roll', title: 'Roll', line: 'Onto her back, then up.' },
].map(m => ({ ...m, src: `./mugi/${m.id}.mp4`, poster: `./mugi/${m.id}.jpg` }))
export const move = id => MOVES.find(m => m.id === id) ?? MOVES[0]

const DB = 'mugi-tune', STORE = 'clips'
function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE) }
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error)
  })
}
export async function saveHum(blob) {
  const db = await open()
  await new Promise((res, rej) => { const t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(blob, 'hum'); t.oncomplete = res; t.onerror = () => rej(t.error) })
}
export async function loadHum() {
  const db = await open()
  return new Promise((res, rej) => { const g = db.transaction(STORE, 'readonly').objectStore(STORE).get('hum'); g.onsuccess = () => res(g.result ?? null); g.onerror = () => rej(g.error) })
}

export function speak(text, pitch = 1.35, rate = 1.02) {
  if (!text || !window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = /[\u3040-\u30ff\u4e00-\u9faf]/.test(text) ? 'ja-JP' : 'en-US'
  u.pitch = pitch; u.rate = rate
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
}
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const MORPHS = ['pink', 'gold', 'wild', 'dark']
export function audioCtx() { const A = window.AudioContext || window.webkitAudioContext; return A ? new A() : null }
