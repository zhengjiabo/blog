const themeConfig = require('./config/theme/')

module.exports = {
  title: "Firefly",
  description: 'Enjoy when you can, and endure when you must.',
  dest: 'public/blog',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  theme: 'reco',
  themeConfig,
  markdown: {
    lineNumbers: true
  },
  plugins: ['@vuepress/medium-zoom', 'flowchart'],
  base: '/blog/'
}  