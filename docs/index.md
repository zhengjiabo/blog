---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Knowledge Framework
  text: 知识框架梳理
  tagline: 使用 Obsidian 维护
  image:
    light: /img/logo/light.png
    dark: /img/logo/dark.png
  # actions:
  #   - theme: brand
  #     text: Markdown Examples
  #     link: /markdown-examples
  #   - theme: alt
  #     text: API Examples
  #     link: /api-examples

# features:
#   - title: Feature A
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature B
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature C
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

<script setup>
import { ref, onMounted } from 'vue'
const init =  () => {
  const theme = localStorage.getItem('vitepress-theme-appearance')
  if (!theme) {
    localStorage.setItem('vitepress-theme-appearance', 'dark')
  }
  window.difyChatbotConfig = { token: 'vV4NTVAUuNR5IhLL' }
  var script = document.createElement('script') 
  script.src = 'https://udify.app/embed.min.js'
  script.id = 'vV4NTVAUuNR5IhLL'
  script.defer = true
  script.onload = function() {
    embedChatbot()
    const btn = document.getElementById("dify-chatbot-bubble-button")
    btn.click()
  };
  document.head.appendChild(script)
}

onMounted(() => {
  init()
})
</script>
