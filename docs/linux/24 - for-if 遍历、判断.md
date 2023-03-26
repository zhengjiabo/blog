---
title: for/if 遍历、判断
date: 2022-11-12
tags:
 - linux
categories: 
 - linux
---


## 总结
-  





## 提问
- [x] 1. 如何遍历输出 1 至 100
    >  `for i in {1..100}; do echo $i; done`
- [x] 2. 判断某个命令是否存在，存在输出 ok，不存在输出 not ok
    > `if [[ -n $(command -v <command>) ]]; then echo ok; else echo no ok; fi`






## 1. 前提提要、场景
在写代码时经常需要和遍历、判断打交道，`JavaScript` 中使用 `for` /`if`，在 `sh` 中也类似。



## 2. for 循环 
`for in`, 遍历数组
```sh
for name [ [ in [ word ... ] ] ; ] do list ; done
```
分号可以使用换行替换
```sh
for i in {1..100}; do echo $i; done

# 等价于
for i in {1..100}
  do echo $i
done
```

除了 `for in`，也可以使用常见的 `for` 循环样式。
```sh
for (( i = 0; i < 100; i++ )); do echo $i; done
```


## 3. if 判断

`if` 常与布尔运算符 `[[ ]]` 进行搭配，`if` 开头且以 `fi` 结尾。     
`if [[ ]]; then ; fi`
```sh
# 如果 $USER 为空字符串，则输出 ok
$ if [[ -z $USER ]]; then echo ok; fi
# 没有输出

$ if [[ -z $USER ]]; then echo ok; else echo not ok; fi
not ok

# 也可以使用 test 代表布尔运算符
$ if test -z $USER; then echo ok; else echo not ok; fi
not ok
```

使用命令 `command -v <command>` 可查看某个命令的真实执行路径，如果该路径为空，则该命令不存在。
```sh
# 判断系统中是否有 Node.js 环境
$ if [[ -n $(command -v node) ]]; then echo ok; else echo not ok; fi

# 判断系统中是否有 GoLang 环境
$ if [[ -n $(command -v go) ]]; then echo ok; else echo not ok; fi

# 判断系统中是否已经安装了 yarn 命令
$ if [[ -n $(command -v yarn) ]]; then echo ok; else echo not ok; fi
```



