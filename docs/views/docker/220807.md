---
title: docker - 5 | 极简项目的  docker-nginx 部署
date: 2022-08-07
tags:
 - docker
categories: 
 - docker
---

## 总结
1. Alpine 是众多 Linux 发行版中的一员。它镜像的容量非常小，仅仅只有 5 MB 左右。alpine 小巧、功能完备，非常适合作为容器的基础镜像。 




## 1. nginx 镜像
在 docker 中，前端静态文件服务器可以使用 nginx 镜像，因为体积小，性能更好。        
```bash
docker images
#REPOSITORY       TAG       IMAGE ID       CREATED        SIZE  
# node             alpine    16b18c065537   10 days ago    166MB
# nginx            alpine    e46bcc697531   2 weeks ago    23.5MB
# alpine       latest    d7d3d98c851f   2 weeks ago   5.53MB
```
node 镜像是 nginx 镜像的 7 倍大。      
alpine：小巧、功能完备，非常适合作为容器的基础镜像。            
- 小巧：基于 Musl libc 和 busybox，和 busybox 一样小巧。
- 安全：面向安全的轻量发行版。
- 简单：提供APK包管理工具，软件的搜索、安装、删除、升级都非常方便。


> Alpine 是众多 Linux 发行版中的一员，和 CentOS、Ubuntu、Archlinux 之类一样，只是一个发行版的名字，号称小巧安全，有自己的包管理工具 apk。它镜像的容量非常小，仅仅只有 5 MB 左右。

启动容器，宿主机 3000 端口映射容器 80 端口，访问 http://localhost:3000 便能访问 nginx 页面。      
```bash
docker run -it --rm -p 3000:80 nginx:alpine sh
```

## 2. nginx 的基础配置
```nginx
# /etc/nginx/conf.d/default.conf
server {
    listen       80; # 监听 80 端口
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html; # 静态资源服务目录
        index  index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```
通过 `volume` 挂载      
将 nginx 配置添加到 `/etc/nginx/conf.d/default.conf` 可以更新 nginx 配置。      
将我们的资源添加到 `/usr/share/nginx/html` 可以正常部署。    



## 3. 构建镜像、运行容器
使用繁杂的命令构造镜像和运行容器，在管理端口，存储有天然劣势，将命令行的选项（例如-p）也翻译成配置文件，更易于维护。也可以实现多个容器相互配合。     
```dockerfile
# Dockerfile
FROM nginx:alpine

ADD index.html /usr/share/nginx/html/
```

```yml
# docker-compose.yaml
version: "3"
services:
  nginx-app:
    build: .
    ports:
      - 3000:80
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - .:/usr/share/nginx/html
```

构建镜像、启动容器，访问 http://localhost:3000 便能访问 nginx 页面。

```bash
# --build：重新构建镜像
# -f：指定 docker-compose.yaml 文件名称
docker compose up --build
```


## 疑问







