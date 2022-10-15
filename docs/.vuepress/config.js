/* import { viteBundler } from 'vuepress' */
import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import generateSidebar from './generate/sidebar.json' assert {type: 'json'};

export const navbar = [
  { text: '主页', link: '/' },
  { text: '前端部署', link: '/views/docker/' },
  { text: 'Linux', link: '/views/linux/' },
  { text: 'Http', link: '/views/http/' },
  { text: 'Vue', link: '/views/vue/' },
  {
    text: '更多',
    children: [
      { text: '其他杂文', link: '/views/article/' },
    ],
  },
]

const sidebar = {
  ...generateSidebar
}


export default defineUserConfig({
  lang: 'zh-CN',
  base: '/blog/',
  title: 'Firefly',
  description: 'Enjoy when you can, and endure when you must.',
  head: [
    ['link', { rel: 'shortcut icon', href: '/images/favicon.ico', type: 'image/x-icon' }],
  ],
  shouldPrefetch: () => true, // 控制对于哪些文件，是需要生成 <link rel="prefetch"> 资源提示的
  theme: defaultTheme({
    repo: 'zhengjiabo/blog', // 将会自动在每个页面的导航栏生成生成一个 GitHub 链接，以及在页面的底部生成一个 "Edit this page" 链接。
    navbar,
    sidebar,
    editLink: false
  }),
  /*  bundler: viteBundler({ // 自定义打包器
    vuePluginOptions: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'center',
        },
      },
    },
  }), */
})