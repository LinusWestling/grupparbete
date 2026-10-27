<script setup>
import { nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import {
  apiSources,
  browserNotes,
  collectBrowserInformation,
} from '../experiments/linusExperiment.js'

const frame = ref(null)
const target = shallowRef(null)
const sections = ref([])
const collecting = ref(false)
const capturedAt = ref('')
const height = ref(800)
let observer
let disposed = false

// An empty same-origin document restores native HTML defaults without adding CSS
// or changing the rest of the app. No script, stylesheets or resources in srcdoc.
// Native HTML color attributes keep the otherwise transparent frame black/white.
// Browser information is read from the HOST window so iframe policy/size cannot
// accidentally masquerade as the visitor's top-level browser environment.
const plainDocument =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light"><title>Linus experimenting</title></head><body bgcolor="white" text="black" link="black" vlink="black" alink="black"><main id="report"></main></body></html>'

function resize() {
  const body = frame.value?.contentDocument?.body
  if (body) height.value = Math.ceil(body.getBoundingClientRect().height + 32)
}

async function refresh() {
  if (collecting.value || disposed) return
  collecting.value = true
  capturedAt.value = new Date().toISOString()
  try {
    await collectBrowserInformation(window, {
      onUpdate: (report) => {
        if (!disposed) sections.value = report
      },
    })
  } finally {
    if (!disposed) {
      collecting.value = false
      await nextTick()
      resize()
    }
  }
}

async function prepareReport() {
  observer?.disconnect()
  target.value = frame.value.contentDocument.getElementById('report')
  await nextTick()
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(resize)
    observer.observe(frame.value.contentDocument.body)
  }
  void refresh()
}

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
})
</script>

<template>
  <iframe
    ref="frame"
    title="Linus experimenting — plain HTML browser information"
    :srcdoc="plainDocument"
    width="100%"
    :height="height"
    @load="prepareReport"
  ></iframe>
  <Teleport v-if="target" :to="target">
    <h1>Linus experimenting</h1>
    <p>
      An open browser experiment. Anyone can visit without logging in. This report shows what
      built-in browser APIs expose to this page in your current session.
    </p>
    <p>
      Your report stays in this tab: it is not uploaded, saved, or shared with other visitors.
      JavaScript reads native browser APIs; HTML alone cannot read these values. This experiment
      makes no custom network requests and asks for no new permissions. The surrounding app can
      still make its normal requests, including its existing sign-in check.
    </p>
    <p>
      Values are browser reports, not verified facts. Versions, operating systems, HTTPS,
      permissions policies, extensions and privacy settings can change the results. Empty, false and
      zero values are shown explicitly. This is a snapshot; refresh after changing settings or
      window size.
    </p>
    <button type="button" :disabled="collecting" @click="refresh">
      Refresh browser information
    </button>
    <p role="status" aria-live="polite">
      {{ collecting ? 'Reading local browser APIs…' : 'Snapshot complete.' }}
      Captured at {{ capturedAt }}.
    </p>

    <h2>Browser differences</h2>
    <p>
      Documentation checked on 27 October 2026. These are expectations, not a browser detection
      algorithm. Every optional read below checks the actual API or handles its failure.
    </p>
    <dl>
      <template v-for="browser in browserNotes" :key="browser.browser">
        <dt>
          <strong>{{ browser.browser }}</strong>
        </dt>
        <dd>
          {{ browser.note }}
          <a :href="browser.url" target="_blank" rel="noreferrer noopener">Documentation</a>
        </dd>
      </template>
    </dl>

    <section
      v-for="section in sections"
      :key="section.id"
      :aria-labelledby="`experiment-${section.id}`"
    >
      <h2 :id="`experiment-${section.id}`">{{ section.id }}</h2>
      <p>{{ section.note }}</p>
      <dl>
        <template v-for="row in section.rows" :key="row.code">
          <dt>
            <code>{{ row.code }}</code>
          </dt>
          <dd>
            <strong>{{ row.status }}:</strong> <samp>{{ row.value }}</samp>
          </dd>
        </template>
      </dl>
    </section>

    <h2>What this experiment cannot tell you</h2>
    <ul>
      <li>Your public or local IP address: no external IP service or WebRTC discovery is used.</li>
      <li>
        Your precise location, camera image, microphone audio, clipboard contents or files: these
        APIs are not invoked, even if permission was previously granted.
      </li>
      <li>
        Your name, email, passwords, other tabs, full browsing history, other sites' cookies or
        HttpOnly cookies.
      </li>
      <li>
        A reliable installed-app, extension or font inventory, exact hardware identity or
        private-browsing status.
      </li>
      <li>
        Cookie and web-storage values: technically some same-origin values are accessible, but this
        report intentionally displays metadata only.
      </li>
    </ul>
    <h2>API documentation</h2>
    <ul>
      <li v-for="[label, url] in apiSources" :key="url">
        <a :href="url" target="_blank" rel="noreferrer noopener">{{ label }}</a>
      </li>
    </ul>
  </Teleport>
</template>
