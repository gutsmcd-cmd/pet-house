import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function precache() {
  return {
    name: 'precache-list',
    closeBundle() {
      const dist = path.resolve('dist'); const out = []
      const walk = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : out.push(path.relative(dist, p).split(path.sep).join('/')) } }
      walk(dist)
      fs.writeFileSync(path.join(dist, 'precache.json'), JSON.stringify(out.filter(f => f !== 'sw.js' && f !== 'precache.json' && f !== '.nojekyll')))
    }
  }
}
export default defineConfig({ base: './', plugins: [react(), precache()] })
