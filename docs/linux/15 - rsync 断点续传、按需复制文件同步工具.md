---
title: rsync 断点续传、按需复制文件同步工具
date: 2022-11-04
tags:
 - linux
categories: 
 - linux
---


## 总结
- 使用 `rsync` 替代 `cp`。
-  `rsync -lahzv <source_file_path> <file_path>`
   - `-l：--links`: 拷贝符号链接
   - `-a：--archive`: 归档模式
   - `-h：--human-readable`: 可读化格式进行输出
   - `-z：--compress`: 压缩传输
   - `-v：--verbose`: 详细输出
   - `--exclude`: 忽略文件
- 可拷贝元属性、可断点续传、可按需复制、压缩



## 提问
- [x] 1. 在 `Node.j`s 或其它语言中如何实现 `cp`。(`cp` 实际上是通过库函数 `open/write` 模拟实现)
    >  `fsPromises.cp(src, dest)` 参考 [fsPromises.cp](https://nodejs.org/api/fs.html#fspromisescpsrc-dest-options)。
- [x] 2. 为何说保留复制文件时的元属性，对静态资源服务器有益
    > 例如 `nginx` 根据 `mtime/size` 生成 `Etag`，归档模式的拷贝可以避免元属性的变动，使得 `Etag` 不变，浏览器缓存不会受影响。
- [x] 3. 在使用 rsync 传输前端项目时，如何忽略 `node_modules` 目录
    > `rsync --exclude node_modules `






## 1. 前提提要、场景
文件复制、上传文件到服务器、从服务器下载文件，这些场景十分常见。     
`rsync` 是一个快速高效、支持断点续传、按需复制、从远程服务器拷贝的文件同步工具。




## 2. 文件上传/下载 rsync -lahzv \<local_file_path\> \<server\>:\<server_file_path\>

### 2.1 命令说明
本地文件上传到服务器 `rsync -lahzv <local_file_path> <server>:<server_file_path>`

服务器文件下载到本地则是将两个地址反过来，挺自由的，也可以本地复制到本地，唯独不可以远程到远程。


按需上传：上传重复文件时，会对比文件的元属性，如果无变更则不会重复上传。

```bash
# 将本地的 react 拷贝到 shanyue 服务器的 ~/Documents 目录
#
# -l：--links，拷贝符号链接
# -a：--archive，归档模式
# -h：--human-readable，可读化格式进行输出
# -z：--compress，压缩传输
# -v：--verbose，详细输出
# --exclude: 忽略文件
$ rsync -lahzv <local_file_path> <server>:<server_file_path>
```

### 2.2 window 下的 rsync
`window` 需要安装 `cygwin64` 且在依赖中选中 `ssh` 和 `rsync`。 使用时如果以下报错，大概率是使用了非 `cygwin64` 的 `ssh` 
```bash
rsync: connection unexpectedly closed (0 bytes received so far) [Receiver]
rsync error: error in rsync protocol data stream (code 12) at io.c(235) [Receiver=3.1.3]
rsync: connection unexpectedly closed (0 bytes received so far) [sender]
rsync error: error in rsync protocol data stream (code 12) at io.c(228) [sender=3.2.4dev]
```

可以使用 `which ssh` 查看当前使用的来源， `where ssh` 查看已有列表

![](../assets/1%2026.png)

可以临时指定 `ssh` 
```bash
# -e: 指定 ssh 路径，根据自己 where ssh 查到的设置
$ rsync -e <ssh_path> -lahzv <local_file_path> <server>:<server_file_path>

$ rsync -e C:\cygwin64\bin\ssh.exe -lahzv ./01.md  bo:/root/temp/
sending incremental file list

sent 61 bytes  received 12 bytes  146.00 bytes/sec
total size is 3.92K  speedup is 53.63
```



## 3. 归档模式 -a
归档模式：拷贝元属性，如 `ctime/mtime/mode` 等等，这对于静态资源服务器相当有用。例如 `nginx` 根据 `mtime/size` 生成 `Etag`，归档模式的拷贝可以避免元属性的变动，使得 `Etag` 不变，浏览器缓存不会受影响。
```bash
# 查看其 yarn.lock 信息
$ ls -lah | grep yarn
-rw-r--r-- 1 root root 323K Oct 24 10:44 yarn.lock

# yarn2.lock 使用 rsync 拷贝
$ rsync -lahz yarn.lock yarn2.lock
# yarn3.lock 使用 cp 拷贝
$ cp yarn.lock yarn3.lock

# 观察可知
# rsync 修改时间/mode 与源文件保持一致
# cp 修改时间为当前最新时间，mode 也不一致
$ ls -lah | grep yarn
-rw-r--r-- 1 root root 323K Oct 24 10:44 yarn.lock
-rw-r--r-- 1 root root 323K Oct 24 10:44 yarn2.lock
-rw-r--r-- 1 root root 323K Nov  5 20:48 yarn3.lock

# 当然，他们不是相同的软、硬链接。inode 都不同
$ find -maxdepth 1 -name 'yarn*' -printf '%i\n'
2367621
2367617
2364783
```



## 4. 拷贝目录
拷贝目录时需要留意 **源目录** 的 `/`
- 不以 `/` 结尾: 该目录连同目录名一起进行拷贝
- 以 `/` 结尾: 该目录下所有内容进行拷贝
```bash
# 以下以拷贝 react 目录为例
# 结果都是：~/Documents/abc/react
$ rsync -lahz ~/Documents/react ~/Documents/abc
$ rsync -lahz ~/Documents/react ~/Documents/abc/

# 结果都是：~/Documents/abc
$ rsync -lahz ~/Documents/react/ ~/Documents/abc
$ rsync -lahz ~/Documents/react/ ~/Documents/abc/
```