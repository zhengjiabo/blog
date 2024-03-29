---
title: $PATH 执行文件的目录 
date: 2022-11-11
tags:
 - linux
categories: 
 - linux
---


## 总结
- 当某个命令不存在时，`command -v` 不会输出任何字符，用此常来判断某个命令是否存在。
- `which` 列出全局命令的完整路径，场景：查看当前指令路径，判断是否引用错误
- `where` 列出指令所有的全局匹配路径，场景：想切换指令路径，查看指令的所有版本的路径




## 提问
- [x] `npm install -g pkg` 全局安装的命令行为什么可以直接使用呢
    > 会将 `pkg` 安装在全局目录下的 `node_modules` 下，如果该 `pkg` 有可执行文件，`node` 会根据其 `package.json` 的 `bin` 字段指向的文件，将其软链接到 `$PATH` 下的某个目录下，这样该指令便全局可执行。 
- [x] `command -v` 与 `which` 命令一致，有什么不同
    > 当某个命令不存在时，`command -v` 不会输出任何字符，用此常来判断某个命令是否存在。
- [x] 如何设计一个可以切换 `node` 版本的命令行工具，比如 `n` 与 `nvm`
    > 有两种解决方案，执行切换指令的时候
    - 将对应 `node` 版本的可执行文件，软链接放在 `$PATH` 其中一个目录下，如 `/usr/bin`。
    - 将对应 `node` 版本的可执行文件的目录，添加到 `$PATH` 里。


## 1. 前提提要、场景

`$PATH` 决定了 `shell` 将到哪些目录中寻找命令或程序，`$PATH` 的值是一系列目录。

```sh
$ echo $PATH
/opt/share/pnpm:/opt/nvm/versions/node/v16.17.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```


## 2. 如何写一个全局命令行工具
两个方式：
1. 将自己的命令所在的目录纳入 `$PATH` 
1. 将自己的命令复制到 `$PATH` 的某个路径中 (一般为软链接)



## 3. which 列出命令的完整路径
```sh
# 实际使用的 node 路径
$ which node
/opt/nvm/versions/node/v16.17.1/bin/node

$ which ssh
/usr/bin/ssh
```

## 4. where 列出指令全局所有的匹配路径
部分指令可能存在多个版本，如果发现自己使用的版本不对，想要知道所有的全局匹配路径，可以使用 `where`
```sh
$ where ssh
C:\Windows\System32\OpenSSH\ssh.exe
C:\cygwin64\bin\ssh.exe
D:\Git\usr\bin\ssh.exe
D:\cmder\vendor\git-for-windows\usr\bin\ssh.exe
```


## 5. command -v 列出命令的完整路径 
```sh
# 实际使用的 node 路径
$ command -v node
/opt/nvm/versions/node/v16.17.1/bin/node

# 也可以直接指向命令
$ command node
```
当某个命令不存在时，`command -v` 不会输出任何字符，用此常来判断某个命令是否存在。

```sh
# Debian，不同发行版 which 找不到命令的提示可能略微不同
$ which hello
hello not found

$ command -v hello 
# 没有任何输出
```


