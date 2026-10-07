import { createApiService } from './apiFactory.js'

const { request } = createApiService('')

export const api = {
  // Topics
  getTopics: () => request('/topics'),
  getTopic: (id) => request(`/topics/${id}`),

  // Questions (CRUD)
  getQuestions: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/questions${query ? `?${query}` : ''}`)
  },
  createQuestion: (questionData) =>
    request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),
  updateQuestion: (id, questionData) =>
    request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    }),
  deleteQuestion: (id) =>
    request(`/questions/${id}`, {
      method: 'DELETE',
    }),

  // Quizzes & Game Modes
  getPracticeQuiz: (topicId, difficulty) => {
    const params = new URLSearchParams()
    if (topicId) params.append('topicId', topicId)
    if (difficulty) params.append('difficulty', difficulty)
    return request(`/quizzes/practice?${params.toString()}`)
  },
  getSpeedrunQuiz: () => request('/quizzes/speedrun'),
  submitQuiz: (submissions) =>
    request('/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify({ submissions }),
    }),

  // User & Stats
  getDashboardStats: () => request('/dashboard/stats'),
  getUserProgress: (userId) => request(userId ? `/users/${userId}/progress` : '/users/me/progress'),

  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/auth/me'),
}
