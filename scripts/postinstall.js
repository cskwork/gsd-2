#!/usr/bin/env node

import { exec as execCb } from 'child_process'
import { createRequire } from 'module'
import os from 'os'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const pkg = require(resolve(__dirname, '..', 'package.json'))
const cwd = resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// Async exec helper — captures stdout+stderr, never inherits to terminal
// ---------------------------------------------------------------------------
function run(cmd, options = {}) {
  return new Promise((resolve) => {
    execCb(cmd, { cwd, ...options }, (error, stdout, stderr) => {
      resolve({ ok: !error, stdout, stderr, error })
    })
  })
}
<<<<<<< HEAD

// ---------------------------------------------------------------------------
// Redirect stdout → stderr so npm always shows postinstall output.
// npm ≥7 suppresses stdout from lifecycle scripts by default; stderr is
// always forwarded. Clack writes to process.stdout, so we reroute it.
// ---------------------------------------------------------------------------
process.stdout.write = process.stderr.write.bind(process.stderr)

// ---------------------------------------------------------------------------
// ASCII banner — printed before clack UI for brand recognition
// ---------------------------------------------------------------------------
const cyan    = '\x1b[36m'
const dim     = '\x1b[2m'
const reset   = '\x1b[0m'

const banner =
  '\n' +
  cyan +
  '   ██████╗ ███████╗██████╗ \n' +
  '  ██╔════╝ ██╔════╝██╔══██╗\n' +
  '  ██║  ███╗███████╗██║  ██║\n' +
  '  ██║   ██║╚════██║██║  ██║\n' +
  '  ╚██████╔╝███████║██████╔╝\n' +
  '   ╚═════╝ ╚══════╝╚═════╝ ' +
  reset + '\n' +
  '\n' +
  `  Get Shit Done ${dim}v${pkg.version}${reset}\n`

// ---------------------------------------------------------------------------
// Main — wrapped in async IIFE, with graceful fallback if clack fails
// ---------------------------------------------------------------------------
;(async () => {
  process.stderr.write(banner)

  let p, pc

=======

// ---------------------------------------------------------------------------
// Redirect stdout → stderr so npm always shows postinstall output.
// npm ≥7 suppresses stdout from lifecycle scripts by default; stderr is
// always forwarded. Clack writes to process.stdout, so we reroute it.
// ---------------------------------------------------------------------------
process.stdout.write = process.stderr.write.bind(process.stderr)

// ---------------------------------------------------------------------------
// Main — wrapped in async IIFE, with graceful fallback if clack fails
// ---------------------------------------------------------------------------
;(async () => {
  let p, pc

>>>>>>> gsd/M002/S01
  try {
    p = await import('@clack/prompts')
    pc = (await import('picocolors')).default
  } catch {
    // Clack or picocolors unavailable — fall back to minimal output
<<<<<<< HEAD
    process.stderr.write(`  Run gsd to get started.\n\n`)
    await run('npx patch-package')
    await run('npx playwright install chromium')
=======
    process.stderr.write(`\n  GSD v${pkg.version} installed.\n  Run gsd to get started.\n\n`)
    await run('npx patch-package')
    const args = os.platform() === 'linux' ? '--with-deps' : ''
    await run(`npx playwright install chromium ${args}`)
>>>>>>> gsd/M002/S01
    return
  }

  // --- Branded intro -------------------------------------------------------
<<<<<<< HEAD
  p.intro('Setup')
=======
  p.intro(pc.bgCyan(pc.black(' gsd ')) + '  ' + pc.dim(`v${pkg.version}`))
>>>>>>> gsd/M002/S01

  const results = []
  const s = p.spinner()

  // --- Step 1: Apply patches -----------------------------------------------
  s.start('Applying patches…')
  const patchResult = await run('npx patch-package')
  if (patchResult.ok) {
    s.stop('Patches applied')
    results.push({ label: 'Patches applied', ok: true })
  } else {
    s.stop(pc.yellow('Patches — skipped (non-fatal)'))
    results.push({
      label: 'Patches skipped — run ' + pc.cyan('npx patch-package') + ' manually',
      ok: false,
    })
  }

  // --- Step 2: Playwright browser ------------------------------------------
<<<<<<< HEAD
  // Avoid --with-deps: install scripts should not block on interactive sudo
  // prompts. If Linux libs are missing, suggest the explicit follow-up.
  s.start('Setting up browser tools…')
  const pwResult = await run('npx playwright install chromium')
=======
  s.start('Setting up browser tools…')
  const pwArgs = os.platform() === 'linux' ? ' --with-deps' : ''
  const pwResult = await run(`npx playwright install chromium${pwArgs}`)
>>>>>>> gsd/M002/S01
  if (pwResult.ok) {
    s.stop('Browser tools ready')
    results.push({ label: 'Browser tools ready', ok: true })
  } else {
<<<<<<< HEAD
    const output = `${pwResult.stdout ?? ''}${pwResult.stderr ?? ''}`
    if (os.platform() === 'linux' && output.includes('Host system is missing dependencies to run browsers.')) {
      s.stop(pc.yellow('Browser downloaded, missing Linux deps'))
      results.push({
        label: 'Run ' + pc.cyan('sudo npx playwright install-deps chromium') + ' to finish setup',
        ok: false,
      })
    } else {
      s.stop(pc.yellow('Browser tools — skipped (non-fatal)'))
      results.push({
        label: 'Browser tools unavailable — run ' + pc.cyan('npx playwright install chromium'),
        ok: false,
      })
    }
=======
    s.stop(pc.yellow('Browser tools — skipped (non-fatal)'))
    results.push({
      label: 'Browser tools unavailable — run ' + pc.cyan('npx playwright install chromium'),
      ok: false,
    })
>>>>>>> gsd/M002/S01
  }

  // --- Summary note --------------------------------------------------------
  const lines = results.map(
    (r) => (r.ok ? pc.green('✓') : pc.yellow('⚠')) + ' ' + r.label
  )
  lines.push('')
  lines.push('Run ' + pc.cyan('gsd') + ' to get started.')

  p.note(lines.join('\n'), 'Installed')

  // --- Outro ---------------------------------------------------------------
  p.outro(pc.green('Done!'))
})()
