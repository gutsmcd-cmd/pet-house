import { useEffect, useRef, useState } from 'react'
import { useJaDom } from './i18n.js'
import House from './House.jsx'
import Mugi from './Mugi.jsx'
import Mizu from './Mizu.jsx'
import Play from './Play.jsx'
import Films from './Films.jsx'
import { useLang } from './shared.js'

const routeOf = () => (location.hash.replace(/^#\/?/, '').split(/[?/]/)[0] || 'house').toLowerCase()
export const go = to => { location.hash = '#/' + to }

function NotFound() {
  return (
    <main className="page notfound">
      <div className="nf-card">
        <div className="nf-emoji" aria-hidden="true">🐾</div>
        <h1>Nobody's in this room</h1>
        <p>Mugi sniffed around and Mizu checked behind the stone, but this page isn't here.</p>
        <a className="nf-btn" href="#/house">Back to the House</a>
      </div>
    </main>
  )
}

const TABS = [['house', 'House', 'おうち', '🏠'], ['play', 'Play', 'あそぶ', '🎾'], ['mugi', 'Mugi', 'ムギ', '🐕'], ['mizu', 'Mizu', 'ミズ', '🫧'], ['films', 'Films', 'ビデオ', '🎬']]

export default function App() {
  const lang = useLang()
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const [r, setR] = useState(routeOf)
  useEffect(() => { const f = () => setR(routeOf()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  useEffect(() => { document.title = (TABS.find(t => t[0] === r)?.[1] ?? 'Not found') + ' · Pet House' }, [r])
  const box = useRef(null)
  useJaDom(box, lang === 'ja' && ['house', 'mugi', 'mizu'].includes(r))
  const Page = { house: House, play: Play, mugi: Mugi, mizu: Mizu, films: Films }[r] ?? NotFound
  return (
    <div className="shell">
      <div ref={box} className="pagebox"><Page key={r + lang} /></div>
      <nav className="tabs" aria-label="Rooms">
        {TABS.map(([id, label, ja, emoji]) => (
          <a key={id} href={'#/' + id} className={'tab' + (r === id ? ' is-on' : '')} aria-current={r === id ? 'page' : undefined}>
            <span aria-hidden="true">{emoji}</span>{lang === 'ja' ? ja : label}
          </a>
        ))}
      </nav>
    </div>
  )
}
