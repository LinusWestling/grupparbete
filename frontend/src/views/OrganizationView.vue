<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../services/api'

const prospects = ref([])
const searchQuery = ref('')
const selectedMinLevel = ref(0)
const loading = ref(true)
const error = ref(null)

const selectedProspectDetails = ref(null)
const loadingDetails = ref(false)
const requestingId = ref(null)

onMounted(() => {
  fetchProspects()
})

let searchTimeout = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchProspects()
  }, 300)
})

async function fetchProspects() {
  try {
    loading.value = true
    error.value = null
    prospects.value = await api.getProspects(searchQuery.value)
  } catch (err) {
    error.value = 'Failed to load prospect candidates: ' + err.message
  } finally {
    loading.value = false
  }
}

const filteredProspects = computed(() => {
  if (!selectedMinLevel.value) return prospects.value
  return prospects.value.filter(
    (p) => p.access_status === 'approved' && p.overall_level >= Number(selectedMinLevel.value),
  )
})

async function requestAccess(prospect) {
  if (requestingId.value) return
  try {
    requestingId.value = prospect.id
    const res = await api.requestProspectAccess(prospect.id)
    prospect.access_status = res.access_status || 'pending'
  } catch (err) {
    alert('Could not request access: ' + err.message)
  } finally {
    requestingId.value = null
  }
}

async function inspectProspect(prospectId) {
  try {
    loadingDetails.value = true
    selectedProspectDetails.value = await api.getProspectDetails(prospectId)
  } catch (err) {
    alert('Could not load prospect details: ' + err.message)
  } finally {
    loadingDetails.value = false
  }
}

function closeDetailsModal() {
  selectedProspectDetails.value = null
}
</script>

<template>
  <div class="org-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">ORGANIZATION RECRUITMENT & PROSPECT INSIGHTS</p>
        <h1>Candidate Knowledge Overview</h1>
        <p class="heading-description">
          Discover candidates who have opted in as prospects, request permission to view their quiz
          results, and inspect approved candidates' topic mastery and test history.
        </p>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="search-filter-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search prospects by username..."
        aria-label="Search prospects"
      />
      <div class="filter-group">
        <label for="level-filter" class="text-sm font-semibold">Min Approved Level:</label>
        <select id="level-filter" v-model="selectedMinLevel" class="filter-select">
          <option :value="0">All Prospects</option>
          <option :value="1">Approved Level 1+</option>
          <option :value="2">Approved Level 2+</option>
          <option :value="3">Approved Level 3+</option>
          <option :value="4">Approved Level 4+</option>
          <option :value="5">Approved Level 5 (PT Master)</option>
        </select>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="error-banner">⚠️ {{ error }}</div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-muted text-center">Loading prospect candidates...</div>

    <!-- Empty State -->
    <div v-else-if="filteredProspects.length === 0" class="empty-state">
      <p>No candidate prospects found matching your criteria.</p>
    </div>

    <!-- Prospects Cards Grid -->
    <div v-else class="prospects-grid">
      <div v-for="p in filteredProspects" :key="p.id" class="prospect-card">
        <div class="prospect-header">
          <div class="prospect-avatar">
            {{ p.username ? p.username[0].toUpperCase() : 'C' }}
          </div>
          <div class="prospect-info">
            <span class="prospect-name">{{ p.username }}</span>
            <span :class="['status-pill', p.access_status]">
              {{
                p.access_status === 'approved'
                  ? '✅ Access Approved'
                  : p.access_status === 'pending'
                    ? '⏳ Approval Pending'
                    : p.access_status === 'rejected'
                      ? '✕ Access Declined'
                      : '🔒 Results Locked'
              }}
            </span>
          </div>
        </div>

        <!-- Approved Candidate View -->
        <template v-if="p.access_status === 'approved'">
          <div class="prospect-stats-row">
            <div class="p-stat">
              <span class="p-val">Lvl {{ p.overall_level }}</span>
              <span class="p-lbl">Overall Tier</span>
            </div>
            <div class="p-stat">
              <span class="p-val">{{ p.quizzes_completed }}</span>
              <span class="p-lbl">Quizzes</span>
            </div>
            <div class="p-stat">
              <span class="p-val">{{ p.accuracy_percentage }}%</span>
              <span class="p-lbl">Accuracy</span>
            </div>
          </div>

          <div v-if="p.topic_progress && p.topic_progress.length > 0" class="topic-pills">
            <span v-for="tp in p.topic_progress" :key="tp.topic_id" class="topic-pill">
              {{ tp.topic_name }}: ⭐ Lvl {{ tp.level }}
            </span>
          </div>

          <button @click="inspectProspect(p.id)" class="button button-outline button-sm">
            Inspect Full Report ↗
          </button>
        </template>

        <!-- Unapproved / Locked Candidate View -->
        <template v-else>
          <div class="prospect-locked-box">
            <p class="text-muted">
              Detailed quiz scores and topic progression are private until
              <strong>{{ p.username }}</strong> approves your organization's request.
            </p>
          </div>

          <button
            v-if="p.access_status === 'pending'"
            class="button button-outline button-sm"
            disabled
          >
            ⏳ Waiting for Candidate Approval
          </button>
          <button
            v-else
            @click="requestAccess(p)"
            class="button button-accent button-sm"
            :disabled="requestingId === p.id"
          >
            {{
              requestingId === p.id
                ? 'Sending Request...'
                : p.access_status === 'rejected'
                  ? 'Request Access Again 🔒'
                  : 'Request Access to Results 🔒'
            }}
          </button>
        </template>
      </div>
    </div>

    <!-- Inspect Prospect Modal -->
    <div v-if="selectedProspectDetails" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Candidate Prospect: {{ selectedProspectDetails.username }}</h2>
          <button @click="closeDetailsModal" class="button-text">✕ Close</button>
        </div>

        <div class="modal-body">
          <div class="prospect-meta-grid">
            <div class="stat-card">
              <span class="value">Level {{ selectedProspectDetails.overall_level }}</span>
              <span class="label">Overall Qualification Tier</span>
            </div>
            <div class="stat-card">
              <span class="value">{{ selectedProspectDetails.total_xp }} XP</span>
              <span class="label">Total Earned XP</span>
            </div>
            <div class="stat-card">
              <span class="value">{{ selectedProspectDetails.accuracy_percentage }}%</span>
              <span class="label">Overall Accuracy</span>
            </div>
            <div class="stat-card">
              <span class="value">{{ selectedProspectDetails.total_answered }}</span>
              <span class="label">Questions Answered</span>
            </div>
          </div>

          <!-- Topic Mastery -->
          <div class="details-section">
            <h3>Topic Breakdown & Mastery</h3>
            <div v-if="selectedProspectDetails.topic_progress.length > 0" class="progress-list">
              <div
                v-for="tp in selectedProspectDetails.topic_progress"
                :key="tp.id || tp.topic_id"
                class="tp-item"
              >
                <div class="tp-info">
                  <div class="tp-title">
                    <strong>{{ tp.topic_name }}</strong>
                    <span class="badge">⭐ Level {{ tp.level }}</span>
                  </div>
                  <span>{{ tp.xp }} XP</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ '--progress-width': (tp.level >= 5 ? 100 : tp.xp % 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <p v-else class="text-muted">No topic progress recorded for this candidate.</p>
          </div>

          <!-- Quiz History -->
          <div class="details-section">
            <h3>Completed Quiz History</h3>
            <div v-if="selectedProspectDetails.quiz_history.length > 0" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Quiz #</th>
                    <th>Topic</th>
                    <th>Difficulty</th>
                    <th>Score / Accuracy</th>
                    <th>Date Completed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in selectedProspectDetails.quiz_history" :key="q.quiz_id">
                    <td>#{{ q.quiz_id }}</td>
                    <td>
                      <span class="badge">{{ q.topic_name }}</span>
                    </td>
                    <td>⭐ Level {{ q.difficulty }}</td>
                    <td>
                      <strong>{{ q.correct_cnt }} / {{ q.total_cnt }}</strong>
                      <span class="text-muted">
                        ({{
                          q.total_cnt > 0 ? Math.round((q.correct_cnt / q.total_cnt) * 100) : 0
                        }}%)
                      </span>
                    </td>
                    <td>{{ new Date(q.completed_at).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted">No completed quizzes found for this candidate.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailsModal" class="button button-outline">Close Report</button>
        </div>
      </div>
    </div>
  </div>
</template>
