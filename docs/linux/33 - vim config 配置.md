---
title: vim config 配置
date: 2022-11-11
tags:
 - linux
categories: 
 - linux
---


## 总结
- 在 `vim` 中使用 `:vs<文件路径>` 左右分割窗口
- 在 `vim` 中使用 `:sp<文件路径>` 上下分割窗口
- 在命令行窗口直接使用 `vim -o <文件路径1> <文件路径2>`
- `<ctrl-w>` 与 `jkhl` 结合即可上下左右切换窗口
- `.vimrc` 配置
  - `let mapleader=","`: 设置自定义快捷键触发键为 `,`
  - `nmap <快捷键> <执行的操作>`: 设置 `normal mode` 时的快捷键 `<leader>` 作为变量，会替换为上面设置的 `mapleader` ，而 `<cr>` 代表回车。
  - `set noswapfile`: 不产生交换文件(当打开一个文件未正常关闭时会产生交换文件)
  - `set tabstop=2`: 设置制表符为 2 宽度
  - `set expandtab`: 制表符用空格替代
  - `set smarttab`: 在行和段开始处使用制表符
  - `set shiftwidth=2`: 程序中自动缩进所使用的空白长度




## 提问
- [x] 1. 如何不使 `vim` 产生交换文件
    > 在 `.vimrc` 中设置 `set noswapfile`
- [x] 2. `leader` 键有什么作用
    > 自定义按键的触发键
 





## 1. 前提提要、场景

`vim` 在启动的时候会去加载 `.vimrc`(`rc` 意思是 `run command`)，可以根据个人喜好去配置自己的 `vim`，包括快捷键、编写风格、更多的功能插件等等。

Github 上也有许多受欢迎的 `.vimrc` 配置
- [ vim-config ](https://github.com/shfshanyue/vim-config)：山月的 `vim` 配置
- [ amix/vimrc ](https://github.com/amix/vimrc)：有可能是最受欢迎的 `vim` 配置


> 本章的命令建议单独开命令行窗口，不要在 vscode 的命令行窗口执行，有快捷键冲突。

## 2. leader 自定义快捷键触发键
通过 `leader` 可配置诸多自定义的快捷键，我们一般先按下 `<leader>` 键，再按自定义键就可以完成快捷键操作。

编辑 `~/.vimrc`，添加以下内容，表示 `,` 为 `<leader>` 键。
```bash
let mapleader=","
```


## 3. map/nmap 自定义快捷键
在 `vim` 中可通过 `<leader>` 与 `nmap` / `map` 自定义快捷键      
`nmap` 代表 `normal mode` 下的快捷键映射。

在 `.vimrc` 中使用 `"` 作为注释。`nmap` 的使用方法为: `nmap <快捷键> <执行的操作>`。      
`<leader>` 作为变量，会替换为上面设置的 `mapleader` ，而 `<cr>` 代表回车。
```bash
" ,w：快速保存
nmap <leader>w :w!<cr>

" 配置 Y 与 D/C 一样可以从当前字符复制
nmap Y y$;
```


在 `vim` 中也可以打开多个窗口，
- 在 `vim` 中使用 `:vs<文件路径>` 左右分割窗口
- 在 `vim` 中使用 `:sp<文件路径>` 上下分割窗口
- 在命令行窗口直接使用 `vim -o <文件路径1> <文件路径2>`

通过 `<ctrl-w>` 与 `jkhl` 结合即可上下左右切换窗口，此时也可以通过快捷键简化操作。
```bash
" 快速切换窗口
map <C-j> <C-W>j
map <C-k> <C-W>k
map <C-h> <C-W>h
map <C-l> <C-W>l
```


## 4. swapfile 交换文件
当打开一个文件未正常关闭时会产生交换文件。可以把这个选项关闭

![](../assets/1%2027.png)

```bash
" 不产生交换文件(当打开一个文件未正常关闭时会产生交换文件)
set noswapfile

```


## 5. tab/space 制表符和空格配置
```bash
" 表符和空格配置
set tabstop=2 " 设置制表符为 2 宽度
set expandtab " 制表符用空格替代
set smarttab " 在行和段开始处使用制表符
set shiftwidth=2 " 程序中自动缩进所使用的空白长度
```



