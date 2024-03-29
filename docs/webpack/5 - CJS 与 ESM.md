---
title: webpack - 5 | CJS 与 ESM
date: 2022-08-31
tags:
 - webpack
categories: 
 - webpack
---
## 总结
1.  CJS：Node 中的模块规范，可运行在 Node 环境、webpack 环境，不可运行在浏览器
2.  ESM：一个模块化规范，ECMAScript 语言层规范，可运行在 Node 环境、浏览器。
3.  编译时和运行时：
    1. `require` 运行时代码，可以接收变量实现动态加载模块。
    2. `import` 编译时代码，编译过程时变量都还没赋值，不可接收变量无法动态加载模块。`ESM` 为了实现动态加载模块，便有了 `import()` 函数 API。
    3. `import()` 运行时代码，可以接收变量实现动态加载模块。
4. `ESM` 是未来的趋势，逐渐从 `CJS` 模块向 `ESM` 转化。
5. `ESM` 导出不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。而在 webpack 中会将 `ESM` 转换成 `CJS`，去实现其特性。因为在部分老旧的浏览器仍不支持，转换成 `CJS` 为了向下兼容。         
   其实代码实现上，也不是转换成 `CJS`，而是转换为浏览器可以识别的更早规范 `ES5`（语言层级的规范）。只是代码实现形式上很贴合 `CJS` 的 `ES5` 实现，在 `CJS` 转换 `ES5` 的基础上添加代码去实现 `ESM` 的特性。 



## 提问
- [x] 什么是 ESM/CJS     
ESM：一个模块化规范，ECMAScript 语言层规范，可运行在 Node 环境、浏览器。
CJS：Node 中的模块规范，可运行在 Node 环境、webpack 环境，不可运行在浏览器


- [x] 什么是 import(module)
1. `require` 运行时代码，可以接收变量实现动态加载模块。
2. `import` 编译时代码，编译过程时变量都还没赋值，不可接收变量无法动态加载模块。`ESM` 为了实现动态加载，便有了 `import()` 函数 API。
3. `import()` 运行时代码，可以接收变量实现动态加载模块。尽量不要滥用（因为无法被Tree Shaking，与 CJS 一样）



## 1. CJS (CommonJS)
`CJS` 是 Node 中的模块规范，通过 `require` 及 `exports` 进行导入导出 (`exports.xxx = yyy` 属于 commonjs1，`module.exports` 属于 commonjs2)。 利用闭包，实现私有化且通过暴露出来的对象，可以访问到模块内的数据和方法。          

可以运行在
- Node 环境
- webpack 环境

不可在浏览器中直接使用，一般前端项目是通过 webpack 打包转换 `CJS` 为 ES5（语言层级的规范），才可以在浏览器中使用。       

由于 `require` 是运行时代码，可直接 `require` 一个变量。所以 `CJS` 可以动态加载
```js
require(`./${a}`)
```


## 2. ESM (ES Module)
`ESM` 是 tc39 对于 ECMAScript 的模块化规范，正因是语言层规范，因此在 Node 及 浏览器中均会支持。

ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。

使用 import/export 进行模块导入导出。
```js
// sum.js
export const sum = (x, y) => x + y

// index.js
import { sum } from './sum'
```
两种导出
- 具名导出/导入: `Named Import`/Export
- 默认导出/导入: `Default Import`/Export

```js
// 默认导出 只能有 1 个
export default function () {
  console.log('foo');
}

// 命名单独导出
export var firstName = 'Michael';

// 或者
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;
export { firstName, lastName, year };
```


`ESM` 为静态导入，正因如此，可在编译期进行 `Tree Shaking`，减少 js 体积。    

如果需要动态导入，tc39 为动态加载模块定义了 API: `import(module)` 。
```js
const {default: arrayUniq} = await import('https://cdn.jsdelivr.net/npm/array-uniq/index.js')

arrayUniq([1,1,2,2,2,3]) // [1, 2, 3]
```

`ESM` 是未来的趋势，目前一些 CDN 厂商，前端构建工具均致力于 `CJS` 模块向 `ESM` 的转化，比如 `skypack`、`vite` 等。         
目前，在浏览器与 Node.js 中均原生支持 `ESM`。





## 3. 简单对比 

|              | CJS            | ESM               |
| ------------ | -------------- | ----------------- |
| 加载时机     | 运行时（动态） | 编译时（静态）    |
| 导出值方式   | 值的拷贝       | 值的引用          |
| Tree Shaking | false          |true               |

- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。
  >  CommonJS 加载的是一个对象（即module.exports属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。     
  ES6 遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。ES6 的import有点像 Unix 系统的“符号连接”，原始值变了，import加载的值也会跟着变。因此，ES6 模块的属性是动态引用，并且不会缓存值，执行时根据这个只读引用去制定模块获取现在的值。该引用是只读的，不能重新赋值，这就好比main.js创造了一个名为obj的const变量
- CommonJS 模块的 `require()` 是同步加载模块，ES6 模块的 `import` 命令是异步加载，有一个独立的模块依赖的解析阶段。



更多差异参考[文档](https://es6.ruanyifeng.com/#docs/module-loader#ES6-%E6%A8%A1%E5%9D%97%E4%B8%8E-CommonJS-%E6%A8%A1%E5%9D%97%E7%9A%84%E5%B7%AE%E5%BC%82)


Tree Shaking（摇树）
- CJS：动态导入，不可以进行 Tree Shaking。由于是在运行时才加载模块，编译时无法确定哪个模块被加载。
- ESM：静态导入，可以进行Tree Shaking。在编译时可以确定哪些模块被加载，进而筛掉不加载的模块，减少代码体积与运行时的加载速度。

## 疑问
- [x] 阮一峰老师说的 "ES6 模块的 import 命令是异步加载，有一个独立的模块依赖的解析阶段。"，如何理解它的 "异步加载"，import() Api 才是异步不是吗，可能指解析阶段就是异步加载？但又不太可能            
它是先构建、实例化，最后才是执行。所以，可以理解为执行是异步的。          
[https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)             
[中文版 https://segmentfault.com/a/1190000014318751](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)









