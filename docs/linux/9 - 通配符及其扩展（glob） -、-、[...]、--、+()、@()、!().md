---
title: 通配符及其扩展（glob） *、?、[...]、**、+()、@()、!()
date: 2022-10-30
tags:
 - linux
categories: 
 - linux
---


## 总结
- 通配符：
  - `*`：匹配 0 个及以上字符
  - `?`：匹配 1 个字符
  - `[...]`：range，匹配方括号内任意字符
  - `**`：匹配0个及多个子目录
- 扩展通配符：（跟正则类似）
  - `?(pattern-list)`: 重复0次或1次的模式
  - `*(pattern-list)`: 重复0次或多次
  - `+(pattern-list)`: 重复1次或多次
  - `@(pattern-list)`: 重复1次
  - `!(pattern-list)`: 非匹配


## 提问
- [x] 1. 如何判断当前终端是哪个 `shell` 
  > `echo $0` 或者 `echo $SHELL`
- [x] 2. 列出当前目录（不包含子目录）下所有的 `js` 文件
  > `exa -lah *.js`
- [x] 3. 列出当前目录（不包含子目录）下所有的 `js` 文件和 `json` 文件
  > `exa -lah *.@(js|json)`
- [x] 4. 假设有 `test000.json` 到 `test099.json` 100个文件，如何列出所有带有数字 258 的文件
  > `exa -lah test[258].json`



<!-- ## 疑问
- [ ] 1. -->




## 1. 前提提要、场景
有很多场景需要匹配指定文件进行操作，例如删除当前目录所有 `js` 文件：`rm *.js`         

这便是使用了通配符 `glob`（`global` 的简写）

详见文档 [glob](https://man7.org/linux/man-pages/man7/glob.7.html)，也可以通过 `man bash`，查找 `Pattern Matching` 找到文档。
> 在 `Node.js/Python` 等各个语言中，也有对 `glob` 的支持，比如 [globby](https://www.npmjs.com/package/globby)     




## 2. `*、?、[...]、**`  通配符 glob

基本语法：
- `*`：匹配 0 个及以上字符
- `?`：匹配 1 个字符
- `[...]`：range，匹配方括号内任意字符
- `**`：匹配0个及多个子目录（在 `bash` 下，需要开启 `globstar` 选项，开启方式参考下方的 `shopt` 命令 `shopt -s globstar`）

与 `JS` 的正则有些不一样。正则是前一字符位置的描述（扩展匹配符），而这里的 `*`、`?` 为自身位置的描述。

```sh
# 列出当前目录下所有的 js 文件
$ ls -lah *.js
-rw-r--r-- 1 train train 1.5K Jun 10 15:45 ReactVersions.js
-rw-r--r-- 1 train train 1.1K May 22  2021 babel.config.js
-rw-r--r-- 1 train train 7.5K Jun 10 15:45 dangerfile.js

# 列出当前目录及所有子目录的 js 文件
$ ls -lah **/*.js

# 列出当前目录及所有子目录的后缀名为两个字符的文件
$ ls -lah **/*.??

# 列出当前目录中，以 2 或 5 或 8 开头的文件
$ ls -lah [258]*
```




## 3. \*()、\?()、+()、@()、!()  扩展通配符 extglob
- `?(pattern-list)`: 重复0次或1次的模式
- `*(pattern-list)`: 重复0次或多次
- `+(pattern-list)`: 重复1次或多次
- `@(pattern-list)`: 重复1次
- `!(pattern-list)`: 非匹配


```sh
# 列出所有以 js/json/md 结尾的文件
$ ls -lah *.@(js|json|md)
```

在 `bash` 中，`extglob` 需要通过 `shopt` 命令手动开启。
```sh
$ shopt -s extglob

$ shopt | grep glob
dotglob         off
extglob         on
failglob        off
globasciiranges off
globstar        off
nocaseglob      off
nullglob        off
```
> `shopt`，`shell option` 缩写，即 `shell` 的配置。


在 `zsh` 中，`extglob` 需要通过 `setopt` 命令手动开启。
```sh
$ setopt extendedglob
$ setopt kshglob
```