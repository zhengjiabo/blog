---
title: sed 更为强大的文本内容处理工具
date: 2022-11-30
tags:
 - linux
categories: 
 - linux
---


## 总结
example:
- `p`：`sed -n '1p'` 或 `sed -n '/reg/p'` 打印    
- `d`：`sed '1d'` 或 `sed '/reg/d'` 删除       
- `s`：`sed 's/regexp/replacement/'` 替换。默认替换每行第一个，全部替换 `sed 's/regexp/replacement/g'`。删除某个字符，只要把 `replacement` 置空即可。     
  `find -name '*.md' | sed 's/\(.*\).md/\1/'`: 使用正则时，`()` 需要反斜杆，子匹配项在 `\1 \2` 依次递推
- `i/a`：`sed '/regexp/i addText'` 或 `sed '/regexp/a addText'` 新增

`[OPTION]...` 可选命令选项:
- `-n`: 打印匹配内容行
- `-i`: `--in-place` ，原地替换文本内容
- `-f`: `--file` ，指定 `sed` 脚本文件，包含一系列 `sed` 命令
- `-e`: `--expression` ，直接指定 `sed` 脚本，包含一系列 `sed` 命令

`sed SCRIPT`:
- 匹配：
  - `/reg/`: 匹配正则，默认基础正则表达式 `BREs`，可以使用 `-E` 使用扩展正则表达式。
  - `3`: 数字代表第几行
  - `$:` 最后一行
  - `1,3`: 第一行到第三行
  - `1,+3`: 第一行，并再往下打印三行 (打印第一行到第四行)
  - `1, /reg/`: 第一行，并到匹配字符串行
- 操作：
  - `p`: `print`，打印，通常用来打印文件某几行，通常与 `-n` 一起用
  - `d`: `delete`，删除，与 `vim` 一致
  - `s`: `replace`，替换，与 `vim` 一致
  - `a`: `append`, 下一行插入内容
  - `i`: `insert`, 上一行插入内容


## 提问
- [x] 1. 如何使用 `sed` 替换文字
    > `sed 's/regexp/replacement/'` 
- [x] 2. 如何使用 `sed` 替换文本每行的首空格
    > `sed 's/ //'` 每行首个空格；`sed 's/ *//'` 每行首的所有空格
- [x] 3. 如何使用 `sed` 在查找到 `hello` 的一行前新增一行
    > `sed '/hello/i \'`。 `\` 相当于占位，没有任何文本
- [x] 4. 如何使用 `sed` 将查找到 `hello` 的一行给删掉
    > `sed '/hello/d'`






## 1. 前提提要、场景

`tr` 可以做一些简单的文本替换和删除，但不够灵活。需要一个更强大的文本内容处理工具——`sed`。     

`Linux` 三剑客（`grep`、`sed`、`awk`）之一。      

`sed` 可以批量替换、删除行，也可以新增内容，甚至可以进行正则匹配，十分强大。

## 2. sed 详解
命令：`sed [OPTION]... {script-only-if-no-other-script} [input-file]...`

### 2.1 `[OPTION]...` 可选命令选项
- `-n`: 打印匹配内容行
- `-i`: `--in-place` ，原地替换文本内容
- `-f`: `--file` ，指定 `sed` 脚本文件，包含一系列 `sed` 命令
- `-e`: `--expression` ，直接指定 `sed` 脚本，包含一系列 `sed` 命令

### 2.2 `{script-only-if-no-other-script}` sed 脚本  
如果没有 `-e`、`-f`，在该位置的内容都被当做 `sed` 脚本。


### 2.3 `[input-file]...` 待处理文本
标准输入文本：可以为文件、管道传入的文本。



## 3. sed SCRIPT（sed 脚本）

### 3.1 匹配
- `/reg/`: 匹配正则，默认基础正则表达式 `BREs`，可以使用 `-E` 使用扩展正则表达式
- `3`: 数字代表第几行
- `$:` 最后一行
- `1,3`: 第一行到第三行
- `1,+3`: 第一行，并再往下打印三行 (打印第一行到第四行)
- `1, /reg/`: 第一行，并到匹配字符串行


### 3.2 操作
- `p`: `print`，打印，通常用来打印文件某几行，通常与 `-n` 一起用
- `d`: `delete`，删除，与 `vim` 一致
- `s`: `replace`，替换，与 `vim` 一致
- `a`: `append`, 下一行插入内容
- `i`: `insert`, 上一行插入内容


## 4. sed examples
- `p`：`sed -n '1p'` 或 `sed -n '/reg/p'` 打印    
- `d`：`sed '1d'` 或 `sed '/reg/d'` 删除       
- `s`：`sed 's/regexp/replacement/'` 替换。默认替换每行第一个，全部替换 `sed 's/regexp/replacement/g'`       
- `i/a`：`sed '/regexp/i addText'` 或 `sed '/regexp/a addText'` 新增

> 单引号也可以不加，除了特殊情况：如 
> - `$`、跟变量重名，避免被 `shell` 识别为变量转换了。
> - 有空格，不然识别为两个参数。

### 4.1 打印特定行-第 n 行
`-n`: 只打印匹配内容，和 `p` 使用      
`p`: 打印，没有 `-n` 时会在匹配行下方复制匹配行。通常和 `-n` 一起使用，只打印匹配内容

命令：`sed -n '1p'` 或 `sed -n '/reg/p'`

```sh
# ps -ef: 显示所有的程序进程
# 1p: 打印第一行
$ ps -ef | sed -n '1p'
UID        PID  PPID  C STIME TTY          TIME CMD


# 2,5p: 打印第2-5行
$ ps -ef | sed -n '2,5p'
root         1     0  0 Sep13 ?        00:00:30 /sbin/init
root         2     0  0 Sep13 ?        00:00:00 [kthreadd]
root         3     2  0 Sep13 ?        00:00:00 [rcu_gp]
root         4     2  0 Sep13 ?        00:00:00 [rcu_par_gp]
```


### 4.2 打印最后一行
`$`: 最后一行
> 注意使用单引号

```sh
$ ps -ef | sed -n '$p'
```


### 4.3 过滤字符串——即打印匹配行 
与 `grep` 类似，但 `grep` 可以高亮关键词     

`/reg/`: 正则匹配 

```sh
$ ps -ef | sed -n '/ssh/p'
root       888     1  0 Sep13 ?        00:00:07 /usr/sbin/sshd -D
root      3397   888  0 13:39 ?        00:00:00 sshd: root@pts/2
root      4563  3403  0 16:07 pts/2    00:00:00 sed -n /ssh/p

$ ps -ef | grep ssh
root       888     1  0 Sep13 ?        00:00:07 /usr/sbin/sshd -D
root      3397   888  0 13:39 ?        00:00:00 sshd: root@pts/2
```

### 4.4 删除特定行-第 n 行
`d`: 删除 

命令：`sed '1d'` 或 `sed '/reg/d'`

```sh
$ cat hello.txt
hello, one
hello, two
hello, three

# 删除第三行内容
$ sed '3d' hello.txt
hello, one
hello, two
```


### 4.5 删除匹配行

```sh
$ cat hello.txt
hello, one
hello, two
hello, three

$ sed '/one/d' hello.txt
hello, two
hello, three
```


### 4.6 替换内容
`s`: 替换，与 `vim` 类似

命令：`sed 's/regexp/replacement/'`       

默认只替换每一行的第一个，如果要全部替换，使用 `sed 's/regexp/replacement/g'`       

```sh
$ echo hello | sed 's/hello/world/'
world

# 删除某个字符
# replacement 留空即可
$ echo hello | sed 's/h//'
ello


# g: 为全局匹配模式
# 由于是多行模式，不加 g 默认匹配每行第一个
$ echo oook | sed 's/o//'
ook

$ echo oook | sed 's/o//g'
k
```



### 4.7 添加内容
`a`: 后一行添加内容，与 `vim` 类似  
`i`: 前一行添加内容，与 `vim` 类似

命令：`sed '/regexp/i addText'` 或 `sed '/regexp/a addText'`

```sh
# i: 指定前一行
# a: 指定后一行
# -e: 指定脚本，重复使用实现一个命令多个脚本
$ echo hello | sed -e '/hello/i hello insert' -e '/hello/a hello append'
hello insert
hello
hello append
```


### 4.8 原地替换文件内容
`-i`: 原地替换文本内容
```sh
$ cat hello.txt
hello, world
hello, world
hello, world

# 把 hello 替换成 world
# -i: 原地替换文件内容
# g: 为全局匹配模式
# 由于是多行模式，不加 g 默认匹配每行第一个
$ sed -i 's/hello/world/g' hello.txt

$ cat hello.txt
world, world
world, world
world, world
```





