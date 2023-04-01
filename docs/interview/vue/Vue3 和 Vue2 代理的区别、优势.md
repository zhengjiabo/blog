## 总结
1. 解决里无法监听【数组变化】和【对象属性的增加】的问题。支持数组索引修改，对象属性的增加
2. 性能更好，实现方面
	Vue2: `Object.defineProperty` 给对象的属性添加 `getter` 和 `setter`，遇到嵌套对象时需要递归
	Vue3: `Proxy` 直接监听对象而非属性, 且实现嵌套对象惰性监听 . 
	
	

## Vue 3 中的惰性监听
惰性监听（lazy by default）并不是 `Proxy` 的默认行为，而是指 Vue 3 在使用 `Proxy` 实现数据响应式时采用的策略。

嵌套对象（即对象中包含对象）默认不会被代理。当嵌套对象被访问时，Vue 3 才惰性地，为该对象添加代理。这种方式可以更加高效地处理大型的复杂对象，提高了性能和响应速度

以下是伪代码
```js
function reactive(obj) {
  const handler = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key)
      track(target, key) // 记录属性的访问情况
      return isObject(result) ? reactive(result) : result // 递归地代理嵌套对象
    },
    // ...其他拦截器
  }
  return new Proxy(obj, handler)
}
```