---
title: 帮助命令 man、--help、tldr
date: 2022-09-28
tags:
 - linux
categories: 
 - linux
---
## 总结
1. `<command> --help`：命令自带操作手册
2. `man <command>`：linux man 的操作手册，更详细的文档，可搜索。适用于想了解某个具体指令或单字符
3. `tldr <command>`：更加简洁的使用操作手册，用于快速入手尝试，或关键点提醒。


<!-- ## 疑问
- [ ]  -->





## 提问
- [x] 在命令行文档中，`[]` 代表什么意思     
  可选参数






## 1. 前提提要、场景
学习 linux 命令时，文档必不可少。      
可以使用以下查询文档
- `<command> --help`
- `man <command>`




## 2. 命令格式
```sh
$ git --help
usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           [--super-prefix=<path>] [--config-env=<name>=<envvar>]
           <command> [<args>]
```
如果进行简化，只剩下      
 `git [option/flag option argument] <command> [<args>]`。
- `[option/flag]`：选项，以 `--` 前缀接多个字符，`-` 前缀接单个字符，如 `--help/-h`。 
- `option argument`：选项参数，如 `--git-dir=<path>` 中的 path 就是选项参数。
- `<command>`：子命令，如 `git clone` 中的 `clone` 为子命令。部分主命令中，子命令也是可选的。
- `[<args>]`：命令中的参数，一般而言，除了命令本身外，其它的都是参数。所以子命令也跟主命令一样，可以有自己的选项和选项参数

中间部分为可选参数
- `[ ]`：可选参数
- `[-v | --version]`：`-v` 或者 `--version`，是等效的。
- `[<files> ...]`：多可选参数，类似于 Javascript 中的 `...` 扩展运算符。
    ```sh
    $ cat [-belnstuv] [file ...]

    $ cat a.txt b.txt c.txt ...
    ```
- `-abc`：多个单字符选项拼接
    ```sh
    # 以下两个命令是等价的
    $ ls -lah

    $ ls -l -a -h
    ```

如果想进行命令行开发，可以参考 [CLI 开发指南](https://clig.dev/#output)





## 3. man 操作手册
`man`：manual 操作手册，实际存储在 linux 的 `/usr/share/man` 目录
![](../assets/1s19.png)
> 看到图中 `ZH_CN` 文件夹了吗，`man` 也有中文文档，但内置很少量，想要全的可以去网上下载，具体操作网上搜很容易找到的。但不推荐，避免养成习惯心里抵触英文文档。可以使用 `man -M /usr/share/man/zh_CN/ man` 浅试一下。
```sh
# man <command>
$ man ls

LS(1)                            User Commands                           LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List  information  about  the FILEs (the current directory by default).
       Sort entries alphabetically if none of -cftuvSUX nor --sort  is  speci-
       fied.

       Mandatory  arguments  to  long  options are mandatory for short options
       too.

       -a, --all
              do not ignore entries starting with .
...
```

使用 `vim` 的操作
- `j`: 向下移动
- `k`：向上移动
- `q`：退出



可以执行 `man <num> <command>` 查询， `<num>` 具有以下意义。
1. Standard commands （标准命令）
2. System calls （系统调用）
3. Library functions （库函数）
4. Special devices （设备说明）
5. File formats （文件格式）
6. Games and toys （游戏和娱乐）
7. Miscellaneous （杂项）
8. Administrative Commands （管理员命令）
9. 其他（Linux特定的）， 用来存放内核例行程序的文档。

如果发现文档缺失，`Debian` 可以执行以下命令更新文档
```sh
$ apt-get update
$ apt-get -y install manpages manpages-de manpages-de-dev manpages-posix manpages-posix-dev libc6-dev glibc-doc manpages-posix manpages-posix-dev linux-doc libstdc++-7-dev libstdc++-7-doc
```
或者手动更新整个 `man-pages` 包
```sh
$ git clone git://git.kernel.org/pub/scm/docs/man-pages/man-pages.git
$ cd man-pages
$ make install
```


## 4. tldr 简化的操作手册
`Too Long; Didn't Read`      
一个简化的文档，如果是想知道怎么快速使用，而不是细看每一个配置，选他。          
前期可以使用 `man` 查看文档，后续想不起如何使用，使用 `tldr`。      
可以安装在全局 `npm i -g tldr`，使用方法 `tldr <command>`

```sh
$ tldr ls  

  ls

  List directory contents.
  More information: https://www.gnu.org/software/coreutils/ls.

  - List files one per line:
    ls -1

  - List all files, including hidden files:
    ls -a

  - List all files, with trailing / added to directory names:
    ls -F

  - Long format list (permissions, ownership, size, and modification date) of all files:
    ls -la

  - Long format list with size displayed using human-readable units (KiB, MiB, GiB):
    ls -lh
```














