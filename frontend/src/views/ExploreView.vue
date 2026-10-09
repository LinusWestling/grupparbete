<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'

const route = useRoute()

const topics = ref([])
const loading = ref(true)
const error = ref(null)

// Difficulty selection (1-5)
const selectedDifficulty = ref(1)

// Active quiz session state
const activeQuizSession = ref(null)
const activeTopicName = ref('')
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const quizResult = ref(null)
const submitting = ref(false)
const saving = ref(false)
const saveMessage = ref('')
const unfinishedQuizzes = ref([])
const loggedIn = ref(false)

onMounted(async () => {
  try {
    topics.value = await api.getTopics()
    try {
      await api.getMe()
      loggedIn.value = true
    } catch {
      loggedIn.value = false
    }
    if (loggedIn.value) {
      try {
        unfinishedQuizzes.value = await api.getUnfinishedQuizzes()
      } catch (err) {
        console.error('Failed to load unfinished quizzes:', err)
      }
    }

    // Handle retake quiz auto-start from route query params
    if (route.query.topicId && route.query.difficulty) {
      const diffNum = Number(route.query.difficulty)
      if (diffNum >= 1 && diffNum <= 5) selectedDifficulty.value = diffNum
      const targetTopic = topics.value.find((t) => t.id === Number(route.query.topicId))
      if (targetTopic && route.query.autoStart === 'true' && loggedIn.value) {
        await startQuizSession(targetTopic)
      }
    }
  } catch (err) {
    console.error('Failed to load topics:', err)
    error.value = 'Failed to load topics from database backend: ' + err.message
  } finally {
    loading.value = false
  }
})

async function startQuizSession(topic) {
  try {
    loading.value = true
    error.value = null
    activeTopicName.value = topic.name
    activeQuizSession.value = await api.startQuiz(topic.id, selectedDifficulty.value, 10)
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    quizResult.value = null
    saveMessage.value = ''
  } catch (err) {
    error.value = 'Failed to generate quiz: ' + err.message
  } finally {
    loading.value = false
  }
}

async function selectAnswer(questionId, answerVal) {
  selectedAnswers.value[questionId] = answerVal
  await saveCurrentQuestion()
}

async function saveCurrentQuestion(isSkipped = false) {
  const question = activeQuizSession.value?.questions[currentQuestionIndex.value]
  if (!question || saving.value) return false
  saving.value = true
  saveMessage.value = 'Saving…'
  error.value = null
  try {
    const progress = await api.saveQuestionProgress(activeQuizSession.value.quiz_id, question.id, {
      answer: selectedAnswers.value[question.id],
      isSkipped,
    })
    Object.assign(question, progress)
    if (isSkipped) delete selectedAnswers.value[question.id]
    saveMessage.value = 'Saved to your account'
    return true
  } catch (err) {
    saveMessage.value = 'Not saved — retry before leaving'
    error.value = err.message
    return false
  } finally {
    saving.value = false
  }
}

async function navigateQuestion(direction, skip = false) {
  const question = activeQuizSession.value.questions[currentQuestionIndex.value]
  const hasAnswer =
    selectedAnswers.value[question.id] !== undefined && selectedAnswers.value[question.id] !== ''

  // Stoppa NEXT om ingen svar har valats.
  if (direction > 0 && !skip && !hasAnswer) {
    error.value = 'Välj ett svar eller hoppa över frågan'
    return
  }
  if ((hasAnswer || skip) && !(await saveCurrentQuestion(skip))) return

  error.value = null

  currentQuestionIndex.value = Math.max(
    0,
    Math.min(activeQuizSession.value.questions.length - 1, currentQuestionIndex.value + direction),
  )
  saveMessage.value = ''
}

async function resumeQuiz(quizId) {
  loading.value = true
  error.value = null
  try {
    const quiz = await api.getQuizDetails(quizId)
    if (quiz.status !== 'in_progress') throw new Error('This quiz is already completed')
    activeQuizSession.value = quiz
    activeQuizSession.value.quiz_id = quiz.id
    activeTopicName.value = quiz.topic_name
    selectedAnswers.value = {}
    for (const question of quiz.questions) {
      if (question.is_answered)
        selectedAnswers.value[question.id] = question.free_text_answer ?? question.chosen_answer_id
    }
    const firstUnanswered = quiz.questions.findIndex((question) => !question.is_answered)
    currentQuestionIndex.value = firstUnanswered < 0 ? 0 : firstUnanswered
    quizResult.value = null
    saveMessage.value = ''
  } catch (err) {
    error.value = 'Could not resume quiz: ' + err.message
  } finally {
    loading.value = false
  }
}

async function handleSubmitQuiz() {
  if (!activeQuizSession.value) return
  const question = activeQuizSession.value.questions[currentQuestionIndex.value]
  if (
    selectedAnswers.value[question.id] !== undefined &&
    selectedAnswers.value[question.id] !== ''
  ) {
    if (!(await saveCurrentQuestion())) return
  }
  submitting.value = true
  try {
    quizResult.value = await api.submitQuizSession(activeQuizSession.value.quiz_id)
  } catch (err) {
    error.value = 'Failed to submit quiz results.'
  } finally {
    submitting.value = false
  }
}

async function exitQuiz() {
  if (!quizResult.value) {
    const question = activeQuizSession.value?.questions[currentQuestionIndex.value]
    if (
      question &&
      selectedAnswers.value[question.id] !== undefined &&
      selectedAnswers.value[question.id] !== ''
    ) {
      if (!(await saveCurrentQuestion())) return
    }
  }
  activeQuizSession.value = null
  quizResult.value = null
  try {
    unfinishedQuizzes.value = await api.getUnfinishedQuizzes()
  } catch (err) {
    error.value = 'Could not load unfinished quizzes: ' + err.message
  }
}
</script>

<template>
  <div class="explore-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">EXPLORE SKILLS & KNOWLEDGE</p>
        <h1>Quiz & Knowledge Center</h1>
        <p class="heading-description">
          Choose a difficulty level (1–5) and test your knowledge across Anatomy, Exercise Science,
          and Physiology.
        </p>
      </div>
    </div>

    <!-- Difficulty Level Selector Bar -->
    <div v-if="!activeQuizSession" class="difficulty-bar">
      <span class="diff-label">Select Difficulty Level for Quiz:</span>
      <div class="difficulty-options">
        <button
          v-for="lvl in [1, 2, 3, 4, 5]"
          :key="lvl"
          :class="['diff-btn', { active: selectedDifficulty === lvl }]"
          @click="selectedDifficulty = lvl"
        >
          ⭐ Level {{ lvl }}
          <span class="diff-desc">
            {{
              lvl === 1 ? 'Beginner' : lvl === 3 ? 'Intermediate' : lvl === 5 ? 'PT Candidate' : ''
            }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="error" class="error-banner">⚠️ {{ error }}</div>

    <!-- Active Quiz Playing View -->
    <div v-if="activeQuizSession && !quizResult" class="quiz-container">
      <p
        v-if="
          activeQuizSession.requested_difficulty != null &&
          activeQuizSession.requested_difficulty !== activeQuizSession.difficulty
        "
        role="status"
      >
        Nivå {{ activeQuizSession.requested_difficulty }} saknar frågor inom detta ämne. Quizet
        använder nivå {{ activeQuizSession.difficulty }}.
      </p>
      <div class="quiz-header">
        <div>
          <span class="badge">{{ activeTopicName }}</span>
          <span class="chip margin-left">⭐ Level {{ activeQuizSession.difficulty }}</span>
        </div>
        <span
          >Question {{ currentQuestionIndex + 1 }} of {{ activeQuizSession.questions.length }}</span
        >
        <button @click="exitQuiz" :disabled="saving || submitting" class="button-text">
          ✕ Exit Quiz
        </button>
      </div>

      <div v-if="activeQuizSession.questions[currentQuestionIndex]" class="question-card">
        <p class="meta">
          Type: {{ activeQuizSession.questions[currentQuestionIndex].question_type }} | Difficulty:
          Level
          {{ activeQuizSession.questions[currentQuestionIndex].difficulty_level }}
        </p>
        <h2>{{ activeQuizSession.questions[currentQuestionIndex].question_text }}</h2>

        <!-- Answer Rendering by Type -->
        <!-- 1. Multiple Choice & Yes/No -->
        <div
          v-if="activeQuizSession.questions[currentQuestionIndex].question_type !== 'free_text'"
          class="options-grid"
        >
          <button
            v-for="ans in activeQuizSession.questions[currentQuestionIndex].answers"
            :key="ans.id"
            :disabled="saving || submitting"
            :class="[
              'option-button',
              {
                selected:
                  selectedAnswers[activeQuizSession.questions[currentQuestionIndex].id] === ans.id,
              },
            ]"
            @click="selectAnswer(activeQuizSession.questions[currentQuestionIndex].id, ans.id)"
          >
            {{ ans.answer_text }}
          </button>
        </div>

        <!-- 2. Free Text Open Answer Input -->
        <div v-else class="free-text-box">
          <input
            type="text"
            v-model="selectedAnswers[activeQuizSession.questions[currentQuestionIndex].id]"
            placeholder="Type your answer here..."
            class="text-input"
            :disabled="saving || submitting"
            @input="saveMessage = 'Not saved yet'"
            @change="saveCurrentQuestion()"
          />
          <button
            class="button button-outline"
            :disabled="saving || submitting"
            @click="saveCurrentQuestion()"
          >
            Save answer
          </button>
        </div>

        <!-- Sources / Citations -->
        <div
          v-if="activeQuizSession.questions[currentQuestionIndex].sources.length > 0"
          class="source-box"
        >
          <span class="source-label">📖 Reference Source:</span>
          <a
            v-for="src in activeQuizSession.questions[currentQuestionIndex].sources"
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
          :disabled="currentQuestionIndex === 0 || saving || submitting"
          @click="navigateQuestion(-1)"
          class="button button-outline"
        >
          ← Previous
        </button>

        <button
          v-if="currentQuestionIndex < activeQuizSession.questions.length - 1"
          @click="navigateQuestion(1)"
          :disabled="saving || submitting"
          class="button button-accent"
        >
          Next →
        </button>

        <button
          v-else
          @click="handleSubmitQuiz"
          :disabled="submitting || saving"
          class="button button-accent"
        >
          {{ submitting ? 'Grading & Saving...' : 'Submit Quiz 🚀' }}
        </button>
      </div>
      <button
        class="button button-outline"
        :disabled="saving || submitting"
        @click="navigateQuestion(1, true)"
      >
        Skip question
      </button>
      <p role="status" aria-live="polite">{{ saveMessage }}</p>
      <p>
        Answered: {{ activeQuizSession.questions.filter((q) => q.is_answered).length }} · Skipped:
        {{ activeQuizSession.questions.filter((q) => q.is_skipped).length }}
      </p>
    </div>

    <!-- Quiz Results View -->
    <div v-else-if="quizResult" class="results-card">
      <h2>🎉 Quiz Complete!</h2>
      <div class="score-summary">
        <div class="stat">
          <span class="stat-value"
            >{{ quizResult.correct_count }} / {{ quizResult.total_questions }}</span
          >
          <span class="stat-label">Correct Answers</span>
        </div>
        <div class="stat">
          <span class="stat-value">+{{ quizResult.xp_earned }} XP</span>
          <span class="stat-label">
            XP Earned (Level
            {{ activeQuizSession ? activeQuizSession.difficulty : selectedDifficulty }})
          </span>
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
      <p v-if="!loading && !loggedIn">
        Log in through your profile to start a quiz and save progress across devices.
      </p>
      <section v-if="unfinishedQuizzes.length" aria-labelledby="unfinished-title">
        <h2 id="unfinished-title">Continue an unfinished quiz</h2>
        <div v-for="quiz in unfinishedQuizzes" :key="quiz.quiz_id">
          <p>
            {{ quiz.topic_name }} · Level {{ quiz.difficulty }} · {{ quiz.answered_count }}/{{
              quiz.total_cnt
            }}
            answered · {{ quiz.skipped_count }} skipped
          </p>
          <button
            class="button button-outline"
            :disabled="loading"
            @click="resumeQuiz(quiz.quiz_id)"
          >
            Resume quiz
          </button>
        </div>
      </section>
      <div v-if="loading" class="loading-state">Loading topics from database...</div>

      <div v-else class="topics-grid">
        <article v-for="topic in topics" :key="topic.id" class="topic-card">
          <div class="topic-header">
            <h3>{{ topic.name }}</h3>
            <span class="chip">{{ topic.question_count }} Questions</span>
          </div>
          <p>{{ topic.description || 'Explore and master key concepts in ' + topic.name }}</p>
          <button
            @click="startQuizSession(topic)"
            :disabled="!loggedIn || loading"
            class="button button-outline"
          >
            Start Level {{ selectedDifficulty }} {{ topic.name }} Quiz ↗
          </button>
        </article>
      </div>
    </div>
  </div>
</template>
