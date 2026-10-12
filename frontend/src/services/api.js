import { createApiService } from './apiFactory.js'

const { request } = createApiService('')

// Drops empty filters so they aren't sent as e.g. "search=".
function toQuery(params) {
  const filled = Object.entries(params).filter(([, value]) => value !== '' && value != null)
  const query = new URLSearchParams(filled).toString()
  return query ? `?${query}` : ''
}

export const api = {
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
  startQuiz: (topicId, difficulty = 1, limit = 10) =>
    request('/quizzes/start', {
      method: 'POST',
      body: JSON.stringify({ topicId, difficulty, limit }),
    }),
  submitQuizSession: (quizId, submissions) =>
    request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ submissions }),
    }),
  getQuizHistory: () => request('/quizzes/history'),
  getQuizDetails: (quizId) => request(`/quizzes/${quizId}`),
  getUnfinishedQuizzes: () => request('/quizzes/unfinished'),
  saveQuestionProgress: (quizId, questionId, progress) =>
    request(`/quizzes/${quizId}/questions/${questionId}/progress`, {
      method: 'PUT',
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

  // Organization Candidate Insights
  getProspects: (search = '') =>
    request(`/organization/prospects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProspectDetails: (prospectId) => request(`/organization/prospects/${prospectId}`),

  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/auth/me'),
}
