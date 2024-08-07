---
title: 权限/所属更改 chmod、chown
date: 2022-10-20
tags:
 - linux
categories: 
 - linux
---


## 总结
-  `chown -R <user>:<group> <filename>` 遍历设置所有文件的所属用户和所属用户组
-  `chmod xxx <filename>`  直接设置权限
-  `chmod [ugoa...][[+-=][perms...]...]` 可读式设置权限





## 提问
- [x] 1. 给某一个文件的所有用户（ugo）都移除 Read 权限
    > chmod a-r \<filename\>
- [x] 2. 给某一个文件的所有用户（ugo）都添加 Read 权限
    > chmod a+r \<filename\>
- [x] 3. 为文件添加权限时，数字 600 代表什么意思
    > rw-------     
    只有所属用户可读可写
- [x] 4. 当我们新建了一个文件时，他默认的 mode 是多少
    > root用户组 644     
    其它用户 664 
- [x] 5. 如何获取一个文件的 username 与 groupname
    > `ls -l` 或者 `stat <filename>`
- [x] 6. 在 Node.js 或其它语言中如何修改 user 及 mode
    > [fs.chown(path, uid, gid, callback)](https://nodejs.org/api/fs.html#fschownpath-uid-gid-callback) 和 [fs.chmod(path, mode, callback)](https://nodejs.org/api/fs.html#fschmodpath-mode-callback)







## 1. 前提提要、场景
文件有可读、可写、可执行权限，缺少相关权限则无法执行对应操作。可以给所属用户、所属群组或其它人分配对应权限。



## 2. chown 更改文件的所属用户及用户组
`change owner`，可以通过 `ls -l` 查询文件的所属用户和用户组
```sh
$ ls -l
total 824
drwxr-xr-x 5 bo root   4096 Oct 13 10:10 docs
-rw-r--r-- 1 bo root    592 Oct 13 10:10 package.json
-rw-r--r-- 1 bo root 416647 Oct 13 10:10 package-lock.json
-rw-r--r-- 1 bo root     51 Oct 13 10:10 README.md
-rw-r--r-- 1 bo root   1780 Oct 13 10:10 Server.js
-rw-r--r-- 1 bo root 407538 Oct 13 10:10 yarn.lock
```

可以通过 `chown -R`，递归将子文件所属用户及用户组进行修改
```sh
# 将 . 文件夹下当前目录的用户及用户组设为 shanyue
# -R：遍历子文件修改
$ chown -R bo:bo .
```



## 3. EACCES: permission denied 权限报错
在前端使用 `yarn` 去装包的时候，可能会遇到以下问题
```sh
$ yarn
error An unexpected error occurred: "EACCES: permission denied, unlink '/home/train/Documents/react/node_modules/@babel/cli/node_modules/commander/CHANGELOG.md'".
info If you think this is a bug, please open a bug report with the information provided in "/home/train/Documents/react/packages/react/yarn-error.log".
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.
```
可能的原因是 `node_modules` 文件非本用户，并操作没拥有的权限。这个时候利用 `chown` 修改文件所属即可修复。    
`chown -R bo:bo node_modules`



## 4. chmod 修改文件权限
`change mode` 修改文件权限
修改完文件所属后，便可以针对不同身份设置不同权限了。可以通过 `ls -l` 查询文件权限
```sh
$ ls -l
total 824
# 第一列为文件权限
drwxr-xr-x 5 bo root   4096 Oct 13 10:10 docs
-rw-r--r-- 1 bo root    592 Oct 13 10:10 package.json
-rw-r--r-- 1 bo root 416647 Oct 13 10:10 package-lock.json
-rw-r--r-- 1 bo root     51 Oct 13 10:10 README.md
-rw-r--r-- 1 bo root   1780 Oct 13 10:10 Server.js
-rw-r--r-- 1 bo root 407538 Oct 13 10:10 yarn.lock
```
第一个字母为文件类型，详见 stat，后面每3位为一组权限       
`d | rwx | r-x | r-x`     
- 分组方面
  - 所属用户 
  - 所属用户组 
  - 其它用户      
- 权限方面
  - r: 可读，二进制为 100，十进制为 4
  - w: 可写，二进制为 010，十进制为 2
  - x: 可执行，二进制为 001，十进制为 1

```sh
# rw-：所属用户可写可读，110，十进制 6
# r--：所属用户组可读，100，十进制 4
# r--：其它用户可读，100，十进制 4
# 所以加起来就是 644
-rw-r--r--
```



### 4.1 chmod xxx \<filename\> 直接设置
```sh
# 777，rwxrwxrwx，代表所有用户可读可写可执行
$ chmod 777 yarn.lock
```




### 4.2 chmod [ugoa...][[+-=][perms...]...] 可读式设置
更加偏向人类可读的设置方式
```sh
# u: user
# g: group
# o: other
# a: all
# +-=: 增加减少复制
# perms: 权限
$ chmod [ugoa...][[+-=][perms...]...]

# 为 yarn.lock 文件的用户所有者添加可读权限
$ chmod u+r yarn.lock

# 为所有用户添加 yarn.lock 的可读权限
$ chmod a+r yarn.lock

# 为所有用户删除 yarn.lock 的可读权限
$ chmod a-r yarn.lock
```




