<script setup>
import { RouterLink } from 'vue-router'
</script>
<template>
  <section class="empty-state surface">
    <p class="eyebrow">404 · SIDAN HITTADES INTE</p>
    <h1>Hitta tillbaka till rätt sida.</h1>
    <p>Sidan du söker finns inte.</p>
    <RouterLink to="/" class="button button-primary">Tillbaka till översikten ↗</RouterLink>
  </section>
</template>
