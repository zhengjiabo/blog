---
title: env 环境变量 printenv
date: 2022-11-08
tags:
 - linux
categories: 
 - linux
---


<!-- ## 总结
-   -->





<!-- ## 提问
- [x]  -->





## 1. 前提提要、场景

`environment variables`，在操作系统及应用都有极大的作用。

环境变量的使用场景很多
- 比如在 OSS 篇使用宿主机的环境变量，存储云服务的权限
- CRA 使用环境变量 `PUBLIC_URL` 配置静态资源的基础路径
- 前端的异常监控服务中还会用到 Git 的 Commit/Tag 作为 Release 方便定位代码，其中 Commit/Tag 的名称从环境变量中获取。



## 2. printenv
通过 `printenv` 可获得系统的所有环境变量

```sh
$ printenv
LANG=en_US.UTF-8
USER=root
LOGNAME=root
HOME=/root
PATH=/opt/share/pnpm:/opt/nvm/versions/node/v16.17.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MAIL=/var/mail/root
SHELL=/bin/zsh
TERM=xterm-256color
XDG_SESSION_ID=1852
XDG_RUNTIME_DIR=/run/user/0
DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/0/bus
XDG_SESSION_TYPE=tty
XDG_SESSION_CLASS=user
```
环境变量命名一般为全部大写
> 在 `zsh` 中，为了方便拿到 `$PATH` 中的路径，设计了 `$path` 做为数组，更容易遍历，其中一个修改都会反映到另一个身上。[What is the difference between $path and $PATH (lowercase versus uppercase) with zsh](https://unix.stackexchange.com/questions/532148/what-is-the-difference-between-path-and-path-lowercase-versus-uppercase-with)


## 3. $HOME
`$HOME`，当前用户目录，即 `~` 目录。
```sh
# 以下两个命令是等价的
$ cd $HOME
$ cd ~
```



## 4. $USER
`$USER`，即当前用户名。
```sh
$ echo $USER
root

# 与下面的等价
$ id -un 
```



## 5. $SHELL
`sh` 是规范，`bash` 是其实现，但在部分 `POSIX` 系统中没有 `bash`，他们也有自己对 `sh` 的实现使得命令可以正常运行。

可以使用 `$SHELL` 查看目前使用的 SHELL 工具
```sh
$ echo $SHELL
/bin/zsh
```


## 6. $PATH
决定了 `shell` 将到哪些目录中寻找命令或程序，`$PATH` 的值是一系列目录。
