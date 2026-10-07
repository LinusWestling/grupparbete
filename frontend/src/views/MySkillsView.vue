<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const questions = ref([])
const topics = ref([])
const loading = ref(true)
const error = ref(null)
const successMsg = ref(null)

// Form state for creating a new custom question
const showForm = ref(false)
const formData = ref({
  topic_id: 1,
  question_text: '',
  question_type: 'multiple_choice',
  difficulty_level: 1,
  answers: [
    { answer_text: '', is_correct: true },
    { answer_text: '', is_correct: false },
  ],
  sources: [{ source_text: '', url: '' }],
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    loading.value = true
    error.value = null
    const [qData, tData] = await Promise.all([api.getQuestions({ limit: 50 }), api.getTopics()])
    questions.value = qData
    topics.value = tData
    if (tData.length > 0) {
      formData.value.topic_id = tData[0].id
    }
  } catch (err) {
    error.value = 'Failed to load questions from backend.'
  } finally {
    loading.value = false
  }
}

function addAnswerOption() {
  formData.value.answers.push({ answer_text: '', is_correct: false })
}

function removeAnswerOption(index) {
  if (formData.value.answers.length > 1) {
    formData.value.answers.splice(index, 1)
  }
}

async function handleCreateQuestion() {
  try {
    error.value = null
    successMsg.value = null
    await api.createQuestion(formData.value)
    successMsg.value = 'New question added successfully to MySQL!'
    showForm.value = false
    // Reset form
    formData.value.question_text = ''
    formData.value.answers = [
      { answer_text: '', is_correct: true },
      { answer_text: '', is_correct: false },
    ]
    await loadData()
  } catch (err) {
    error.value = 'Failed to create question: ' + err.message
  }
}

async function handleDeleteQuestion(id) {
  if (!confirm('Are you sure you want to delete this question?')) return
  try {
    await api.deleteQuestion(id)
    successMsg.value = 'Question deleted.'
    await loadData()
  } catch (err) {
    error.value = 'Failed to delete question.'
  }
}
</script>

<template>
  <div class="my-skills-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">QUESTION & CONTENT MANAGEMENT</p>
        <h1>My Skills & Question Authoring</h1>
        <p class="heading-description">
          Create, view, and manage custom quiz questions stored directly in your MySQL database.
        </p>
      </div>
      <button @click="showForm = !showForm" class="button button-accent">
        {{ showForm ? '✕ Close Form' : '+ Add New Question' }}
      </button>
    </div>

    <div v-if="error" class="banner error-banner">⚠️ {{ error }}</div>
    <div v-if="successMsg" class="banner success-banner">✅ {{ successMsg }}</div>

    <!-- Create Question Form Modal/Panel -->
    <div v-if="showForm" class="form-card">
      <h2>Add New Question to MySQL Database</h2>
      <form @submit.prevent="handleCreateQuestion" class="question-form">
        <div class="form-group">
          <label>Topic / Category:</label>
          <select v-model="formData.topic_id" required>
            <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Question Type:</label>
          <select v-model="formData.question_type">
            <option value="multiple_choice">Multiple Choice</option>
            <option value="yes_no">Yes / No</option>
            <option value="free_text">Free Text</option>
          </select>
        </div>

        <div class="form-group">
          <label>Difficulty Level (1 - 5):</label>
          <input type="number" min="1" max="5" v-model="formData.difficulty_level" required />
        </div>

        <div class="form-group">
          <label>Question Text:</label>
          <textarea
            v-model="formData.question_text"
            placeholder="Enter question..."
            required
            rows="3"
          ></textarea>
        </div>

        <!-- Answers Builder -->
        <div class="form-section">
          <h3>Answer Options</h3>
          <div v-for="(ans, idx) in formData.answers" :key="idx" class="answer-row">
            <input
              type="radio"
              name="correct_answer"
              :checked="ans.is_correct"
              @change="formData.answers.forEach((a, i) => (a.is_correct = i === idx))"
              title="Mark as correct answer"
            />
            <input
              type="text"
              v-model="ans.answer_text"
              placeholder="Answer option text..."
              required
              class="flex-1"
            />
            <button type="button" @click="removeAnswerOption(idx)" class="button-icon">🗑️</button>
          </div>
          <button type="button" @click="addAnswerOption" class="button button-outline button-sm">
            + Add Choice
          </button>
        </div>

        <!-- Source Citation Builder -->
        <div class="form-section">
          <h3>Reference Source</h3>
          <div class="form-group">
            <input
              type="text"
              v-model="formData.sources[0].source_text"
              placeholder="Source title / citation..."
            />
            <input
              type="url"
              v-model="formData.sources[0].url"
              placeholder="Source URL (optional)"
            />
          </div>
        </div>

        <button type="submit" class="button button-accent">Save Question to MySQL 💾</button>
      </form>
    </div>

    <!-- Questions Table / List -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">Loading questions from MySQL database...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Topic</th>
            <th>Question</th>
            <th>Type</th>
            <th>Difficulty</th>
            <th>Choices</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in questions" :key="q.id">
            <td>#{{ q.id }}</td>
            <td>
              <span class="badge">{{ q.topic_name }}</span>
            </td>
            <td class="question-col">{{ q.question_text }}</td>
            <td>
              <code>{{ q.question_type }}</code>
            </td>
            <td>⭐ Level {{ q.difficulty_level }}</td>
            <td>{{ q.answers ? q.answers.length : 0 }} options</td>
            <td>
              <button @click="handleDeleteQuestion(q.id)" class="button-danger button-sm">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.my-skills-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.banner {
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
}
.error-banner {
  background: #fee2e2;
  color: #991b1b;
}
.success-banner {
  background: #dcfce7;
  color: #166534;
}
.form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  border-radius: 12px;
}
.question-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}
.form-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.answer-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.flex-1 {
  flex: 1;
}
.table-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.data-table th,
.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}
.data-table th {
  background: #f9fafb;
  font-weight: 600;
}
.question-col {
  max-width: 350px;
}
.button-danger {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}
.button-danger:hover {
  background: #dc2626;
}
</style>
