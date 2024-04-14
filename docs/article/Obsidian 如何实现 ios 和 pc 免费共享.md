## 前提
方式有很多，例如 ios 的 icloud  等，但这些方式都有文件内容重复、覆盖等缺点。
所以后续只分享使用 git 维护的方法。

注：你还需要有个服务器，需要配置 ios 和 服务器，配置会略麻烦，但使用时相当轻松。

## 方式
收费：ios 下载 working copy，开通会员（100+¥）

这个是最方便的，working copy 可以直接 git 形式拉取和提交代码。但由于需要花费，不继续深入

以下讲解免费操作


## 1. 下载

1. ios 下载 iSH 和 obsidian
2. 打开 ISH，执行
	```bash
	apk update
	apk add git vim openssh openrc rsync ssh-copy-id inotifywait
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

```txt
PermitRootLogin yes
```

2. 检查 ssh 是否启动，如没启动会自动启动

```bash
rc-service sshd restart
```

3. 在 iSH 中建立 obsidian 文件夹

```txt
cd ~ && mkdir obsidian
```

4. 执行以下命令会打开手机文件管理器，之后需要选中本地的 obsidian 文件夹，进行关联

```txt
mount -t ios . obsidian
```

5. 通过 cd 命令，进入 blog 文件夹内

```txt
cd ~/obsidian/blog
```

6. 初始化git

```txt
git init
```

7. 为了防止出错，要禁用安全名单

```txt
git config --global --add safe.directory /root/obsidian/blog
```

8. 使iSH链接你的仓库地址（之前获取的ssh地址）

```txt
git remote add origin git@xxxx/blog.git
```


9. 设置中文兼容，因为 `obsidian` 基本都是中文命名
```bash
  
# 该命令表示提交命令的时候使用 utf-8 编码集 
git config --global i18n.commitencoding utf-8 

# 该命令表示日志输出时使用 utf-8 编码集显示 
git config --global i18n.logoutputencoding utf-8

# 该命令使得 git status 中文正常显示
git config --global core.quotepath false

```


## 5. 设置服务器

由于 ISH 有个 bug，几年了至今未解决， `git add` 或 `git commit` 会假死，所以无法使用正常的 git 去维护。

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

3. 服务器拉取项目
```bash
cd /root/scripts
git clone git@xxxx/blog.git
```

4. 后台起动监听脚本 
```bash
nohup /bin/bash /root/scripts/listen.sh > /dev/null 2>&1 &
```


## 6. ios 提交文档

1. 在 ios ISH 根目录新建 `push.sh` 文件，用于提交代码：`vim push.sh`
```bash
#!/bin/bash 
 
# 项目路径和目标服务器信息 
LOCAL_DIR="/root/obsidian/blog/" 
LOCAL_BK="/root/bk/blog/" 
TARGET_ALIAS="bo" 
TARGET_PATH="/root/scripts/blog/" 
  
# 切换到Git项目根目录 
cd $LOCAL_DIR 
  
# 获取Git变更文件列表 上传服务器并备份到本地 bk 文件夹
git status --porcelain | sed 's/^ //g' | cut -d ' ' -f 2- | sed 's/"//g' | xargs -I {} sh -c "rsync -lahzv '${LOCAL_DIR}{}' ${TARGET_ALIAS}:'${TARGET_PATH}{}'; rsync -lahzv '${LOCAL_DIR}{}' '${LOCAL_BK}{}'" 
```

2. 在 ios ISH 根目录新建 `pull.sh` 文件，用于拉取代码：`vim pull.sh`
```bash
#!/bin/bash

# 项目路径和目标服务器信息
LOCAL_DIR="/root/obsidian/blog/"

# 切换到Git项目根目录
cd $LOCAL_DIR

git reset --hard HEAD
git pull
```


3. 在 ios 写完文章后，输入 `./push.sh` 执行提交代码

4. 等待代码发布完成，输入`./pull.sh` 执行拉取代码

后续在 ios 更新文章也就上面两个命令，相当简便。


## 参考

- [42号笔记：iOS上使用iSH的git同步Obsidian - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/565028534)