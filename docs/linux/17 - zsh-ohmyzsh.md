---
title: zsh/ohmyzsh
date: 2022-11-06
tags:
 - linux
categories: 
 - linux
---


<!-- ## 总结
-  





## 提问
- [x] 
 -->




## 1. 前提提要、场景
上一章讲了 `sh` 规范的实现 `bash/zsh/fish/dash`。    
`zsh` 是一种更富有交互效果，功能更加强大，界面更加华丽的 `shell` 工具



## 2 安装
各个系统的安装文档 [Installing ZSH](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH)    

默认 `sh` 是 `bash` 或 `dash`。如果想切换默认 `shell` 工具，可以使用：`chsh` (`change shell`)，下次登录会生效。

```sh
# 安装 zsh
# 注意，不同的 linux 发行版，zsh 的安装命令不同
# 以下是 Debian 安装
# -f: 报错尝试修复安装
$ apt-get -f install zsh

# 查看默认的 shell
$ echo $SHELL
/bin/bash

# 找到 zsh 的默认安装位置
$ which zsh
/usr/bin/zsh

# 打印 shell 列表
# -l: 展示列表
$ chsh -l
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/bin/zsh
/usr/bin/zsh

# 如果 chsh 没有 -l 字符选项，使用以下等价命令
$ cat /etc/shells
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/bin/zsh
/usr/bin/zsh

# 更改服务器默认登录的 shell，但此刻不会生效，需要重新登录
# -s: --shell，切换为指定的 shell
$ chsh -s /usr/bin/zsh

# 想要尽快体验 zsh，可直接输入zsh命令
$ zsh
```

## 3. ohmyzsh
[ohmyzsh](https://github.com/ohmyzsh/ohmyzsh) 是一个管理 zsh 插件的轻量框架，使用其搭配 `zsh`，可配置大量有用的好看主题及插件。可以在服务器和本地都安装。
```sh
# 远程下载 install.sh 安装程序并直接执行
# `sh -c command_string`: 将命令文本视为命令执行
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 没有魔法的麻瓜，可以使用以下镜像
$ sh -c "$(curl -fsSL https://ghproxy.com/https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

```

window 用户可以参考 [Window 10上使用zsh并安装oh-my-zsh](https://www.jianshu.com/p/b8272df2796c)进行配置。

## 4 配置
### 4.1 命令缺失
切换过来后发现 `autojump` 的指令 `j` 找不到了，是因为还没有配置好配置文件。可以更改用户配置，这样只对单独用户生效，也可以更改全局配置，对所有用户生效

用户：    
`bash` 的默认配置文件为 `~/.bashrc`        
`zsh` 的默认配置文件为 `~/.zshrc`


全局：   
`bash` 会加载 `/etc/profile` 下的脚本，自己的 `sh` 脚本可以放这。      
但 `zsh` 并不使用 `/etc/profile`，而是使用 `/etc/zsh/` 下面的 `zshenv、zprofile、zshrc、zlogin` 文件，并以这个顺序进行加载。     

由于我在`/etc/profile` 有自己脚本，利用 `redirection >>` 追加到 `/etc/zsh/zshrc`。这样切换用户后同样设置默认 shell `chsh -s /usr/bin/zsh`，拥有相同的配置，也能正常使用 `autojump`。



### 4.2 plugin 插件
在 `zsh` 中可拓展多个插件，可见[插件列表](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins)。
>大部分插件的功能是 `alias` 与 自动补全。

`~/.zshrc` 文件中的 `plugins` 配置，可启用插件 
```sh
plugins=(git dotenv vi-mode)
```
- [git](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git): 添加了大量别名，例如 g => git
- [dotenv](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/dotenv): 可使 `.env` 文件中环境变量可在终端直接访问。
- [vi-mode](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/vi-mode): 可在命令行下输出命令时使用 `vim`。
- [autojump](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/autojump#readme): 尝试匹配 `autojump`，就不用像我上面缺失命令自己修改。
- [z](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/z): 跟 `autojump` 类似




### 4.3 theme 主题
`ohmyzsh` 中维护了多个主题，可见 [主题列表](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)     

`~/.zshrc` 文件中的 `ZSH_THEME` 配置，可更换主题。
```sh
# 默认主题 
ZSH_THEME="robbyrussell"

# 也可以设置随机主题
ZSH_THEME="random"

# 在随机主题下，后续喜欢上了某个主题，查看环境变量 RANDOM_THEME 
$echo $RANDOM_THEME
```


### 4.4 多用户使用相同配置
```sh
# root 文件夹开通 x 权限
# 我的账号在同个 group ，所以就只开通了 g
$ chmod g+x /root

# 为 .oh-my-zsh .zshrc 建立软链接
$ ln -s /root/.oh-my-zsh  /home/<username>/.oh-my-zsh
$ ln -s /root/.zshrc  /home/<username>/.zshrc
```
这样其它用户也有相同配置了



