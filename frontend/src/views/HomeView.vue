<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'

const stats = ref({
  total_topics: 3,
  total_questions: 312,
  total_quiz_attempts: 0,
})

onMounted(async () => {
  try {
    const liveStats = await api.getDashboardStats()
    stats.value = liveStats
  } catch (err) {
    // Keep defaults if backend offline
  }
})

const steps = [
  {
    number: '01',
    title: 'Utgå från det du kan',
    description: 'Gör ett quiz och upptäck hur mycket du redan kan.',
    path: '/explore',
    action: 'Testa dina kunskaper',
  },
  {
    number: '02',
    title: 'Hitta något nytt att utforska',
    description: 'Testa dina kunskaper inom anatomi, träningslära och fysiologi.',
    path: '/explore',
    action: 'Utforska kunskap',
  },
  {
    number: '03',
    title: 'Knyt en kontakt',
    description: 'Starta ett samtal och låt ett gemensamt intresse bli ett kunskapsutbyte.',
    path: '/messages',
    action: 'Öppna meddelanden',
  },
]
</script>

<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">DITT LÄRANDE BÖRJAR HÄR</p>
      <h1>Lite nyfikenhet kan ta dig långt.</h1>
      <p class="heading-description">
        Välkommen till din plats för att dela kunskaper och upptäcka nya.
      </p>
    </div>
    <span class="welcome-tag">Låt oss utvecklas tillsammans ↗</span>
  </div>

  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <span class="hero-label"
        ><span class="status-dot"></span> KUNSKAP VÄXER NÄR VI DELAR DEN</span
      >
      <h2 id="hero-title">Dina kunskaper.<br />Någon annans nästa<br /><em>stora upptäckt.</em></h2>
      <p>
        Lär ut det du brinner för. Lär dig det du är nyfiken på. Hitta din gemenskap genom
        kunskapsutbyte.
      </p>
      <div class="live-stats-bar">
        <div class="stat-box">
          <span class="num">{{ stats.total_topics }}</span>
          <span class="lbl">Ämnen</span>
        </div>
        <div class="stat-box">
          <span class="num">{{ stats.total_questions }}</span>
          <span class="lbl">Källbelagda frågor</span>
        </div>
        <div class="stat-box">
          <span class="num">{{ stats.total_quiz_attempts }}</span>
          <span class="lbl">Quizförsök</span>
        </div>
      </div>
      <RouterLink to="/explore" class="button button-accent"
        >Hitta något att lära dig <span aria-hidden="true">↗</span></RouterLink
      >
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="orbit orbit-one"></div>
      <div class="orbit orbit-two"></div>
      <span class="art-spark">✳</span>
      <div class="skill-tile tile-code"><span>&lt;/&gt;</span> Lite programmering</div>
      <div class="exchange-symbol">⇄</div>
      <div class="skill-tile tile-creative"><span>✎</span> Ett nytt perspektiv</div>
      <span class="art-caption">Olika kunskaper. Gemensamma möjligheter.</span>
    </div>
  </section>

  <section aria-labelledby="start-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">KÄNN DIG SOM HEMMA</p>
        <h2 id="start-title">Dina första steg</h2>
      </div>
      <span class="text-muted">Tre små steg. Oändliga möjligheter.</span>
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

  <section class="community-banner" aria-labelledby="community-title">
    <span class="community-symbol" aria-hidden="true">✳</span>
    <div>
      <h2 id="community-title">En gemenskap där alla kan bidra.</h2>
      <p>Du behöver inte vara expert för att ha något värdefullt att dela med dig av.</p>
    </div>
    <RouterLink to="/profile" class="button button-outline">Fyll i din profil ↗</RouterLink>
  </section>
</template>
