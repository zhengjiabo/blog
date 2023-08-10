---
title: Vue.js 设计与实现 - 21 | 简单 Diff 算法
date: 2023-08-09
tags:
 - 书籍阅读
categories: 
 - vue
---


## 总结
1. 
   


## 1.  什么是 Diff

用来比较两个虚拟 DOM 的差异，只更新需要更改的部分，可以显著提高页面更新的性能。

## 2. key 的作用 

作用：找到可复用DOM

可复用也需要判断是否需要更新内容

## 3. 如何找到移动的节点

总思路：当新旧两组子节点的节点顺序不变时，就不需要额外的移动操作。

实现思路：每一次寻找可复用的节点时，都会记录该可复用节点在旧的一组子节点中的位置索引。如果把这些位置索引值按照先后顺序排列，则可以得到一个序列，如果该序列提增， 则无需移动。

新节点在旧节点寻找具有相同 `key` 值节点的过程中，遇到的最大索引值， 记录在 `lastIndex`。如果在后续寻找的过程中，存在【索引值比当前遇到的最大索引值 `lastIndex`】还要小的节点，则意味着该节点需要移动。(当然这种方法有弊端，后续会改进)


### 4. 如何移动节点

已知如何找到待移动的节点，下一步便是移动节点

节点的真实 DOM 存在 `vnode.el` 中，在移动前会对新节点打内容补丁（因为新节点没有 `vnode.el`  属性）
```js
function patchElement(oldNode, newNode) {
  // 新的 vnode 也引用了真实 DOM 元素
  const el = newNode.el = oldNode.el
  // 省略部分代码
}
```

通过上面函数，新节点就有对应的真实 `DOM` 了。如下图

![](../../assets/Pasted%20image%2020230809170928.png)

到这一步， 仅仅在内存上的 `js` 对象有对应真实 `DOM`，但还未进行移动。对应关系如下

![](../../assets/Pasted%20image%2020230809172026.png)

> 找到节点和移动节点是同时进行的

通过 `key` 找到可复用节点，查找和移动同时进行，利用 `lastIndex` 判断是否需要移动。
1.  `lastIndex` 为 0，`p-3` 旧节点索引 2， 2 > 0  不需要移动。`lastIndex` 更新为 2。
2.  `lastIndex` 为 2，`p-1` 旧节点索引 0， 0 < 2  需要移动，根据新节点的顺序，需要移动到 `p-3` 后面。`lastIndex` 依然为 2。
3. `lastIndex` 为 2，`p-2` 旧节点索引 1， 1 < 2  需要移动，根据新节点的顺序，需要移动到 `p-1` 后面。`lastIndex` 依然为 2。

以上步骤操作如图
![](../../assets/Pasted%20image%2020230809174256.png)


 具体代码入下
 
```js
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略部分代码
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children
    const newChildren = n2.children
    let lastIndex = 0
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      let j = 0
      for (j; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container)
          if (j < lastIndex) {
            // 代码运行到这里,说明 newVNode 对应的真实 DOM 需要移动
            // 先获取 newVNode 的前一个 vnode,即 prevVNode
            const prevVNode = newChildren[i - 1]
            // 如果 prevVNode 不存在,则说明当前 newVNode 是第一个节点,它不需要移动
            if (prevVNode) {
              // 由于我们要将 newVNode 对应的真实 DOM 移动到
              // prevVNode 所对应真实 DOM 后面,
              // 所以我们需要获取 prevVNode 所对应真实 DOM 的下一个兄弟节点,并将其作为锚点
              const anchor = prevVNode.el.nextSibling
              // 调用 insert 方法将 newVNode 对应的真实 DOM 插入到锚点元素前面,
              // 也就是 prevVNode 对应真实 DOM 的后面
              insert(newVNode.el, container, anchor)
            }
          } else {
            lastIndex = j
          }
          break
        }
      }
    }
  } else {
    // 省略部分代码
  }
}
```



 > 新旧用短的为基准去做比较

1. 比较key和节点类型，相同则比较内容，为内容打补丁。
2. 先为内容打补丁，再进行移动
3. 






## 疑问
1. 

