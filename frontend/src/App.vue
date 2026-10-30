<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { navigation } from './router'
import {
  currentUser,
  isAdmin,
  isOrganization,
  loadCurrentUser,
  clearCurrentUser,
} from './services/auth'
import { api } from './services/api'

const router = useRouter()

const visibleNavigation = computed(() =>
  navigation.filter(
    (item) => (!item.adminOnly || isAdmin.value) && (!item.orgOnly || isOrganization.value),
  ),
)

const loggingOut = ref(false)
const logoutError = ref('')
const mobileMenuOpen = ref(false)
const mainContent = ref(null)
let shouldFocusMain = false

function focusMainContent() {
  const mainEl = mainContent.value
  if (!mainEl) return
  const heading = mainEl.querySelector('h1')
  if (heading) {
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1')
    }
    heading.focus()
  } else {
    mainEl.focus()
  }
}

async function closeMobileMenu() {
  mobileMenuOpen.value = false
  shouldFocusMain = true
  await nextTick()
  focusMainContent()
}

watch(
  () => router.currentRoute.value.fullPath,
  async () => {
    mobileMenuOpen.value = false
    if (!shouldFocusMain) return
    shouldFocusMain = false
    await nextTick()
    focusMainContent()
  },
)

async function handleLogout() {
  if (loggingOut.value) return

  loggingOut.value = true
  logoutError.value = ''

  try {
    await api.logout()
    clearCurrentUser()
    router.push('/profile')
  } catch (error) {
    console.error('Logout failed:', error)
    logoutError.value = 'Det gick inte att logga ut: ' + error.message
  } finally {
    loggingOut.value = false
  }
}

onMounted(loadCurrentUser)
</script>
<template>
  <a class="skip-link" href="#main-content">Hoppa till innehållet</a>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-header">
        <RouterLink class="brand" to="/" aria-label="SkillSwaps startsida" @click="closeMobileMenu"
          ><span class="brand-mark">⇄</span> SkillSwap<span class="brand-dot">.</span></RouterLink
        >
        <button
          type="button"
          class="hamburger-btn"
          :aria-expanded="mobileMenuOpen"
          aria-controls="primary-navigation"
          :aria-label="mobileMenuOpen ? 'Stäng meny' : 'Öppna meny'"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span class="hamburger-icon" aria-hidden="true">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
          <span class="hamburger-label">Meny</span>
        </button>
      </div>
      <p class="nav-label">DIN ARBETSYTA</p>
      <nav
        id="primary-navigation"
        :class="{ 'is-open': mobileMenuOpen }"
        aria-label="Huvudnavigering"
      >
        <RouterLink
          v-for="item in visibleNavigation"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          exact-active-class="is-active"
          @click="closeMobileMenu"
          ><span class="nav-icon" aria-hidden="true">{{ item.icon }}</span
          >{{ item.label }}</RouterLink
        >
      </nav>
      <div class="sidebar-note">
        <span class="note-symbol" aria-hidden="true">✳</span>
        <h3>Alla har något att lära ut.</h3>
        <p>Och något nytt att lära sig.</p>
        <RouterLink to="/explore">Utforska kunskap ↗</RouterLink>
      </div>
      <div class="sidebar-footer">
        <span class="status-dot"></span> Ett litet utbyte. Stora möjligheter.
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <span>Lär tillsammans. Utvecklas tillsammans.</span>
        <div class="profile-div">
          <RouterLink to="/profile" class="profile-link">
            <span class="avatar" aria-hidden="true">{{
              currentUser?.username ? currentUser.username[0].toUpperCase() : '→'
            }}</span>
            {{ currentUser?.username ? `${currentUser.username} ↗` : 'Logga in / Skapa konto ↗' }}
          </RouterLink>
          <button
            v-if="currentUser"
            type="button"
            class="button button-outline"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            {{ loggingOut ? 'Loggar ut…' : 'Logga ut' }}
          </button>
          <span v-if="logoutError" class="error-banner" role="alert">{{ logoutError }}</span>
        </div>
      </header>
      <main id="main-content" ref="mainContent" tabindex="-1"><RouterView /></main>
      <footer class="page-footer">
        <span>SkillSwap</span><span>Bra saker händer när vi delar med oss.</span>
      </footer>
    </div>
  </div>
</template>
