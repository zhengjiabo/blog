---
title: 如何将项目变成一个npm包提交
date: 2021-08-31
tags:
 - npm      
categories: 
 - frontEnd
---

## 场景
公司的网络有限制，没法直连github，想在公司闲时写写文档却被掐住了喉咙。突然发觉前端安装依赖不就是拉了个项目过来吗，通过npm安装依赖包的形式，可以拉到最新版代码，所以想把此博客项目作为npm包发布上去，去公司安装此依赖包。


## 操作
1. 前往[npm官网注册](https://www.npmjs.com/)一个账号。
2. 去到要发布的项目目录，输入`npm login`进行登录
3. 输入`npm publish`进行发布，发布的包名是取`package.json`里的`name`
4. 如果出现了`+xxxx@x.x.x`那就是发布成功了。
5. 新建一个目录，执行 `npm init` 和 `npm install xxxx`。看看是否发布成功

## 
参考了**手把手教你用npm发布包**[<sup>1</sup>](#refer-anchor-1)

### 错误流
- 403 Forbidden - PUT *** - Forbidden

  这种情况就是刚注册了npm账号，还没去邮箱验证。验证可解决。

## 体会
说实在的，有点顺畅，没想到这么快搞好了。果然没接触过就觉得很难，人总害怕未知事物，好在现在目的实现了。可以摸鱼了~

## 参考资料
<div id="refer-anchor-1"></div>

- [1] [手把手教你用npm发布包：https://blog.csdn.net/taoerchun/article/details/82531549](https://blog.csdn.net/taoerchun/article/details/82531549)



