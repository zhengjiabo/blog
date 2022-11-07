---
title: 文件信息 stat
date: 2022-10-13
tags:
 - linux
categories: 
 - linux
---


## 总结
1. stat -c: 指定输出元属性
   - `"%a"`: 权限
   - `"%A"`: 权限 - 更符合人类可读
   - `"%F"`: 文件类型
   - `"%Y"`: 修改时间 
   - `"%y"`: 修改时间 - 更符合人类可读
   - `"%h"`: 硬链接数量 
  
2. 元属性：
   - mtime 修改文件内容时间
   - ctime 修改文件时间
   - atime 访问文件时间
   - birth 创建时间
   - Inode 文件区块唯一标志
   - Access Mode 权限
   - File Type 文件类型
   - Size 文件大小
   - Links 文件硬链接个数
   - Uid/Gid 文件所属用户和用户组

3. fileTyoe：
   - 目录文件 `d`
   - 符号链接 `l`
   - 普通文件 `-` 或 `f` (file)
   - 块级设备文件 `b`
   - 字符设备文件 `c`
   - 套接字文件 `s`

## 提问
- [x] 1. 尝试说出四种以上文件类型
    - 目录文件 `d`
    - 符号链接 `l`
    - 普通文件 `-` 或 `f` (file)
    - 块级设备文件 `b`
    - 字符设备文件 `c`
    - 套接字文件 `s`

- [x] 2. 尝试说出四种以上文件元属性
    - mtime 修改文件内容时间
    - ctime 修改文件时间
    - atime 访问文件时间
    - birth 创建时间
    - Inode 文件区块唯一标志
    - Access Mode 权限
    - File Type 文件类型
    - Size 文件大小
    - Links 文件硬链接个数
    - Uid/Gid 文件所属用户和用户组
  
- [x] 3. 如何查看某个文件的文件类型     
    `stat -c '%F' <file>` 或者 `exa -lah` 第一个字母
- [x] 4. 如何判断某个文件是一个软链接及硬链接       
    `stat -c '%F' <file>` 为 Symbolic link 或者 `exa -lah` 第一个字母为 `l` 为软连接
- [x] 5. 我们修改了文件的 mode，在 git 中是否有更改操作     
    使用 `chmod` 修改，git 有更改操作
- [x] 6. 我们仅仅修改了文件的 mtime，在 git 中是否有更改操作        
    修改文本内容后保存，再改回来。git 没有更改操作
- [x] 7. 在 Node.js 或其它语言中如何获取 stat 信息      
    `fs.stat` 







## 1. 前提提要、场景
前面使用 `exa -lah` 查询目录的文件，但列表里都是什么意思，例如 `Permissions`、`Modified` 



## 2. stat 查询文件信息
```bash
$ stat README.md
  Filæe: README.md
  Size: 51              Blocks: 8          IO Block: 4096   regular file
Device: fe01h/65025d    Inode: 2364779     Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2022-09-29 22:31:50.847884042 +0800
Modify: 2022-09-29 22:17:21.435980710 +0800
Change: 2022-09-29 22:17:21.435980710 +0800
Birth: -
```
- `regular file`: 普通文件
- `Size`: 文件体积
- `Inode`: 文件的 Inode 编号，Inode 在分区内具有唯一性
- `Links`: 文件硬链接个数，为 2，代表有两个相同 Inode 的文件
- `Access Mode`: mode，文件访问模式或权限，对应列 Permissions
- `Uid/Gid`: owner，文件所属用户与组 ID
- `Access`: atime，文件访问时间
- `Modify`: mtime，文件内容修改时间（在 HTTP 服务器中，常以此作为 last-modified 响应头）
- `Change`: ctime，文件修改时间（包括属性，比如 mode 和 owner，也包括 mtime，因此 ctime 总比 mtime 大）
- `Birth`: 诞生时间，某些操作系统其值为 -

> 详细解释可以查询 [stat 文档](https://www.man7.org/linux/man-pages/man2/stat.2.html#DESCRIPTION)



## 3. stat -c 指定元属性输出
```bash
$ stat -c <FORMAT> <file>
# %a     access rights in octal (note '#' and'0' printf flags)
# %A     access rights in human readable form
# %b     number of blocks allocated (see %B)
# %B     the size in bytes of each block  reported by %b
# %C     SELinux security context string
# %d     device number in decimal
# %D     device number in hex
# %f     raw mode in hex
# %F     file type
# %g     group ID of owner
# %G     group name of owner
# %h     number of hard links
# %i     inode number
# %m     mount point
# %n     file name
# %N     quoted file name with dereference if symbolic link
# %o     optimal I/O transfer size hint
# %s     total size, in bytes
# %t     major device type in hex, for  character/block device special files
# %T     minor device type in hex, for character/block device special files
# %u     user ID of owner
# %U     user name of owner
# %w     time of file birth, human-readable; - if unknown
# %W     time of file birth, seconds since Epoch; 0 if unknown
# %x     time of last access, human-readable
# %X     time of last access, seconds  since Epoch
# %y     time of last data modification, human-readable
# %Y     time of last data modification, seconds since Epoch
# %z     time of last status change,  human-readable
# %Z     time of last status change,  seconds since Epoch
```

一般常用以下
```bash 
$ stat -c "%a" README.md # 权限
644
$ stat -c "%A" README.md # 权限 - 更符合人类可读
-rw-r--r--

$ stat -c "%F" README.md # 文件类型
regular file

$ stat -c "%Y" README.md # 修改时间 
1664461041
$ stat -c "%y" README.md # 修改时间 - 更符合人类可读
2022-09-29 22:17:21.435980710 +0800

$ stat -c "%h" README.md # 硬链接数量 
1 # 1 代表没有其他硬链接，大于 1 则有

```


## 4. 文件类型，stat -c "%F" \<file\>

在 Linux 中一切都是文件，目录也是文件。

| 名称         | stat 中展示              | exa / ls 第一个字符 | 描述                                                                                               |
| ------------ | ------------------------ | ------------------- | -------------------------------------------------------------------------------------------------- |
| 普通文件     | `regular file`           | `-`  或 `f` (file)                 |                                                                                                    |
| 目录文件     | `directory`              | `d`                 |                                                                                                    |
| 符号链接     | `symbolic link`          | `l`                 |                                                                                                    |
| 套接字文件   | `socket`                 | `s`                 | 一般以 .sock 作为后缀。可把 .sock 理解为 API，我们可以像 HTTP 一样对它请求数据）, 还有 docker.sock |
| 块设备文件   | `block special file`     | `b`                 |                                                                                                    |
| 字符设备文件 | `character special file` | `c`                 |                                                                                                    |


```bash
# c 字符设备文件
# b 块级设备文件
$ exa -lah /dev
crw-rw-rw-     5,0 root 11 Oct 17:01  tty
brw-rw----   254,0 root 13 Sep 12:53  vda
```






