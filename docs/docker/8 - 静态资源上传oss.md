---
title: docker - 8 | 静态资源上传oss
date: 2022-08-18
tags:
 - docker
categories: 
 - docker
---
 

## 总结
1.  OSS：云存储服务，可以存储静态资源，安全、低成本、高可靠，静态资源也不是从我们服务器中获取，速度会快些。
2.  Bucket：生产环境，可对每一个项目创建单独的 Bucket，而在测试环境，多个项目可共用 Bucket。
3.  AccessKey：权限用以编程访问操作，不要存储在代码里，可以通过环境变量引入使用。
4.  obsutil：华为云 obs 对象存储服务的管理工具
5.  Endpoint：终端节点，将会搭配 BucketName 在打包配置 `PUBLIC_URL` 中使用。
6.  PUBLIC_URL：静态资源的基础路径，一般配置 output.publicPath，`cra` 是配置环境变量 `PUBLIC_URL`。静态资源最终访问路径 = output.publicPath（基础路径） + 资源loader或插件等配置路径。        
    所以设置 `PUBLIC_URL=https://$Bucket.$Endpoint` 经过打包后，网页需要的内容静态资源就都指向了 `oss`。
7.  如何设置环境变量：
    ```sh
    # linux / mac 临时更改，当前窗口有效 
    export PUBLIC_URL=https://$Bucket.$Endpoint

    # linux / mac 永久更改
    # 写入 ~/.bashrc 或者 ~/.zshrc


    # windows 临时更改，仅当前窗口有效
    # && 前面不要空格
    set PUBLIC_URL=https://$Bucket.$Endpoint


    # windows 永久更改
    # 在我的电脑-属性-高级系统设置-环境变量 中设置，重启命令行窗口
    ```
8. 使用 `docker` 时，在镜像配置文件 `Dockerfile` 中，设置 `ENV PUBLIC_URL https://$Bucket.$Endpoint`，后再执行打包指令，以更改打包后的网页内容静态文件基础路径。
9. 打包完需要上传到 `oss`，此时是通过编程访问 `oss`，需要配置权限信息，使用到 AccessKey (`Access Key Id` 和 `Secret Access Key` )，敏感信息不可明文存储在代码中。           
   可将敏感信息可使用 `ARG` 作为变量，通过 `docker build --build-arg` 或 `docker-compose.yaml` 的 `build.args` 传入。     
   `build.args` 从宿主机的同名环境变量中取值，所以只要配置好宿主机的环境变量，便可以不暴露敏感信息并配置到镜像内使用。      
10. ARG 和 ENV 区别：
    - ARG：Dockerfile 内的变量，仅在构建过程中有效，可以理解为构建时的局部变量。
    - ENV：环境变量，ENV 作为环境变量一直存在，可以在后续的指令中使用。（Docker 使用了一些 linux 内核的特性，可以把它简单理解成也是个 linux 系统，所以也有环境变量）




## 1. OSS 云存储服务是什么
OSS(Object Storage) 云存储服务，提供海量、安全、低成本、高可靠的云存储服务。       
- 海量：单个数据的大小从 1 字节到 48.8 PB 可以存储的数据个数无限容量和处理能力弹性扩展。 
- 安全：OSS 时支持 SSL 加密，数据存储时支持 OSS 托管加密盒 KMS 托管加密，可有效防止数据被非法截获。还支持 ACL 防盗链等鉴权和授权机制，实现用户级别资源隔离。 
- 低成本：标准存储、低频访问、归档存储、冷归档存储。价格以访问频率依次降低。支持生命周期管理，对符合条件的特定数据自动删除或转换成更低成本的低铁访问归档或冷归档存储类型   
- 高可靠：通过同城冗余存储将每个对象冗余存储在同一个地域的三个可用区中，或跨区域复制功能将数据复制到其他地域，确保硬件失效时的数据可靠性和可用性      


目的：将静态资源上传至 OSS，并对 OSS 提供 CDN 服务。 
![](../assets/1s10.png)  

由于我个人使用的是华为云，华为云对应的是 `OBS` 效果相同。后续使用 `OBS` 演示。            
价格很便宜，按量包月，40GB标准存储包，1年价格仅9块钱。按需计费40GB只要4块钱。    

> 华为云的 obs 在使用上和阿里云的 oss 差不多，但我个人使用出现了设置元数据 CacheControl 不生效，按照官方文档字段名配置的，甚至浏览器控制台交互去设置，也是提示成功，但不生效，提工单处理排查了好久，最后告知直接使用 obsutil 上传不支持 **HTTP标准属性 例如 CacheControl**，但文档就是写了 `CacheControl`，通过 `SDK` 先上传对象，后修改对象的元数据，两个接口实现，而且传参都是首字母大写，有点难受 `client.putObject({ Bucket, Key})`，不太推荐使用华为云的 obs，阿里的支持一个接口。            


## 2. OBS 云存储服务的准备
需要准备以下内容：
- Bucket（桶）：存储空间。对于生产环境，可对每一个项目创建单独的 Bucket，而在测试环境，多个项目可共用 Bucket。
- AccessKey：权限用以编程访问操作
- obsutil：对象存储服务的管理工具，利用 `AccessKey` 权限上传或删除资源。


### 2.1 Bucket
存储空间。对于生产环境，可对每一个项目创建单独的 Bucket，而在测试环境，多个项目可共用 Bucket。

在创建 Bucket（桶） 时，需要注意以下事项。
1. 权限设置为公共读 (Public Read)
2. 记住终端节点 `Endpoint`，将会在配置 `PUBLIC_URL` 中使用
3. 跨域配置 CORS (manifest.json 需要配置 cors，可以通过 Bucket 详情页面，权限管理中的跨域管理)，避免被其它域名引用。
   
 `PUBLIC_URL`：对应 `webpack` 配置中 [output.publicPath](https://www.webpackjs.com/configuration/output/#output-publicpath) ，设置静态资源的基础路径。              
静态资源最终访问路径 = output.publicPath（基础路径） + 资源loader或插件等配置路径
```js
{   
    /* codes */
    output: {
        publicPath: "/assets/"
        /* codes */
    }
}

// 将会输出类似于
<link href="/assets/spinner.gif" />
```

所以创建完 Bucket 后，我们便可以更改 `webpack.output.publicPath` 为 `Endpoint`，去执行打包。     

不同的脚手架可能不同，对于 `cra` 是使用 `PUBLIC_URL`，可以在 `node_modules\react-scripts\config\paths.js:29` 看到相关代码。    
在 `linux` 中指定 `PUBLIC_URL`
```sh
# 临时更改，仅当前窗口有效
# 设定环境变量
# = 左右不要由空格
export PUBLIC_URL=https://$Bucket.$Endpoint

# 永久更改
# 写入 ~/.bashrc 或者 ~/.zshrc
```

在 `window` 中指定 `PUBLIC_URL`
```sh
# 临时更改，仅当前窗口有效
# && 前面不要空格
set PUBLIC_URL=https://$Bucket.$Endpoint&& npm run build


# 永久更改
# 在我的电脑-属性-高级系统设置-环境变量 中设置，重启命令行窗口
```



### 2.2 AccessKey
权限用以上传等操作       

在华为云，只要在右上角头像聚焦，点击 “我的凭证” - “访问密钥” - 新建         
便可以得到一个 `csv` 文件，里面存了编程访问的凭证 `Access Key Id` 和 `Secret Access Key` ，要保留好，只能下载一次。       





### 2.3 obsutil 安装与使用
对象存储服务的管理工具，利用 `AccessKey` 权限上传或删除资源。        
- [obsutil 安装说明](https://support.huaweicloud.com/utiltg-obs/obs_11_0003.html)       
- [obsutil 操作说明](https://support.huaweicloud.com/utiltg-obs/obs_11_0013.html)


根据安装说明安装后，需要将上面得到的 `AccessKeyId` `SecretAccessKey` `Endpoint` 进行权限配置。
```sh
# obsutil config -i=${AccessKeyId} -k=${SecretAccessKey} -e=${Endpoint}
obsutil config -i=ak -k=sk -e=endpoint
```

配置完成，现在就可以将打包后的静态文件上传到 `OBS` 上了
```sh
# 将本地目录 build 上传到 Bucket obs://xxx 中
# cp：上传
# -r：递归上传文件夹中的所有文件和子文件夹。
# -f：强制操作，不进行询问提示。
# --meta: 配置响应头，也就是这里的缓存策略，设置策略缓存
# --flat：不包含根文件夹，仅上传内部文件。此处便是不上传 build 文件夹，仅上传其内部文件和文件夹。
# --exclude：不包含匹配文件（只能是文件），此处去除了 static 文件。写在引号内，linux 单引号， window 双引号。最前面要写* 
obsutil cp -r -f --meta CacheControl:no-cache --flat --exclude '*build\static*' build obs://xxx/


# 将带有 hash 资源上传到 OBS Bucket，并且配置长期缓存
# 强策略
obsutil cp -r -f --meta CacheControl:max-age=31536000 build/static obs://xxx/
```


将其写在 `package.json` 中，方便调用
```json
{
  "scripts": {
    // 华为云 obsutil 使用的是 CacheControl，如果使用 cache-control 将会被更改为自定义头部
    "obs:cli": "obsutil cp -r -f --meta CacheControl:no-cache --flat --exclude '*build\\static*' build obs://xxx/ && obsutil cp -r -f --meta CacheControl:max-age=31536000 build/static obs://xxx/"
  }
}
```



### 2.4 SDK 方式调用
以上方式便可以推送静态资源到桶里了，还可以使用 Node 版本的 [SDK](https://support.huaweicloud.com/sdk-nodejs-devg-obs/obs_29_0001.html)，实现
1. 对每一条资源进行精准控制
2. 仅仅上传变更的文件
3. 使用 p-queue 控制 N 个资源同时上传

这一块等后续再实现，我们回到主流程，先将安装 `obsutil` 和 上传资源到 `Bucket` 封装到 docker 镜像配置中。

> 需要注意，该官方 SDK 最高推荐使用的Node.js版本 Node10.x。 




## 3. Dockerfile 与 环境变量
将安装 `obsutil` 和 上传资源到 `Bucket` 翻译成 Dockerfile。        
由于 Dockerfile 同代码一起进行管理，我们不能将敏感信息写入 Dockerfile。       
可将敏感信息可使用 `ARG` 作为变量，通过 `docker build --build-arg` 或 `docker-compose.yaml` 的 `build.args` 传入。           
`build.args` 从宿主机的同名环境变量中取值，所以只要配置好宿主机的环境变量，便可以不暴露敏感信息并配置到镜像内使用。
     
```yaml
# 使用 node:14-alpine 找不到 obsutil 很奇怪
FROM node:14 as builder

# 设置好ARG，构建时
ARG ACCESS_KEY_ID
ARG ACCESS_KEY_SECRET
ARG ENDPOINT
ARG PUBLIC_URL

# 环境变量 cra 设置打包静态资源的基础路径，通过 arg 传入也可以不暴露 
ENV PUBLIC_URL ${PUBLIC_URL}

WORKDIR /code

# obsutil 安装配置 参考文档 https://support.huaweicloud.com/utiltg-obs/obs_11_0049.html
# 我使用 stepup.sh 无法成功，只能手动添加

# 为了更好的缓存，把它放在前边
    # 下载 obsutil
    # -O：指定下载目录和文件名
    # -P：指定下载目录 试验了如果无目录不会主动创建目录
RUN wget https://obs-community.obs.cn-north-1.myhuaweicloud.com/obsutil/current/obsutil_linux_amd64.tar.gz \ 
    # 解压
    # -C：指定解压目录，此处不使用，因为解压后内部还有个文件夹 obsutil_linux_amd64_x.x.x
    && tar -xzvf obsutil_linux_amd64.tar.gz  \
    && find /code -name obsutil_linux_amd64_* | xargs -i cp {}/obsutil /usr/local/bin/obsutil \
    # 设置权限 775  读（r=4），写（w=2），执行（x=1）  
    # 7 可读可写可执行（rwx=7=4+2+1）
    # 6 可读可写（rw=6=4+2）
    # 5 可读可执行（rx=5=4+1）
    # 7            5           5
    # 文件所有者   同用户组    其它用户组
    # && cat /etc/profile \
    && chmod 755 /usr/local/bin/obsutil \
    && obsutil config -i $ACCESS_KEY_ID -k $ACCESS_KEY_SECRET -e $ENDPOINT


# 单独分离 package.json，是为了安装依赖可最大限度利用缓存
ADD package.json yarn.lock /code/
RUN yarn

# 这里可以优化，只添加需要被打包的文件
ADD . /code
RUN npm run build && npm run obs:cli

# 选择更小体积的基础镜像
FROM nginx:alpine
ADD nginx.conf /etc/nginx/conf.d/default.conf

# 虽然网页内容只用到了index.html，其它网页内容静态资源都在oss。
# 但还有类似于 robots.txt 爬虫配置等非网页内容资源，要么全部抽出来 COPY，要么就方便些直接都 COPY
COPY --from=builder code/build /usr/share/nginx/html
```



## 4. docker-compose 配置
在 `docker-compose.yaml` 配置文件中，通过 `build.args` 可对 Dockerfile 进行传参。     
但同样不允许出现敏感数据，此时通过环境变量进行传参，在 `build.args` 中，默认从**宿主机的同名环境变量**中取值。

在宿主机中，linux 和 mac 在命令行中设置
```sh
export ACCESS_KEY_ID=xxxx
export ACCESS_KEY_SECRET=xxxx
```

window 系统，在我的电脑-属性-高级系统设置-环境变量 中设置



`docker-compose.yaml` 配置文件如下 
```yml
version: "3"
services:
  obs:
    image: obs
    build:
      context: .
      args:
        # 此处默认从宿主机(host)环境变量中传参，在宿主机中需要提前配置 ACCESS_KEY_ID/ACCESS_KEY_SECRET 环境变量
        - ACCESS_KEY_ID
        - ACCESS_KEY_SECRET
        # - ENDPOINT=xxxxxxx 也可以直接赋值，但这样会暴露在代码里
        - ENDPOINT
        - PUBLIC_URL
    ports:
      - 8000:80
```

配置完成后执行 `docker compose up obs`，静态资源将会上传到 `obs` 远程服务存储，且服务也启动，可以正常访问。






## 疑问
- [ ] 我使用的是 华为云 obs，下载后是解压包，解压后放到`/usr/local/bin/` 但出现问题 obsutil: not found。为什么会有这种情况，阿里的 ossutil 也是放在 `/usr/local/bin/` 可以使用，华为云的 obsutil 一样放在 `/usr/local/bin/` 却不行。这个跟 `linux` 系统相关，有点不理解。         
    我把镜像换成 `FROM node:14` 可以正常使用，以下是代码
    ```yaml
      # 使用 node:14-alpine 找不到 obsutil 很奇怪
      FROM node:14-alpine 
      # FROM node:14 这个可以

      WORKDIR /code

      # obsutil 安装配置 参考文档 https://support.huaweicloud.com/utiltg-obs/obs_11_0049.html
      # 我使用 stepup.sh 无法成功，只能手动添加

      RUN wget https://obs-community.obs.cn-north-1.myhuaweicloud.com/obsutil/current/obsutil_linux_amd64.tar.gz \ 
          && tar -xzvf obsutil_linux_amd64.tar.gz  \
          && find /code -name obsutil_linux_amd64_* | xargs -i cp {}/obsutil /usr/local/bin/obsutil \
          && chmod 755 /usr/local/bin/obsutil \
          && ls -l /usr/local/bin/ \
          && obsutil help

    ```
    执行 `docker compose build --progress plain --no-cache` 结果如下，确实 `/usr/local/bin` 下有 `obsutil` 文件。           
    ![](../assets/2s7.png)        





## 遗留
- [x] 华为云的OBS 根据文档，使用的是 CacheControl 字段，但我无论是 obsutil 还是官网控制台更改，都提示成功，但实际没有效果。导致强缓存和策略换成都无效，提了工单在等解决。     
   官方回复：文档给了该字段，但实际不支持。



## 提问
- [x] 如何向 Dockerfile 中传递宿主机环境变量      
   可使用 `ARG` 作为变量，通过 `docker build --build-arg` 或 `docker-compose.yaml` 的 `build.args` 传入。           
   `build.args` 从宿主机的同名环境变量中取值，所以只要配置好宿主机的环境变量，便可以不暴露敏感信息并配置到镜像内使用。    



