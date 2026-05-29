// Proxy script to start vibe_offer Next.js dev server from this project root
const { spawn } = require('child_process')
const path = require('path')

const vibeOfferDir = path.join(__dirname, '..', 'vibe_offer')
const port = process.env.PORT || '3001'

const child = spawn('npm', ['run', 'dev'], {
  cwd: vibeOfferDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: port },
})

child.on('error', (err) => { console.error('Failed to start:', err); process.exit(1) })
child.on('exit', (code) => process.exit(code ?? 0))
