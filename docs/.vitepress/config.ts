import { defineConfig } from 'vitepress'
import nav from './generate/nav.json' assert {type: 'json'};
import sidebar from './generate/nav.json' assert {type: 'json'};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Knowledge Framework",
  description: "知识框架梳理",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      ...nav
    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],
    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zhengjiabo/blog' }
    ]
  }
})
