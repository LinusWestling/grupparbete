<script setup>
import { ref } from 'vue'
import { loadExample } from '../services/apiExample.js'

const exercises = ref([])
const loading = ref(false)
const errorMessage = ref('')
const loaded = ref(false)

// Button → service → API factory → backend route → controller → JSON → UI.
async function handleLoadExample() {
  loading.value = true
  errorMessage.value = ''
  loaded.value = false
  exercises.value = []

  try {
    exercises.value = await loadExample()
    loaded.value = true
  } catch (error) {
    errorMessage.value = `Det gick inte att hämta övningar: ${error.message}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="api-example step-card" aria-labelledby="api-example-title">
    <h2 id="api-example-title">Exempelövningar</h2>
    <p>Hämta två exempelövningar.</p>
    <button
      type="button"
      class="button button-accent"
      :disabled="loading"
      @click="handleLoadExample"
    >
      {{ loading ? 'Hämtar…' : 'Hämta exempelövningar' }}
    </button>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <div role="status" aria-live="polite">
      <p v-if="loading">Hämtar övningar…</p>
      <p v-else-if="loaded">Hämtade {{ exercises.length }} övningar.</p>
    </div>
    <ul v-if="loaded && exercises.length">
      <li v-for="exercise in exercises" :key="exercise.id">
        <strong>{{ exercise.name }}</strong> — {{ exercise.primaryMuscle }}
      </li>
    </ul>
  </section>
</template>
