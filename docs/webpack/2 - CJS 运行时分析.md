---
title: webpack - 2 | CJS 运行时分析
date: 2022-08-25
tags:
 - webpack
categories: 
 - webpack
---
## 总结
1. `require('xx')` 在理解上，可以把 `require` 等效替换为依赖包中 `module.exports` 后面的值。即 module.exports 后面内容是什么，require的结果就是什么。    
1. `exports = module.exports`，想要改写 exports 时不可以为 `exports` 直接赋值，因为是修改了 `exports` 的指向，与原本的 `modlue` 断开了联系。要用 module.exports 去赋值
   




## 提问
- [x] webpack 的模块加载器是如何实现的？      
    1. 利用缓存：利用 moduleId 去缓存 `__webpack_module_cache__` 中尝试命中缓存，有则返回缓存 `module.exports`。    
    1. 初始化：没有缓存则进行模块初始化，主要初始化模块的 `module.exports` 属性。        
    1. 执行并缓存：初始话后利用 moduleId 去所有模块的数组 `__webpack_modules__` 中取出模块，并将初始化模块 `module`、 `module.exports` 及 加载器 `__webpack_require__` 作为参数，执行模块并缓存      
    1. 最后返回 `module.exports`。 

- [x] webpack 的运行时代码做了那些事情？      
    1. 利用 AST 生成所有模块数组 `__webpack_modules__`，内部都是包裹函数。
    1. 生成缓存对象 `__webpack_module_cache__`
    1. 实现模块加载器 `__webpack_require__`，可以利用 `__webpack_module_cache__` 读取缓存，或直接从所有模块数组 `__webpack_modules__` 中取得模块执行并缓存
    1. 入口模块执行，即 0 号模块执行。
      
- [x] CommonJS 中，如果不实现 __webpack_module_cache__ 数据结构，即不对 module 进行缓存会有什么问题？      
    1. 模块将会被加载多次，每次引用模块都会去执行模块。可能破坏幂等性，有些模块是副作用函数，执行会直接或间接影响其他函数的执行。单次执行和多次执行产生不同结果。       
    1. 可能会导致内存泄漏 [一行 delete require.cache 引发的内存泄漏血案](https://zhuanlan.zhihu.com/p/34702356)。
       ```js
        // lib/module.js
        function updateChildren(parent, child, scan) {
              var children = parent && parent.children;
              if (children && !(scan && children.includes(child)))
              children.push(child);
        }
       ```
       删除缓存后，会导致每次执行都会新建一个 Module 实例，并且往父级中的 `children` 中推入该实例。执行越多，`children` 越大，里面包含了许多意义上无效的旧的 Module 实例。
  
- [x] 阅读 webpack 模块加载器代码，我们在 CommonJS 中使用 module.exports 与 exports 有何区别？     
exports = module.exports        
使用时，如果是需要改写整个 exports，使用 `module.exports` 赋值。如果使用了 `exports` 只是重写了 `exports` 的指向。


- [x] 如何理解 webpack 运行时代码最后是 __webpack_require__(0)      
入口模块，即 webpack 指定的入口文件代码。



## 1. 前提提要、场景
对一个最简单的静态资源打包，分析其运行时代码，了解整个运行时代码的过程。       



## 2. 静态资源文件
`index.js` 
```js
const sum = require('./sum')
console.log(sum(3, 8))
```

`sum.js`
```js
module.exports = (...args) => args.reduce((x, y) => x + y, 0)
```

`build.js`
```js
webpack({
  entry: './index.js',
  mode: 'none',
  output: {
    iife: false,
    pathinfo: 'verbose'
  }
}).run()
```


## 3. webpack 运行时代码
执行 `node build.js`，得到以下打包后的代码 
```js
/******/ var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/*!****************!*\
  !*** ./sum.js ***!
  \****************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = (...args) => args.reduce((x, y) => x + y, 0)

/***/ })
/******/ ]);
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__ */
const sum = __webpack_require__(/*! ./sum */ 1)

console.log(sum(3, 8))

})();


```


### 3.1 模块数组 __webpack_modules__
入口代码作为 0 号模块，即 `__webpack_modules__[0]`，其它引用模块从 1 开始存放。   
执行的模块，只要将返回值赋值给 `module.exports` 对象。如果需要整个替换，要使用 `module.exports` 而不是 `exports`，后者只是更改了形参的指向。
```js
// 维护一个所有模块的数组。
var __webpack_modules__ = ([
  // moduleId=0 的模块空缺，可理解为 index.js 即是0号模块
  ,
  // 每个模块都由一个包裹函数 (module, module.exports, __webpack_require__) 对模块进行包裹构成，这也是 CommonJS 模块的基础，详见 CommonJS 的 module wrapper
  ((module) => {
    // moduleId=1 的模块，即 sum.js，此处没有做任务代码转译的工作
    module.exports = (...args) => args.reduce((x, y) => x + y, 0)
  })
]);
```


### 3.2 模块加载器__webpack_require__ 和 缓存__webpack_module_cache__
单例模式，模块只会加载一次。       
对已加载过的模块进行缓存，对未加载过的模块初始化模块，主要是 `module.exports` 属性，初始化后利用执行 id 定位到 `__webpack_modules__` 中的包裹函数，执行返回 `module.exports` 并缓存。

```js
// 模块缓存
var __webpack_module_cache__ = {};

// 实现一个模块加载器，模拟实现 CommonJS 的 require
function __webpack_require__(moduleId) {
  var cachedModule = __webpack_module_cache__[moduleId];

  if (cachedModule !== undefined) {
    // 如果该模块存在缓存，则直接在缓存中读取模块的 exports
    return cachedModule.exports;
  }

  // 对该模块进行缓存，注意 module.exports 是引用对象
  var module = __webpack_module_cache__[moduleId] = {
    exports: {}
  };

  // 1. 执行模块内容，此时每一个模块是包裹函数，三个参数分别是 module、module.exports、__webpack_require__，详见 CommonJS 的包裹函数
  // 2. 在模块中执行 module.exports = xxx 的过程，将获取到模块的 exports，最后返回
  // 3. 此处容易得到在 CommonJS 中 module 与 exports 的关系
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

  // require 的过程，其实就是执行函数并得到 module.exports 的过程
  return module.exports;
}
```


### 3.3 入口模块执行
入口模块也可以视为 0 号模块，即 `__webpack_modules__[0]`
```js
var __webpack_exports__ = {}; // 全局

// 此处是一个立即执行函数
(() => {
  // 1. index.js，即入口文件的内容，直接执行
  // 2. 如果将 index.js 该模块视为 moduleId=0 的模块，则该立即执行函数等同于 __webpack_require__(0)
  // 3. 注意这里 require(sum) 时，已经变成了 require sum.js 的 moduleId
  const sum = __webpack_require__(/*! ./sum */ 1)
  sum(3, 8)
})();
```



## 4. webpack 运行时代码分析
1. `__webpack_modules__`：所有模块的数组。将入口模块解析为 AST，根据 AST 深度优先搜索所有的模块，并构建出这个模块数组。每个模块都由一个包裹函数 (`module`, `module.exports`, `__webpack_require__`) 对模块进行包裹。
1. `__webpack_require__(moduleId)`：模块加载器。对已加载过的模块进行缓存，对未加载过的模块初始化模块，主要是 `module.exports` 属性，初始化后利用执行 id 定位到 `__webpack_modules__` 中的包裹函数，执行返回 `module.exports` 并缓存。
1. `__webpack_require__(0)`: 运行第一个模块，即运行入口模块。
1. `__webpack_module_cache__`：模块缓存。确保每个模块只能被执行一次，在 HMR 时进行热加载时，将会清除对应的 moduleId 的缓存。


### 4.1 __webpack_require__(moduleId) 
`__webpack_require__(moduleId)` 的实现是模拟 `CommonJS` 的 `require`。          

例如 `node.js` 的内置 `require`，很相似：
1. 如果命中缓存，直接取缓存
1. 没命中则执行，并缓存
1. module.exports 与 exports 的关系实际上是 exports = module.exports




### 4.2 webpack runtime 精简版
```js
const __webpack_modules__ = [() => { console.log(10) }, /* 后续引用包 */]
const __webpack_module_cache__ = {} // 缓存
const __webpack_require__ = id => {
  const cachedModule = __webpack_module_cache__[id];
  if (cachedModule) { // 如果该模块存在缓存，则直接在缓存中读取模块的 exports
    return cachedModule.exports;
  }
  const module = { exports: {} } // 初始化
  const m = __webpack_module_cache__[id] = __webpack_modules__[id](module, __webpack_require__) // 执行并缓存
  return module.exports // 返回
}

__webpack_require__(0)
```




> 关于 webpack 运行时的所有变量可见源码：[https://github.com/webpack/webpack/blob/main/lib/RuntimeGlobals.js](https://github.com/webpack/webpack/blob/main/lib/RuntimeGlobals.js)





## 疑问
- [x] /* 0 */ 为什么 webpack 要跳过 0，从 1 **开始定义开发者的包**？      
      moduleId=0 的模块空缺，为入口模块，即入口模块为 0 号模块












