---
title: webpack - 7 | code spliting 运行时分析
date: 2022-09-05
tags:
 - webpack
categories: 
 - webpack
---
## 总结




## 提问
- [x] 


## 1. 前提提要、场景
在项目性能优化时，常讲到 `code spliting` 代码分割用以分包。通过 `import()` 动态导入实现懒加载。         
```js
// index.js 内容
import('./sum').then(m => {
  console.log(m.default(3, 4))
})

// 第二次 import() 时不会再次加载 chunk
import('./sum').then(m => {
  console.log(m.default(3, 4))
})


// sum.js
const sum = (...args) => args.reduce((x, y) => x + y, 10)

export default sum
```





## 2. 导出转换

```js
/* 加载入口文件，加载更多 chunk */
__webpack_require__.e = (chunkId) => {
	return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
		__webpack_require__.f[key](chunkId, promises);
		return promises;
	}, []));
};

// JSONP chunk loading for javascript
/* JSONP 加载 chunk */
__webpack_require__.f.j = (chunkId, promises) => {
  /* codes */
  __webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
  /* codes */
}

// loadScript function to load a script via script tag
// 通过 script 标签加载脚本，这也是 jsonp 的关键
__webpack_require__.l = (url, done, key, chunkId) => {
  var onScriptComplete = (prev, event) => {
		// avoid mem leaks in IE.
		script.onerror = script.onload = null;
		clearTimeout(timeout);
		var doneFns = inProgress[url];
		delete inProgress[url];
		script.parentNode && script.parentNode.removeChild(script);
		doneFns && doneFns.forEach((fn) => (fn(event)));
		if(prev) return prev(event);
	};
	var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
	script.onerror = onScriptComplete.bind(null, script.onerror);
	script.onload = onScriptComplete.bind(null, script.onload);
	needAttach && document.head.appendChild(script); // script 标签
}

```


```js
// install a JSONP callback for chunk loading
var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
	var [chunkIds, moreModules, runtime] = data;
	// add "moreModules" to the modules object,
	// then flag all "chunkIds" as loaded and fire callback
	var moduleId, chunkId, i = 0;
	if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
		for(moduleId in moreModules) {
			if(__webpack_require__.o(moreModules, moduleId)) {
				__webpack_require__.m[moduleId] = moreModules[moduleId];
			}
		}
		if(runtime) var result = runtime(__webpack_require__);
	}
	if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
	for(;i < chunkIds.length; i++) {
		chunkId = chunkIds[i];
		if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
			installedChunks[chunkId][0]();
		}
		installedChunks[chunkId] = 0;
	}

}
var chunkLoadingGlobal = self["webpackChunkexamples"] = self["webpackChunkexamples"] || [];
chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal)); // 数组实例添加了 push 方法
```

## 疑问
- [ ] 











