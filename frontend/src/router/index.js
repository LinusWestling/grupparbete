import { createRouter, createWebHashHistory } from 'vue-router'

export const navigation = [
  { path: '/', label: 'Overview', icon: '◫' },
  { path: '/explore', label: 'Explore skills', icon: '⌕' },
  { path: '/my-skills', label: 'My skills', icon: '✳' },
  { path: '/messages', label: 'Messages', icon: '◌' },
  { path: '/profile', label: 'Profile', icon: '◎' },
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
      path: '/my-skills',
      name: 'my-skills',
      component: () => import('../views/MySkillsView.vue'),
      meta: { title: 'My skills' },
    },
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
router.afterEach((to) => {
  document.title = `${to.meta.title} · SkillSwap`
})
export default router
