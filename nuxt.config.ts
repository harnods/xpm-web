export default defineNuxtConfig({
  compatibilityDate: '2025-05-26',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/transactions': { redirect: '/transactions/claims' },
    '/purchasing': { redirect: '/purchasing/purchases' },
    '/approval': { redirect: '/approval/claims' },
    '/policies': { redirect: '/policies/claims' },
    '/cards': { redirect: '/cards/virtual-cards' },
    '/workflows': { redirect: '/workflows/claims' },
    '/integrations': { redirect: '/integrations/add-ons' },
    '/settings': { redirect: '/settings/custom-fields' },
  },
  postcss: {
    plugins: {
      '@mekari/pixel3-postcss': {
        include: [
          './pages/**/*.{js,ts,vue}',
          './components/**/*.{js,ts,vue}',
          './layouts/**/*.{js,ts,vue}',
          './app.vue',
        ],
      },
    },
  },
  app: {
    head: {
      title: 'Mekari Expense',
      htmlAttrs: {
        'data-panda-theme': 'next',
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
        },
      ],
    },
  },
})
