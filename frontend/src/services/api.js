const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'API request failed');
  }

  return data.data;
}

export const api = {
  // Topics
  getTopics: () => request('/topics'),
  getTopic: (id) => request(`/topics/${id}`),

  // Questions (CRUD)
  getQuestions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/questions?${query}`);
  },
  createQuestion: (questionData) => request('/questions', {
    method: 'POST',
    body: JSON.stringify(questionData),
  }),
  updateQuestion: (id, questionData) => request(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(questionData),
  }),
  deleteQuestion: (id) => request(`/questions/${id}`, {
    method: 'DELETE',
  }),

  // Quizzes & Game Modes
  getPracticeQuiz: (topicId, difficulty) => {
    const params = new URLSearchParams();
    if (topicId) params.append('topicId', topicId);
    if (difficulty) params.append('difficulty', difficulty);
    return request(`/quizzes/practice?${params.toString()}`);
  },
  getSpeedrunQuiz: () => request('/quizzes/speedrun'),
  submitQuiz: (submissions, userId = 1) => request('/quizzes/submit', {
    method: 'POST',
    body: JSON.stringify({ userId, submissions }),
  }),

  // User & Stats
  getDashboardStats: () => request('/dashboard/stats'),
  getUserProgress: (userId = 1) => request(`/users/${userId}/progress`),

  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getMe: () => request('/auth/me'),
};
