import { createRouter, createWebHashHistory } from 'vue-router'
import { currentUser, isAdmin, isOrganization, loadCurrentUser } from '../services/auth'

export const navigation = [
  { path: '/', label: 'Översikt', icon: '◫' },
  { path: '/explore', label: 'Utforska kunskap', icon: '⌕' },
  { path: '/challenges', label: 'Utmaningar', icon: '🏆' },
  { path: '/organization/prospects', label: 'Kandidatöversikt', icon: 'ϗ', orgOnly: true },
  { path: '/profile', label: 'Profil', icon: '◎' },
  { path: '/linus-experiment', label: 'Linus experimenting', icon: '⚗' },
  { path: '/admin/questions', label: 'Hantera frågor', icon: '✎', adminOnly: true },
]

// Hash URLs support direct links and refreshes on static hosting.
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Översikt' },
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('../views/ExploreView.vue'),
      meta: { title: 'Utforska kunskap' },
    },
    {
      path: '/organization/prospects',
      name: 'org-prospects',
      component: () => import('../views/OrganizationView.vue'),
      meta: { title: 'Kandidatöversikt', requiresOrg: true },
    },
    {
      path: '/admin/questions',
      name: 'admin-questions',
      component: () => import('../views/AdminQuestionsView.vue'),
      meta: { title: 'Hantera frågor', requiresAdmin: true },
    },
    { path: '/my-skills', redirect: '/admin/questions' },
    { path: '/messages', redirect: '/profile' },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { title: 'Profil' },
    },
    {
      path: '/linus-experiment',
      name: 'linus-experiment',
      component: () => import('../views/linusExperiment.vue'),
      meta: { title: 'Linus experimenting' },
    },
    {
      path: '/challenges',
      name: 'challenges',
      component: () => import('../views/ChallengeView.vue'),
      meta: { title: 'Utmaningar', requiresAuth: true },
    },
    {
      path: '/challenges/:id/play',
      name: 'challenge-play',
      component: () => import('../views/ChallengePlayView.vue'),
      meta: { title: 'Utmaningsquiz', requiresAuth: true },
    },
    {
      path: '/challenges/:id/result',
      name: 'challenge-result',
      component: () => import('../views/ChallengeResultView.vue'),
      meta: { title: 'Utmaningsresultat', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Sidan hittades inte' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    await loadCurrentUser()
    if (!currentUser.value) return { name: 'profile' }
  }
  if (to.meta.requiresAdmin) {
    await loadCurrentUser()
    if (!currentUser.value) return { name: 'profile' }
    if (!isAdmin.value) return { name: 'home' }
  }
  if (to.meta.requiresOrg) {
    await loadCurrentUser()
    if (!currentUser.value) return { name: 'profile' }
    if (!isOrganization.value) return { name: 'home' }
  }
})
router.afterEach((to) => {
  document.title = `${to.meta.title} · SkillSwap`
})
export default router
