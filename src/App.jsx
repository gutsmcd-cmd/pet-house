import { useEffect, useState } from 'react'
import House from './House.jsx'
import Mugi from './Mugi.jsx'
import Mizu from './Mizu.jsx'

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

const TABS = [['house', 'House', '🏠'], ['mugi', 'Mugi', '🐕'], ['mizu', 'Mizu', '🫧']]

export default function App() {
  const [r, setR] = useState(routeOf)
  useEffect(() => { const f = () => setR(routeOf()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  useEffect(() => { document.title = (TABS.find(t => t[0] === r)?.[1] ?? 'Not found') + ' · Pet House' }, [r])
  const Page = r === 'house' ? House : r === 'mugi' ? Mugi : r === 'mizu' ? Mizu : NotFound
  return (
    <div className="shell">
      <Page key={r} />
      <nav className="tabs" aria-label="Rooms">
        {TABS.map(([id, label, emoji]) => (
          <a key={id} href={'#/' + id} className={'tab' + (r === id ? ' is-on' : '')} aria-current={r === id ? 'page' : undefined}>
            <span aria-hidden="true">{emoji}</span>{label}
          </a>
        ))}
      </nav>
    </div>
  )
}
