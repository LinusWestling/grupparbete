import { createApiService } from './apiFactory.js'
import { rememberQuizAccount } from './quizIdentity.js'

const { request } = createApiService('')

/**
 * Serialize non-empty filter parameters into a URL query string.
 * Drops empty filters so they aren't sent as e.g. "search=".
 */
function toQuery(params) {
  const filled = Object.entries(params).filter(([, value]) => value !== '' && value != null)
  const query = new URLSearchParams(filled).toString()
  return query ? `?${query}` : ''
}

export const api = {
  // The backend authenticates this read and records access before returning the log.
  getMonitoringEvents: () => request('/monitoring/events', { cache: 'no-store' }),
  getServerInformation: (signal) =>
    request('/experiments/server-information', { cache: 'no-store', signal }),

  // Topics
  getTopics: () => request('/topics'),
  getTopic: (id) => request(`/topics/${id}`),

  // Questions (public, without correct answers)
  getQuestions: (params = {}) => request(`/questions${toQuery(params)}`),

  // Admin question CRUD. Reads include correct answers and usage_count.
  // Filters: topicId, type, difficulty, search.
  getAdminQuestions: (params = {}) => request(`/admin/questions${toQuery(params)}`),
  getAdminQuestion: (id) => request(`/admin/questions/${id}`),
  createQuestion: (questionData) =>
    request('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),
  updateQuestion: (id, questionData) =>
    request(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    }),
  deleteQuestion: (id) =>
    request(`/admin/questions/${id}`, {
      method: 'DELETE',
    }),

  // Quizzes & Game Modes with Difficulty Selection & History
  startQuiz: (topicId, difficulty = 1, limit = 10, questionTypes) =>
    request('/quizzes/start', {
      method: 'POST',
      body: JSON.stringify({
        topicId,
        difficulty,
        limit,
        ...(questionTypes !== undefined ? { questionTypes } : {}),
      }),
    }),
  submitQuizSession: (quizId, submissions) =>
    request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ submissions }),
    }),
  getQuizHistory: () => request('/quizzes/history'),
  getQuizDetails: (quizId) => request(`/quizzes/${quizId}`),
  getUnfinishedQuizzes: () => request('/quizzes/unfinished'),
  saveQuestionProgress: (quizId, questionId, progress) =>
    request(`/quizzes/${quizId}/questions/${questionId}/progress`, {
      method: 'PUT',
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify(progress),
    }),

  // User & Stats
  getDashboardStats: () => request('/dashboard/stats'),
  getUserProgress: (userId) => request(userId ? `/users/${userId}/progress` : '/users/me/progress'),
  updateUserPrivacy: (isPublicProspect) =>
    request('/users/me/privacy', {
      method: 'PUT',
      body: JSON.stringify({ is_public_prospect: isPublicProspect }),
    }),
  getMyAccessRequests: () => request('/users/me/access-requests'),
  respondToAccessRequest: (requestId, status) =>
    request(`/users/me/access-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Admin Organization Approvals
  getOrganizationRequests: () => request('/admin/org-requests'),
  updateOrganizationRequestStatus: (userId, action) =>
    request(`/admin/org-requests/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    }),

  // Organization Candidate Insights
  getProspects: (search = '') =>
    request(`/organization/prospects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  requestProspectAccess: (prospectId) =>
    request(`/organization/prospects/${prospectId}/request-access`, {
      method: 'POST',
    }),
  getProspectDetails: (prospectId) => request(`/organization/prospects/${prospectId}`),
  assignTest: (prospectId, settings) =>
    request(`/organization/prospects/${prospectId}/tests`, {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
  getAssignedTestReport: (prospectId, quizId) =>
    request(`/organization/prospects/${prospectId}/tests/${quizId}`),

  // Challenges
  getPendingChallenges: () => request('/challenges/pending'),
  getActiveChallenges: () => request('/challenges/active'),
  getChallengeHistory: () => request('/challenges/history'),
  createChallenge: (challengedUserId, topicId, difficulty) =>
    request('/challenges', {
      method: 'POST',
      body: JSON.stringify({ challenged_user_id: challengedUserId, topic_id: topicId, difficulty }),
    }),
  acceptChallenge: (challengeId) =>
    request(`/challenges/${challengeId}/accept`, {
      method: 'POST',
    }),
  declineChallenge: (challengeId) =>
    request(`/challenges/${challengeId}/decline`, {
      method: 'POST',
    }),
  startChallengeQuiz: (challengeId) =>
    request(`/challenges/${challengeId}/start`, {
      method: 'POST',
    }),
  completeChallengeQuiz: (challengeId) =>
    request(`/challenges/${challengeId}/complete`, {
      method: 'POST',
    }),
  getChallengeProgress: (challengeId) => request(`/challenges/${challengeId}/progress`),
  getChallengeResult: (challengeId) => request(`/challenges/${challengeId}/result`),
  markChallengeResultViewed: (challengeId) =>
    request(`/challenges/${challengeId}/mark-viewed`, {
      method: 'POST',
    }),
  searchUsers: (query) => request(`/challenges/users/search?q=${encodeURIComponent(query)}`),

  // Auth
  register: (username, email, password, requestOrganization = false) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, requestOrganization }),
    }),
  login: async (email, password) => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const { loadCurrentUser } = await import('./auth.js')
    await loadCurrentUser({ force: true })
    rememberQuizAccount(result.id)
    window.dispatchEvent(new Event('quiz-auth-restored'))
    return result
  },
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
  getMe: async () => {
    try {
      const user = await request('/auth/me')
      rememberQuizAccount(user.id)
      return user
    } catch (error) {
      if ([401, 403].includes(error.status)) rememberQuizAccount(null)
      throw error
    }
  },
}
