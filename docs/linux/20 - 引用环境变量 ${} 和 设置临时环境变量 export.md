---
title: 引用环境变量 ${} 和 设置临时环境变量 export    
date: 2022-11-09
tags:
 - linux
categories: 
 - linux
---


## 总结
- `${var:-word}`：如果 `var` 不存在，则使用默认值 `word`。
- `${var:=word}`：如果 `var` 不存在，则使用默认值 `word`, 并且赋值 `$var=word`, 赋值为临时赋值，仅在当前窗口有效. 如果有，则正常获取原值
- `${var:+word}`：如果 `var` 存在，则使用默认值 `word`。
  
使用 `export` 配置临时环境变量。也可以 `key=value` 做为前置环境变量。还可以在各个 shell 配置里写全局环境变量, 如写入 `~/.bashrc` 或者 `~/.zshrc`。

- `NODE_ENV=production npm run build`: 命令的前置变量 


## 提问
- [x] 1. 如何配置环境变量
    > 使用 `export` 配置临时环境变量。也可以 `key=value` 做为前置环境变量。还可以在各个 shell 配置里写全局环境变量。
- [x] 2. `${var:=word}` 是什么意思
    > 如果 `var` 不存在，则使用 `word`，并且将 `var` 赋值为 `word`, 如果有, 则正常获取原值
- [x] 3. 使用 `export` 配置的环境变量如何永久生效
    > 写入 `~/.bashrc` 或者 `~/.zshrc`








## 1. 前提提要、场景
上文知道了环境变量的作用，便需要了解怎么去维护和使用环境变量。



## 2. 引用变量
`${}`: 可以作为变量的边界

可以使用 `$var` 或者 `${var}` 来引用变量，还有一些扩展值。
详见文档 [Parameter Expansion](https://www.gnu.org/software/bash/manual/bash.html#Brace-Expansion)。

> zsh 中可直接使用 `$var`，在 bash 中使用 `$var` 会报错，因此最好使用 `${var}`。

- `${var:-word}`：如果 `var` 不存在，则使用默认值 `word`。
- `${var:=word}`：如果 `var` 不存在，则使用默认值 `word`, 并且赋值 `$var=word`, 赋值为临时赋值，仅在当前窗口有效. 如果有，则正常获取原值
- `${var:+word}`：如果 `var` 存在，则使用默认值 `word`。
```sh
# 作为变量的边界
$ echo shell is: ${SHELL}
shell is: /bin/zsh

$ echo oooo${SHELL}oooo
oooo/bin/zshoooo

# world
$ echo ${HELLO:-world}

# ''
$ echo $HELLO

# world 
$ echo ${HELLO:=world}

# world
$ echo $HELLO

# 由于此时 $HELLO 存在，则使用 shanyue
# shanyue
$ echo ${HELLO:+shanyue}

```
在 `Dockerfile` 与 `CI` 中，常用到环境变量的扩展
```sh
# 如果不配置环境变量，则默认值为 production，并赋值给 NODE_ENV
${NODE_ENV:=production}
```


## 3. export 设置临时环境变量 
通过 `export` 可配置环境变量，如 `export A=3`，注意 `=` 前后不能有
```sh
$ export NODE_ENV=production
$ echo $NODE_ENV
production
```

通过 `export` 配置的环境变量仅在当前 `shell(tty)` 窗口有效，如果再开一个 `shell`，则无法读取变量

永久有效，需要写入 `~/.bashrc` 或者 `~/.zshrc`

```sh
# 判断当前是哪个 shell
# 如果是 zsh，写入 ~/.zshrc
# 如果是 bash，写入 ~/.bashrc
$ echo $SHELL
/bin/zsh

# 写入 ~/.zshrc，如果不存在该文件，请新建
$ vim ~/.zshrc

# 写入 ~/.bashrc 后记得使它生效，或者重开一个 shell 窗口
$ source ~/.zshrc
```



## 4. 前置变量
在执行命令之前置入变量，用以指定仅在该命令中有效的变量       
注意：是命令的变量，不是环境变量
```sh
# 该变量仅在当前命令中有效
$ NODE_ENV=production printenv NODE_ENV
production

# 没有输出
$ printenv NODE_ENV

```

在前端非常常见
```sh
$ NODE_ENV=production npm run build
```

