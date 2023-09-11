## 整理目的
分类整理，备注好每个项目的优点，预留一些使用上的可能性。

## AI 类
### ChatDev: 自然语言创建软件
[OpenBMB/ChatDev: Create Customized Software using Natural Language Idea (through Multi-Agent Collaboration) --- OpenBMB/ChatDev：使用自然语言理念创建自定义软件（通过多代理协作） (github.com)](https://github.com/OpenBMB/ChatDev)
- 未来发展的其中一个趋势，目前只能做简单的软件。使用自然语言开发软件，提供软件构建过程的综合日志，可用于重放。
- 非商业


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



## 其它
### CasaOS: 个人云
[IceWhaleTech/CasaOS: CasaOS - A simple, easy-to-use, elegant open-source Personal Cloud system. --- IceWhaleTech/CasaOS：CasaOS - 一个简单，易于使用，优雅的开源个人云系统。 (github.com)](https://github.com/IceWhaleTech/CasaOS)
	- 个人云，使用时纯 UI 交互，且数据所有权归个人。代码开源自由度高。可以把它当国内的腾讯云阿里云的个人版。随着硬件设备价格下降，应该会越来越香。不申请公网 `ip` 的话，配合 `natapp` 也挺舒服的。
	- [Apache-2.0 license](https://github.com/IceWhaleTech/CasaOS/blob/main/LICENSE)
	- ![](../assets/Pastedimage20230904193004.png)



