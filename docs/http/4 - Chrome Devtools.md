---
title: Chrome Devtools
date: 2022-12-11
tags:
 - http
categories: 
 - http
---



## 提问
- [x] 1. 在开发环境调试 `HTTP` 请求时，如何只筛选出 `localhost` 上的所有请求
    > 过滤工具中输入 `domain:localhost`
- [x] 2. 控制台左下角，`transformed size` 与 `resource size` 有何区别
    > - `transformed size`: 资源压缩传输后体积大小      
    > - `resource size`: 资源压缩前体积大小      
- [x] 3. 如何看出某个网站首页加载了多少个请求
    > 底部状态最左边有总请求次数
- [x] 4. 如何在控制台中显示 `HTTP` 协议一列
    > `window` 的 `Chrome` 网络列表头右键，显示协议






## 1. 前提提要、场景
浏览器作为我们常用的 `HTTP Client`，熟悉浏览器的网络调试有利于我们开发。

本篇文章讲解 `Chrome` 浏览器的几个高频操作，如果想要更详细的讲解，可查看官方文档 [ Inspect network activity ](https://developer.chrome.com/docs/devtools/network/#search)(需要魔法）。



## 2. Header Options

在网络面板中，列表头右键，点击 `Header Options`，可网络面板中显示更多选项列。       
为了方便后续学习，建议添加以下选项

- `Protocol`：`HTTP` 协议版本号
- `Content-Length`：响应体大小
- `Content-Encoding`：响应体编码
- `Content-Type`: 响应内容类型
- `Cache-Control`: 缓存控制

![](../assets/1s17.png)



## 2. Filter 过滤工具

![](../assets/2s14.png)
1. `/[cj]s/`：直接输入正则表达式对资源进行筛选
2. `domain:<domain>`：根据域名进行筛选
3. `method`：根据请求方法进行筛选
4. `status-code`：根据状态码进行筛选，它会自动补充所有资源的状态码，可以利用此特性查看该网站资源有多少状态码。
5. `larger-than:<size>`：筛选大于指定体积的资源，如 `larger-than:100k`
6. `has-response-header:<header>`：筛选包含某响应头，如 `has-response-header:cache-control`
7. `mime-type`：根据指定 MIME 类型进行筛选

> 由于过滤工具有补全功能，可以利用此特性查看该网站资源所拥有各自报文字段。如 `method`、`status-code` 或 `has-response-header` 补全的所有响应头



## 3. 底部状态栏

![](../assets/3s10.png)
1. 开启设置，使用大请求行可以看到每个请求资源压缩后传输大小、资源压缩前大小。
2. 底部依次可以看到总请求次数、总压缩传输大小、总压缩前大小



