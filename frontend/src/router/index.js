import { createRouter, createWebHashHistory } from 'vue-router'
import { currentUser, isAdmin, loadCurrentUser } from '../services/auth'

export const navigation = [
  { path: '/', label: 'Overview', icon: '◫' },
  { path: '/explore', label: 'Explore skills', icon: '⌕' },
  { path: '/messages', label: 'Messages', icon: '◌' },
  { path: '/profile', label: 'Profile', icon: '◎' },
  { path: '/admin/questions', label: 'Manage questions', icon: '✎', adminOnly: true },
]

// Hash URLs support direct links and refreshes on static hosting.
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Overview' },
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('../views/ExploreView.vue'),
      meta: { title: 'Explore skills' },
    },
    {
      path: '/admin/questions',
      name: 'admin-questions',
      component: () => import('../views/MySkillsView.vue'),
      meta: { title: 'Manage questions', requiresAdmin: true },
    },
    { path: '/my-skills', redirect: '/admin/questions' },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/MessagesView.vue'),
      meta: { title: 'Messages' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { title: 'Profile' },
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Page not found' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return
  await loadCurrentUser()
  if (!currentUser.value) return { name: 'profile' }
  if (!isAdmin.value) return { name: 'home' }
})
router.afterEach((to) => {
  document.title = `${to.meta.title} · SkillSwap`
})
export default router
