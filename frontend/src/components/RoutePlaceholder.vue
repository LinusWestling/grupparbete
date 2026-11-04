<script setup>
import { RouterLink } from 'vue-router'
defineProps({ title: String, description: String, icon: String })
</script>
<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">DIN ARBETSYTA</p>
      <h1>{{ title }}</h1>
      <p class="heading-description">{{ description }}</p>
    </div>
  </div>
  <section class="empty-state surface">
    <span class="empty-icon" aria-hidden="true">{{ icon }}</span
    ><span class="welcome-tag">Kommer snart</span>
    <h2>Här är något nytt på gång.</h2>
    <p>Vi förbereder sidan. Kom tillbaka snart för att dela kunskap med andra.</p>
    <RouterLink to="/" class="button button-primary">Tillbaka till översikten ↗</RouterLink>
  </section>
</template>
