


## 总结

-  Vue 2 中: `nextTick` 函数尝试使用 microtask（微任务），不支持再使用 macrotask（宏任务）。顺序如下
	1.  `Promise`
	2.  `MutationObserver`
	3.  `setImmediate`
	4.  `setTimeout`


- Vue 3: `nextTick` 函数只能返回 `Promise`

虽然两者的实现方式有所不同，但它们的目的是相同的：在组件更新后，异步地执行某些操作，例如访问 DOM 元素。

基础概念推荐文档：[nextTick | Vue3 (vue3js.cn)](https://vue3js.cn/global/nextTick.html)

## vue 2 

口语化：
nextTick 函数会把回调函数推入一个数组中，如果当前浏览器不支持 `Promise` 和 `MutationObserver`，会退回到使用 `setImmediate` / `setTimeout` 创建宏任务，在==下一个事件循环？==中执行这些回调函数。在执行回调函数时，如果出现错误会捕获。如果 Promise 可用，nextTick 函数也可以返回一个 Promise，以便在回调函数执行完成后进行链式调用。

在 Vue 2 中，`nextTick` 函数尝试使用 microtask（微任务），如 `Promise` 或 `MutationObserver` 创建微任务，并将回调函数添加到微任务队列中，以便在当前 macrotask（宏任务）执行完毕后立即执行该回调函数。
如果当前浏览器不支持 `Promise` 和 `MutationObserver`，Vue 2 会退回到使用 `setImmediate` / `setTimeout` 创建宏任务（macrotask）。

1.  `Promise`
2.  `MutationObserver`
3.  `setImmediate`
4.  `setTimeout`

源码：
```js
// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```


## vue 3 

在 Vue 3 中，Vue3 中的 `nextTick` 函数使用了 `Promise` 的特性来实现异步更新。具体来说，`nextTick` 函数会返回一个 `Promise` 对象，并在该 `Promise` 对象的 `then` 方法执行前，将回调函数封装成一个 `Job` 对象添加到 Vue3 内部的 `scheduler` 队列中。当下一个微任务执行周期来临时，Vue3 会从 `scheduler` 队列中取出 `Job` 并执行其回调函数，从而实现异步更新。

需要注意的是，如果当前已经有一个微任务正在等待执行，则直接使用该微任务来执行 `nextTick` 回调函数，避免创建多余的 `Promise` 对象和微任务。


源码：
```js

const resolvedPromise = /*#__PURE__*/ Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

export function nextTick<T = void>(
  this: T,
  fn?: (this: T) => void
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}
```