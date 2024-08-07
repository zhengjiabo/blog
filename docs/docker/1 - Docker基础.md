---
title: docker - 1 | Docker基础
date: 2022-07-23
tags:
 - docker
categories: 
 - docker
---

## 1. 为什么要学习docker
1. 节省配置环境的时间。
2. 应用隔离，避免不同应用的依赖冲突，且应用CPU占用过高也无法超出设定值，不会影响其它应用。
3. 开发、测试、生产环境得到统一，不会出现代码在测试环境正常，线上爆炸的尴尬场景。使得整个交付流程可控可信。
4. 低成本迁移，在新服务器上拉取制作好的镜像并运行。
5. 更易于持续交付和部署(CI/CD)，配合 GitLab CI 的方式让部署流程更加的自动化和高效。



## 2. 底层原理
docker 底层使用了一些 linux 内核的特性，比较重要的有三个 namespace，cgroups 和 UnionFS。
### 2.1 namespace
docker 使用 linux namespace 构建隔离的环境，它由以下 namespace 组成
- pid: 隔离进程
- net: 隔离网络
- ipc: 隔离 IPC
- mnt: 隔离文件系统挂载
- uts: 隔离hostname
- user: 隔离uid/gid


### 2.2 control groups
也叫 cgroups，限制资源配额，比如某个容器只能使用 100M 内存


### 2.3 Union file systems
UnionFS 是一种分层、轻量级并且高性能的文件系统，支持对文件系统的修改作为一次提交来一层层的叠加。docker 的镜像与容器就是分层存储，可用的存储引擎有 aufs，overlay 等。
关于分层存储的详细内容可以查看官方文档 docker: [About storage drivers](https://docs.docker.com/storage/storagedriver)



## 3. 基础概念
- 镜像：一个用来**创建容器的模板** ，提供容器运行时所需的程序、库、资源、配置等文件，以及运行时准备的配置参数。（一个只读模板，包含创建Docker容器的说明。）
- 容器：**镜像创建的运行实例**。（镜像 + 可写层）


流程：     
  1. 构建或拉取镜像
  2. 由镜像运行一个容器实例，实例内有我们的应用，且在指定端口提供服务

> 可读、可写层都是基于 unionFS （ linux 上使用的文件系统服务）



## 4. 镜像
### 4.1 获取镜像的途径
1. `docker pull` 拉取 Docker Hub （官方镜像仓库）的镜像。
   ```sh
    # docker pull 镜像名字:版本号/平台标志
    # alpine的体积比较小
    docker pull node:alpine
   ```

2. `docker build` 通过 Dockerfile（镜像配置文件）构建。
   ```sh
    # --no-cache=true：不使用缓存
    # -t: 指定镜像名称和版本号/平台标志   node-base:10: 镜像明细 版本号/平台标志
    # .: 指当前路径，利用当前目录的Dockerfile配置构建镜像
    $ docker build -t demo:10 .
   ```
   
### 4.2 docker images 获取镜像列表
```sh
docker images
# REPOSITORY   TAG       IMAGE ID       CREATED      SIZE
# nginx        alpine    e46bcc697531   3 days ago   23.5MB
```


### 4.3 docker rmi 移除镜像
```sh
docker rmi nginx:alpine
```


### 4.4 docker push 将镜像推送到远程仓库
```sh
docker push nginx:alpine
```


### 4.5 docker inspect 查看镜像、容器信息
```sh
# 查看镜像信息
docker inspect nginx:alpine

# 查看容器信息
# -f 输出指定参数
# 此处是输出容器的IP地址
docker inspect -f {{.NetworkSettings.IPAddress}} container_name
```


## 5. Dockerfile 镜像配置文件
可以为自己的应用编写配置，用此配置来构造镜像。     
Dockerfile一般放在前端目录下，这样可以理解成 代码 和 Docker镜像配置文件 打包在一起，这个包在任何服务器都是同样的执行效果。

### 5.1 FROM 基于基础镜像
基于一个某个基础镜像
```yaml
FROM node:alpine
```


### 5.2 ADD 宿主机往镜像添加文件
将宿主机的文件或目录 添加到 镜像的文件系统中。      
支持URL自动下载，自动解压。而 COPY 不会。      
ADD 时会忽略 .dockerignore 配置里的文件夹/文件，该配置作用和.gitignore一样
```yaml
ADD . /code
```



### 5.3 RUN 镜像中执行命令    
RUN 在 **构造镜像时** 运行的。     
在镜像中执行命令，由于 ufs 的文件系统，它会在当前镜像的顶层新增一层
多行运行时与Shell不同，Shell在同一进程中运行，前后之间有关系     
RUN 每次都是单独的，运行在新增的层，前后两句 RUN 之间没有关系。  

```yaml
RUN cd /code
RUN echo "1" > world.txt

# 本质上
# 1. 执行了 cd /code         目前pwd: ~/code
# 2. 执行了 echo 1 > 1.txt   目前pwd: ~/
# 前后没有联系，新增的文件: ~/1.txt     
```


### 5.4 WORKDIR 指定工作目录
指定工作目录 改变了后续各层的工作目录，对后续 `RUN/CMD` 有影响。     
如果指定目录不存在，会新增目录。     
```yaml
WORKDIR /code/
RUN echo "1" > world.txt

# 本质上
# 1. WORKDIR /code/          目前pwd: ~/code
# 2. 执行了 echo 1 > 1.txt    目前pwd: ~/code
# 新增的文件: ~/code/1.txt     
```



### 5.5 CMD 指定容器如何启动
CMD 在 **容器启动时** 运行的。    
指定容器如何启动，**一个 Dockerfile 中只允许有一个 CMD**。    
```yaml
CMD npm start
```


### 5.6 Dockerfile 文件

```yaml
# 基于基础镜像
FROM node:alpine

# 将宿主机的文件或目录 添加到 镜像的文件系统中
# ADD src dest
ADD package.json package-lock.json /code/

# 指定工作目录 改变了后续各层的工作目录
# 对 RUN 有影响。因为 RUN 每次都是单独的，运行在新增的层上，前后两句 RUN 之间没有关系
WORKDIR /code/


# ADD 时会忽略 .dockerignore 配置里的文件夹/文件，该配置作用和.gitignore一样
ADD . /code/

# 在镜像中执行指令
# 多行运行时与Shell不同，Shell在同一进程中运行，前后之间有关系
# RUN 命令每次都是单独的，前后之间没有关系
RUN npm run build


# 指定容器如何启动
CMD npm start

```



## 6. 容器
容器 和 镜像的关系，像代码中 类 和 实例 的关系。
镜像是静态的定义，容器是运行的实例。容器可以被创建、删除、启动、暂停等。    

### 6.1 常用操作
- docker ps: 列出容器，默认列出正在运行的容器，-a 可以列出所有状态的容器。
- docker create：创建容器
    `docker create` 命令新建的容器处于停止状态，可以使用 `docker start` 命令来启动它。
    ```sh
    # --name: 指定容器名称
    docker create --name demo nginx:alpine 
    ```
- docker start：启动容器    
    如果镜像不存在，会尝试从默认的镜像仓库中下载。

- docker stop：暂停容器
- docker rm：删除容器
- docker run：创建一个容器并启动（create 和 start的结合）        
    如果镜像不存在，会尝试从默认的镜像仓库中下载。

    ```sh
    # --rm: 停止时删除容器
    # -it: 可进行交互
    # --name: 指定容器名称
    # -p: 端口映射，对外提供服务   宿主机端口:容器端口
    docker run --rm -it --name demo -p 8888:80 nginx:alpine
    ```

可以使用 `curl localhost:8888` 测试服务是否正常

- docker logs：查看容器日志
```sh
# -f：跟随输出，即进入日志文件一直显示最新的，不会打印后立马退出
# -t：显示时间
# -n x：显示最后x行
docker logs container_name -f -t
```

### 6.2 docker exec 进入容器后执行命令
进入容器，可以排查问题或查找相关信息，操作的灵活度大大增加。
```sh
# docker exec -it 容器名称 执行的命令
docker exec -it demo sh
```


### 6.3 docker port 列出容器的端口映射
```sh
docker port demo
# 80/tcp -> 0.0.0.0:8888
```


### 6.4 docker stats 查看容器资源占用
```sh
docker port stats
# CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O   PIDS
# f1fa5900f5e6   demo      0.00%     5.086MiB / 6.067GiB   0.08%     1.85kB / 1.23kB   0B / 0B     7
```



## 7. Docker Compose 
Dockerfile 是一个镜像配置文件，用来构造镜像。     
而根据镜像创造并启动容器，仍然需要敲入复杂的指令，例如
```sh
# --rm: 停止时删除容器
# -it: 可进行交互
# --name: 指定容器名称
# -p: 端口映射，对外提供服务   宿主机端口:容器端口
docker run --rm -it --name demo -p 8888:80 nginx:alpine
```
Docker Compose 可以将启动容器的参数变成配置文件 `docker-compose.yaml`，也可以实现多个容器相互配合。    

### 7.1 `docker compose up` 构建/拉取镜像并启动容器。
配置yaml文件，可以基于已有镜像。
```yml
# docker-compose.yaml
version: "3"
services:
  app:
    image: "nginx:alpine"
    ports:
      - 8000:80
    container_name: "blog" # 指定容器名称
    restart: always # 容器出错了 无限重启
```

也可以基于Dockerfile去构建镜像
```yml
# docker-compose.yaml
version: "3"
services:
  app:
    build:
        context: . # Dockerfile 文件所在目录
        dockerfile: Dockerfile # Dockerfile 文件名称
    ports:
      - 8000:80
    container_name: "blog" # 指定容器名称
    restart: always # 容器出错了 无限重启
```


## 总结

## 疑问
- [x] 通过 `docker pull` 拉取下来的，CREATED 是指Docker Hub上该镜像的创建时间吗？     
  是的，作者的创建时间，可能时间对不上是操作系统时间不同。

- [x] “CMD不一定会跑”。 我感觉CMD在容器启动时是一定会运行，只是视频最后的操作是在启动之后进入容器，所以没看到命令。 这个理解对吗？     
  不对，CMD 命令不一定会被执行，因为他只是一个默认的启动命令，很容易被覆盖，例如 `docker run -it nginx:alpine sh`，CMD 命令就被 `sh` 覆盖了。所以更容易理解 CMD 是在运行时期跑的一个命令、

- [x] UFS 的分层存储不理解    
[About storage drivers](https://docs.docker.com/storage/storagedriver)     
由基础镜像作为元数据层，添加和移除文件都会生成新的层，每个层都只是与之前的层的有一小部分差异。        
这些层堆叠在一起形成一个基础层“镜像”，这个镜像为可读层。创建新容器时，可以在基础层的顶部添加新的**可写层**。该层通常称为“容器层”。



## 提问
- [x] 启动docker后如何进入容器?    
`docker exec -it container_name sh`

- [x] 如何查看容器的日志?    
`docker logs container_name -f -t`

- [x] docker的底层原理     
- name space 隔离环境
- cgroups 限制资源配额


