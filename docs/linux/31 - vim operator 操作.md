---
title: vim operator 操作 
date: 2022-11-17
tags:
 - linux
categories: 
 - linux
---


## 总结
- 基础操作
  - `yy`：复制整行内容
  - `p`：光标之后进行粘贴
  - `P`：光标之前进行粘贴
  - `dd`：删除整行内容
  - `D`：删除当前字符至行尾
  - `cc`：删除整行内容并进入 `insert mode`
  - `C`：删除当前字符至行尾并进入 `insert mode`
  - `>>`：向右缩进
  - `<<`：向左缩进
- 操作加移动
  - `dl`：删除右侧字符（当前字符）
  - `dh`：删除左侧字符
  - `d$`：删除至行尾
  - `dG`：删除至末尾
  - `3dl`：删除右侧三个字符
  - `d3l`：删除右侧三个字符，与上同
- 操作加文本匹配
  - `aw`: a word 包含空格
  - `iw`: inner word 不含空格
  - `aW`: a WORD
  - `iW`: inner WORD
  - `d/c/yi<cin>`:  根据输入关键词，删除/更改/复制关键词匹配项内的内容，例如 `()<>''` 内容
  - `d/c/ya<cin>`:  根据输入关键词，删除/更改/复制关键词匹配项内的内容，包括关键词. 例如 `()<>''` 
  - `d/c/yit`: 删除/更改/复制标签内的内容，例如：`<div>aaa</div>` => 输入 `dit` => `<div></div>` 
  - `d/c/yat`: 删除/更改/复制标签内的内容，例如：`<div>aaa</div>` => 输入 `dat` => `` 
  - `d/c/yat`: 删除/更改/复制标签内的内容，例如：`<div>aaa</div>` => 输入 `dat` => `` 
- 更多扩展
  - `u`：撤销
  - `<ctrl-r>`：重做
  - `/{word}<cr>`：高亮搜索词。如果不需要高亮时，可使用 `:noh[lsearch]` 取消高亮
  - `n`：下一个搜索
  - `N`：上一个搜索





## 提问
- [x] 如何删除当前行并进入插入模式
    > `cc`
 





## 1. 前提提要、场景
复制粘贴、删除是十分频繁的操作，在 `vim` 中是如何使用的

> Tip：在 vim 中可使用 :help operator 查看 operator 详细文档，使用 :help d 可查看 delete 的详细文档。

## 2. yank (copy) 复制  
- `yy`：复制整行内容
- `p`：光标之后进行粘贴
- `P`：光标之前进行粘贴




## 3. delete 删除

- `dd`：删除整行内容
- `D`：删除当前字符至行尾



## 4. change 修改

- `cc`：删除整行内容并进入 `insert mode`
- `C`：删除当前字符至行尾并进入 `insert mode`


## 5. shift 缩进
- `>>`：向右缩进
- `<<`：向左缩进


## 6. operater + move 操作符+移动

以上三种操作，都可以与 move 键结合。比如 d 是删除，则
- `dl`：删除右侧字符（当前字符）
- `dh`：删除左侧字符
- `d$`：删除至行尾
- `dG`：删除至末尾
- `3dl`：删除右侧三个字符
- `d3l`：删除右侧三个字符，与上同


## 7. text object 操作符+文本匹配
除此之外，结合 `a/i` 还可以更好地在括号、引号内工作。以下统称为 `text object`。
- `aw`: a word 包含空格
- `iw`: inner word 不含空格
- `aW`: a WORD
- `iW`: inner WORD
- `a[`：a [] block
- `a(`
- `a<`
- `a{`
- `a"`
- `a'`

具体效果如下
- `d/c/yi<cin>`:  根据输入关键词，删除/更改/复制关键词匹配项内的内容，例如 `()<>''` 内容
- `d/c/ya<cin>`:  根据输入关键词，删除/更改/复制关键词匹配项内的内容，包括关键词. 例如 `()<>''` 
- `d/c/yit`: 删除/更改/复制标签内的内容，例如：`<div>aaa</div>` => 输入 `dit` => `<div></div>` 
- `d/c/yat`: 删除/更改/复制标签内的内容，例如：`<div>aaa</div>` => 输入 `dat` => `` 
- `d/c/yat`: 删除/更改/复制标签内的内容，例如：`<div>aaa</div>` => 输入 `dat` => `` 


## 8. undo/redo/search
以下严格来说不算 `vim` 中的操作符（operator)，但是篇幅太短放在这里。
- `u`：撤销
- `<ctrl-r>`：重做
- `/{word}<cr>`：高亮搜索词。如果不需要高亮时，可使用 `:noh[lsearch]` 取消高亮
- `n`：下一个搜索
- `N`：上一个搜索



