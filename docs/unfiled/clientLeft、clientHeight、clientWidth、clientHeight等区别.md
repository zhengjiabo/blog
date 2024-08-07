---
title: clientLeft、clientHeight、clientWidth、clientHeight等区别
date: 2022-06-09
tags:
 - 基础
categories: 
 - frontEnd
---

## 1. 近似混淆, 理解困难
在图片懒加载时有用到这些属性, 但无法区分他们, 以至于不知道如何写代码.    
所以该文的目的,便是为了区分这些属性, 且熟悉具体使用场景


## 2. 前提了解
- 后续的width都是指内容content的width
- 滚动条占位关系: 如果有padding, 滚动条占据padding的宽度, 否则占据width的宽度

## 3. clientXxx
元素内容信息
 
![图片](../assets/220609-1-1.png 'clientXxx')
- clientWidth = width + padding - scrollWidth(即不包含滚动条宽度)
- clientHeight = height + padding - scrollWidth(即不包含滚动条宽度)
- clientLeft =  左边框宽度 + srcollWidth(direction: rtl 且存在垂直滚动条, 个人在Mac的Edge中测试, 不会加scrollWidth, 所以这个了解就行)
- clientTop = 上边框宽度
   

## 4. offsetXxx
元素可见信息

![图片](../assets/220609-1-2.png 'offsetXxx')

- offsetWidth = width + padding + borderWidth(滚动条宽度已经计算在width 和 padding)
- offsetHeight = height + padding + borderWidth(滚动条宽度已经计算在height 和 padding)


![图片](../assets/220609-1-3.png 'offsetXxx')    
offsetParent 是一个只读属性，获得**被定位**的最近祖先元素。    
- offsetLeft = 距离offsetParent的左边边界偏移
- offsetTop = 距离offsetParent的顶部边界偏移


## 5. scrollXxx
元素滚动信息    
![图片](../assets/220609-1-4.png 'ScrollXxx')
该元素在不使用滚动条的情况下的实际内容
- scrollWidth = width + padding
- scrollHeight = height + padding     

width和height都为内容, 在容器和元素有点区别, 以下只说了width, height也是一样的    
- 如果一个元素做为容器, 内部有其他元素     
    - scrollWidth = 元素内部子元素的所有占用(width + padding + border + margin) + 元素容器padding      

- 如果一个元素内部没有其他元素, 
    - scrollWidth = 元素自身width + 元素自身padding
- 可以看出, 上面写的容器和元素, 本质都是一样的, 内部的内容占用空间 + padding

![图片](../assets/220609-1-5.png 'ScrollXxx')    
![图片](../assets/220609-1-6.png 'ScrollXxx')    
边缘: 内容的边缘    内容: 如果是元素, 包含该元素 width + padding + border + margin 所有占用     
scrollLeft 和 scrollTop都是滚动距离
- scrollLeft = 实际内容元素的左边缘和可视容器左边缘之间的距离
- scrollTop = 实际内容元素的顶部边缘和可视容器顶部边缘之间的距离


## 5. window/ducument相关
- window.innerWidth:    浏览器网页容器的宽(包含滚动条)
- window.innerHeight:   浏览器网页容器的高(包含滚动条)
- document.documentElement.clientWidth: 浏览器网页容器的宽(不含滚动条)
- document.documentElement.clientHeight: 浏览器网页容器的高(不含滚动条)    
- window.outerWidth:    整个浏览器的宽
- window.outerHeight:   整个浏览器的高
- window.screen.width:    整个屏幕的宽(所以window.outerWidth <= window.screen.width)
- window.screen.height:   整个屏幕的高(所以window.outerHeight <= window.screen.height)
- window.screenTop: 浏览器距离屏幕顶部的距离
- window.screenLeft: 浏览器距离屏幕左边的距离
## 总结
![图片](../assets/220609-1-7.png '总结')    
- clientWidth = width + padding - scrollWidth(即不包含滚动条宽度)
- clientHeight = height + padding - scrollWidth(即不包含滚动条宽度)
- clientLeft =  左边框宽度 + srcollWidth(direction: rtl 且存在垂直滚动条, 个人在Mac的Edge中测试, 不会加scrollWidth, 所以这个了解就行)
- clientTop = 上边框宽度

---

- offsetWidth = width + padding + borderWidth(滚动条宽度已经计算在width 和 padding)
- offsetHeight = height + padding + borderWidth(滚动条宽度已经计算在height 和 padding)
- offsetLeft = 距离offsetParent的左边边界偏移
- offsetTop = 距离offsetParent的顶部边界偏移

---

- scrollWidth = width + padding
- scrollHeight = height + padding
- scrollLeft = 实际内容元素的左边缘和可视容器左边缘之间的距离
- scrollTop = 实际内容元素的顶部边缘和可视容器顶部边缘之间的距离

---

- window.innerWidth:    浏览器网页容器的宽(包含滚动条)
- window.innerHeight:   浏览器网页容器的高(包含滚动条)
- document.documentElement.clientWidth: 浏览器网页容器的宽(不含滚动条)
- document.documentElement.clientHeight: 浏览器网页容器的高(不含滚动条)    
- window.outerWidth:    整个浏览器的宽
- window.outerHeight:   整个浏览器的高
- window.screen.width:    整个屏幕的宽(所以window.outerWidth <= window.screen.width)
- window.screen.height:   整个屏幕的高(所以window.outerHeight <= window.screen.height)
- window.screenTop: 浏览器距离屏幕顶部的距离
- window.screenLeft: 浏览器距离屏幕左边的距离     

对client、offset、scroll记得, window和document了解, 忘记时可以查一查, 因为这些只在特定场景会使用, 学习嘛, 不要有负担.
## 应用场景
1. [[如何实现图片懒加载]]




## 参考资料




