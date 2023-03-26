---
title: tmux 终端复用器
date: 2022-11-21
tags:
 - linux
categories: 
 - linux
---


## 总结
- `server`：理解为操作系统。每个操作系统 `server` 包含多个浏览器 `session`
- `session`：理解为浏览器。每一个浏览器 `session` 包含多个标签页 `window`
- `window`：理解为标签页，每一个标签页 `window` 包含多个面板 `pane`
- `pane`：理解为面板
- `tmux new -s <name>`: 新建 `session`
- `c-d`: 退出 `tmux` 环境，此时现场被销毁了。
- `tmux detach`: 保留现场退出，或者快捷键 `c-b,d`
- `tmux attach`: 重新进入保留的现场。更简洁 `tmux a -t <name>`





<!-- ## 提问
- [x]  -->





## 1. 前提提要、场景
`tmux`: 终端复用器，这也是它命名的由来 `t(terminal) mux(multiplexer)`，可以在 `linux` 终端管理多个窗口。

1. 分屏。
2. `attach`: 可以起到保护现场的作用，不至于因 `ssh timeout`，而丧失了工作环境。
3. 操作简单，可配置化。你可以使用快捷键很快地在多个窗口，面板间切换，粘贴复制，无限滚屏。


## 2. 安装/更新 man 文档
- mac: `brew install tmux`
- linux: 直接通过 [ tmux源码 ](https://github.com/tmux/tmux) 编译安装。当然有些 linux 发行版有二进制安装包，但不一定有更新，所以还是使用源码编译安装吧。

```sh
# Debian 安装软件依赖 编译时缺啥安啥，结果就需要安装这么多依赖了
$ apt install -y autoconf automake pkg-config libevent-dev byacc ncurses-dev

# 下载源代码
$ git clone --depth=1 https://github.com/tmux/tmux.git
$ cd tmux

# 编译源码
$ sh autogen.sh && ./configure && make

# 直接执行
$ ./tmux 

# 使得 tmux 可全局执行
$ cp ./tmux /usr/local/bin/tmux

# 更新文档
$ rsync -lazhv tmux.1 /usr/local/man/man1/tmux.1

# 删除掉 git 源码
$ cd ..
$ rm -rf tmux
```

## 3. 术语

- `server`：理解为操作系统。每个操作系统 `server` 包含多个浏览器 `session`
- `session`：理解为浏览器。每一个浏览器 `session` 包含多个标签页 `window`
- `window`：理解为标签页，每一个标签页 `window` 包含多个面板 `pane`
- `pane`：理解为面板



## 4. 命令
`tmux`: 进入 `tmux` 环境

![](../assets/1s29.png)

```sh
# 新建一个 tmux session
# new：new-session 的简写
# -s: sessionName
$ tmux new -s shanyue

# 也可以直接通过 tmux 命令进入
# tmux
```

退出 `tmux` 环境，使用快捷键 `ctrl + d`，此时现场被销毁了。
如果想保留现场，可以使用命令 `tmux detach` (或者快捷键 `ctrl + b d`)， 保留现场退出，下次进入时使用 `tmux attach` 重新进入保留的现场。

```sh
# 退出并保存环境
$ tmux detach

# 列出所有的 session
# ls：list-sessions 的简写
$ tmux ls
shanyue: 1 windows (created Sun Jul 31 16:02:49 2022)

# a: attach 简写，
# -t：选择要 attach 的 session name
$ tmux a -t shanyue
```


