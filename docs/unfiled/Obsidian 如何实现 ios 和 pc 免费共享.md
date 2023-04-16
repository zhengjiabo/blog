## 前提
方式有很多，例如 ios 的 icloud  等，但这些方式都有文件内容重复、覆盖等缺点。
所以后续只分享使用 git 维护的方法。

注：你还需要有个服务器，需要配置 ios 和 服务器，配置会略麻烦，但使用时相当轻松。

## 收费方法
ios 下载 working copy，开通会员（100+¥）

这个是最方便的，working copy 可以直接 git 形式拉取和提交代码。但由于需要花费，不继续深入

以下讲解免费操作


## 1. 下载

1. ios 下载 iSH 和 obsidian
2. 打开 ISH，执行
	```bash
	apk update
	apk add git vim openssh openrc rsync ssh-copy-id
	```

## 2. git 设置

打开 ISH，设置 github 全局信息
```bash
git config --global user.name "用户名"
git config --global user.email "邮箱"
ssh-keygen -t ed25519 -C "<注释内容>"
```

打开网页，进入 github 右上角个人头像-个人设置-ssh公钥 
使用 `cat ~/.ssh/id_ed25519.pub` 获取公钥信息
将公钥信息存进去，做完这一步就可以往 github 推送拉取

并新建一个新仓库 math

## 3. 新建项目
打开 obsidian，创建一个新的空项目，如 blog , 后续都用 blog 代表项目

## 4. 文件配置 
1. 打开配置文件

```bash
vim /etc/ssh/sshd_config
```

参考 vim 操作 [28 - vim mode 模式](../linux/28%20-%20vim%20mode%20模式.md)
写上以下文本并保存退出

```text
PermitRootLogin yes
```

2. 检查 ssh 是否启动，如没启动会自动启动

```bash
rc-service sshd restart
```

3. 在 iSH 中建立 obsidian 文件夹

```text
cd ~ && mkdir obsidian
```

4. 执行以下命令会打开手机文件管理器，之后需要选中本地的 obsidian 文件夹，进行关联

```text
mount -t ios . obsidian
```

5. 通过 cd 命令，进入 blog 文件夹内

```text
cd ~/obsidian/blog
```

6. 初始化git

```text
git init
```

7. 为了防止出错，要禁用安全名单

```text
git config --global --add safe.directory /root/obsidian/blog
```

8. 使iSH链接你的仓库地址（之前获取的ssh地址）

```text
git remote add origin git@xxxx/blog.git
```

## 5. 设置服务器

由于 ISH 有个 bug，几年了至今未解决， `git add` 或 `git commit` 会假死，所以无法使用正常的 git 取维护。

> 详见  issue [Git Commands Stuck Forever · Issue #1640 · ish-app/ish (github.com)](https://github.com/ish-app/ish/issues/1640)  如果这个被修复了，可以直接使用 ISH 提交拉取代码，不用服务器


只能通过 rsync 传给服务器， 服务器监听文件变化后，在服务器提交代码

在 ISH 中设置免密登陆服务器，参考 [13 - 服务器免密登录](../linux/13%20-%20服务器免密登录.md)

1. 服务器配置提交文件，如：`/root/scripts/git.sh`
```bash
#!/bin/bash

# 进入/root/scripts/blog目录
cd /root/scripts/blog

# 添加所有更改
git add .

# 提交更改并推送到远程仓库
git commit -m "obsidian: Auto commit by inotifywait"       
git push origin main
git pull
echo "git.sh ok!"
```

2. 服务器配置监测文件，如：`/root/scripts/listen.sh`
```bash
#!/bin/bash

# 监听目录 /root/scripts/blog 中的所有事件，并且当有任何事件发生时，运行 blog.sh 脚本

# 当前正在运行的任务的 PID
current_pid=""

# 取消之前的任务
function cancel_task {
  if [[ ! -z "$current_pid" ]]; then
    kill -9 $current_pid >/dev/null 2>&1
    current_pid=""
  fi
}

# 监听目录 /root/scripts/blog 中的所有事件，并且当有任何事 
件发生时，运行 blog.sh 脚本
while true; do
  # 使用 inotifywait 监听 /root/scripts/blog 目录下的所有事件
  inotifywait -r -e create,modify,delete,move --exclude '/root/scripts/blog/.git/*' /root/scripts/blog
  # 取消之前的任务并启动一个新的任务
  cancel_task
  (
    sleep 5s
    /bin/bash /root/scripts/git.sh
  ) &
  current_pid=$!
  echo ${current_pid}
done
```

3. 服务器安装 `inotifywait` ：`apt add inotifywait`
4. 服务器拉取项目
```bash
cd /root/scripts
git clone git@xxxx/blog.git
```

7. 后台起动监听脚本 
```bash
nohup /bin/bash /root/scripts/listen.sh > /dev/null 2>&1 &
```


## 6. ios 提交文档

1. 在 ios 写完文章后，打开 ISH 发送到服务器
```bash
rsync -lahzv --exclude='.git' /root/obsidian/blog/ 服务器简称:/root/scripts/blog/
```

2. 服务器会监听并提交，此时可以将 IOS 的代码备份（以防万一），并重置代码、拉取 git 最新代码
```bash
cd /root/obsidian/blog && rsync --exclude='.git' -lahzv /root/obsidian/blog/ /root/bk/blog/ &&  git reset --hard HEAD && git pull
```

后续在 ios 更新文章也就上面两个命令，复制到备忘录中常用，相当简便。
