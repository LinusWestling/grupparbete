<script setup>
import { RouterLink } from 'vue-router'
defineProps({ title: String, description: String, icon: String })
</script>
<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">YOUR WORKSPACE</p>
      <h1>{{ title }}</h1>
      <p class="heading-description">{{ description }}</p>
    </div>
  </div>
  <section class="empty-state surface">
    <span class="empty-icon" aria-hidden="true">{{ icon }}</span
    ><span class="welcome-tag">Coming soon</span>
    <h2>This space is taking shape.</h2>
    <p>We’re getting things ready. Come back soon to start your next skill exchange.</p>
    <RouterLink to="/" class="button button-primary">Back to overview ↗</RouterLink>
  </section>
</template>
