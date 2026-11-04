<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '../services/api'
import { formatValue } from '../experiments/linusExperiment.js'

const report = ref(null)
const loading = ref(false)
const error = ref('')
const requestDurationMs = ref(null)
const samples = ref([])
let controller
let disposed = false

const averageMs = computed(() =>
  samples.value.length
    ? (samples.value.reduce((sum, value) => sum + value, 0) / samples.value.length).toFixed(2)
    : null,
)

const descriptions = {
  connection: 'Express-resolved client address, direct socket peer, protocols and proxy policy.',
  request: 'The request received by this backend. Query parameters are omitted.',
  headers:
    'Selected headers received by the backend. Values are client/proxy claims; null means absent.',
  server:
    'Facts reported by the Node process answering this request. Uptime is for that process, not the whole host.',
  timing:
    'Time spent building this report inside the handler, in milliseconds. Earlier middleware, JSON serialization and network time are excluded.',
}

async function refresh() {
  if (loading.value || disposed) return
  loading.value = true
  error.value = ''
  report.value = null
  requestDurationMs.value = null
  controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  const startedAt = performance.now()
  try {
    const result = await api.getServerInformation(controller.signal)
    if (!disposed) {
      const elapsed = performance.now() - startedAt
      report.value = result
      requestDurationMs.value = elapsed.toFixed(2)
      samples.value = [...samples.value, elapsed].slice(-5)
    }
  } catch (failure) {
    if (!disposed) {
      error.value = controller.signal.aborted ? 'The server request timed out.' : failure.message
    }
  } finally {
    clearTimeout(timeout)
    if (!disposed) loading.value = false
  }
}

onMounted(refresh)
onBeforeUnmount(() => {
  disposed = true
  controller?.abort()
})
</script>

<template>
  <section aria-labelledby="server-information-title">
    <h1 id="server-information-title">Server information</h1>
    <p>
      This makes one request to this app's backend when opened and one per Refresh. It returns
      information about your own request. No login or database migration is needed. This endpoint
      does not save these readings or add them to the monitoring log; hosting access logs are
      controlled separately by the hosting provider.
    </p>
    <button type="button" :disabled="loading" @click="refresh">Refresh server information</button>
    <p v-if="loading" role="status">Requesting server information…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <template v-if="report">
      <h2>Latency / request duration</h2>
      <dl>
        <dt>Latest end-to-end request (ms)</dt>
        <dd>
          <samp>{{ requestDurationMs }}</samp>
        </dd>
        <dt>Average of the last {{ samples.length }} successful requests in this view (ms)</dt>
        <dd>
          <samp>{{ averageMs }}</samp>
        </dd>
      </dl>
      <p>
        Measured in this browser from just before the API call until its response is read and
        parsed. This includes connection setup when needed, network travel, proxy/server work and
        browser scheduling. It is not ICMP ping or one-way latency. Server handler time is shown
        separately below; subtracting it would not isolate pure network time.
      </p>
      <section
        v-for="(values, category) in report"
        :key="category"
        :aria-labelledby="`server-${category}`"
      >
        <h2 :id="`server-${category}`">{{ category }}</h2>
        <p>{{ descriptions[category] }}</p>
        <dl>
          <template v-for="(value, name) in values" :key="name">
            <dt>
              <code>{{ name }}</code>
            </dt>
            <dd>
              <samp>{{ formatValue(value) }}</samp>
            </dd>
          </template>
        </dl>
      </section>
      <h2>How to interpret the readings</h2>
      <ul>
        <li>
          On localhost the IP is a loopback address. On a hosted app it can be a shared NAT, VPN or
          proxy exit address; it does not identify a person or give a precise physical location. The
          ::ffff: prefix represents an IPv4 address in IPv6 form.
        </li>
        <li>
          Express resolves the client IP using the app's current trust-proxy policy. The socket peer
          is the machine directly connected to Node and may be a reverse proxy. Forwarded headers
          can be forged unless the proxy configuration and deployment enforce the trust boundary.
        </li>
        <li>
          TLS and HTTP version describe the connection reaching Node. HTTPS may terminate at a
          proxy, so your browser can use HTTPS while Node sees HTTP and no TLS cipher. Protocols can
          also differ on either side of the proxy.
        </li>
        <li>
          Header availability differs between browsers. User-agent and Client Hint headers can be
          reduced or absent. Cookie values, authorization headers, environment variables, file
          paths, database settings and other visitors' information are not returned.
        </li>
      </ul>
    </template>
    <h2>Documentation</h2>
    <ul>
      <li>
        <a
          href="https://expressjs.com/en/guide/behind-proxies/"
          target="_blank"
          rel="noreferrer noopener"
          >Express IP addresses and trusted proxies</a
        >
      </li>
      <li>
        <a
          href="https://nodejs.org/api/net.html#socketremoteaddress"
          target="_blank"
          rel="noreferrer noopener"
          >Node socket information</a
        >
      </li>
      <li>
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Server-Timing"
          target="_blank"
          rel="noreferrer noopener"
          >Server-Timing response header</a
        >
      </li>
    </ul>
  </section>
</template>
