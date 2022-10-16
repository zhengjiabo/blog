---
title: webpack - 6 | ESM to CJS 
date: 2022-09-02
tags:
 - webpack
categories: 
 - webpack
---
## 总结
1. 虽然现代主流浏览器已支持 ESM，但在部分老旧的浏览器仍不支持，为了向下兼容，webpack 仍然会将 `ESM` 转化为 `CommonJS`，并注入到运行时代码。      
其实代码实现上，也不是转换成 `CJS`，而是转换为浏览器可以识别的更早规范 `ES5`（语言层级的规范，[浏览器支持程度很高，不支持的都基本被淘汰了](http://kangax.github.io/compat-table/es5/)）。只是代码实现形式上很贴合 `CJS` 转 `ES5` 的实现，在 `CJS` 转换 `ES5` 的基础上添加代码去实现 `ESM` 的特性。            
2. `__webpack_require__.r` 标记其为 ESM 模块 (暂时没找到 r 的单词)
3. `__webpack_require__.d` 定义其所有导出的值 (define)
4. `__webpack_require__.o` 判断是否实例的属性 (ownProperty)
5. `__webpack_require__` 与 `CJS` 的运行时一致，意味着执行的传参和 `CJS` 的运行时代码一致，依旧还是 module、module.exports、require。且模块返回还是 `module.exports`。
6. 执行的传参和 `CJS` 的运行时代码一致，只不过 `CJS` 是为 `module.exports` 添加数据属性或直接赋值为堆里的另一个引用地址。而 `ESM` 是为其添加访问器属性 getter。
7. `module_wrapper` 包裹函数内，对 `module.exports` 使用 `__webpack_require__.r` 进行标记，表示该模块已经处理过，且使用 `__webpack_require__.d` 定义其所有导出的访问器属性


## 提问
- [x] 对含 ESM 模块的 webpack 运行时代码进行调试与理解
- [x] webpack 含 ESM 的运行时代码做了那些事情        
    主体框架与 `CJS` 运行时代码一致。
    1. 利用 AST 生成所有模块数组 `__webpack_modules__`，内部都是包裹函数。
    2. 生成缓存对象 `__webpack_module_cache__`
    3. 实现模块加载器 `__webpack_require__`，可以利用 `__webpack_module_cache__` 读取缓存，或直接从所有模块数组 `__webpack_modules__` 中取得模块执行并缓存
    4. 入口模块执行，即 0 号模块执行。

    区别在于，模块加载器 `__webpack_require__` 函数扩展了以下三个方法：（在函数上扩展属性，目的是为了封装，且避免和模块内变量重名）
    1. `__webpack_require__.r` 标记其为 ESM 模块
    1. `__webpack_require__.d` 定义其所有导出的值 (define)
    1. `__webpack_require__.o` 判断是否实例的属性 (ownProperty)

    且每个模块，即每个包裹函数内，对 `module.exports` 使用 `__webpack_require__.r` 进行标记该模块已经处理过，且使用 `__webpack_require__.d` 定义其所有导出的访问器属性


- [x] __webpack_require__ 中的 d/r/o 各个变量指什么意思
1. `__webpack_require__.r` 标记其为 ESM 模块
1. `__webpack_require__.d` 定义其所有导出的值 (define)
1. `__webpack_require__.o` 判断是否实例的属性 (ownProperty)



## 1. 前提提要、场景
虽然现代主流浏览器已支持 ESM，但在部分老旧的浏览器仍不支持，为了向下兼容，webpack 仍然会将 `ESM` 转化为 `CommonJS`，并注入到运行时代码。      
其实代码实现上，也不是转换成 `CJS`，而是转换为浏览器可以识别的更早规范 `ES5`（语言层级的规范，[浏览器支持程度很高，不支持的都基本被淘汰了](http://kangax.github.io/compat-table/es5/)）。只是代码实现形式上很贴合 `CJS` 转 `ES5` 的实现，在 `CJS` 转换 `ES5` 的基础上添加代码去实现 `ESM` 的特性。           

`webpack` 是如何将 `ESM` 转化为 `CommonJS` 的，学习这个转换过程，有利于理解 `ESM` 的特性及其实现。







## 2. 导出转换
`ESM` 中，有 命名导出 和 默认导出 两种的方式，但在 `CJS` 中只有一种。     
所以需要进行转换
- `default` 转化为 `module.exports.default`
- `name` 转化为 `module.exports.name` 

```javascript
// esm 代码
import sum, { name } from './sum'
import * as s from './sum'

// 转化后的 cjs 代码
const s = require('./sum')
const sum = s.default
const name = s.name
```


## 3. 运行时代码分析


```javascript
/* webpack/runtime/define property getters */
(() => {
    // define getter functions for harmony exports
    // 定义 get 函数，实现 ESM 属性的只读引用，即属性懒加载
    __webpack_require__.d = (exports, definition) => {
        for(var key in definition) {
            // 判断是否实例的属性 且 未在exports中定义过
            // 目的：只使用 definition 实例的属性，为 exports 设置 getter，且不重复设置。
            if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
            }
        }
    };
})();

/* webpack/runtime/hasOwnProperty shorthand */
(() => {
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();

/* webpack/runtime/make namespace object */
(() => {
    // define __esModule on exports
    __webpack_require__.r = (exports) => {
        // 支持 Symbol，也设置 Symbol.toStringTa， Object.prototype.toString() 方法会去读取这个标签并把它包含在自己的返回值里
        if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        // 设置 exports 的 __esModule 字段为 true，即标记为 ESM 模块
        Object.defineProperty(exports, '__esModule', { value: true });
    };
})();
```




### 3.1 __webpack_require__.r  标记是一个 ESM 模块
暂时不知道 r 是哪个单词的缩写。
```javascript
/* webpack/runtime/make namespace object */
(() => {
    // define __esModule on exports
    __webpack_require__.r = (exports) => {
        // 支持 Symbol，也设置 Symbol.toStringTa， Object.prototype.toString() 方法会去读取这个标签并把它包含在自己的返回值里
        if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        // 设置 exports 的 __esModule 字段为 true，即标记为 ESM 模块
        Object.defineProperty(exports, '__esModule', { value: true });
    };
})();
```




### 3.2 __webpack_require__.d  定义 get 函数(define)
```javascript
/* webpack/runtime/define property getters */
(() => {
    // define getter functions for harmony exports
    // 定义 get 函数，实现 ESM 属性的只读引用，即属性懒加载
    __webpack_require__.d = (exports, definition) => {
        for(var key in definition) {
            // 判断是否实例的属性 且 未在exports中定义过
            // 目的：只使用 definition 实例的属性，为 exports 设置 getter，且不重复设置。
            if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
            }
        }
    };
})();
```



### 3.3 __webpack_require__.o 判断是否实例的属性(OwnProperty)
```javascript
/* webpack/runtime/hasOwnProperty shorthand */
(() => {
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
```







### 3.4 Symbol.toStringTag 设定 Object.prototype.toString 返回值
`Object.prototype.toString()` 方法会去读取 `Symbol.toStringTag` 并把它包含在自己的返回值里
```javascript
var t = {}
Object.prototype.toString.call(t) // '[object Object]'
Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' });
Object.prototype.toString.call(t) // '[object Module]'
```




### 3.5 运行时代码分析
`sum.js`
```javascript
// 源码
const sum = (...args) => args.reduce((x, y) => x + y, 0)

export default sum
export const name = 'sum'

// 运行时代码
// 该模块被 module_wrapper 包裹，依旧还是 module、module.exports、require
((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    // 1. 标记该模块是一个 ESM 模块
  __webpack_require__.r(__webpack_exports__);

    // 2. 导出所有的属性，即 __webpack_exports__，但通过 getter/setter 方式，可以懒加载属性
  __webpack_require__.d(__webpack_exports__, {
    "default": () => (__WEBPACK_DEFAULT_EXPORT__),
    "name": () => (/* binding */ name)
  });

    // 3. 执行代码，配置 getter/setter 的属性
  const sum = (...args) => args.reduce((x, y) => x + y, 0)

    // 即 export default
  const __WEBPACK_DEFAULT_EXPORT__ = (sum);

  const name = 'sum'
})
```

`index.js`
```javascript
// 源码
import sum, { name } from './sum'
import * as s from './sum'

console.log(sum(3, 4))
console.log(name)
console.log(s)


// 运行时代码
(() => { // webpackBootstrap
	"use strict";
	var __webpack_modules__ = ([
    /* 0 */,
    /* 1 */((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
        "default": () => (__WEBPACK_DEFAULT_EXPORT__),
        "name": () => (/* binding */ name)
    });
    const sum = (...args) => args.reduce((x, y) => x + y, 0)

    /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sum);

    const name = 'sum'
    })
	]);


/************************************************************************/
  // 缓存都和 CJS 的运行时代码一致
	// The module cache
	var __webpack_module_cache__ = {};
	
	// The require function
  // require 与 CJS 的运行时一致
	function __webpack_require__(moduleId) {
		// Check if module is in cache
		var cachedModule = __webpack_module_cache__[moduleId];
		if (cachedModule !== undefined) {
			return cachedModule.exports;
		}
		// Create a new module (and put it into the cache)
		var module = __webpack_module_cache__[moduleId] = {
			// no module.id needed
			// no module.loaded needed
			exports: {}
		};
	
		// Execute the module function
    // 执行的传参和 CJS 的运行时代码一致，依旧还是 module、module.exports、require
    // 执行的传参和 `CJS` 的运行时代码一致，依旧还是 module、module.exports、require。只不过 `CJS` 是为 `module.exports` 添加数据属性或直接整个改写赋值。而 `ESM` 是为其添加访问器属性 getter。
		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
	
		// Return the exports of the module
		return module.exports; // 还是返回模块的 module.exports
	}
	
/************************************************************************/
	/* webpack/runtime/define property getters */
	(() => {
		// define getter functions for harmony exports
		__webpack_require__.d = (exports, definition) => {
			for(var key in definition) {
				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
				}
			}
		};
	})();
	
	/* webpack/runtime/hasOwnProperty shorthand */
	(() => {
		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
	})();
	
	/* webpack/runtime/make namespace object */
	(() => {
		// define __esModule on exports
		__webpack_require__.r = (exports) => {
			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
			}
			Object.defineProperty(exports, '__esModule', { value: true });
		};
	})();
	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
var _sum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1); // 得到模块的 module.exports

console.log((0,_sum__WEBPACK_IMPORTED_MODULE_0__["default"])(3, 4)) // 取得模块的访问器属性 default
console.log(_sum__WEBPACK_IMPORTED_MODULE_0__.name) // 取得模块的访问器属性 name
console.log(_sum__WEBPACK_IMPORTED_MODULE_0__)

})();

/******/ })()
;
```
1. `__webpack_require__` 与 `CJS` 的运行时一致，意味着执行的传参和 `CJS` 的运行时代码一致，依旧还是 module、module.exports、require。且模块返回还是 `module.exports`。
2. 执行的传参和 `CJS` 的运行时代码一致，只不过 `CJS` 是为 `module.exports` 添加数据属性或直接整个改写赋值。而 `ESM` 是为其添加访问器属性 getter。





## 疑问
- [ ] 











