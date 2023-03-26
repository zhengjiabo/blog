---
title: sh 与 bash
date: 2022-11-05
tags:
 - linux
categories: 
 - linux
---


## 总结
-  `sh` 是一份命令语言规范，而 `bash/zsh/fish/dash`是规范的实现。
-  查看使用 `sh` 真正的应用程序：`ls -lah /bin/sh` 或 `find -L /bin -samefile /bin/sh`





## 提问
- [x] 1. `sh` 与 `bash` 的区别是什么。见 [Difference between sh and Bash](https://stackoverflow.com/questions/5725296/difference-between-sh-and-bash)
    > `sh` 是规范，`bash` 是其实现，但在部分 `POSIX` 系统中没有 `bash`，他们也有自己对 `sh` 的实现使得命令可以正常运行。
- [x] 2. 如何找到 `sh` 真正的应用程序是哪个，比如 `bash` 还是 `dash`
    > `ls -lah /bin/sh` 或 `find -L /bin -samefile /bin/sh`






## 1. 前提提要、场景
每次使用 `ssh` 登录服务器，都有个命令行窗口供我们使用，别人服务器的窗口花里胡哨的，自己服务器的却平平无奇，这是为什么呢？          
了解完 `sh` 便心中有答案。



## 2. sh 命令解释器
`sh` (全称 `Shell Command Language`): 是由 [Shell Command Language](https://pubs.opengroup.org/onlinepubs/009695399/utilities/xcu_chap02.html) 表述的一份规范。而 `bash/zsh/fish/dash` 等是基于该规范的实现。      
但 `sh` 的规范有些简陋，因此 `bash/zsh` 不仅实现了基本功能，甚至对 `sh` 进行了功能的扩展。(在 `sh` 规范中并没有数组，在 `bash/zsh` 中均对数组进行了实现。)

> 在前端，`ESMAScript` 是一份规范，而在 `Node.js` 与浏览器环境中的 `Javascript/Typescript` 是对它的实现。




## 3. /bin/sh 软硬链接 
`sh` 仅仅是一份语言规范，在我们执行 `sh` 命令时，实际上是在其实现的应用程序 `bash/dash` 上执行命令。
1. 在大部分操作系统中 `/bin/sh` 链接指向 `/bin/bash`，即 `bash`
2. 在 `ubuntu/debian` 操作系统中 `/bin/sh` 链接指向 `/bin/dash`，即 `dash`

以下命令可以查询目前使用的 `sh` 应用程序
```sh
# 大部分操作系统是软连接
$ ls -lah /bin/sh
lrwxrwxrwx 1 root root 4 Jul 27  2021 /bin/sh -> bash


# 有些操作系统是通过硬链接方式
# -L: 搜寻结果包括路径中的软连接下的结果
$ find -L /bin -samefile /bin/sh
/bin/bash
/bin/sh
```




## 4. Shebang 脚本中指定
在脚本中可以指定 `sh/bash/dash` 应用程序去运行脚本

```sh
#!/bin/sh

#!/bin/bash

#!/bin/dash
```
