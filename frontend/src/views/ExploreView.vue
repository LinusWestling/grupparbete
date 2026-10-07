<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const topics = ref([])
const loading = ref(true)
const error = ref(null)

// Quiz session state
const activeQuiz = ref(null)
const activeTopicName = ref('')
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const freeTextInput = ref('')
const quizResult = ref(null)
const submitting = ref(false)

onMounted(async () => {
  try {
    topics.value = await api.getTopics()
  } catch (err) {
    error.value = 'Failed to load topics from database backend.'
  } finally {
    loading.value = false
  }
})

async function startQuiz(topic) {
  try {
    loading.value = true
    error.value = null
    activeTopicName.value = topic ? topic.name : 'All Topics'
    activeQuiz.value = await api.getPracticeQuiz(topic ? topic.id : null)
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    freeTextInput.value = ''
    quizResult.value = null
  } catch (err) {
    error.value = 'Failed to generate quiz. Make sure backend is running.'
  } finally {
    loading.value = false
  }
}

async function startSpeedrun() {
  try {
    loading.value = true
    error.value = null
    activeTopicName.value = 'Speed Run Challenge'
    activeQuiz.value = await api.getSpeedrunQuiz()
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    freeTextInput.value = ''
    quizResult.value = null
  } catch (err) {
    error.value = 'Failed to start Speed Run.'
  } finally {
    loading.value = false
  }
}

function selectAnswer(questionId, answerVal) {
  selectedAnswers.value[questionId] = answerVal
}

function updateFreeText(questionId) {
  selectedAnswers.value[questionId] = freeTextInput.value
}

async function handleSubmitQuiz() {
  submitting.value = true
  try {
    const submissions = Object.entries(selectedAnswers.value).map(([qId, ans]) => ({
      question_id: Number(qId),
      answer: ans
    }))
    quizResult.value = await api.submitQuiz(submissions)
  } catch (err) {
    error.value = 'Failed to submit quiz results.'
  } finally {
    submitting.value = false
  }
}

function exitQuiz() {
  activeQuiz.value = null
  quizResult.value = null
}
</script>

<template>
  <div class="explore-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">EXPLORE SKILLS & KNOWLEDGE</p>
        <h1>Quiz & Knowledge Center</h1>
        <p class="heading-description">
          Select a topic to test your knowledge or try a Speed Run across all domains.
        </p>
      </div>
      <button @click="startSpeedrun" class="button button-accent">⚡ Start Speed Run</button>
    </div>

    <div v-if="error" class="error-banner">
      ⚠️ {{ error }}
    </div>

    <!-- Active Quiz Playing View -->
    <div v-if="activeQuiz && !quizResult" class="quiz-container">
      <div class="quiz-header">
        <span class="badge">{{ activeTopicName }}</span>
        <span>Question {{ currentQuestionIndex + 1 }} of {{ activeQuiz.length }}</span>
        <button @click="exitQuiz" class="button-text">✕ Exit Quiz</button>
      </div>

      <div v-if="activeQuiz[currentQuestionIndex]" class="question-card">
        <p class="meta">
          Type: {{ activeQuiz[currentQuestionIndex].question_type }} | 
          Difficulty: Level {{ activeQuiz[currentQuestionIndex].difficulty_level }}
        </p>
        <h2>{{ activeQuiz[currentQuestionIndex].question_text }}</h2>

        <!-- Answer Rendering by Type -->
        <!-- 1. Multiple Choice & Yes/No -->
        <div v-if="activeQuiz[currentQuestionIndex].question_type !== 'free_text'" class="options-grid">
          <button
            v-for="ans in activeQuiz[currentQuestionIndex].answers"
            :key="ans.id"
            :class="['option-button', { 'selected': selectedAnswers[activeQuiz[currentQuestionIndex].id] === ans.id }]"
            @click="selectAnswer(activeQuiz[currentQuestionIndex].id, ans.id)"
          >
            {{ ans.answer_text }}
          </button>
        </div>

        <!-- 2. Free Text Open Answer Input -->
        <div v-else class="free-text-box">
          <input
            type="text"
            v-model="freeTextInput"
            @input="updateFreeText(activeQuiz[currentQuestionIndex].id)"
            placeholder="Type your answer here..."
            class="text-input"
          />
        </div>

        <!-- Sources / Citations -->
        <div v-if="activeQuiz[currentQuestionIndex].sources.length > 0" class="source-box">
          <span class="source-label">📖 Reference Source:</span>
          <a
            v-for="src in activeQuiz[currentQuestionIndex].sources"
            :key="src.id"
            :href="src.url"
            target="_blank"
            rel="noopener"
          >
            {{ src.source_text }} ↗
          </a>
        </div>
      </div>

      <div class="quiz-nav">
        <button
          :disabled="currentQuestionIndex === 0"
          @click="currentQuestionIndex--"
          class="button button-outline"
        >
          ← Previous
        </button>

        <button
          v-if="currentQuestionIndex < activeQuiz.length - 1"
          @click="currentQuestionIndex++"
          class="button button-accent"
        >
          Next →
        </button>

        <button
          v-else
          @click="handleSubmitQuiz"
          :disabled="submitting"
          class="button button-accent"
        >
          {{ submitting ? 'Grading...' : 'Submit Quiz 🚀' }}
        </button>
      </div>
    </div>

    <!-- Quiz Results View -->
    <div v-else-if="quizResult" class="results-card">
      <h2>🎉 Quiz Complete!</h2>
      <div class="score-summary">
        <div class="stat">
          <span class="stat-value">{{ quizResult.correct_count }} / {{ quizResult.total_questions }}</span>
          <span class="stat-label">Correct Answers</span>
        </div>
        <div class="stat">
          <span class="stat-value">+{{ quizResult.xp_earned }} XP</span>
          <span class="stat-label">XP Earned</span>
        </div>
      </div>

      <div class="results-list">
        <h3>Answer Breakdown:</h3>
        <div
          v-for="(res, idx) in quizResult.results"
          :key="idx"
          :class="['result-item', res.is_correct ? 'correct' : 'incorrect']"
        >
          <span class="status-icon">{{ res.is_correct ? '✅' : '❌' }}</span>
          <div>
            <p><strong>Correct Answer:</strong> {{ res.correct_answer_text }}</p>
            <p v-if="res.explanation" class="text-muted">Source: {{ res.explanation }}</p>
          </div>
        </div>
      </div>

      <button @click="exitQuiz" class="button button-accent">Back to Topics</button>
    </div>

    <!-- Topics Grid View -->
    <div v-else>
      <div v-if="loading" class="loading-state">Loading topics from database...</div>

      <div v-else class="topics-grid">
        <article v-for="topic in topics" :key="topic.id" class="topic-card">
          <div class="topic-header">
            <h3>{{ topic.name }}</h3>
            <span class="chip">{{ topic.question_count }} Questions</span>
          </div>
          <p>{{ topic.description || 'Explore and master key concepts in ' + topic.name }}</p>
          <button @click="startQuiz(topic)" class="button button-outline">
            Start {{ topic.name }} Quiz ↗
          </button>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-page { display: flex; flex-direction: column; gap: 1.5rem; }
.error-banner { background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; font-weight: 500; }
.topics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.topic-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; }
.topic-header { display: flex; justify-content: space-between; align-items: center; }
.chip { background: #f3f4f6; color: #374151; font-size: 0.85rem; padding: 0.25rem 0.6rem; border-radius: 999px; font-weight: 500; }
.quiz-container { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.quiz-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 1rem; }
.question-card h2 { margin: 0.5rem 0 1.5rem 0; font-size: 1.35rem; }
.options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.option-button { padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; background: #fff; text-align: left; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
.option-button:hover { border-color: #3b82f6; background: #eff6ff; }
.option-button.selected { border-color: #2563eb; background: #dbeafe; font-weight: 600; }
.free-text-box { margin: 1rem 0; }
.text-input { width: 100%; padding: 1rem; font-size: 1.1rem; border: 2px solid #3b82f6; border-radius: 8px; }
.quiz-nav { display: flex; justify-content: space-between; border-top: 1px solid #f3f4f6; padding-top: 1rem; }
.source-box { margin-top: 1.5rem; font-size: 0.9rem; background: #f9fafb; padding: 0.75rem; border-radius: 6px; }
.results-card { background: #fff; padding: 2rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center; }
.score-summary { display: flex; justify-content: center; gap: 3rem; margin: 1.5rem 0; }
.stat-value { font-size: 2rem; font-weight: bold; color: #2563eb; display: block; }
.result-item { display: flex; gap: 1rem; text-align: left; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; }
.result-item.correct { background: #f0fdf4; border: 1px solid #bbf7d0; }
.result-item.incorrect { background: #fef2f2; border: 1px solid #fecaca; }
</style>
