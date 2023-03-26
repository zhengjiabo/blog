---
title: questions 
date: 2022-07-19
tags:
 - 计算机
categories: 
 - article
---

# 问题集

## OPTIONS 预检请求过多，如何减少？
`access-control-max-age` 控制 `OPTIONS` 缓存时间 1 年

跨域请求， `GET` 以外非简单请求，如 `POST`，`content-type` 为 `application/json` 复杂型都会发送 `OPTIONS`


## JSONP
通过 `script` 标签加载跨域脚本，跨域脚本执行 `callback` 的形式实现跨域获取数据. 本质是 `script` 的 `src` 可以绕过同源策略. 允许页面引入第三方资源，当然可以通过 `Content-Security-Policy（CSP）` 进行限制
`JSONP` 场景：
1. 跨域
2. `webpack` 代码懒加载, 路由懒加载 `array.push` 重封装


## CICD
持续集成，持续部署, 自动化操作. 利用托管平台的钩子，优化开发流程，自动执行校验、打包、发布

- `git hooks` -> local
- `web hooks` 
  - `push`
  - `pull`
  
## 雪碧图
多个图片合一，减少请求
`webpack` 小图片转 `Data URL`: `Base64`


## Base64 为什么体积增加
增加大概三分之一
- 每一个 `utf-8` 字符: `8bit`
- 每一个 `Base64` 字符: `6bit`(`2^6=64`)

 `3` 个 `utf8` 字符，用了 `24` 位二进制表示，转 `Base64` 时，每一个 `Base64` 字符是 `6` 位二进制，需要 `4` 个 `Base64` 字符才能表示完这 `24` 位 。这 `4` 个 `Base64` 字符最终还是需要 `utf8` 存储. 增大了 `(4-3)/3 = 1/3`


## 图片懒加载
是否在视图窗口内
- `Intersection Observer API`
  - `prefetch` 预加载，视图内提前加载, 方便跳转

```js
const intersectionObserver = new IntersectionObserver((entries) => {
  // 如果 intersectionRatio 为 0，则目标在视野外，
  // 我们不需要做任何事情。
  if (entries[0].intersectionRatio <= 0) return;

  loadItems(10);
  console.log('Loaded new items');
});
// 开始监听
intersectionObserver.observe(document.querySelector('.scrollerFooter'));
```










