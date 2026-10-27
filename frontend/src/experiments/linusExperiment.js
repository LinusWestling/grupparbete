// All reads are local browser APIs. No fetch, XHR, beacons, permission requests,
// storage writes, device activation, STUN/WebRTC probes, or fingerprint hashes.
// Feature detection controls every optional read; browser names never gate APIs.
export const browserNotes = [
  {
    browser: 'Chrome (desktop / Android)',
    note: 'Chromium may expose userAgentData, approximate deviceMemory, connection estimates and battery data. Secure context and policy checks still apply. The legacy user agent is reduced; high-entropy hints may be withheld.',
    url: 'https://developer.chrome.com/docs/privacy-security/user-agent-client-hints',
  },
  {
    browser: 'Microsoft Edge',
    note: 'Shares Chromium APIs. Client Hint brands can identify Edge; legacy Windows user agents do not distinguish Windows 10 from 11. Use the reported platformVersion hint, when exposed, rather than assuming the OS from the legacy string.',
    url: 'https://learn.microsoft.com/en-us/microsoft-edge/web-platform/user-agent-guidance',
  },
  {
    browser: 'Firefox (desktop / Android)',
    note: 'Do not assume Chromium-only APIs exist. Fingerprinting protections can reduce or alter screen, CPU, timezone and graphics information. Privacy mode and settings affect the values returned; this page does not try to detect private browsing.',
    url: 'https://blog.mozilla.org/en/firefox/fingerprinting-protections/',
  },
  {
    browser: 'Safari (macOS / iOS / iPadOS)',
    note: 'WebKit documents restrictions on hardware, fonts and media-device exposure, and does not implement several Chromium APIs including Device Memory, Network Information and Battery Status. Missing values are expected.',
    url: 'https://webkit.org/tracking-prevention/',
  },
  {
    browser: 'Brave',
    note: 'Chromium API availability does not imply raw hardware values. Shields can block or randomize identifying values (farbling). Results can vary between sites and sessions. A Chrome-like user agent does not prove the browser is Chrome.',
    url: 'https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/',
  },
  {
    browser: 'Opera',
    note: 'Desktop and Android versions share Chromium foundations, but API subsets still depend on OS, version and settings. The legacy user agent can include OPR alongside Chrome and Safari tokens; those tokens do not mean three browsers are running.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent',
  },
  {
    browser: 'Samsung Internet',
    note: 'Samsung documents reduced Android user agents from version 24: Android 10 and model K can be placeholders rather than the actual OS and phone. SamsungBrowser identifies the brand; desktop mode also changes reported identity.',
    url: 'https://developer.samsung.com/browser/user-agent-string-format.html',
  },
  {
    browser: 'Vivaldi',
    note: 'The Vivaldi brand is normally hidden except on selected partner sites. Brand masking can report Chrome, Edge or a custom brand. iOS uses WebKit and has different API availability. Feature checks are more reliable than brand detection.',
    url: 'https://help.vivaldi.com/developers/web/vivaldi-user-agent-and-client-hints-user-agent/',
  },
]

export const apiNotes = {
  identity:
    'User agents and brands are claims, not verified identities. Hints can be reduced or spoofed.',
  hardware:
    'CPU means exposed logical concurrency, not a CPU model. Memory is approximate, rounded and clamped; privacy settings may alter both.',
  screen:
    'CSS pixels, zoom and privacy settings affect these values. Available screen space does not reveal other windows.',
  locale:
    'Language and timezone are browser configuration, not proof of nationality or physical location.',
  preferences:
    'A false media-query match can mean either no match or an unsupported feature. No preferences are changed.',
  network:
    'onLine is only a connectivity hint. Connection values are browser estimates, not a speed test. No IP lookup or network probe is performed.',
  page: 'These readings describe the host application document, not the unstyled report iframe. Referrer policy may omit or shorten the referrer.',
  storage:
    'Only this origin is accessible. Counts and quota estimates are metadata; cookie and storage values are deliberately not displayed. HttpOnly cookies are inaccessible. No storage is written.',
  performance:
    'Only existing performance entries are read. Timings may be rounded, zeroed or restricted; no benchmark or resource load is started.',
  graphics:
    'A temporary offscreen WebGL context reports capabilities without drawing or reading pixels. Renderer details may be masked or blocked, especially by Firefox privacy settings and Brave Shields.',
  media:
    'Format support does not guarantee smooth playback. Device enumeration never starts a camera or microphone; labels and IDs may be empty unless permission was already granted.',
  permissions:
    'query() reads state without prompting. Supported permission names differ by browser; TypeError can mean an unknown descriptor. “prompt” is a state, not a prompt shown by this page.',
  capabilities:
    'API presence only: availability does not imply permission, actual hardware, or successful access. Permission-gated APIs are not invoked.',
}

export const apiSources = [
  ['Opera Chromium foundation', 'https://help.opera.com/en/extensions/'],
  [
    'Why feature detection matters',
    'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent',
  ],
  ['Navigator and hardware', 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator'],
  ['Device memory', 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory'],
  [
    'Client Hints and policy restrictions',
    'https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API',
  ],
  [
    'Network information',
    'https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API',
  ],
  ['Battery status', 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery'],
  ['Storage estimates', 'https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate'],
  [
    'WebGL renderer information',
    'https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info',
  ],
  [
    'Media device enumeration',
    'https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices',
  ],
  ['Permission queries', 'https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query'],
]

export function formatValue(value) {
  if (value === undefined) return 'Not exposed'
  if (value === null) return 'null'
  if (value === '') return '(empty string)'
  // Preserve Infinity (e.g. battery charging time), false and zero.
  if (typeof value !== 'object') return String(value)
  return JSON.stringify(value, (_, item) =>
    typeof item === 'number' && !Number.isFinite(item) ? String(item) : item,
  )
}

export async function collectBrowserInformation(
  win,
  { timeoutMs = 3000, onUpdate = () => {} } = {},
) {
  const nav = win.navigator
  const doc = win.document
  const sections = Object.entries(apiNotes).map(([id, note]) => ({ id, note, rows: [] }))
  const jobs = []
  const publish = () =>
    onUpdate(sections.map((s) => ({ ...s, rows: s.rows.map((r) => ({ ...r })) })))
  const fail = (row, error) => {
    row.status = error?.name === 'TimeoutError' ? 'Timed out' : 'Unavailable / blocked / failed'
    row.value = `${error?.name || 'Error'}: ${error?.message || String(error)}`
  }
  function read(section, code, getter, async = false) {
    const row = { code, status: 'Pending', value: '' }
    sections.find((s) => s.id === section).rows.push(row)
    const finish = (value) => {
      row.value = formatValue(value)
      row.status = value === undefined ? 'Not exposed / unsupported' : 'Reported'
    }
    if (!async) {
      try {
        finish(getter())
      } catch (error) {
        fail(row, error)
      }
      return
    }
    // A hung API must not hold the whole report open. Late results are ignored.
    jobs.push(
      (async () => {
        let timer
        try {
          finish(
            await Promise.race([
              Promise.resolve().then(getter),
              new Promise((_, reject) => {
                timer = setTimeout(
                  () => reject(new DOMException('Local API did not settle', 'TimeoutError')),
                  timeoutMs,
                )
              }),
            ]),
          )
        } catch (error) {
          fail(row, error)
        } finally {
          clearTimeout(timer)
          publish()
        }
      })(),
    )
  }
  function properties(section, prefix, object, names) {
    for (const name of names) read(section, `${prefix}.${name}`, () => object()?.[name])
  }

  properties('identity', 'navigator', () => nav, [
    'userAgent',
    'appVersion',
    'appName',
    'appCodeName',
    'vendor',
    'vendorSub',
    'product',
    'productSub',
    'platform',
    'webdriver',
    'pdfViewerEnabled',
    'cookieEnabled',
    'doNotTrack',
    'globalPrivacyControl',
  ])
  properties('identity', 'navigator.userAgentData', () => nav.userAgentData, [
    'brands',
    'mobile',
    'platform',
  ])
  // Chrome / Edge / some Chromium derivatives expose this; Firefox / Safari may not.
  // This is a local native API call, not an HTTP Client Hints request.
  read(
    'identity',
    'navigator.userAgentData.getHighEntropyValues([...])',
    () =>
      nav.userAgentData?.getHighEntropyValues?.([
        'architecture',
        'bitness',
        'model',
        'platformVersion',
        'fullVersionList',
        'wow64',
        'formFactors',
      ]),
    true,
  )

  properties('hardware', 'navigator', () => nav, [
    'hardwareConcurrency',
    'deviceMemory',
    'maxTouchPoints',
  ])
  read(
    'hardware',
    'navigator.getBattery()',
    async () => {
      if (!nav.getBattery) return undefined
      const battery = await nav.getBattery()
      return Object.fromEntries(
        ['charging', 'level', 'chargingTime', 'dischargingTime'].map((key) => [key, battery[key]]),
      )
    },
    true,
  )
  properties('screen', 'screen', () => win.screen, [
    'width',
    'height',
    'availWidth',
    'availHeight',
    'availLeft',
    'availTop',
    'colorDepth',
    'pixelDepth',
    'isExtended',
  ])
  properties('screen', 'screen.orientation', () => win.screen?.orientation, ['type', 'angle'])
  properties('screen', 'window', () => win, [
    'innerWidth',
    'innerHeight',
    'outerWidth',
    'outerHeight',
    'devicePixelRatio',
    'screenX',
    'screenY',
  ])
  properties('screen', 'window.visualViewport', () => win.visualViewport, [
    'width',
    'height',
    'scale',
    'offsetLeft',
    'offsetTop',
    'pageLeft',
    'pageTop',
  ])

  properties('locale', 'navigator', () => nav, ['language', 'languages'])
  read('locale', 'Intl.DateTimeFormat().resolvedOptions()', () =>
    new win.Intl.DateTimeFormat().resolvedOptions(),
  )
  read('locale', 'Intl.NumberFormat().resolvedOptions()', () =>
    new win.Intl.NumberFormat().resolvedOptions(),
  )
  read('locale', 'new Date().getTimezoneOffset()', () => new win.Date().getTimezoneOffset())
  read('locale', 'new Date().toString()', () => new win.Date().toString())
  for (const query of [
    '(prefers-color-scheme: dark)',
    '(prefers-color-scheme: light)',
    '(prefers-reduced-motion: reduce)',
    '(prefers-reduced-transparency: reduce)',
    '(prefers-contrast: more)',
    '(prefers-contrast: less)',
    '(forced-colors: active)',
    '(inverted-colors: inverted)',
    '(hover: hover)',
    '(any-hover: hover)',
    '(pointer: fine)',
    '(pointer: coarse)',
    '(pointer: none)',
    '(any-pointer: fine)',
    '(any-pointer: coarse)',
    '(display-mode: standalone)',
    '(display-mode: browser)',
    '(dynamic-range: high)',
    '(color-gamut: p3)',
    '(color-gamut: rec2020)',
  ])
    read('preferences', `matchMedia('${query}').matches`, () => win.matchMedia?.(query).matches)

  properties('network', 'navigator', () => nav, ['onLine'])
  properties(
    'network',
    'navigator.connection',
    () => nav.connection ?? nav.mozConnection ?? nav.webkitConnection,
    ['effectiveType', 'type', 'downlink', 'downlinkMax', 'rtt', 'saveData'],
  )
  properties('page', 'window', () => win, ['isSecureContext', 'crossOriginIsolated', 'origin'])
  properties('page', 'document', () => doc, [
    'referrer',
    'visibilityState',
    'compatMode',
    'characterSet',
    'contentType',
    'lastModified',
    'wasDiscarded',
    'prerendering',
  ])
  read(
    'page',
    'location.origin + location.pathname (query / hash omitted)',
    () => `${win.location.origin}${win.location.pathname}`,
  )
  read('page', 'history.length (count only, not history URLs)', () => win.history.length)
  read('page', 'window.top === window', () => win.top === win)
  read('page', 'document.hasFocus()', () => doc.hasFocus())
  read('storage', 'document.cookie (visible cookie count only)', () =>
    doc.cookie ? doc.cookie.split(';').length : 0,
  )
  for (const name of ['localStorage', 'sessionStorage'])
    read('storage', `${name}.length`, () => win[name]?.length)
  read('storage', 'navigator.storage.estimate()', () => nav.storage?.estimate?.(), true)
  read('storage', 'navigator.storage.persisted()', () => nav.storage?.persisted?.(), true)

  properties('performance', 'performance', () => win.performance, ['timeOrigin'])
  read('performance', 'performance.now()', () => win.performance?.now())
  read('performance', 'performance.getEntriesByType("navigation") (timings only)', () => {
    const entry = win.performance?.getEntriesByType('navigation')[0]
    if (!entry) return undefined
    return Object.fromEntries(
      [
        'type',
        'redirectCount',
        'duration',
        'domainLookupStart',
        'domainLookupEnd',
        'connectStart',
        'connectEnd',
        'secureConnectionStart',
        'requestStart',
        'responseStart',
        'responseEnd',
        'domInteractive',
        'domContentLoadedEventEnd',
        'loadEventEnd',
        'transferSize',
        'encodedBodySize',
        'decodedBodySize',
        'nextHopProtocol',
      ].map((key) => [key, entry[key]]),
    )
  })
  read(
    'performance',
    'performance.getEntriesByType("resource").length',
    () => win.performance?.getEntriesByType('resource').length,
  )
  // Nonstandard, Chromium-specific. Not a measurement of total system RAM.
  properties('performance', 'performance.memory', () => win.performance?.memory, [
    'jsHeapSizeLimit',
    'totalJSHeapSize',
    'usedJSHeapSize',
  ])

  read('graphics', 'canvas.getContext("webgl"): parameters and extensions', () => {
    const canvas = doc.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) return undefined
    try {
      const debug = gl.getExtension('WEBGL_debug_renderer_info')
      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),
        unmaskedVendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : 'Not exposed',
        unmaskedRenderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'Not exposed',
        extensions: gl.getSupportedExtensions(),
      }
    } finally {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  })
  for (const [tag, formats] of [
    [
      'video',
      [
        'video/mp4; codecs="avc1.42E01E"',
        'video/webm; codecs="vp9"',
        'video/mp4; codecs="av01.0.05M.08"',
        'application/vnd.apple.mpegurl',
      ],
    ],
    [
      'audio',
      ['audio/mpeg', 'audio/ogg; codecs="opus"', 'audio/mp4; codecs="mp4a.40.2"', 'audio/wav'],
    ],
  ]) {
    for (const format of formats)
      read('media', `${tag}.canPlayType('${format}')`, () =>
        doc.createElement(tag).canPlayType(format),
      )
  }
  read('media', 'navigator.mediaDevices.getSupportedConstraints()', () =>
    nav.mediaDevices?.getSupportedConstraints?.(),
  )
  read(
    'media',
    'navigator.mediaDevices.enumerateDevices()',
    async () => {
      if (!nav.mediaDevices?.enumerateDevices) return undefined
      if (doc.visibilityState !== 'visible')
        throw new Error('Document must be visible; refresh the report when visible')
      return (await nav.mediaDevices.enumerateDevices()).map((device) => ({
        kind: device.kind,
        label: device.label,
        deviceId: device.deviceId,
        groupId: device.groupId,
      }))
    },
    true,
  )

  // Never call requestPermission(), getCurrentPosition(), getUserMedia(), readText(),
  // requestDevice() or requestAdapter(). Even already-granted capabilities stay unused.
  for (const name of [
    'geolocation',
    'notifications',
    'camera',
    'microphone',
    'clipboard-read',
    'clipboard-write',
    'persistent-storage',
    'midi',
    'accelerometer',
    'gyroscope',
    'magnetometer',
    'display-capture',
    'local-fonts',
    'window-management',
  ]) {
    read(
      'permissions',
      `navigator.permissions.query({ name: '${name}' })`,
      async () => {
        if (!nav.permissions?.query) return undefined
        return (await nav.permissions.query({ name })).state
      },
      true,
    )
  }
  const capabilities = {
    'navigator.geolocation': () => 'geolocation' in nav,
    'navigator.mediaDevices': () => 'mediaDevices' in nav,
    'navigator.clipboard': () => 'clipboard' in nav,
    'navigator.bluetooth': () => 'bluetooth' in nav,
    'navigator.usb': () => 'usb' in nav,
    'navigator.hid': () => 'hid' in nav,
    'navigator.serial': () => 'serial' in nav,
    'navigator.gpu': () => 'gpu' in nav,
    'navigator.serviceWorker': () => 'serviceWorker' in nav,
    'navigator.credentials': () => 'credentials' in nav,
    'window.RTCPeerConnection': () => 'RTCPeerConnection' in win,
    'window.WebSocket': () => 'WebSocket' in win,
    'window.WebTransport': () => 'WebTransport' in win,
    'window.SharedArrayBuffer': () => 'SharedArrayBuffer' in win,
    'window.AudioContext': () => 'AudioContext' in win || 'webkitAudioContext' in win,
    'window.Notification': () => 'Notification' in win,
    'window.PaymentRequest': () => 'PaymentRequest' in win,
    'window.showOpenFilePicker': () => 'showOpenFilePicker' in win,
    'window.queryLocalFonts': () => 'queryLocalFonts' in win,
    'window.indexedDB': () => 'indexedDB' in win,
    'window.caches': () => 'caches' in win,
    'window.Worker': () => 'Worker' in win,
    'window.WebAssembly': () => 'WebAssembly' in win,
  }
  for (const [code, getter] of Object.entries(capabilities))
    read('capabilities', `${code} (presence only)`, getter)
  publish()
  await Promise.all(jobs)
  return sections
}
