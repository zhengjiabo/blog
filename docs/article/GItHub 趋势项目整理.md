## 整理目的
分类整理，备注好每个项目的特点，预留一些使用上的可能性。

## AI 类
### ChatDev: 自然语言创建软件
[OpenBMB/ChatDev: Create Customized Software using Natural Language Idea (through Multi-Agent Collaboration) --- OpenBMB/ChatDev：使用自然语言理念创建自定义软件（通过多代理协作） (github.com)](https://github.com/OpenBMB/ChatDev)
- 未来发展的其中一个趋势，目前只能做简单的软件。使用自然语言开发软件，提供软件构建过程的综合日志，可用于重放。
- 非商业


### AIdea: 集合聊天和图像生成的 AI App
[mylxsw/aidea: AIdea 是一款支持 GPT 以及国产大语言模型通义千问、文心一言等，支持 Stable Diffusion 文生图、图生图、 SDXL1.0、超分辨率、图片上色的全能型 APP。 (github.com)](https://github.com/mylxsw/aidea)
- 移动端便捷，无电脑场景十分好用
- [MIT License](https://github.com/mylxsw/aidea/blob/main/LICENSE)
- ![](../assets/GItHub趋势项目整理-app.png)![](../assets/GItHub趋势项目整理-app2.png)

## 前端
### Astro: 专为速度而设计的一体化 Web 框架
[withastro/astro: The all-in-one web framework designed for speed. ⭐️ Star to support our work! --- withastro/astro：专为速度而设计的多合一Web框架。⭐️ 星星支持我们的工作！ (github.com)](https://github.com/withastro/astro)
- `Astro` 关注内容，十分注重速度，**尽可能利用服务器渲染**，默认生成**不含**客户端 `JS` 的网站。同时可以配合前端框架 [React](https://react.dev/)、[Preact](https://preactjs.com/)、[Svelte](https://svelte.dev/)、[Vue](https://vuejs.org/)等一起使用，会自动提前将它们渲染为 `HTML`，然后再除去所有 `JS`，使得网站十分迅速。部分 `html` 需要 `JS` 做交互，这种为客户端组件，也称为：**可响应岛屿**。
- 所以整个页面是个群岛，由多个岛屿组成。整个应用为**多页应用程序（MPA）**，也可以对接多个前端框架。
- [MIT License](https://github.com/withastro/astro/blob/main/LICENSE)
- [官方中文文档-为什么是 Astro? 🚀 Astro 文档](https://docs.astro.build/zh-cn/concepts/why-astro/)

### Bun: 快速 JavaScript 运行时、捆绑器、测试运行器和包管理器一体化工具
[oven-sh/bun: Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one --- oven-sh/bun：令人难以置信的快速 JavaScript 运行时、捆绑器、测试运行器和包管理器 - 合二为一 (github.com)](https://github.com/oven-sh/bun)

- 多合一工具包，旨在替代 `Node.js`，大大减少了启动时间和内存使用量，可以在现有的 Node.js 项目中使用，几乎不需要更改。
	- 转换器：可以运行 `.js/.ts/.cjs/.mjs/.jsx/.tsx`等（不需要 `tsc/babel/ts-node/tsx`)
	- 捆绑器：比 `esbuild` 快 1.75 倍，将 `js/ts` 捆绑压缩，生成用于浏览器和 node 等平台代码
	- 包管理器：安装比 `pnpm` 快 17 倍，执行脚本也是瞬间，替代 `npm/yarn/pnpm/lerna`。
	- 测试库：与 `Jest` 兼容的测试运行器，比 `Vitest` 快 13 倍，比 `Jest` 快 8 倍。支持快照测试、模拟和代码覆盖率。替代 `jest/ts-ject/vitest`
- [MIT License](https://bun.sh/docs/project/licensing)
> 可惜 2023-09-11时，Bun 还未提供原生 Windows 版本，在公司没法用。


### clean-code-javascript: 干净代码概念
[ryanmcdermott/clean-code-javascript: :bathtub: Clean Code concepts adapted for JavaScript --- ryanmcdermott/clean-code-javascript： 适用于JavaScript的Clean Code概念 (github.com)](https://github.com/ryanmcdermott/clean-code-javascript)
- 《Clean Code》一书，改编为JavaScript，作者从多年的集体经验中编纂出来。

### tldraw: 白板编辑器组件
[tldraw/tldraw: a very good whiteboard --- TLdraw/TLDRAW：一个非常好用的白板 (github.com)](https://github.com/tldraw/tldraw)
- 白板编辑器组件，功能挺好的。用于 React 项目
- [Apache License 2.0](https://github.com/tldraw/tldraw/blob/main/LICENSE)
- [官方文档 | tldraw docs](https://tldraw.dev/)
- ![](../assets/Pastedimage20230914233836.png)


### poster-design: 图片设计器
[palxiao/poster-design: 一款漂亮且功能强大的在线图片设计器，仿稿定设计，适用于多种场景：海报生成、电商产品图、文章长图、视频/公众号封面等，让设计更简单！A beautiful online image designer, suitable for various scenarios like generate posters, making design easier. (github.com)](https://github.com/palxiao/poster-design)
- [MIT License](https://github.com/palxiao/poster-design/blob/main/LICENSE)
- [在线体验 (palxp.cn)](https://design.palxp.cn/home)



## 书籍


### Hello: 书籍-算法
[krahets/hello-algo: 《Hello 算法》：动画图解、一键运行的数据结构与算法教程，支持 Java, C++, Python, Go, JS, TS, C#, Swift, Rust, Dart, Zig 等语言。 (github.com)](https://github.com/krahets/hello-algo)
- leetCode 上 C 神的书，提供在线文档和源码，在线文档有动画图解，覆盖多种语言，且源码中有详细打印辅助理解。
- [在线文档-Hello 算法 (hello-algo.com)](https://www.hello-algo.com/)
- ![](../assets/GItHub趋势项目整理-1.png)

### TypeScript: 书籍-阮一峰 TS 

[wangdoc/typescript-tutorial: TypeScript 教程 (github.com)](https://github.com/wangdoc/typescript-tutorial)
- TypeScript 开源教程，介绍基本概念和用法，面向初学者。
- [在线文档 - TypeScript 教程 - 网道 (wangdoc.com)](https://wangdoc.com/typescript/)


### 精益副业：程序员如何优雅地做副业
[easychen/lean-side-bussiness: 精益副业：程序员如何优雅地做副业 (github.com)](https://github.com/easychen/lean-side-bussiness)
引入「精益创业」流程，并优化「精益副业」流程，以实际案例为主，添加了「独立开发变现」和「网课变现实践」的内容。
- [在线文档 - 精益副业](http://r.ftqq.com/lean-side-bussiness/index.html)



## 其它
### CasaOS: 个人云
[IceWhaleTech/CasaOS: CasaOS - A simple, easy-to-use, elegant open-source Personal Cloud system. --- IceWhaleTech/CasaOS：CasaOS - 一个简单，易于使用，优雅的开源个人云系统。 (github.com)](https://github.com/IceWhaleTech/CasaOS)
	- 个人云，使用时纯 UI 交互，且数据所有权归个人。代码开源自由度高。可以把它当国内的腾讯云阿里云的个人版。随着硬件设备价格下降，应该会越来越香。不申请公网 `ip` 的话，配合 `natapp` 也挺舒服的。
	- [Apache-2.0 license](https://github.com/IceWhaleTech/CasaOS/blob/main/LICENSE)
	- ![](../assets/Pastedimage20230904193004.png)


### Resume-Matcher: 求职者跟踪系统
[srbhr/Resume-Matcher: Open Source Free ATS Tool to compare Resumes with Job Descriptions and create a score to rank them.  (github.com)](https://github.com/srbhr/Resume-Matcher)
- Applicant Tracking System（求职者跟踪系统）
- 将 `pdf` 简历与 `pdf` 职位描述进行比较，并创建一个分数进行排名，为您提供见解和建议。
- 找工作的可以反向操作，核对自己简历的问题加以修改。


### Home Assistant: 家庭助理
[home-assistant/core: :house_with_garden: Open source home automation that puts local control and privacy first. (github.com)](https://github.com/home-assistant/core)
- 一个开源家庭自动化项目，可用于 DIY，且注重保护本地控制和隐私。非常适合在树莓派或本地服务器上运行。家里有自动化需求可以接入，用的语言是 `Python`
- [Apache License 2.0]([core/LICENSE.md at dev · home-assistant/core (github.com)](https://github.com/home-assistant/core/blob/dev/LICENSE.md))
- [官方 DEMO (home-assistant.io)](https://demo.home-assistant.io/#/lovelace/0) | [官方 示例 (home-assistant.io)](https://www.home-assistant.io/examples/)
- ![](../assets/GItHub趋势项目整理.png)


