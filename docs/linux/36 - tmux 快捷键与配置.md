---
title: tmux 快捷键与配置
date: 2022-11-22
tags:
 - linux
categories: 
 - linux
---


## 总结
- 快捷键可以理解为: 利用按键去触发命令      
  所以一般绑定快捷键需要指定按键和命令 `bind <key> <command>`
- `tmux new -s <sessionName>` 或 `tmux`：新增 session
- `<prefix>`：前置按键
- `<prefix>:`：进入命令模式
- `<prefix>?`：查看快捷键帮助
- `<prefix>%`：水平分屏
- `<prefix>"`：垂直分屏
- `<prefix>hjkl`：左下上右移动聚焦
- `<prefix>d`：detach session
- `<prefix>$`：rename session
- `<prefix>s`：切换 session
- `<prefix>c`：新建窗口  `tmux new-window -n <windowName>`
- `<prefix>,`：重命名窗口
- `<prefix>1`：选择1号窗口
- `<prefix>2`：选择2号窗口
- `<prefix><space>`：重排局当前窗口
- `<prefix>x`：杀掉当前面板，当当前面板卡死时特别有用
- `<prefix>z`：将当前面板最大化或恢复
- `<prefix>w`：tmux 打开窗口列表



## 提问
- [x] 1. 如何新建窗口
    > - `tmux new -s <sessionName>` 或 `tmux`
    > - `tmux new-window -n <windowName>` 或  `<prefix>c`
- [x] 2. 如何新建面板
    > - `<prefix>%`：水平分屏
    > - `<prefix>"`：垂直分屏
- [x] 3. 如何跳转到某个窗口
    > - `<prefix>1`：选择1号窗口
    > - `<prefix>2`：选择2号窗口
    > - `<prefix>w`：列表选择
- [x] 4. 如何跳转到某个面板
    > - `<prefix>hjkl`：左下上右移动聚焦
- [x] 5. 如何将某个面板最大化
    > - `<prefix>z`：将当前面板最大化或恢复
 





## 1. 前提提要、场景

可以通过 `man tmux` 查看文档，也可以在 `tmux` 中使用 `<C-b> ?` 查看所有快捷键，当然快捷键也可以自己配置。

`tmux` 的默认配置文件为 `~/.tmux.conf`，可通过它来配置快捷键。
- [ tmux-config for shanyue ](https://github.com/shfshanyue/tmux-config)
- [ gpakosz/.tmux ](https://github.com/gpakosz/.tmux)


## 2. prefix-key 前置按键
在 `tmux` 中，有一个 `<prefix>` 键做为前置按键，默认为 `<ctrl-b>`，在按任意快捷键之前需要先按一个 `<prefix>` 键。

由于 `<ctrl-s`> 相比 `<ctrl-b>` 更加方便快捷，因此使用它作为常用快捷键。
```bash
# 方法一：进入 tmux 后，键入 <C-b> : 进入命令模式，输入以下捆绑备用的前置按键。两个命令都要输入
# send-prefix 指令代表向 tmux 发送 <prefix> 键，send-prefix -2 代表新增一个 <prefix> 键。
set -g prefix2 C-s # 一个兼容写法
bind C-s send-prefix -2

# 方法二：将上面两个命令配置到 ~/tmux.conf, 推荐这种配置文件的方法
```


## 3. 命令模式
在 `tmux` 中，可通过 `<prefix>:` 进入命令模式。
> `<prefix>` 默认为 `<C-b>`，所以进入命令模式为 `<C-b> :`

在命令模式输入 `rename <newName>` 可以更改 `window` 名字

![](../assets/1%2030.png)

## 4. 查看帮助
在 `tmux` 中，可通过 `<prefix>?` 查看所有的快捷键

```bash
C-b C-b     Send the prefix key 
C-b C-o     Rotate through the panes                                                                     
C-b C-z     Suspend the current client                                                                   
C-b Space   Select next layout                                                                           
C-b !       Break pane to a new window                                                                   
C-b "       Split window vertically                                                                      
C-b #       List all paste buffers                                                                       
C-b $       Rename current session                                                                       
C-b %       Split window horizontally                                                                    
C-b &       Kill current window                                                                          
C-b '       Prompt for window index to select                                                            
C-b (       Switch to previous client                                                                    
C-b )       Switch to next client                                                                        
C-b ,       Rename current window                                                                        
C-b -       Delete the most recent paste buffer                                                          
C-b .       Move the current window                                                                      
C-b /       Describe key binding                                                                         
C-b 0       Select window 0                                                                              
C-b 1       Select window 1                                                                              
C-b 2       Select window 2                                                                              
C-b 3       Select window 3                                                                              
C-b 4       Select window 4                                                                              
C-b 5       Select window 5                                                                              
C-b 6       Select window 6                                                                              
C-b 7       Select window 7                                                                              
C-b 8       Select window 8                                                                              
C-b 9       Select window 9                                                                              
C-b :       Prompt for a command                                                                         
C-b ;       Move to the previously active pane                                                           
C-b =       Choose a paste buffer from a list                                                            
C-b ?       List key bindings                                                                            
C-b C       Customize options                                                                            
C-b D       Choose a client from a list                                                                  
C-b E       Spread panes out evenly                                                                      
C-b L       Switch to the last client                                                                    
C-b M       Clear the marked pane                                                                        
C-b [       Enter copy mode                                                                              
C-b ]       Paste the most recent paste buffer                                                           
C-b c       Create a new window                                                                          
C-b d       Detach the current client
C-b f       Search for a pane
C-b i       Display window information
C-b l       Select the previously current window
C-b m       Toggle the marked pane
C-b n       Select the next window
C-b o       Select the next pane                                                                         
C-b p       Select the previous window                                                                   
C-b q       Display pane numbers                                                                         
C-b r       Redraw the current client                                                                    
C-b s       Choose a session from a list                                                                 
C-b t       Show a clock                                                                                 
C-b w       Choose a window from a list                                                                  
C-b x       Kill the active pane
C-b z       Zoom the active pane
C-b {       Swap the active pane with the pane above
C-b }       Swap the active pane with the pane below
C-b ~       Show messages
C-b DC      Reset so the visible part of the window follows the cursor
C-b PPage   Enter copy mode and scroll up
C-b Up      Select the pane above the active pane
C-b Down    Select the pane below the active pane
C-b Left    Select the pane to the left of the active pane
C-b Right   Select the pane to the right of the active pane
C-b M-1     Set the even-horizontal layout
C-b M-2     Set the even-vertical layout
C-b M-3     Set the main-horizontal layout
C-b M-4     Set the main-vertical layout
C-b M-5     Select the tiled layout
C-b M-n     Select the next window with an alert
C-b M-o     Rotate through the panes in reverse
C-b M-p     Select the previous window with an alert
C-b M-Up    Resize the pane up by 5
C-b M-Down  Resize the pane down by 5
C-b M-Left  Resize the pane left by 5
C-b C-Right Resize the pane right
C-b S-Up    Move the visible part of the window up
C-b S-Down  Move the visible part of the window down
C-b S-Left  Move the visible part of the window left
C-b S-Right Move the visible part of the window right
```

### 4. 常用快捷键
- `<prefix>d`：detach session
- `<prefix>$`：rename session
- `<prefix>s`：切换 session
- `<prefix>c`：新建窗口
- `<prefix>,`：重命名窗口
- `<prefix>1`：选择1号窗口
- `<prefix>2`：选择2号窗口
- `<prefix><space>`：重排局当前窗口
- `<prefix>x`：杀掉当前面板，当当前面板卡死时特别有用
- `<prefix>z`：将当前面板最大化或恢复



## 5. split-window 分割窗口/分屏

在 tmux 环境下使用快捷键 `<prefix>%` 与 `<prefix>"` 完成分屏

![](../assets/2%2020.png)

或者通过命令 `tmux split-window` 分屏
```bash
# -h: 水平分屏
# -v: 垂直分屏
# -c: 分屏打开指定路径
$ tmux split-window -h -c ~
```

为了每次分屏都能定位到分屏窗口的当前路径，在 `~/.tmux.conf` 使用以下快捷键覆盖绑定
```bash
# pane_current_path: 变量 当前路径。man tmux 中还可以查到很多变量，推荐看别人的配置，遇到哪个变量查哪个
bind % split-window -h -c "#{pane_current_path}"
bind '"' split-window -c "#{pane_current_path}"
```


## 6. 分屏移动
移动面板命令为 `tmux select-pane`，传参 `-LDUR` 四个方向聚焦移动      
可配置快捷键使得移动命令为 `hljk`，`<prefix>h` 为向左聚焦。

在 `~/.tmux.conf` 中配置
```bash
# bind：绑定快捷键
# -r：可重复按键
# select-pane：选择面板
bind -r h select-pane -L 
bind -r l select-pane -R
bind -r j select-pane -D
bind -r k select-pane -U

```

也可以开启鼠标支持，通过鼠标快速移动面板。
```bash
set -g mouse on
```


## 7. 翻屏 类似 vi 模式
按 `prefix [` 键进入 tmux 的 `copy mode`，此时可见到在 `tmux` 右上角有一个黄色的行号。
该模式类似于 vi 的 `normal mode`，支持复制，粘贴，查找，以及翻页。具体是 `vi` 还是 `emacs` 可以根据以下命令探知。
```bash
$ tmux show-window-options -g mode-keys
mode-keys vi
```

与 vi 命令相同，如上下翻页(半屏)可使用 `<ctrl-d>` 以及 `<ctrl-u>`。
在 `~/.tmux.conf` 中配置
```bash
set -wg mode-keys vi
```



