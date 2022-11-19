---
title: visual mode 可视化模式
date: 2022-11-19
tags:
 - linux
categories: 
 - linux
---


## 总结
- `v`：逐字选择
- `V`：逐行选择
- `<ctrl-v>`：逐块选择, 和 `v` 的区别是 `j` `k` 切换时不会把当前行全选中，只选中目前已选中的块





## 提问
- [x] 





## 1. 前提提要、场景
鼠标按住拖拽选中，进行批量复制和删除，这种操作也十分频繁。这便需要用到 `visual mode`。



## 2. visual mode
通过以下方式可进入 `visual mode`。
- `v`：逐字选择
- `V`：逐行选择
- `<ctrl-v>`：逐块选择, 和 `v` 的区别是 `j` `k` 切换时不会把当前行全选中，只选中目前已选中的块

进入 `visual mode` 后
1. 用 `vim move` 移动光标选择区域
2. 用 `vim operator` 选中区域进行复制、删除、缩进等操作

如果需要中途退出 `visual mode`，请使用 `<ctrl-c>`。


## 3. `ctrl-v`
`<ctrl-v>` 可以以方形选中区域，并可同时操作多行。
比如，同时给三行内容前添加 `HELLO`，可使用 `<ctrl-v>jjIHELLO<ctrl-c>`

- `<ctrl-v>`：进入 `vim visual mode`
- `jj`：往下选择两行
- `I`：进入区域首字符进行编辑
- `HELLO`：编辑文字
- `<ctrl-c>`：退出 `visual mode`








