const themeConfig = require('./config/theme/')
const argv = require('minimist')(process.argv.slice(2));
const dest = argv.d ? argv.d : 'public/blog/';
const base = dest.replace('public', '') || undefined

module.exports = {
  title: "Firefly",
  description: 'Enjoy when you can, and endure when you must.',
  dest,
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
  base
}  