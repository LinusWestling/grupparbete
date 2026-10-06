<script setup>
import { RouterLink } from 'vue-router'
import ApiExample from '../components/ApiExample.vue'
const steps = [
  {
    number: '01',
    title: 'Bring what you know',
    description: 'From coding to cooking, your everyday skills could make someone’s day.',
    path: '/my-skills',
    action: 'Add a skill',
  },
  {
    number: '02',
    title: 'Find your next curiosity',
    description: 'Discover something you’ve always wanted to try and people to learn from.',
    path: '/explore',
    action: 'Explore skills',
  },
  {
    number: '03',
    title: 'Make a connection',
    description: 'Start a conversation and turn a shared interest into a skill exchange.',
    path: '/messages',
    action: 'Open messages',
  },
]
</script>
<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">YOUR LEARNING STARTS HERE</p>
      <h1>A little curiosity goes a long way.</h1>
      <p class="heading-description">
        Welcome to your space for sharing skills and discovering new ones.
      </p>
    </div>
    <span class="welcome-tag">Let’s grow together ↗</span>
  </div>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <span class="hero-label"><span class="status-dot"></span> KNOWLEDGE IS BETTER SHARED</span>
      <h2 id="hero-title">Your skills.<br />Someone’s next<br /><em>big thing.</em></h2>
      <p>
        Teach what you love. Learn what you’re curious about. Find your people, one skill at a time.
      </p>
      <RouterLink to="/explore" class="button button-accent"
        >Find a skill to learn <span aria-hidden="true">↗</span></RouterLink
      >
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="orbit orbit-one"></div>
      <div class="orbit orbit-two"></div>
      <span class="art-spark">✳</span>
      <div class="skill-tile tile-code"><span>&lt;/&gt;</span> A little coding</div>
      <div class="exchange-symbol">⇄</div>
      <div class="skill-tile tile-creative"><span>✎</span> A new perspective</div>
      <span class="art-caption">Different skills. Shared possibilities.</span>
    </div>
  </section>
  <section aria-labelledby="start-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">MAKE YOURSELF AT HOME</p>
        <h2 id="start-title">Your first steps</h2>
      </div>
      <span class="text-muted">Three small steps. Endless possibilities.</span>
    </div>
    <div class="step-grid">
      <article v-for="step in steps" :key="step.number" class="step-card">
        <span class="step-number">{{ step.number }}</span>
        <h3>{{ step.title }}</h3>
        <p>{{ step.description }}</p>
        <RouterLink :to="step.path">{{ step.action }} <span aria-hidden="true">↗</span></RouterLink>
      </article>
    </div>
  </section>
  <ApiExample />
  <section class="community-banner" aria-labelledby="community-title">
    <span class="community-symbol" aria-hidden="true">✳</span>
    <div>
      <h2 id="community-title">A community built on give and take.</h2>
      <p>You don’t have to be an expert to have something worth sharing.</p>
    </div>
    <RouterLink to="/profile" class="button button-outline">Set up your profile ↗</RouterLink>
  </section>
</template>
