<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { navigation } from './router'
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
          v-for="item in navigation"
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
        <RouterLink to="/my-skills">Share your skills ↗</RouterLink>
      </div>
      <div class="sidebar-footer">
        <span class="status-dot"></span> A little exchange. A lot of possibility.
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <span>Learn together. Grow together.</span
        ><RouterLink to="/profile" class="profile-link"
          ><span class="avatar" aria-hidden="true">Y</span> Your profile ↗</RouterLink
        >
      </header>
      <main id="main-content" tabindex="-1"><RouterView /></main>
      <footer class="page-footer">
        <span>SkillSwap</span><span>Good things happen when we share.</span>
      </footer>
    </div>
  </div>
</template>
