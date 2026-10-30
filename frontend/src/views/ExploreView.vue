<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { api } from '../services/api'
import { QUESTION_TYPE_LABELS } from '../services/questionTypes.js'
import { currentUser, loadCurrentUser } from '../services/auth'
import { quizStore } from '../stores/quizStore'
import QuizSyncStatus from '../components/QuizSyncStatus.vue'
import { confirmQuizNavigation } from '../services/quizNavigationSafety.js'

const route = useRoute()

const topics = ref([])
const loading = ref(true)
const error = ref(null)

// Difficulty selection (1-5)
const selectedDifficulty = ref(1)
const selectedQuestionTypes = ref(Object.keys(QUESTION_TYPE_LABELS))

// Active quiz session state
const {
  activeQuizSession,
  currentQuestionIndex,
  selectedAnswers,
  quizResult,
  saveMessage,
  pendingCompletion,
  syncingCompletion,
  hasUnsyncedData,
  isSyncing,
} = quizStore
const activeTopicName = computed(() => activeQuizSession.value?.topic_name || '')
const submitting = ref(false)
const unfinishedQuizzes = ref([])
const loggedIn = ref(false)

onMounted(async () => {
  await loadCurrentUser()
  loggedIn.value = Boolean(currentUser.value)
  // The store survives internal navigation. Returning offline must not fetch
  // fresh content or replace a loaded quiz (including its local summary).
  if (activeQuizSession.value) {
    loading.value = false
    return
  }
  try {
    topics.value = await api.getTopics()
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
    error.value = 'Det gick inte att hämta ämnen: ' + err.message
  } finally {
    loading.value = false
  }
})

async function startQuizSession(topic) {
  if (selectedQuestionTypes.value.length === 0) {
    error.value = 'Välj minst en frågetyp för att starta ett quiz.'
    return
  }
  try {
    quizStore.assertCanReplaceQuiz()
    loading.value = true
    error.value = null
    const payload = await api.startQuiz(
      topic.id,
      selectedDifficulty.value,
      10,
      selectedQuestionTypes.value,
    )
    quizStore.loadQuiz(payload)
  } catch (err) {
    error.value = 'Det gick inte att skapa quizet: ' + err.message
  } finally {
    loading.value = false
  }
}

function selectAnswer(questionId, answerVal) {
  quizStore.recordProgress(questionId, answerVal)
  void quizStore.flushPending()
}

function selectMatchPair(questionId, answerId, matchValue) {
  const existing = selectedAnswers.value[questionId]
  const currentMap =
    existing && typeof existing === 'object' && !Array.isArray(existing) ? { ...existing } : {}
  if (matchValue) {
    currentMap[answerId] = matchValue
  } else {
    delete currentMap[answerId]
  }
  quizStore.recordProgress(questionId, currentMap)
  void quizStore.flushPending()
}

function getMatchOptions(question) {
  if (Array.isArray(question?.match_options) && question.match_options.length > 0) {
    return question.match_options
  }
  return (question?.answers || []).map((a) => a.match_text).filter(Boolean)
}

function saveCurrentQuestion(isSkipped = false) {
  const question = activeQuizSession.value?.questions[currentQuestionIndex.value]
  if (!question) return Promise.resolve(false)
  quizStore.recordProgress(question.id, selectedAnswers.value[question.id], isSkipped)
  return quizStore.flushPending()
}

async function navigateQuestion(direction, skip = false) {
  if (submitting.value) return
  const question = activeQuizSession.value.questions[currentQuestionIndex.value]
  const hasAnswer =
    question.question_type === 'matching'
      ? Boolean(question.is_answered)
      : selectedAnswers.value[question.id] !== undefined &&
        selectedAnswers.value[question.id] !== ''

  // Stoppa NEXT om ingen svar har valats.
  if (direction > 0 && !skip && !hasAnswer && !question.is_skipped) {
    error.value =
      question.question_type === 'matching'
        ? 'Para ihop alla alternativ eller hoppa över frågan.'
        : 'Välj ett svar eller hoppa över frågan.'
    return
  }
  if (hasAnswer || skip) {
    submitting.value = true
    try {
      // Keep the local answer even when the server is unavailable.
      // Wait for the save attempt before displaying the next question.
      await saveCurrentQuestion(skip)
    } finally {
      submitting.value = false
    }
  }

  error.value = null

  currentQuestionIndex.value = Math.max(
    0,
    Math.min(activeQuizSession.value.questions.length - 1, currentQuestionIndex.value + direction),
  )
}

async function resumeQuiz(quizId) {
  loading.value = true
  error.value = null
  try {
    quizStore.assertCanReplaceQuiz()
    const quiz = await api.getQuizDetails(quizId)
    if (quiz.status !== 'in_progress') throw new Error('Det här quizet är redan avslutat.')
    quizStore.loadQuiz(quiz)
  } catch (err) {
    error.value = 'Det gick inte att återuppta quizet: ' + err.message
  } finally {
    loading.value = false
  }
}

onBeforeRouteLeave(() => confirmQuizNavigation(quizStore))
onBeforeRouteUpdate(() => confirmQuizNavigation(quizStore))

async function handleSubmitQuiz() {
  if (!activeQuizSession.value) return
  error.value = null
  quizStore.completeLocally()
  // Render the summary immediately; server requests never gate completion.
  void quizStore.syncCompletion()
}

async function exitQuiz() {
  if (!quizResult.value) {
    const question = activeQuizSession.value?.questions[currentQuestionIndex.value]
    if (question && question.is_answered) {
      if (!(await saveCurrentQuestion())) return
    }
  }
  if (!quizStore.clearQuiz()) {
    error.value =
      'Ditt quiz har osparade ändringar. Synkronisera dem med ditt konto innan du lämnar quizet.'
    return
  }
  try {
    if (!topics.value.length) topics.value = await api.getTopics()
    if (!loggedIn.value) {
      try {
        await api.getMe()
        loggedIn.value = true
      } catch {
        loggedIn.value = false
      }
    }
    if (!loggedIn.value) return
    unfinishedQuizzes.value = await api.getUnfinishedQuizzes()
  } catch (err) {
    error.value = 'Det gick inte att hämta pågående quiz: ' + err.message
  }
}
</script>

<template>
  <div class="explore-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">UTFORSKA KUNSKAP</p>
        <h1>Quiz och kunskap</h1>
        <p class="heading-description">
          Välj en svårighetsgrad (1–5) och testa dina kunskaper inom anatomi, träningslära och
          fysiologi.
        </p>
      </div>
    </div>

    <!-- Difficulty Level Selector Bar -->
    <div v-if="!activeQuizSession" class="difficulty-bar">
      <span class="diff-label">Välj svårighetsgrad för quizet:</span>
      <div class="difficulty-options">
        <button
          v-for="lvl in [1, 2, 3, 4, 5]"
          :key="lvl"
          :class="['diff-btn', { active: selectedDifficulty === lvl }]"
          @click="selectedDifficulty = lvl"
        >
          ⭐ Nivå {{ lvl }}
          <span class="diff-desc">
            {{ lvl === 1 ? 'Nybörjare' : lvl === 3 ? 'Medel' : lvl === 5 ? 'PT-kandidat' : '' }}
          </span>
        </button>
      </div>
    </div>
    <fieldset v-if="!activeQuizSession" class="question-type-selector">
      <legend>Välj frågetyper</legend>

      <label v-for="(lable, type) in QUESTION_TYPE_LABELS" :key="type" class="question-type-option">
        <input type="checkbox" v-model="selectedQuestionTypes" :value="type" />
        {{ lable }}
      </label>

      <p v-if="selectedQuestionTypes.length === 0">
        Välj minst en frågetyp för att starta ett quiz.
      </p>
    </fieldset>
    <p v-if="!activeQuizSession" class="text-muted">
      Quizet innehåller upp till 10 frågor. Om färre frågor matchar dina val används de som finns.
    </p>
    <div v-if="error" class="error-banner">⚠️ {{ error }}</div>
    <QuizSyncStatus v-if="activeQuizSession" />

    <!-- Active Quiz Playing View -->
    <div v-if="activeQuizSession && !quizResult" class="quiz-container">
      <p
        v-if="
          activeQuizSession.requested_difficulty != null &&
          activeQuizSession.requested_difficulty !== activeQuizSession.difficulty
        "
        role="status"
      >
        Det finns inga frågor av valda frågetyper på nivå
        {{ activeQuizSession.requested_difficulty }} inom det här ämnet. Quizet använder nivå
        {{ activeQuizSession.difficulty }}.
      </p>
      <div class="quiz-header">
        <div>
          <span class="badge">{{ activeTopicName }}</span>
          <span class="chip margin-left">⭐ Nivå {{ activeQuizSession.difficulty }}</span>
        </div>
        <span
          >Fråga {{ currentQuestionIndex + 1 }} av {{ activeQuizSession.questions.length }}</span
        >
        <button @click="exitQuiz" :disabled="submitting" class="button-text">✕ Lämna quizet</button>
      </div>

      <div v-if="activeQuizSession.questions[currentQuestionIndex]" class="question-card">
        <p class="meta">
          Frågetyp:
          {{
            QUESTION_TYPE_LABELS[activeQuizSession.questions[currentQuestionIndex].question_type]
          }}
          | Svårighetsgrad: nivå
          {{ activeQuizSession.questions[currentQuestionIndex].difficulty_level }}
        </p>
        <h2>{{ activeQuizSession.questions[currentQuestionIndex].question_text }}</h2>

        <!-- Answer Rendering by Type -->
        <!-- 1. Matching Pairs ("Frågor med samband") -->
        <div
          v-if="activeQuizSession.questions[currentQuestionIndex].question_type === 'matching'"
          class="matching-pairs-list"
        >
          <div
            v-for="ans in activeQuizSession.questions[currentQuestionIndex].answers"
            :key="ans.id"
            class="matching-pair-row"
          >
            <div class="matching-prompt">{{ ans.answer_text }}</div>
            <span class="matching-arrow" aria-hidden="true">↔</span>
            <select
              class="matching-select"
              :disabled="submitting"
              :value="
                selectedAnswers[activeQuizSession.questions[currentQuestionIndex].id]?.[ans.id] ??
                ''
              "
              :aria-label="`Välj samband för ${ans.answer_text}`"
              @change="
                selectMatchPair(
                  activeQuizSession.questions[currentQuestionIndex].id,
                  ans.id,
                  $event.target.value,
                )
              "
            >
              <option value="">— Välj samband —</option>
              <option
                v-for="opt in getMatchOptions(activeQuizSession.questions[currentQuestionIndex])"
                :key="opt"
                :value="opt"
              >
                {{ opt }}
              </option>
            </select>
          </div>
        </div>

        <!-- 2. Multiple Choice & Yes/No -->
        <div
          v-else-if="
            activeQuizSession.questions[currentQuestionIndex].question_type !== 'free_text'
          "
          class="options-grid"
        >
          <button
            v-for="ans in activeQuizSession.questions[currentQuestionIndex].answers"
            :key="ans.id"
            :disabled="submitting"
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
            :value="selectedAnswers[activeQuizSession.questions[currentQuestionIndex].id] ?? ''"
            placeholder="Skriv ditt svar här…"
            class="text-input"
            :disabled="submitting"
            @input="
              quizStore.recordProgress(
                activeQuizSession.questions[currentQuestionIndex].id,
                $event.target.value,
              )
            "
          />
        </div>

        <!-- Sources / Citations -->
        <div
          v-if="activeQuizSession.questions[currentQuestionIndex].sources.length > 0"
          class="source-box"
        >
          <span class="source-label">📖 Källa:</span>
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
          :disabled="currentQuestionIndex === 0 || submitting"
          @click="navigateQuestion(-1)"
          class="button button-outline"
        >
          ← Föregående
        </button>

        <button
          v-if="currentQuestionIndex < activeQuizSession.questions.length - 1"
          @click="navigateQuestion(1)"
          :disabled="submitting"
          class="button button-accent"
        >
          Nästa →
        </button>

        <button
          v-else
          @click="handleSubmitQuiz"
          :disabled="submitting"
          class="button button-accent"
        >
          Slutför quizet 🚀
        </button>
      </div>
      <button
        class="button button-outline"
        :disabled="submitting"
        @click="navigateQuestion(1, true)"
      >
        Hoppa över frågan
      </button>
      <p role="status" aria-live="polite">{{ saveMessage }}</p>
      <p>
        Besvarade: {{ activeQuizSession.questions.filter((q) => q.is_answered).length }} ·
        Överhoppade:
        {{ activeQuizSession.questions.filter((q) => q.is_skipped).length }}
      </p>
    </div>

    <!-- Quiz Results View -->
    <div v-else-if="quizResult" class="results-card">
      <h2>🎉 Quizet är slutfört!</h2>
      <p v-if="pendingCompletion" role="status" aria-live="polite">
        Resultatet och beräknade XP väntar på bekräftelse.
        {{ syncingCompletion ? 'Synkroniserar…' : 'Anslut till servern och försök spara igen.' }}
      </p>
      <p v-else role="status">Resultatet är bekräftat och sparat på ditt konto.</p>

      <!-- 80% Qualification Badge -->
      <div v-if="quizResult?.meets_80_percent === true" class="qualification-badge">
        ✓ {{ quizResult.percentage }}% - Uppfyller 80-procentskravet för PT-utbildning
      </div>
      <div v-else-if="quizResult?.meets_80_percent === false" class="qualification-warning">
        {{ quizResult.percentage }}% - Behöver ytterligare
        {{ 80 - quizResult.percentage }} procentenheter för att uppfylla kvalifikationskravet för
        PT-utbildning
      </div>

      <div class="score-summary">
        <div class="stat">
          <span class="stat-value"
            >{{ quizResult.correct_count }} / {{ quizResult.total_questions }}</span
          >
          <span class="stat-label">Rätta svar {{ pendingCompletion ? '(preliminära)' : '' }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">+{{ quizResult.xp_earned }} XP</span>
          <span class="stat-label">
            {{ pendingCompletion ? 'Beräknade XP — väntar på bekräftelse' : 'Intjänade XP' }} (nivå
            {{ activeQuizSession ? activeQuizSession.difficulty : selectedDifficulty }})
          </span>
        </div>
      </div>

      <div class="results-list">
        <h3>Dina svar:</h3>
        <div
          v-for="(res, idx) in quizResult.results"
          :key="idx"
          :class="['result-item', res.is_correct ? 'correct' : 'incorrect']"
        >
          <span class="status-icon">{{
            res.is_skipped ? '⏭️' : res.is_correct ? '✅' : '❌'
          }}</span>
          <div>
            <p>
              <strong>{{ idx + 1 }}. {{ res.question_text }}</strong>
            </p>
            <p v-if="res.is_skipped">Överhoppad</p>
            <p v-else><strong>Ditt svar:</strong> {{ res.selected_answer_text }}</p>
            <p><strong>Rätt svar:</strong> {{ res.correct_answer_text }}</p>
            <p v-for="source in res.sources" :key="source.id" class="text-muted">
              {{ source.source_text }}
            </p>
          </div>
        </div>
      </div>

      <p>Överhoppade: {{ quizResult.skipped_count }}</p>
      <button
        @click="exitQuiz"
        :disabled="pendingCompletion || syncingCompletion"
        class="button button-accent"
      >
        Tillbaka till ämnen
      </button>
    </div>

    <!-- Topics Grid View -->
    <div v-else>
      <p v-if="!loading && !loggedIn">
        Logga in via din profil för att starta ett quiz och spara dina framsteg mellan enheter.
      </p>
      <section v-if="unfinishedQuizzes.length" aria-labelledby="unfinished-title">
        <h2 id="unfinished-title">Fortsätt med ett pågående quiz</h2>
        <div v-for="quiz in unfinishedQuizzes" :key="quiz.quiz_id">
          <p>
            <strong v-if="quiz.organization_name"
              >Tilldelat av {{ quiz.organization_name }} ·
            </strong>
            {{ quiz.topic_name }} · Nivå {{ quiz.difficulty }} · {{ quiz.answered_count }}/{{
              quiz.total_cnt
            }}
            besvarade · {{ quiz.skipped_count }} överhoppade
          </p>
          <button
            class="button button-outline"
            :disabled="loading || hasUnsyncedData || isSyncing"
            @click="resumeQuiz(quiz.quiz_id)"
          >
            Återuppta quizet
          </button>
        </div>
      </section>
      <div v-if="loading" class="loading-state">Hämtar ämnen…</div>

      <div v-else class="topics-grid">
        <article v-for="topic in topics" :key="topic.id" class="topic-card">
          <div class="topic-header">
            <h3>{{ topic.name }}</h3>
            <span class="chip">{{ topic.question_count }} frågor</span>
          </div>
          <p>
            {{ topic.description || 'Utforska och lär dig viktiga begrepp inom ' + topic.name }}
          </p>
          <button
            @click="startQuizSession(topic)"
            :disabled="!loggedIn || loading || hasUnsyncedData || isSyncing"
            class="button button-outline"
          >
            Starta quiz i {{ topic.name }} på nivå {{ selectedDifficulty }} ↗
          </button>
        </article>
      </div>
    </div>
  </div>
</template>
