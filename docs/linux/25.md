---
title: function 函数
date: 2022-11-13
tags:
 - linux
categories: 
 - linux
---


## 总结
- `$0`: zsh 中为函数名，bash 中为脚本名     
- `$1`: 第一个传参      
- `$#`: 参数数量
- `$*`: 所有参数
- `$@`: 所有参数
- `set -e`: 执行时有异常则立即退出
- `set --`: 重置入参 




## 提问
- [x] 1. [nodejs 官方镜像的 docker-entrypoint](https://github.com/nodejs/docker-node/blob/main/16/alpine3.16/docker-entrypoint.sh) 是何意思？
    ```bash
    # shebang 解释器的绝对路径，可能是软链接指向 bash 或 dash
    #!/bin/sh

    # 有异常时立即退出
    set -e

    # Run command with node if the first argument contains a "-" or is not a system command. The last
    # part inside the "{}" is a workaround for the following bug in ash/dash:
    # https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=874264
    if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ] || { [ -f "${1}" ] && ! [ -x "${1}" ]; }; then
    set -- node "$@"
    fi

    # 满足以下情况之一：
        # 参数一携带了 `-`
        # 参数一不是可执行命令
        # 参数一是文件，且不可执行
    # 将会重置入参，在最前方推入 node 作为第一个参数

   
    # 方便理解: 逐步进行拆分

        # [ "${1#-}" != "${1}" ]
        ## ${var#word}: var 以 word 开头，则删掉 word。
        ## 参数一 删除了开头的 `-` 后，不等于原值
        ## 翻译成人话：参数一携带了 `-`

        # [ -z "$(command -v "${1}")" ]
        ## [ -z ] 是否为空
        ## command -v <command> 输出命令的绝对路径，命令不存在时，输出为空
        ## 翻译成人话：参数一不是可执行命令
        
        # {[ -f "${1}" ] && ! [ -x "${1}"];} 
        ## [ -f xxx ]: xxx 是否为文件
        ## [ -x xxx ]: xxx 是否可执行 
        ## { xx && xx;}: 两个条件成立 且；详细可看 https://unix.stackexchange.com/questions/670519/how-to-nest-conditional-script-operators-a-o-in-an-if-statement-in-bash
        ## 翻译成人话：参数一是文件，且不可执行

        # set -- node "$@"
        ## set -- xx: 重置函数入参
        ## 例如 原本入参 b c d 
        ## set -- a "${@}" 后 入参就变为 a b c d 
        ## 翻译成人话：在最前方推入 node 作为第一个参数

    # 取出所有传参 执行
    exec "$@"
    ```
- [x] 2. `$0` `$1` `$@` 各代表什么意思
    > `$0`: zsh 中为函数名，bash 中为脚本名     
    `$1`: 第一个传参      
    `$@`: 所有传参






## 1. 前提提要、场景
`shell` 中的函数调用，跟使用命令一致     
```bash
# 定义
$ hello(){echo world}
# 跟命令一样直接调用指向
$ hello
world
```



## 2. 传参 
在命令后紧跟值，便可以作为入参。      
函数内，使用 `$1`、`$2`、`$3`… 接收参数，而 `$0` 在 zsh 中指函数名，在 bash 中指脚本名称。

> 注意：函数名和脚本名的区别，
```bash
# index.sh
hello () {
  echo $0 $1 $2 $3 $4
}

# 调用函数
# bash index.sh => index.sh a b c d
# zsh index.sh  => hello a b c d
# source index.sh => bash a c c d  (bash 环境下，因为执行的是 bash(.sh))
# source index.sh => hello a c c d (zsh 环境下)
hello a b c d
```



## 3. 特殊变量
除了 `$0` `$1`... 函数内部还有特殊变量
- `$#`: 参数数量
- `$*`: 所有参数
- `$@`: 所有参数
> `$*` 和 `$@` 的区别 [Handling positional parameters](https://wiki.bash-hackers.org/scripting/posparams#handling_positional_parameters)

结合之前的文章，在数组中 `#` 用来取数组长度，`@` 用来取所有数组，便于理解。

```bash
hello () {
  echo '$#' ${#}
  echo '$*' ${*}
  echo '$@' ${@}
}

# 调用函数
# => Output:
# $# 4
# $* a b c d
# $@ a b c d
hello a b c d
```


## 4. 命令即函数
实际上，可把命令行视为函数。
如果 `$0`、`$1`、`$@` 出现在全局，则表明他们是命令行的参数









