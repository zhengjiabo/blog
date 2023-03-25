---
title: 用户相关 whoami、id、who、w、last
date: 2022-10-12
tags:
 - linux
categories: 
 - linux
---


## 总结
1. `whoami`: 查询当前用户名
2. `id`: 打印当前用户 ID 及用户组 ID
    - `-u / --user`: 打印当前用户 userId
    - `-g / --group`: 只打印当前用户目前有效的 group id
    - `-G / --groups`: 打印当前用户所有 group id
    - `-n / --name`: 打印 数字 所对应的用户名, 需要配合 -ugG 其中一个一起使用
3. `who`: 查询当前处于登录状态的所有用户
    - `-u`: 打印出登录用户的 IDLE/PID。表示用户处于不活跃状态的时长，单位分钟，. 代表当前仍在活跃状态 (持续一段时间无输入，都算不活跃状态)
    - `-H`: 打印标头
4. 使用 `w` 替代 `who`，查询当前处于登录状态的所有用户
5. `last`: 查询该服务器历史登录的用户
   - `-s / --since <time>`: 起始时间  有一些内置时间例如 yesterday today tomorrow  now +5min -5days
   - `-t / --until <time>`: 截止时间  有一些内置时间例如 yesterday today tomorrow  now +5min -5days
   - `-n`: 列出最近 n 次
6. `cat /etc/passwd`: 查询所有用户







## 提问
- [x] 1. 如何查询现在服务器上有多少个登录用户      
  `w`
- [x] 2. 如何查出某天服务器上有多少个登录用户 
  ```bash
    # -s, --since <time> 起始时间  有一些内置时间例如 yesterday today tomorrow  now +5min -5days
    # -t, --until <time> 截止时间  有一些内置时间例如 yesterday today tomorrow  now +5min -5days
    $ last -s 2022-10-13 -t 2022-10-13

    # 如果还需要统计此时间段人数，使用 
    # wc：命令用于计算字数
    # -l：显示行数

    # xargs 管道传递参数，组合多个命令的一个工具
    # -I 或者是 -i：指定替代符，后续命令会进行替代。

    # expr：计算器
    # 减去两行非用户信息
    $ last -s 2022-09-29 -t 22-09-30 | wc -l | xargs -I$ expr $ - 2
  ```      
 
- [x] 3. 1000 与 501 的用户 ID 代表什么      
    Linux 和 MacOs 的第一个用户
- [x] 4. 如何打印你自己服务器的 user id 及 user name
    - `id`：查询本人    
    - `cat /etc/passwd`：查询所有
    







## 1. 前提提要、场景
Linux 为多用户系统，允许多个用户同时登录。掌握一些命令可以查询当前系统的用户登录状态和历史记录。





## 2. whoami 查询当前用户名
```bash
$ whoami
root
```




## 3. id 查询当前用户 ID 及用户组 ID

|                 | Linux | MacOs |
| --------------- | ----- | ----- |
| root 用户的 id  | 0     | 0     |
| 第一个用户的 id | 1000  | 501   |

```bash
$ id
# 用户id  组id  所有的组
uid=0(root) gid=0(root) groups=0(root)

# -u: --user，打印 userId
# -g: --group，只打印目前有效的 group id
# -G: --groups，打印所有 group id
# -n: --name，打印 数字 所对应的用户名, 需要配合 -ugG 其中一个一起使用
$ id -un
root
```

如果想查询 Linux 系统的账号列表，可以查询文件 `cat /etc/passwd`




## 4. who 查询当前登录状态的用户
```bash
# -u: 打印出登录用户的 IDLE/PID。
# -H: 打印标头
$ who -uH
NAME     LINE         TIME             IDLE          PID COMMENT
root     pts/0        2022-10-12 13:49 00:04        7092 (12.222.22.122)
root     pts/1        2022-10-12 13:49   .          7303 (12.222.22.122)
```
- 目前两个用户登录，都是 root 账户
- `LINE`：`pts/0`  tty（可以用来切换终端，即切屏）
- `IDLE`：表示用户处于不活跃状态的时长，单位分钟，`.` 代表当前仍在活跃状态。
    > 不活跃状态: 在终端无输入，即使启动前端服务 `npm run dev` 或 启动 docker `docker compose up` 后。只要持续一段时间无输入，都算不活跃状态。




## 5. w 更好用的查询当前登录状态用户
信息更多，如当前用户数，推荐使用其替代 `who`
```bash
$ w
14:21:35 up 29 days,  1:28,  2 users,  load average: 0.01, 0.10, 0.08
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    12.222.22.122    13:49    4.00s  0.10s  0.00s w
root     pts/1    12.222.22.122    13:49    2:31   0.07s  0.07s -bash
```
- `IDLE`：以秒为单位。
- `WHAT`：目前在做什么。


## 6. last 查询该服务器历史登录的用户
```bash
# -s, --since <time> 起始时间  有一些内置时间例如 yesterday today tomorrow  now +5min -5days
# -t, --until <time> 截止时间  有一些内置时间例如 yesterday today tomorrow  now +5min -5days
# -n: 列出最近 10 次
$ last -n 10
root     pts/2        118.73.226.42    Fri Jun 17 09:12   still logged in
root     pts/1        118.73.226.42    Fri Jun 17 08:29   still logged in
train    pts/0        118.73.226.42    Fri Jun 17 08:25   still logged in
train    pts/2        61.149.240.111   Fri Jun 17 00:26 - 00:31  (00:05)
train    pts/2        61.149.240.111   Thu Jun 16 23:19 - 00:24  (01:04)
train    pts/1        118.73.121.227   Thu Jun 16 22:58 - 01:32  (02:33)
train    pts/0        118.73.121.227   Thu Jun 16 22:48 - 01:32  (02:44)
root     pts/0        118.73.121.227   Thu Jun 16 22:44 - 22:48  (00:03)
train    pts/1        118.73.121.227   Thu Jun 16 22:40 - 22:44  (00:04)
root     pts/0        118.73.121.227   Thu Jun 16 22:40 - 22:44  (00:04)

wtmp begins Mon Feb 14 09:05:39 2022
```     
由于是同一个 IP 地址，前三行表示实际上有可能是一个人。         
这代表一个人在终端开了三个 shell 窗口链接了远程服务器。







