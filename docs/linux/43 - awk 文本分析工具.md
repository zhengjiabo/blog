---
title: awk 文本分析工具
date: 2022-11-30
tags:
 - linux
categories: 
 - linux
---


## 总结
- `-F`: 指定分隔符
- `{ print $0}`: 打印，一般用于重新封装

内置变量
- `$0`: 文本本身
- `$1`: 第一列，以此类推
- `NR`： 记录号（行号），每处理完一条记录，`NR` 值加1
- `NF`： 字段数，即 `$1,$2...$100` 的个数
- `FS`： 输入字段分隔符，默认空格

example: 
- `awk '{print $1,$2}'`: 打印指定列
- `awk '{print NR,$0}'`: 添加行号
- `awk '/expression/'`: 过滤打印匹配行
- `awk '/expression/ {print $1,$2}'`: 过滤打印匹配行的列
- `awk '/expression/ {print $1,$2} /expression1/ {print $2,$3}'`: 多个匹配组合
- `awk '$2 ~/expression/'`: 针对某一列进行匹配
- `awk '$2<4 || $3>10'`: 条件操作符
- `awk '{if($1=="a") {print $3} else {print $2}}'`: 条件表达式

> 注意：需要使用单引号，因为双引号会对变量名进行替换，而 `$0 $1...` 这些会被 `shell` 工具识别且替换。导致无法以原本的字符传递给 `awk`。




## 提问
- [x] 1. 如何打印第十行数据
    > `awk 'NR==10'`
    > `sed` 中使用 `sed -n '10p'`
- [x] 2. 如何将文本以 `,` 分割并列出第三列
    > `awk -F , '{print $3}'`
- [x] 3. 找到所有包含 `react` 的行
    > `awk '/react/`






## 1. 前提提要、场景

`Linux` 三剑客（`grep`、`sed`、`awk`）之一。      

`awk` 是一个文本分析工具。具有以下特点:
- 获取文本中的某个列
- 像 `sed` 一样，打印匹配字符的行
- 有条件、循环操作符
- 有内置变量


## 2. awk
命令：`awk [ -F fs ] 'prog' [ file ... ]`      
- `-F`：设置分隔符，后面跟随 `fs`（`field separator`）分隔符
- `prog`: `awk` 语法，或者称为 `Action`

示例：`awk '{print $0}' demo.txt`


## 3. Action 动作
`awk` 中要执行的语句或命令称为 `Action`，即 `prog`。 

- `print`：打印
- `if(expression) statement [else statement]`：条件

当然还有更多参考以下，来源 `man`
```sh
# 粗略瞥一眼就行，知道个大概印象。
if( expression ) statement [ else statement ]
while( expression ) statement
for( expression ; expression ; expression ) statement
for( var in array ) statement
do statement while( expression )
break
continue
{ [ statement ... ] }
expression              # commonly var = expression
print [ expression-list ] [ > expression ]
printf format [ , expression-list ] [ > expression ]
return [ expression ]
next                    # skip remaining patterns on this input line
nextfile                # skip rest of this file, open next, start at top
delete array[ expression ]# delete an array element
delete array            # delete all elements of array
exit [ expression ]     # exit immediately; status is expression
```

## 4. awk examples
### 4.1 获取文本中的某个列
`print`: 打印，一般用于重新封装
`$0`: 文本本身
`$1`: 第一列，以此类推
```sh
# $0: 文本本身
$ cat <<EOF | awk '{print $0}'
a1 a2 a3 a4
b1 b2 b3 b4
c1 c2 c3 c4
EOF

a1 a2 a3 a4
b1 b2 b3 b4
c1 c2 c3 c4

# $1: 第 1 列
$ cat <<EOF | awk '{print $1,$2}'
a1 a2 a3 a4
b1 b2 b3 b4
c1 c2 c3 c4
EOF

a1 a2
b1 b2
c1 c2


# 多个匹配组合
$ cat <<EOF | awk '/b:b/ {print $1,$2} /c:c/ {print $2,$3}'
a:a a:2 a:3 a:4
b:1 b:b b:3 b:4
c:1 c:2 c:c c:4
EOF

b:1 b:b
c:2 c:c
```


> 注意：需要使用单引号，因为双引号会对变量名进行替换，而 `$0 $1...` 这些会被 `shell` 工具识别且替换。导致无法以原本的字符传递给 `awk`  

也可以通过 `-F` 指定分隔符
```sh
# -F: 分隔符
$ cat <<EOF | awk -F : '{print $1}'
a1:a2:a3:a4
b1:b2:b3:b4
c1:c2:c3:c4
EOF

a1
b1
c1
```


### 4.2 打印匹配字符的行

```sh
$ cat <<EOF | awk '/cat/'
hello cat
hello dog
hello pig
EOF

hello cat
```

也可以针对某一列进行匹配
```sh
# 记得 ~ 号
# 虽然第 1 列大家都有 o，但指定匹配第 2 列
$ cat <<EOF | awk '$2 ~/o/'
hello cat
hello dog
hello pig
EOF

hello dog
```



### 4.3 条件操作符

```sh
# 默认是数字匹配
$ cat <<EOF | awk '$2==b'
a b c d
e f g h
i j k l   
EOF
# 没有匹配到


# 加引号：文本匹配
# 所以精准匹配文本时，要记得加双引号
# 如果模糊匹配，可以使用 awk '$2 ~/b/' 在列中模糊匹配
$ cat <<EOF | awk '$2=="b"'
a b c d
e f g h
i j k l   
EOF

a b c d


# 还有 >、>=、<、<=、!= 等
$ cat <<EOF | awk '$2>=6'
1 2 3 4
5 6 7 8
9 10 11 12
EOF

5 6 7 8
9 10 11 12


# 配合 || &&  
$ cat <<EOF | awk '$2<4 || $3>10'
1 2 3 4
5 6 7 8
9 10 11 12
EOF

1 2 3 4
9 10 11 12


# 条件表达式 if( expression ) statement [ else statement ]
$ cat <<EOF | awk '{if($1=="a") {print $3} else {print $2}}'
a b c d
e f g h
EOF

c
f

```


### 4.4 内置变量
`NR`： 记录号（行号），每处理完一条记录，`NR` 值加1
`NF`： 字段数，即 `$1,$2...$100` 的个数
`FS`： 输入字段分隔符，默认空格

添加序号
```sh
# print: 打印，一般用于重新封装
# NR: 行号
$ cat <<EOF | awk '{print NR,$0}'
a b c d
e f g h
i j k l
EOF

1 a b c d
2 e f g h
3 i j k l
```

也可以结合条件判断
```sh
$ cat <<EOF | awk 'NR>1 && NR<3'
a b c d
e f g h
i j k l
EOF

e f g h
```

查看列数
```sh 
# NF：字段数
$ cat <<EOF | awk '{print NF}'
a b c d
e 
i j k 
EOF

4
1
3
```


分隔符
```sh 
# FS：分隔符，默认空格
$ cat <<EOF | awk '{print FS}'
a b c d
e f g h
EOF

# 两行空格

```


