const express = require('express')
const { isIP } = require('node:net')
const { performance } = require('node:perf_hooks')
const router = express.Router()

// Public, per-request diagnostics. No database writes, monitoring events or lookups.
router.get('/api/experiments/server-information', (req, res) => {
  const startedAt = performance.now()
  const socket = req.socket
  const trustProxy = req.app.get('trust proxy')
  const cipher = socket.encrypted ? socket.getCipher() : null

  const data = {
    connection: {
      // Express applies the app's existing trust-proxy policy. Never take the
      // first X-Forwarded-For value ourselves: it can be supplied by the client.
      clientIpResolvedByExpress: req.ip,
      clientIpVersion: isIP(req.ip),
      forwardedIpsUsedByExpress: req.ips,
      socketPeerIp: socket.remoteAddress ?? null,
      socketPeerPort: socket.remotePort ?? null,
      socketPeerFamily: socket.remoteFamily ?? null,
      trustProxyPolicy:
        typeof trustProxy === 'boolean' || typeof trustProxy === 'number'
          ? trustProxy
          : 'Custom proxy policy configured',
      protocolResolvedByExpress: req.protocol,
      secureResolvedByExpress: req.secure,
      httpVersionReceivedByNode: req.httpVersion,
      socketUsesTls: Boolean(socket.encrypted),
      socketTlsProtocol: socket.encrypted ? socket.getProtocol() : null,
      socketTlsCipher: cipher?.standardName ?? cipher?.name ?? null,
      socketAlpnProtocol: socket.alpnProtocol || null,
    },
    request: {
      method: req.method,
      path: req.path,
      hostHeader: req.get('host') ?? null,
    },
    // An allowlist prevents accidental disclosure of session cookies, authorization
    // tokens, full referrers, custom secret headers or URL query parameters.
    headers: Object.fromEntries(
      [
        'user-agent',
        'accept',
        'accept-language',
        'accept-encoding',
        'origin',
        'dnt',
        'sec-gpc',
        'sec-ch-ua',
        'sec-ch-ua-mobile',
        'sec-ch-ua-platform',
        'sec-fetch-site',
        'sec-fetch-mode',
        'sec-fetch-dest',
        'x-forwarded-for',
        'x-forwarded-proto',
        'via',
      ].map((name) => [name, req.get(name) ?? null]),
    ),
    server: {
      observedAtUtc: new Date().toISOString(),
      runtime: process.release.name,
      runtimeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      processUptimeSeconds: Math.floor(process.uptime()),
    },
  }

  // This is only this handler's work: no prior middleware, serialization, network,
  // reverse-proxy queueing or browser work. It is not a network latency estimate.
  data.timing = { handlerDurationMs: Number((performance.now() - startedAt).toFixed(3)) }
  res.set({
    'Cache-Control': 'no-store',
    'Server-Timing': `handler;dur=${data.timing.handlerDurationMs}`,
  })
  res.json({ status: 'success', data })
})

module.exports = router
