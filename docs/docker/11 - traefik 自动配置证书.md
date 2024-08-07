---
title: docker - 11 | traefik 自动配置证书
date: 2022-09-06
tags:
 - docker
categories: 
 - docker
---
 

## 1. 前提提要、场景
在域名提供商的控制台配置域名，通过 A 记录指向搭建好 `traefik` 网关的服务器的 IP 地址。

- A 记录：记录域名对应的 IP 地址。缺点就是容易被发现服务器的真实 IP，导致 DDOS 攻击。       
- CNMAE 记录：别名记录，把域名解析到别的域名上。 CDN 加速解析是现在 CNAME 记录最大的用途。
- A 记录直接指向 IP 地址，CNAME 记录指向域名。CNAME 指向的域名也要指向 A 记录，也就说 IP 地址可以按需更换，而无需变更 CNAME 的记录值。
- 自学用途可以直接添加 A 记录，如果是长期建站、项目运营建议使用 CNAME 记录。可用于 CDN 加速，又能隐藏网站的真实 IP。





## 2. 启动服务
在传统 `nginx` 方式需要手动去配置 `proxy_pass`。然而使用 `traefik`，可以简单地在容器中配置 `labels` ，即可配置域名，启动容器域名便生效。例如以下。
```yaml
labels:
  - "traefik.http.routers.whoami.rule=Host(`whoami.firefly.com`)"
```

完整 `docker-compose.yaml` 配置
```yml
version: '3'

services:
  reverse-proxy:
    image: traefik:v2.5
    ports:
      - "80:80"
      - "443:443" # 用于 TLS 即 HTTPS
      - "8080:8080"
    volumes:
      - ./traefik.toml:/etc/traefik/traefik.toml
      - ./acme.json:/acme.json
      - ./log:/log
      - /var/run/docker.sock:/var/run/docker.sock
    container_name: traefik
    env_file: .env
    labels:
      - "traefik.http.routers.api.rule=Host(`traefik.firefly.com`)"
      - "traefik.http.routers.api.service=api@internal"

      # 配置 TLS
      - traefik.http.routers.api.tls=true
      # 设置 https，此时certresolver 为 le，与 traefik.toml certificatesResolvers 配置保持一致。指定证书解析器
      - traefik.http.routers.api.tls.certresolver=le


  # 该镜像会暴露出自身的 `header` 信息
  whoami:
    image: containous/whoami
    labels:
      # 设置Host 为 whoami.firefly.localhost 进行域名访问
      - "traefik.http.routers.whoami.rule=Host(`whoami.firefly.com`)"

      # 配置 TLS
      - traefik.http.routers.whoami.tls=true
      # 设置 https，此时certresolver 为 le，与 traefik.toml certificatesResolvers 配置保持一致。指定证书解析器
      - traefik.http.routers.whoami.tls.certresolver=le
      # 也可设置多个路由，匹配多个子域名或路径


# 使用已存在的 traefik 的 network
networks:
  external:
    name: demo_default
```

`traefik.toml`
```toml
# 证书解析器.name.自动化证书管理环境配置
# certificatesResolvers.<name>.acme
# 可以跟路由一样创建多个证书解析器-自动化证书管理，用于不同路由。也可以多个路由公用一个证书解析器
[certificatesResolvers.le.acme]
  email = "xianger94@qq.com"
  storage = "acme.json" # 存储文件，默认 acme.json
  
  [certificatesResolvers.le.acme.tlsChallenge] # tls 验证，默认 true
  
  [certificatesResolvers.le.acme.httpChallenge] # http 验证，默认 false
    entryPoint = "web" # 入口

```


需要给 `acme.json` 配置 600 权限，`chmod 600 acme.json` 否则启动会报错。      
```json
{"level":"error","msg":"The ACME resolver \"le\" is skipped from the resolvers list because: unable to get ACME account: permissions 777 for acme.json are too open, please use 600","time":"2022-09-06T15:41:17Z"}
```
> windows 有时候设置 600 还是报错，用 linux 或 mac 吧

以上都准备好后，执行 `docker compose up` 启动容器。



## 3. traefik + Nuxt
使用以下配置 `docker-compose.yml`
```yaml
version: '3.7'

networks:
  traefik-proxy-network:
    # 此处不用设置 external，因为是由本组合（compose 文件）创建的 network
    # external: true # 使用已存在、组合（compose 文件）之外的 network，如果不存在则提示 network proxy-net declared as external, but could not be found
    name: proxy-net # 指定名称

services:
  traefik:
    container_name: traefik
    image: traefik:v2.5
    ports:
      - "80:80"
      - "443:443" # 用于 TLS 即 HTTPS
      - "8080:8080"
    networks: # 指定 network 使这个容器成为该网络的一部分
      - traefik-proxy-network
    volumes:
      - ./traefik.toml:/etc/traefik/traefik.toml
      - ./acme.json:/acme.json
      - ./log:/log
      - /var/run/docker.sock:/var/run/docker.sock
    env_file: .env
    # labels:
      # - "traefik.enable=true" # 如果要在 面板上看到 traefik 服务，则开启

```

`docker-compose-nuxt.yml`

```yml
version: '3.7'

# 使用已存在的 traefik 的 network
networks:
  traefik-proxy-network:
    external: true # 使用已存在、组合（compose 文件）之外的 network，如果不存在则提示 network proxy-net declared as external, but could not be found
    name: proxy-net # 指定名称

services:
  nuxt:
    restart: always
    container_name: nuxt
    build:
      context: ./nuxt/
    networks: # 指定 network 使这个容器成为该网络的一部分
      - traefik-proxy-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nuxt.rule=PathPrefix(`/`)"
      # - "traefik.http.routers.nuxt.tls=true" # 开启 https
      # - "traefik.http.routers.nuxt.tls.certresolver=le"

```



需要注意的是，`Nuxt` 的 `Dockerfile` 文件中，要设置环境变量
```yaml
# 一定要设置这个，否则 traefik http 无法正常使用
ENV HOST 0.0.0.0 
```

执行       
`docker compose up -d && docker compose -f docker-compose-nuxt.yml up -d` 


具体 demo 可以参考 [https://github.com/zhengjiabo/traefik-nuxt](https://github.com/zhengjiabo/traefik-nuxt)



## 遗留




