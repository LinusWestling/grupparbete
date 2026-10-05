<script setup>
import { RouterLink } from 'vue-router'
</script>
<template>
  <section class="empty-state surface">
    <p class="eyebrow">404 · PAGE NOT FOUND</p>
    <h1>Let’s get you back on track.</h1>
    <p>The page you’re looking for doesn’t exist.</p>
    <RouterLink to="/" class="button button-primary">Back to overview ↗</RouterLink>
  </section>
</template>
