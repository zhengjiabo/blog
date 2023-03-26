---
title: Vue.js 设计与实现 - 3 | Vue.js 3 的设计思路
date: 2022-07-22
tags:
 - 书籍阅读
categories: 
 - vue
---


## 总结
1. Vue.js 是声明式的宽街，直接描述结果，用户不用关注过程。
2. 虚拟DOM 比模板更加灵活，模板比 虚拟DOM 更加直观。
3. 渲染器 Render 将 虚拟DOM 渲染为 真实DOM。本质是用我们熟悉的DOM操作API来创建、更新元素。渲染器的精髓是在更新节点阶段，用 Diff 算法找出变更点，只更新变更内容。
4. 编译器 Compiler 将HTML描述文本 编译为 虚拟DOM。与渲染器之间通过 虚拟DOM 进行信息交流，相互配合提高性能。
5. 组件的本质是一组 DOM元素 的封装，表达形式可以很多种，只要渲染器配合即可。本质都是记录了渲染的内容，返回 虚拟DOM 或 render 函数


## 1. 声明式的描述UI
Vue.js3 是一个声明式的UI框架。    

### 1.1 声明式描述UI的关键元素
前端页面涉及：
- DOM元素
- 属性
- 事件
- 层级结构     

框架的设计者需要思考如何用 **模板** 来描述上述的内容，这便是声明式的描述UI。


### 1.2 声明式描述UI的方式
声明式描述UI有两种：
1. 模板（HTML描述文本）
2. js对象描述    

js对象描述更加灵活，也称为 虚拟DOM。（虚拟DOM是用js对象来描述真实的DOM结构）    
在Vue中，两者都有采用，只是最终模板都转成 虚拟DOM。

在 Vue 的组件中，手写的渲染函数就是使用 虚拟DOM 来描述UI的。
```js
import { h } from 'vue'

export default {
    render() {
        return h('h1', { onClick: handler }) // 虚拟DOM
    }
}
```
> h函数 是一个辅助创建 虚拟DOM 的工具函数。



## 2. 初识渲染器
渲染器的目的：将 虚拟DOM 渲染为 真实的DOM。    
渲染器实际上是用我们熟悉的DOM操作API来创建、更新元素，完成渲染工作。    
渲染器的精髓是在更新节点阶段，这个放到后面章节讲。目前只要掌握上面两个要点。



## 3. 组件的本质
组件就是一组 DOM元素 的封装。     
或者说组件可以用一个函数表示，组件函数的返回值是一个 虚拟DOM，这个 虚拟DOM 就是组件想要渲染的内容。    
组件也可以是一个对象，对象内包含 render函数 作为函数想要渲染的内容，返回 虚拟DOM。  
总而言之，组件的表达形式可以很多种，只要渲染器配合即可，本质都是记录了渲染的内容，返回 虚拟DOM。    
在 虚拟DOM 中，可以将组件函数放在 tag属性 中，渲染器根据 tag属性 的类型，运行 创造元素的函数 或者 递归调用render渲染器。
```js
// 组件
const MyConponent = function () {
    return {
        tab: 'div',
        props: {
            onClick: () => {alert('hello')}
        },
        children: 'click me'
    }
}

// 虚拟DOM 的 tag 存储组件
const vnode = {
    tag: MyConponent
}

// render渲染器
function render(vnode, container) {
    if (typeof vnode.tag === 'string') {
        // 渲染标签元素 这里就不写它的声明了，本质就是DOM创造元素，挂载事件，render函数递归调用其children。
        mountElement(vnode, container)
    } else if (typeof vnode.tag === 'function') { 
        // 渲染组件
        mountComponent(vnode, container)
    }
}

// 渲染组件
function mountComponent(vnode, container) {
    // 调用组件函数，获取组件 虚拟DOM
    const subTree = vnode.tag()

    // 递归调用 render渲染器
    renderer(subTree, container)
}

```



## 4. 模板的工作原理
模板是HTML描述文本，只是声明式描述UI其中的一种形式。可以通过 **编译器** 将模板编译为渲染函数 render。
```vue
<template>
    <div @click="handler">
        click me 
    </div>
</template>

// 经过编译器，最终变成组件对象中的 render 函数。

export default {
    data() {/** codes */},
    methods: {
        handler() {/** codes */}
    },
    render() {
        return h('div', { onClick: handler }, 'click me')
    }
}

```



## 5. Vue.js 是各个模块组成的有机整体
- 编译器 Compiler： 将HTML描述文本 编译为 虚拟DOM
- 渲染器 Render： 将 虚拟DOM 渲染为 真实DOM     


渲染器其中一个作用就是寻找并只更新变化的内容，对于渲染器而言找到“更新内容”很费劲，但对于编译器这却很容易。    
为了减少渲染器的工作量，提高性能，编译器和渲染器之间通过 虚拟DOM 进行信息交流，在 虚拟DOM 上添加多种数据字段代表相关含义，这便可以使得性能进一步提升。

```vue
<template>
    <!-- 由于约定的写法不同，编译器可以知道id是常量，而class是变量 -->
    <div id="foo" :class="cls"></div>
</template>

export default {
    render() {
        return h('div', { id: 'foo', class: cls })
    },
    // 假设编译器编译出来的虚拟DOM，通过patchFlags数据字段为1来表示class是变量，这样就节省了渲染器寻找变更点的工作量了。
    patchFlags: 1
}
```














## 疑问


