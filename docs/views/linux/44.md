---
title: xargs 标准输入转化为命令行参数
date: 2022-12-03
tags:
 - linux
categories: 
 - linux
---


## 总结
- `echo package.json | xargs cat`: 标准输入转化为命令行参数，默认添加到最后  
- `-I `: 占位符，控制命令行参数位置，`echo 5 | xargs -I {} head -n {} package.json`，此时默认分隔符为换行符
- `-p`: 打印执行的命令，需要键入 `y` 确认
- `-t`: 打印执行的命令，且立马执行
- `-d`: 指定分隔符
- `-0`: 指定 `null` 即没有分隔符，在明确不需要分隔成多个参数时使用，避免使用默认的空格或换行符等空白字符分隔
- `-n`：指定参数数量作为一个命令行参数，重视参数的数量。使得可以多次执行命令
- `-L`：指定行数作为一个命令行参数，重视标准输入的行，不关注参数的数量。使得可以多次执行命令。因为换行符也是默认分隔符，所以多行文本在不设置 `-L` 时，跟没换行，仅用空格隔开的效果一样，只执行一次。
- `-P`：多个进程执行，0 为无限制。`-n / -L` 使得可以多次执行命令，但每次执行都需要等待上个命令执行完毕，在一些场景我们更关注执行效率，多进程执行可以提高效率。

## 提问
- [x] 1. 如何将标准输入作为命令行参数
    > `<command> | xargs <command>`
- [x] 2. 如何批量将所有后缀为 `.md` 的文件改为 `.mdx` 
    > `find -name '*.md' | sed 's/\(.*\).md/\1/' | xargs -I {} mv {}.md {}.mdx`
- [x] 3. 如何读取当前目录（不包含子目录）下所有后缀为 `.md` 的文件，并逐个打印文件名、文件内容
    > `find -maxdepth 1 -name '*.md' | xargs 1 -I {} sh -c 'echo {} && cat {}'`     
    或     
    `ls *.md | xargs -I {} sh -c 'echo {} && cat {}'`

    > `sh -c command_string`: 将命令文本视为命令执行

    > 可能会有疑问 `ls` 默认不是显示一行空格分隔吗？     
    而 `xargs -I {}` 会使分隔符默认为换行符，最终会将 `ls` 一行的输出都放在占位符里，导致非预期输出。要加个 `-d ' ' ` 解决分隔问题。      
    但实际上 `ls` 只是显示在一行，实际还是带有换行符的，使用 
    `ls | cat -e` 可以看到，所以不用多余操作。
 





## 1. 前提提要、场景

我们可以通过 `pipe` 将标准输出转换为标准输入，标准输入传递给命令。如以下
```bash
$ cat /etc/passwd | grep root

# 由于 grep 可以接受【标准输入】作为参数
# 等价于 
$ grep root /etc/passwd
```

但不是所有命令都接受标准输入作为参数的，如以下
```bash
# cat 没有按照期望打开 package.json 文件
$ echo package.json | cat
package.json
```

为了解决覆盖这类场景，便有了 `xargs` ，可以将【标准输入】转化为命令行参数
```bash
# 成功，内容过多，截取一部分
$ echo package.json | xargs cat
{
  "private": true,
  "workspaces": [
```


## 2. xargs

命令：`xargs [options] [command [initial-arguments]]`，一般搭配 `pipe`      
例子：`echo package.json | xargs cat`



### 2.1 `-I replace-str` 占位符

使用 `xargs` 默认会将【标准输入】放在命令的最后位置
```bash
$ echo 5 | xargs head -n package.json
head: invalid number of lines: ‘package.json’
# 等价于以下，默认作为命令的最后一个参数
$ head -n package.json 5
head: invalid number of lines: ‘package.json’
```

如果要自定义参数的位置，可以使用 `-I replace-str` 使用占位符     
`replace-str` 可以更改为其他占位符，一般使用 `{}`
```bash
$ echo 5 | xargs -I {} head -n {} package.json
{
  "name": "Tab" ,
  "version": "1.0.1",
  "description": "Firefly's blog",
  "main": "index.js",
```

需要注意，使用 `-I`时，分隔符默认为换行符
```bash
# 需要留意一点
# 使用 `-I` 占用符时，分隔符默认为 换行符
# echo -n: 不输出末尾换行
# -p: 打印执行语句，键入 y 继续执行
$ echo -n '1 2 4' | xargs -pI {} head -n {} package.json  
head -n 1 2 4 package.json ?...



# 需要显性设置分隔符为空格
# -d: 设置分隔符
$ echo -n '1 2 4' | xargs -pn 1 -d ' ' -I {} head -n {} package.json  
head package.json -n 1 ?...y
{
head package.json -n 2 ?...y
{
  "name": "Tab" ,
head package.json -n 4 ?...y
{
  "name": "Tab" ,
  "version": "1.0.1",
  "description": "Firefly's blog",

```

### 2.2 `-p/-t` 打印出执行命令 
有时候我们想确认下真正执行的命令是怎样的，是否符合我们的预期。    
可以使用以下两个参数 
- `-p`: 打印执行的命令，需要键入 `y` 确认
- `-t`: 打印执行的命令，且立马执行

> 学习时可以经常使用 `-p` 查看真正执行的命令
```bash
# -p: 打印执行的命令，需要键入 y 确认
$ echo 5 | xargs -pI {} head -n {} package.json
# 键入 y
head -n 5 package.json ?...y
{
  "name": "Tab" ,
  "version": "1.0.1",
  "description": "Firefly's blog",
  "main": "index.js",


# -t: 打印执行的命令，且立马执行
$ echo 5 | xargs -tI {} head -n {} package.json
head -n 5 package.json 
{
  "name": "Tab" ,
  "version": "1.0.1",
  "description": "Firefly's blog",
  "main": "index.js",
```


### 2.3 `-d delim` 分隔符 

参数和参数的分隔符，默认是使用空格或换行等空白字符。但当标准输入为 `a:b:c` 时，我们想要将其分隔为三个参数。便需要更改分隔符。  
- `-d`: 指定分隔符
- `-0`: 指定 `null` 即没有分隔符，在明确不需要分隔成多个参数时使用，避免使用默认的空格或换行符等空白字符分隔

```bash
# -d: 指定分隔符
$ echo 'a:b:c' | xargs -pd : mkdir
mkdir a b c ?...

# 有时候文件名带有空格，甚至其他未知字符。
# 在明确不需要分隔成多个参数的时使用
# -print0: 使用 null 分隔符替换换行，与 xargs -0 对应。
$ find . -name "*.json" -print0 | xargs -0p rm
rm ./1.json ./2.json ./demo.json ?...

# 当然查找删除最便捷还是使用 find -delete
```


当标准输入为多行参数时
```bash
# 因为默认分隔符为空格或换行符等空白字符
# 所以跟没换行空格隔开的效果一样
$ cat <<EOF | xargs -p touch    
a.json
b.json
c.json
EOF
touch a.json b.json c.json ?...

# 分隔符，默认使用空白或换行等空白符
# 如果【标准输入】含有空格作为正文需要，则需要更改分隔符
# 否则会出现意外效果
$ cat <<EOF | xargs -p touch    
a 1.json
b 1.json
c 1.json
EOF
touch a a.json b b.json c c.json ?...y

$ ls
1.json  a  b  c

# 指定分隔符
$ cat <<EOF | xargs -d '\n' -p touch    
a 1.json
b 1.json
c 1.json
EOF
touch a 1.json b 1.json c 1.json ?...y

$ ls
'a 1.json'  'b 1.json'  'c 1.json'
```


### 2.4 `-n max-args` 指定参数数量作为一个命令行参数

分隔符只是分隔出参数，或者理解为产出参数      

在有些场景，如以下情况
- 命令无法接收多个参数
- 命令参数数量过多会报错

这些场景下，我们便需要指定“多少个参数数量”作为一个命令行参数，超过的限制的数量，则另起一个命令。

这时候可以使用 `-n`

```bash
# 场景：每次执行只能接受一个参数
# echo -n: 不输出最后的换行
# xargs -n: 指定参数数量作为一个命令行参数 
$ echo -n '1 2 4' | xargs -pn 1 head package.json -n 

head package.json -n 1 ?...y
{
head package.json -n 2 ?...y
{
  "name": "Tab" ,
head package.json -n 4 ?...y
{
  "name": "Tab" ,
  "version": "1.0.1",
  "description": "Firefly's blog",
# 可以看到，每个参数单独执行一遍命令


```


当标准输入为多行参数时
```bash
# 因为默认分隔符为空格或换行符等空白字符
# 所以跟没换行，仅用空格隔开的效果一样
$ cat <<EOF | xargs -pn 1 touch       
a.json
b.json
c.json
EOF
touch a.json ?...y
touch b.json ?...y
touch c.json ?...y
```



### 2.5 `-L max-lines` 指定行数作为一个命令行参数

当【标准输入】为多行时，如果需要指定行为单位，作为命令行参数，可以使用 `-L`

超过行数限制，将会另起一个命令

```bash
# -L: 指定 n 行作为一个命令行参数 
$ cat <<EOF | xargs -pL 1 touch       
a.json b.json c.json
d.json e.json 
EOF
touch a.json b.json c.json ?...y
touch d.json e.json ?...y

# 可以看出，此时的维度为行，并不关注一行由于分隔符分隔成多少个参数
```

小总结：
- `-n`：指定参数数量作为一个命令行参数，重视参数的数量。使得可以多次执行命令
- `-L`：指定行数作为一个命令行参数，重视标准输入的行，不关注参数的数量。使得可以多次执行命令。因为换行符也是默认分隔符，所以多行文本在不设置 `-L` 时，跟没换行，仅用空格隔开的效果一样，只执行一次。

### 2.6 `-P max-procs` 多个进程
上面介绍可以多次执行命令，每次执行都需要等待上个命令执行完毕。

在一些场景我们更关注执行效率，例如批量关闭 `docker` 进程。

可以指定 `-P`，实现多进程。
```bash
# docker ps -q: 只打印容器的id
# -P: 最多进程数量，0 为无限制
$ docker ps -q | xargs -L 1 -P 0 docker kill
```



