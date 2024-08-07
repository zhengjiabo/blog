---
title: 管道 pipe、fd、redirection、hereDoc、/dev/null
date: 2022-10-30
tags:
 - linux
categories: 
 - linux
---


## 总结
- `|`：管道连接传输入 `cat package.json | head -10 | tail -3`
- 文件描述符
  - `stdin`: 0     
  - `stdout`: 1     
  - `stderr`: 2
- 内容写入/追加
  - `>`: 内容写入
  - `>>`: 内容追加
- `Here Document`：在终端里面将**内容**写入到文件的一种方式，`cat <<EOF > READEME.md`
- `> /dev/null 2>&1`：日志重定向，不显示标准输出日志、标准错误日志。


## 提问
- [x] 1. > 与 >> 的区别是什么
  > `>`：内容写入，会把原本文件内容覆盖  
  `>>`：内容追加，在原本文件内容后面追加内容

- [x] 2. stdin/stdout 的文件描述符各是多少
  > `stdin`: 0     
  `stdout`: 1     
  `stderr`: 2

- [x] 3. 什么是 `Here Document`
  > 在终端里面将**内容**写入到文件的一种方式，一般使用方法 `cat <<EOF > README.md`      
  输入 `<<EOF`，将进入输入模式，此时可以通过键盘输入内容，在结尾处输入 `EOF`，则会自动退出输入模式，并由 `cat` 打印输出，随后输出作为输入，由后面的 `> README.md`，将内容写到文件中
- [x] 4. 如何不显示某个命令的日志
  > `> /dev/null` 指向，如果也不输出异常信息，则使用 `> /dev/null 2>&1`



<!-- ## 疑问
- [ ] 1. -->




## 1. 前提提要、场景
`JS` 中的函数，可以为其提供参数，进行传参调用。`linux` 的指令也可以接收参数，利用 **管道** 进行传参调用。




## 2. |（pipe 管道）
`|` 构成了管道，它将前边命令的标准输出（stdout）作为下一个命令的标准输入（stdin）。
```sh
# 读取 package.json 内容，读取前十行，再读取最后三行
$ cat package.json | head -10 | tail -3
```



## 3. stdin/stdout 标准输入/标准输出
`stdin/stdout` 是特殊的文件描述符
- `stdin`，fd = 0，从键盘中读取数据
- `stdout`，fd = 1，将数据打印至终端
- `stderr`，fd = 2，标准错误，将异常信息打印至终端
  
`stdout` 可通过 `pipe` 作为 `stdin`。

> `fd`：`file descriptor` 一个非负整数，通过文件描述符可用来读写文件。



## 4. > / >> 内容写入/追加
也称 `redirection`
- `>`：将文件描述符或标准输出中内容写入文件
- `>>`：将文件描述符或标准输出中内容追加入文件

```sh
# 将 hello 写入到文件READEME.md
# 这里的 echo hello 指令的文件描述符为 标准输出
$ echo hello > README.md

# 将 hello 追加到文件READEME.md
# 这里的 echo hello 指令的文件描述符为 标准输出
$ echo hello >> README.md
```


## 5. \<\<EOF 内容输入
在终端里面将**内容**写入到文件的一种方式。文档常用 `cat <<EOF > READEME.md`。     
输入 `<<EOF`，将进入输入模式，此时可以通过键盘输入内容，在结尾处输入 `EOF`，则会自动退出输入模式，并由 `cat` 打印输出，随后输出作为输入，由后面的 `> README.md`，将内容写到文件中

`<<EOF`，称作 `Here Document`，当最终写入 `EOF`（End of file）时，则 `heredoc` 会停止输入。

```sh
# word 可以是任意字符，一般选择 EOF
<<[-]word
  # 在这里开始写文档
  here-document
# 敲入 word 后，结束文档写作
word

# 示例：一般使用 EOF，作为结束符
<<EOF
  here-document
EOF
```
![](../assets/1s23.png)



## 6. \> /dev/null 日志重定向
`/dev/null` 是一个空文件，对于所有的输入都统统吃下，化为乌有。     
有时，为了不显示日志，可将所有**标准输出**重定向至 `/dev/null`。
```sh
$ echo hello > /dev/null
```

但此时，只是将 `stdout`fd 1）重定向了，还有 `stderr`fd 2）没有重定向，仍会报错输出。
```sh
$ cat hello > /dev/null
cat: hello: No such file or directory
```     
为了使 `stderr` 也不显示，后面携带 `2>&1`，表示将 `stderr`(fd 2) 重定向至 `stdout`(fd 1)。标准输出日志、标准错误日志都不显示。
```sh
$ cat hello > /dev/null 2>&1
```   
> `/dev/null` 在类 `Unix` 系统中是一个特殊的字符设备文件，它丢弃一切写入其中的数据，读取它则会立即得到一个 `EOF`。在程序员行话，`/dev/null` 被称为比特桶或者黑洞。

