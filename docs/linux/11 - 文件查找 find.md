---
title: 文件查找 find
date: 2022-11-01
tags:
 - linux
categories: 
 - linux
---


## 总结
`find` 常用     
匹配项：
- `-name`
- `-mtime`
- `perm`：权限
- `-samefile`：硬链接
- `-type`：文件类型
  
操作项：
- `-exec <command> {} \;`：拼接其他指令
- `-delete`: 删除
- `-print`：打印文件名，行分界
- `-print0`：打印文件名，空字符分界
- `-printf <format>`：根据 `<format>` 计算文件属性打印结果，例如 `\n%s` 换行展示文件大小，`%i` 展示 `inode` 可以查询文档看更多配置。




## 提问
- [x] 1. 如何找到当前目录及所有子目录下文件名包含 `hello` 的文件
  > `find . -name '*hello*'`
- [x] 2. 如何列出当前目录（不包含子目录）下的所有目录
  > `find . -maxdepth 1 -type d`      
  如果不想要 `.` 目录文件，可以加上 `-mindepth 1`
- [x] 3. 如果一个链接为硬链接，那如何在全局目录中找到该文件
  > `find / -samefile <filename>`
- [x] 4. 如何删掉当前目录中最近修改时间大于一年的全部文件
  > `find . -mtime +365 -delete`

<!-- ## 疑问
- [ ] 1. -->




## 1. 前提提要、场景
查找文件，是十分常见的操作。还有查找相同文件的硬链接、软链接等等，需要查找的场景特别多。     

`find` 可以实现两步
- `Tests`：判断进行文件匹配
- `Actions`：进行操作




## 2. Tests 验证文件匹配
在 `find` 中，用以验证某个文件是否匹配的条件称为 `Test`，一般基于文件名称进行查找，也可以根据文件的属性查找。     

- `-name`：根据文件名查找，注意文件名需要使用引号括起来。
- `-mtime`：根据 `mtime` 查找。
- `-perm`：根据权限进行查找。
- `-type`：根据文件类型进行查找。
- `-inum`：根据 `inode` 查找，用以寻找硬链接非常有用。
- `-samefile`：更好用的查找硬链接。


另外，对于某些数字属性，还有 `+/-` 用以比较
- `+n`：大于 `n`，如 `find . -mtime +30`，递归遍历最近修改时间大于 30 天的文件
- `-n`：小于 `n`，如 `find . -mtime -30`，递归遍历最近修改时间小于 30 天的文件


另外，还可以指定检索深度
- `-mindepth`：指定检索最小深度
- `-maxdepth`：指定检索最大深度

```bash
# 注意，如果文件路径名使用 glob，则需要使用引号括起来
$ find . -name '*.json'

# 在当前目录递归查找包含 hello 的文件
$ find . -name '*hello*'

# 在当前目录递归查找修改时间大于 30 天并且小于 60 天的文件
# 其中数字以天为单位，+ 表示大于，- 表示小于
# +30: 大于30天
# -60: 小于60天
$ find . -mtime +30 -mtime -60

# 在当前目录递归查找权限 mode 为 777 的文件
$ find . -perm 777

# 在当前目录递归查找类型为 f/d/s 的文件
$ find . -type f # 普通文件
$ find . -type d # 目录文件
$ find . -type s # 套接字文件 socket

# 在当前目录递归查找 inode 为 10086 的文件
# 一般用以寻找硬链接的个数，比如 pnpm 中某一个 package 的全局路径在哪里
$ find . -inum 10086

# 寻找相同的文件（硬链接），与以上命令相似
$ find . -samefile package.json

# 仅在当前目录递归检索，在搜目录时加了 -mindepth 1 可以防止搜索出自身 .
$ find . -mindepth 1 -maxdepth 1 -name '*.json'
```


## 3. Actions 操作
找到文件后对所查询的文件进行操作：`-exec` 执行命令，文件名使用 `{}` 替代，最后使用 `\;` 结尾。
```bash
# realpath：打印当前文件的绝对路径
$ realpath package.json 
/home/train/Documents/student/shanyue/react/package.json

# 在当前目录递归查找所有以 test 开头的文件，并打印完整路径
# {}: 查找到文件名的占位符
$ find . -name 'test*' -exec realpath {} \;

```
当然使用 `-exec` 加指令可能繁琐些，其自带些常用的快捷指令
```bash
# 在当前目录递归查找所有以 test 开头的文件，并删除
# delete：删除
$ find . -name '*.json' -delete

# 打印文件名，以行为分界
$ find . -name '*.json' -print


# print：打印文件名，以行分界 即默认效果
$ find . -name '*.json' -print
./package.json
./package-lock.json

# print0：打印文件名，以空格分界
$ find . -name '*.json' -print0
./package.json./package-lock.json% 

# printf <format>`：根据 `<format>` 计算文件属性打印结果
# \n: 换行 
# %s: 文件大小  可以查询文档看更多配置
# %i: inode
$ find . -name '*.json' -printf '\n%s'
587
1355386%    
```



