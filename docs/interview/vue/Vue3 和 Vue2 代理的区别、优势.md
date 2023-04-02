## 总结
1. 解决了无法监听【数组变化】和【增加对象属性】的问题。支持数组索引修改，增加对象属性
2. 性能更好，实现方面
	- Vue2: `Object.defineProperty` 给对象的【属性】添加 `getter` 和 `setter`，遇到嵌套对象时需要递归处理
	- Vue3: `Proxy` 一开始只代理最外层对象, 直接监听对象而非属性, 且实现嵌套对象的惰性监听 
	
	

## Vue 3 中的惰性监听
惰性监听（lazy by default）并不是 `Proxy` 的默认行为，而是指 Vue 3 在使用 `Proxy` 实现数据响应式时采用的策略。

嵌套对象（即对象中包含对象）默认不会被代理。当嵌套对象被访问时，Vue 3 才惰性地，为该对象添加代理。这种方式可以更加高效地处理大型的复杂对象，提高了性能和响应速度

以下是伪代码
```js
// 创建一个 WeakMap 对象，用于缓存已经代理过的对象及其代理对象
const reactiveMap = new WeakMap()

/**
 * 将一个 JavaScript 对象转换为响应式对象，并返回其代理对象。
 * 如果该对象已经被代理过，则直接返回其缓存的代理对象。
 * @param {Object} obj 要转换为响应式对象的原始 JavaScript 对象
 * @returns {Object} 返回转换后的响应式对象的代理对象
 */
function reactive(obj) {
  // 检查该对象是否已经存在于缓存中，如果是，则直接返回其代理对象
  if (reactiveMap.has(obj)) {
    return reactiveMap.get(obj)
  }

  // 定义拦截器对象，在 getter 中收集依赖项，在 setter 中触发更新
  const handler = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key)
      track(target, key) // 收集依赖
      return isObject(result) ? reactive(result) : result // 惰性监听 代理嵌套对象
    },
    // ...其他拦截器
  }

  // 创建一个新的代理对象，并将其添加到缓存中
  const observed = new Proxy(obj, handler)
  reactiveMap.set(obj, observed)

  // 返回新创建的代理对象
  return observed
}

```

