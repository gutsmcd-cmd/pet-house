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

// ---- language (EN / 日本語), shared by every page ----
import { useEffect as _uE, useState as _uS } from 'react'
const LK = 'ph-lang'
export const getLang = () => { try { return localStorage.getItem(LK) || ((navigator.language || '').startsWith('ja') ? 'ja' : 'en') } catch { return 'en' } }
export function setLang(l) { try { localStorage.setItem(LK, l) } catch {} ; dispatchEvent(new Event('ph-lang')) }
export function useLang() {
  const [l, s] = _uS(getLang)
  _uE(() => { const f = () => s(getLang()); addEventListener('ph-lang', f); return () => removeEventListener('ph-lang', f) }, [])
  return l
}
// short synthetic bark (no audio files needed)
let _ac = null
export function bark(times = 1) {
  try {
    _ac = _ac || audioCtx(); if (!_ac) return; _ac.resume?.()
    for (let i = 0; i < times; i++) {
      const t = _ac.currentTime + i * 0.22, o = _ac.createOscillator(), g = _ac.createGain(), f = _ac.createBiquadFilter()
      o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.12)
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.2
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(f); f.connect(g); g.connect(_ac.destination); o.start(t); o.stop(t + 0.18)
    }
  } catch {}
}
