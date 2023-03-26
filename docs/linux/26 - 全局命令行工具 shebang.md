---
title: 全局命令行工具 shebang \#!
date: 2022-11-13
tags:
 - linux
categories: 
 - linux
---


## 总结
- 脚本可运行的前提:
  - 脚本具有可执行权限
  - `shebang` 指定执行环境
    - `#! /usr/bin/env xxx`: 会根据 `$PATH` 在全局中寻找执行应用做为解释器
    - `#! /usr/bin/xxx`: 使用绝对路径，直接指定解释器

- 命令全局都可用，可以任选以下任一方式
  - 软链接到 `$PATH` 任一目录下
  - 将可执行文件的目录添加到 `$PATH` 中





## 提问
- [x] 1. 如何配置可全局执行某命令
    >   软链接到 `$PATH` 任一目录下
    将可执行文件的目录添加到 `$PATH` 中
    赋与 shell 脚本可执行权限
 
- [x] 2. 什么是 `shebang`
   > 指定脚本的执行环境，指定脚本的解释器.






## 1. 前提提要、场景
通过前面的学习，我们已经能够自己编写简单的 SHELL 脚本了。例如新建脚本文件 `hello.sh`
```sh
echo 'hello, world'
```
只要在命令行工具中执行 `bash hello.sh`，便可以执行脚本

如何使我们的脚本，直接通过输入文件名直接执行，如 `ls` / `node` / `cd`
1. 脚本具有可执行权限
1. `shebang` 指定执行环境




## 2. shebang 指定执行环境
`#!` 被称为 `shebang` / `hashbang`，`hash` 等价于 `#`, `bang` 等价于 `!`。指定一个解释器。      
对于可执行的文件，可以在首行添加 `shebang`     

### 2.1 `#! /usr/bin/env xxx`

指定 `bash` 环境
```sh
#! /usr/bin/env bash

echo 'hello, world'
```

指定 `node` 环境
```sh
#! /usr/bin/env node 

echo 'hello, world'
```

指定 `python` 环境
```sh
#! /usr/bin/env python

echo 'hello, world'
```
`#! usr/bin/env bash`
- 指定了该脚本使用 `/usr/bin/env bash` 来执行
- `/usr/bin/env` 即 `env` 所有环境变量及其赋值。 
- `env bash` 将从环境变量即 `PATH` 中寻找可执行的 `bash` 命令。


> 由于历史原因，产生了两个极为相似的命令 `env` 和 `printenv`, 两者差别不大，`env` 可以用于 `shebang`，具体的差别可以参考 [what-is-the-difference-between-env-and-printenv](https://unix.stackexchange.com/questions/123473/what-is-the-difference-between-env-and-printenv)


### 2.2 `#! /usr/bin/xx`

也可以直接指定 `shell` 工具的绝对路径
```sh
#! /usr/bin/sh

echo 'hello, world'
```


## 3. 全局命令行工具

命令如果想在全局都可用，可以任选以下方式
- 软链接到 `$PATH` 任一目录下
- 将可执行文件的目录添加到 `$PATH` 中

以下为第一种操作
```sh
# 添加执行权限
$ chmod +x hello.sh

$ hello.sh
hello, world

# 列出所有 $PATH 路径
$ echo ${PATH}
/opt/share/pnpm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# 将该命令软链接到某个 $PATH 路径
$ ln -s hello.sh /usr/bin/hello

$ hello
hello, world
```