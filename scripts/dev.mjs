import { spawn } from 'node:child_process'
import net from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const isWindows = process.platform === 'win32'
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const services = [
  {
    name: 'backend',
    port: 4000,
    cwd: resolve(projectRoot, '..', 'backend'),
    args: ['--watch', 'src/server.js'],
  },
  {
    name: 'frontend',
    port: 5173,
    cwd: projectRoot,
    args: [
      resolve(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
      '--host',
      '127.0.0.1',
      '--strictPort',
    ],
  },
]

function isPortAvailableOnHost(port, host) {
  return new Promise((resolvePort, reject) => {
    const probe = net.createServer()

    probe.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolvePort(false)
        return
      }
      reject(error)
    })

    probe.listen(host ? { host, port } : { port }, () => {
      probe.close((error) => {
        if (error) reject(error)
        else resolvePort(true)
      })
    })
  })
}

async function isPortAvailable(port) {
  const availability = await Promise.all([
    isPortAvailableOnHost(port),
    isPortAvailableOnHost(port, '127.0.0.1'),
  ])
  return availability.every(Boolean)
}

async function ensurePortsAreAvailable() {
  const unavailable = []

  for (const service of services) {
    if (!await isPortAvailable(service.port)) unavailable.push(service)
  }

  if (unavailable.length) {
    const ports = unavailable.map(({ port }) => port).join(', ')
    throw new Error(
      `Port(s) ${ports} already in use. A BLY dev session may already be running. ` +
      'Reuse it, or stop the original npm run dev process with Ctrl+C before starting another one.',
    )
  }
}

function startService(service) {
  return spawn(process.execPath, service.args, {
    cwd: service.cwd,
    stdio: 'inherit',
    windowsHide: true,
  })
}

function stopProcessTree(child) {
  if (!child?.pid) return Promise.resolve()

  if (!isWindows) {
    child.kill('SIGTERM')
    return Promise.resolve()
  }

  return new Promise((resolveStop) => {
    const taskkill = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    })
    taskkill.once('close', resolveStop)
    taskkill.once('error', resolveStop)
  })
}

try {
  await ensurePortsAreAvailable()
} catch (error) {
  console.error(`[dev] ${error.message}`)
  process.exit(1)
}

const children = services.map((service) => ({
  service,
  child: startService(service),
}))

let shuttingDown = false

async function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true
  await Promise.all(children.map(({ child }) => stopProcessTree(child)))
  process.exit(exitCode)
}

for (const { service, child } of children) {
  child.once('error', (error) => {
    console.error(`[${service.name}] failed to start: ${error.message}`)
    void shutdown(1)
  })

  child.once('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`[${service.name}] stopped unexpectedly (${signal || `exit code ${code ?? 1}`}).`)
    void shutdown(code || 1)
  })
}

process.once('SIGINT', () => void shutdown(0))
process.once('SIGTERM', () => void shutdown(0))
