<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { navigation } from './router'
import { currentUser, isAdmin, isOrganization, loadCurrentUser, clearCurrentUser } from './services/auth'
import { api } from './services/api'

const router = useRouter()

const visibleNavigation = computed(() =>
  navigation.filter(
    (item) => (!item.adminOnly || isAdmin.value) && (!item.orgOnly || isOrganization.value),
  ),
)

const loggingOut = ref(false)

async function handleLogout() {
  if (loggingOut.value) return

  loggingOut.value = true

  try {
    await api.logout()
    clearCurrentUser()
    router.push('/profile')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    loggingOut.value = false
  }
}

onMounted(loadCurrentUser)
</script>
<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/" aria-label="SkillSwap home"
        ><span class="brand-mark">⇄</span> SkillSwap<span class="brand-dot">.</span></RouterLink
      >
      <p class="nav-label">YOUR WORKSPACE</p>
      <nav aria-label="Main navigation">
        <RouterLink
          v-for="item in visibleNavigation"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          exact-active-class="is-active"
          ><span class="nav-icon" aria-hidden="true">{{ item.icon }}</span
          >{{ item.label }}</RouterLink
        >
      </nav>
      <div class="sidebar-note">
        <span class="note-symbol" aria-hidden="true">✳</span>
        <h3>Everyone has something to teach.</h3>
        <p>And something new to learn.</p>
        <RouterLink to="/explore">Explore skills ↗</RouterLink>
      </div>
      <div class="sidebar-footer">
        <span class="status-dot"></span> A little exchange. A lot of possibility.
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <span>Learn together. Grow together.</span>
        <div class="profile-div">
        <RouterLink to="/profile" class="profile-link">
          <span class="avatar" aria-hidden="true">{{
            currentUser?.username ? currentUser.username[0].toUpperCase() : '→'
          }}</span>
          {{ currentUser?.username ? `${currentUser.username} ↗` : 'Your profile ↗' }}
        </RouterLink>
        <button
          v-if="currentUser"
          type="button"
          class="button button-outline"
          :disabled="loggingOut"
          @click="handleLogout"
        >
          {{ loggingOut ? 'Logging out...' : 'Log out' }}
        </button>
        </div>
      </header>
      <main id="main-content" tabindex="-1"><RouterView /></main>
      <footer class="page-footer">
        <span>SkillSwap</span><span>Good things happen when we share.</span>
      </footer>
    </div>
  </div>
</template>
