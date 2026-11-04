<script setup>
import { nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import LinusMonitoring from '../components/LinusMonitoring.vue'
import LinusServerInformation from '../components/LinusServerInformation.vue'
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
const experimentMode = ref(null)
// Component-local state resets on each visit; no consent choice is persisted.
const consentAnswer = ref(null)
const height = ref(800)
let observer
let resizeRequest = 0
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

function scheduleResize() {
  // Defer height writes until after ResizeObserver finishes its layout delivery.
  cancelAnimationFrame(resizeRequest)
  resizeRequest = requestAnimationFrame(() => {
    resizeRequest = 0
    if (!disposed) resize()
  })
}

async function refresh() {
  if (
    experimentMode.value !== 'privacy' ||
    consentAnswer.value === null ||
    collecting.value ||
    disposed
  )
    return
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

function answerPrompt(answer) {
  if (consentAnswer.value !== null) return
  consentAnswer.value = answer
  void refresh()
}

function chooseExperiment(mode) {
  experimentMode.value = mode
  consentAnswer.value = null
  sections.value = []
}

async function prepareReport() {
  observer?.disconnect()
  target.value = frame.value.contentDocument.getElementById('report')
  await nextTick()
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(scheduleResize)
    observer.observe(frame.value.contentDocument.body)
  }
  resize()
}

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  cancelAnimationFrame(resizeRequest)
})
</script>

<template>
  <iframe
    ref="frame"
    title="Linus experimenting — plain HTML experiments"
    :srcdoc="plainDocument"
    width="100%"
    :height="height"
    @load="prepareReport"
  ></iframe>
  <Teleport v-if="target" :to="target">
    <section v-if="experimentMode === null" aria-labelledby="experiment-choice-title">
      <h1 id="experiment-choice-title">Linus experimenting</h1>
      <p>Choose an experiment.</p>
      <button type="button" @click="chooseExperiment('privacy')">Privacy</button>
      <button type="button" @click="chooseExperiment('monitoring')">Monitoring</button>
      <button type="button" @click="chooseExperiment('server')">Server information</button>
    </section>
    <template v-else>
      <button type="button" :disabled="collecting" @click="chooseExperiment(null)">
        Back to experiments
      </button>
      <LinusMonitoring v-if="experimentMode === 'monitoring'" />
      <LinusServerInformation v-else-if="experimentMode === 'server'" />
      <template v-else>
        <section v-if="consentAnswer === null" aria-labelledby="experiment-consent-question">
          <h1 id="experiment-consent-question">Do you consent to sharing your information</h1>
          <p>This demo displays information locally in your tab. Nothing is uploaded or shared.</p>
          <button type="button" @click="answerPrompt('yes')">Yes</button>
          <button type="button" @click="answerPrompt('no')">No</button>
        </section>
        <template v-else>
          <p v-if="consentAnswer === 'no'">lol, okay, anyways, here it is:</p>
          <h1>Linus experimenting</h1>
          <p>
            An open browser experiment. Anyone can visit without logging in. This report shows what
            built-in browser APIs expose to this page in your current session.
          </p>
          <p>
            Your report stays in this tab: it is not uploaded, saved, or shared with other visitors.
            JavaScript reads native browser APIs; HTML alone cannot read these values. This
            experiment makes no custom network requests and asks for no new permissions. The
            surrounding app can still make its normal requests, including its existing sign-in
            check.
          </p>
          <p>
            Values are browser reports, not verified facts. Versions, operating systems, HTTPS,
            permissions policies, extensions and privacy settings can change the results. Empty,
            false and zero values are shown explicitly. This is a snapshot; refresh after changing
            settings or window size.
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
            Documentation checked on 27 October 2026. These are expectations, not a browser
            detection algorithm. Every optional read below checks the actual API or handles its
            failure.
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
            <li>
              Your public or local IP address: this browser-only report makes no IP lookup. Choose
              Server information to see the address observed by this app's backend.
            </li>
            <li>
              Your precise location, camera image, microphone audio, clipboard contents or files:
              these APIs are not invoked, even if permission was previously granted.
            </li>
            <li>
              Your name, email, passwords, other tabs, full browsing history, other sites' cookies
              or HttpOnly cookies.
            </li>
            <li>
              A reliable installed-app, extension or font inventory, exact hardware identity or
              private-browsing status.
            </li>
            <li>
              Cookie and web-storage values: technically some same-origin values are accessible, but
              this report intentionally displays metadata only.
            </li>
          </ul>
          <h2>API documentation</h2>
          <ul>
            <li v-for="[label, url] in apiSources" :key="url">
              <a :href="url" target="_blank" rel="noreferrer noopener">{{ label }}</a>
            </li>
          </ul>
        </template>
      </template>
    </template>
  </Teleport>
</template>
