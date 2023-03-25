---
title: docker - 4 | nginx 基础
date: 2022-08-02
tags:
 - docker
categories: 
 - docker
---

## 总结

1. ```nginx
    http {
      include  /etc/nginx/mime.types; # 根据 文件类型 设置 默认的传输编码类型
    }
    ```
2. 使用 `try_files` 本质上也是去访问路由。
3. 前缀匹配、同用匹配匹配最长，正则匹配匹配第一个。
4. 正则匹配，走第一个路由，与写的顺序有关，如果第一个路由没有找到指定资源，也不会进入后续匹配的路由。
5. brotli 压缩文件比 gzip 小 20% 左右，解压速度也更快。优先使用 brotli，不支持则使用 gzip。
6. 即使删掉 `location /` 和 404 路由，也默认有这两个路由。
7. 502：网关错误，真实服务器节点没响应。504：网关超时，真实服务器节点超时，可能已过载，忙不过来。


## 1. nginx 配置文件
nginx 配置文件在 `/etc/nginx/` 目录中

### 1.1 /etc/nginx/nginx.conf
nginx 的主要配置文件，引用了 `/etc/nginx/conf.d/` 目录下的所有配置文件
```nginx
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types; # 默认的传输编码类型 匹配 文件类型
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    # 引用了 `/etc/nginx/conf.d/` 目录下的所有配置文件
    include /etc/nginx/conf.d/*.conf;
}
```


### 1.2 /etc/nginx/conf.d/default.conf
nginx 的默认配置
```nginx
server {
    listen       80;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```


### 1.3 /usr/share/nginx/html
默认的静态文件资源，nginx 的欢迎页。



## 2. 通过 docker 学习 nginx
![](./220802/1.png)      
通过 `volumes` 挂在资源到容器内，挂在当前目录以及 nginx 配置文件。可以分模块快速验证 nginx 配置。      

- root：静态资源的根目录，默认 `/usr/share/nginx/html`
- index：当请求路径以 `/` 结尾时，自动寻找该路径下的 index 文件。
- default_type：默认 `Content-Type` 类型

- locatiion 中的配置
  - add_header：添加响应头，一般用X-作为自定义头部 
  - try_files：尝试匹配文件，$uri 代表路由
  - proxy_pass：反向代理，将匹配路由反射到指定的 URI 位置。
  - proxy_read_timeout time：默认60s，如果连续的60s内没有收到1个字节, 连接关闭返回 504。       
  - proxy_send_timeout time：默认60s，如果连续的60s内没有发送1个字节, 连接关闭返回 504。   


### 2.1 server_name
server_name nginx的虚拟服务器名，按照以下顺序处理，命中第一个匹配的虚拟服务器配置。       
1. 完整的静态名称
2. 开头带有通配符的名称 *.example.com
3. 尾带有通配符的名称 www.example.*
4. 有正则表达式的名称
5. 带有 default 标记的服务
6. 隐式标记的服务：80 端口

> 可以通过指定 server_name 将不同入口区分，便于隔离调试。曾经客户的 nginx 出现问题，使用域名可以正常访问，但内网的触发 301 重定向，便新建了新的 server 指定内网ip，在不影响域名访问的情况下调试内网。

## 3. location 匹配路由
修饰符，按以下优先级依次递减。
1. `=`：精确匹配
2. `^~`：前缀匹配，匹配最长的
3. `~`：正则匹配，优先级再次 (如果是 `~*` 不区分大小写，与此归为同一类)。如果同样是正则匹配，走第一个路径，与顺序有关。
4. `/`：通用匹配，匹配最长的

进入匹配路由后，如果匹配路由内没有相关资源，中断跳出走 404，相当于走了 404 路由。（原匹配路由没相关资源，相当于没进入该路由，自然原匹配路由的 add_header 也不会执行)     





验证后总结：
### 3.1 使用 `try_files` 本质上也是去访问路由。      
  ```nginx
  location / {
    expires -1;

    add_header X-Config A;
  }

  location /B {
    expires -1;

    add_header X-Config B;

    try_files $uri /index.html;
  }
    
  location /C {
    expires -1;

    add_header X-Config C;

    try_files $uri /B;
  }
  ```
  访问 `curl --head http://localhost:8210/C` 会得到

  ```bash
  HTTP/1.1 200 OK
  Server: nginx/1.23.1
  Date: Thu, 04 Aug 2022 16:08:24 GMT
  Content-Type: text/html
  Content-Length: 166
  Last-Modified: Thu, 04 Aug 2022 13:36:14 GMT
  Connection: keep-alive
  ETag: "62ebcb4e-a6"
  Expires: Thu, 04 Aug 2022 16:08:23 GMT
  Cache-Control: no-cache
  X-Config: A
  Accept-Ranges: bytes
  ```
  访问了 `/C` 尝试访问 `/B` 再尝试访问 `/` 最后携带 `X-Config: A`，即命中了 `/`

### 3.2 即使删掉 `location /` 和 404 路由，也默认有这两个路由，nginx 默认带了许多路由例如 301 304 502 504 等等。

### 3.3 正则匹配，走第一个路由，与写的顺序有关，如果第一个路由没有找到指定资源，会进入后续匹配的路由吗？        
结论：不会。
  ```nginx
  location ~ /in {
    add_header X-Config A;
  }

  location ~ /index {
    add_header X-Config B;
    try_files $uri $uri.html index.html;
  }
  ```
  进行访问 `curl --head http://localhost:8220/index` 结果为 404。        

  /in 作为第一个匹配的路由，但没有匹配资源。/index 作为后续的路由，有匹配资源，但第一个匹配路由不满足，便直接 404，不会再进入该路由。     

  ![](./220802/2.png)





## 4. proxy_pass 反向代理
可以指定 `upstream`，也可以直接指定 `service` 并直接使用容器内端口。        

- proxy_pass 不带任何路径( / 也不带)：最终结果包含了 location 匹配部分。(推荐)
- proxy_pass 带路径：最终结果只会拼接 location 匹配后的 **剩余路径**。

```nginx
# http://localhost/api/hello => http://api:3000/api/hello
location /api {
  proxy_pass http://api:3000;
}

# http://localhost/api/hello => http://api:3000/hello
location /api/ {
  proxy_pass http://api:3000/;
}

# http://localhost/api/hello => http://api:3000//hello 
location /api {
  proxy_pass http://api:3000/;
}

# http://localhost/api/hello => http://api:3000/x/hello 
location /api {
  proxy_pass http://api:3000/x;
}
```






## 5. 应用场景
### 5.1 强缓存：浏览器不会像服务器发送任何请求，直接从本地缓存中读取文件并返回         
  设置 `expires 3d;` 表示 3 天内不会过期，直接使用浏览器缓存                  
  响应头返回
  ```bash

    Date: Thu, 04 Aug 2022 14:29:56 GMT # 服务器当前时间，如果需要缓存，会以此时间添加缓存时间，放在Expires 里。

    Cache-Control: max-age=259200 # 3天转成259200秒，优先级比 Expires 高，超过这个时间会向服务器发起请求。

    Expires: Tue, 02 Aug 2022 23:56:36 GMT # 3 天后的时间，超过该事件会向服务器发起请求

    ETag: $token  # 后面用于请求头的 If-None-Match 校验，如果校验后没过期，返回 304，并重新设置超时时间。优先级高于 Last-Modified。

    Last-Modified：$Mtime # 后面用于 If-Modified-Since 校验。如果校验后没过期，返回 304，并重新设置超时时间。

  ```

  强缓存通过 `Expires` 和 `Catch-Control` 两个字段控制
  - Expires 是 HTTP1.0 的产物，Cache-Control 是 HTTP1.1 的产物，Cache-Control 优先级高于 Expires。在某些不支持 HTTP1.1 的环境下，Expires 就会发挥作用，现阶段 Expires 的存在只是一种兼容性的写法。
  - 强缓存只关心是否超出某个时间，不关心服务器端文件是否更新。
  - 强制缓存优先级高于协商缓存。


### 5.2 协商缓存，向服务器验证是否过期。         
  设置 `expires -1;`        
  响应头返回 
  ```bash
  Cache-Control: no-cache # 每次请求都需要向服务器校验

  ETag: $token  # 后面用于 If-None-Match 校验，基于资源的内容编码生成一串唯一的标识字符串，只要内容不同，就会生成不同的 ETag。

  Last-Modified：$Mtime # 后面用于 If-Modified-Since 校验。如果校验后没过期，返回 304，并重新设置超时时间。
  ```

  协商缓存通过 ，ETag 和 If-None-Match 或者 Last-Modified 和 If-Modified-Since       
  - 强制缓存若不生效则进行协商缓存
  - Etag 优先级高于 Last-Modified。如果文件周期性变化，内容不变 Etag 也不变，但 Last-Modified 会发生变化。我们也是期待用户使用缓存，不必重新下载，这种优先级可以保证用户继续使用缓存。
     当然，不同静态文件服务器生成 Etag 的方式不同，nginx 是利用文件的 mtime 和 size，利用了 mtime，即使单纯保存内容不变，也会导致 Etag 变化。
  - 协商缓存由服务器决定是否使用缓存
    - 若缓存无效了，重新返回资源、缓存标识、状态码200，重新存入浏览器缓存中。
    - 若缓存有效，返回状态 304 ，继续使用缓存。


### 5.3 单页应用的缓存策略

```nginx
server {
  listen       80;
  server_name  localhost;

  root   /usr/share/nginx/html;
  index  index.html index.htm;

  location / {
    # 解决单页应用服务端路由的问题
    # 匹配不到文件，尝试后续匹配项，最终是跳转单页应用的入口
    try_files  $uri $uri/ /index.html;  

    # 非带 hash 的资源，需要配置 Cache-Control: no-cache，避免浏览器默认为强缓存
    expires -1;
  }

  location /static {
    # 带 hash 的资源，需要配置长期缓存
    # 资源有变化，打包出来的文件 hash 也会变化。
    expires 1y;
  }
}
```

### 5.4 cleanUrls 访问路径时，可以省略 .html        

  设置 `try_files  $uri $uri.html $uri/index.html /index.html;`       
  会按以上顺序去依次匹配文件，其中就包括了后面补全的 .html 和 $url/index.html，如果都匹配不到便跳回主页面 /index.html。单页应用可以以此跳回。          
   

### 5.5 开启 gzip       
设置 `gzip on;`，可以参考配置更多参数 [HttpGzip模块](https://www.nginx.cn/doc/standard/httpgzip.html)
  ```nginx
  location / {
    expires -1;

    # 开启 gzip 
    gzip on;

    # gzip http 版本
    gzip_http_version 1.0;
    
    # gzip 压缩等级 压缩等级1-9
    gzip_comp_level 5;

    # 最小压缩临界值(默认的是20字节) 
    gzip_min_length 20;

    # 设置用于处理请求压缩的缓冲区 数量 和 大小  16 * 8 k
    gzip_buffers 16 8k;
    
    # 压缩文件类型 
    gzip_types
      application/javascript 
      application/json
      image/svg+xml
      image/x-icon 
      text/css 
      text/plain
      text/javascript; #（无论是否指定）"text/html"类型总是会被压缩的
  }
  ```

### 5.6 开启 brotli   
   1. 参考 [如何为 nginx 中添加 module](https://github.com/nginxinc/docker-nginx/tree/master/modules)      
   2. 添加自定义 nginx 镜像文件 Dockerfile： `curl -o xx/Dockerfile https://raw.githubusercontent.com/nginxinc/docker-nginx/master/modules/Dockerfile`。
   3. 配置 docker-compose.yml 文件   
      ```nginx
      version: "3.3"
        services:
          brotli:
            build:
              context: ./brotli/
              args:
                ENABLED_MODULES: brotli # 引入 brotli 模块
              ports:
                - "80:80"
            volumes:
            - ./brotli-nginx.conf:/etc/nginx/nginx.conf
            - ./brotli.conf:/etc/nginx/conf.d/default.conf
            - .:/usr/share/nginx/html
      ```   
   4. nginx.conf 加载注册 brotli 模块
      ```nginx
        load_module modules/ngx_http_brotli_filter_module.so;
        load_module modules/ngx_http_brotli_static_module.so;
      ```  
   5. conf.d/default.conf 开启 `brotli on`
      ```nginx
      server {
          listen       80;
          server_name  localhost;

          root   /usr/share/nginx/html;
          index  index.html index.htm;

          location / {
              expires -1;
              brotli on;# 该模块官方文档: https://github.com/google/ngx_brotli#brotli
          }
      }
      ```
   6. brotli 更多的配置
      ```nginx
        # brotli 压缩等级 压缩等级1-11
        brotli_comp_level 5;

        # 最小压缩临界值(默认的是20字节) 
        brotli_min_length 20;

        # 设置用于处理请求压缩的缓冲区 数量 和 大小  16 * 8 k
        brotli_buffers 16 8k;
        
        # 压缩文件类型 
        brotli_types
          application/javascript 
          application/json
          image/svg+xml
          image/x-icon 
          text/css 
          text/plain
          text/javascript; #（无论是否指定）"text/html"类型总是会被压缩的
      ```
 


  brotli/gzip 区别      
  - brotli 压缩比更大，相对的压缩文件所需计算能力更多，资源消耗更大。       
  - Gzip 压缩等级1-9，brotli 压缩等级1-11     
  - Gzip 专为压缩文件设计；Brotli 专为 web 数据设计（内置web词汇的字典），对于 web 流数据的压缩效率更高。   
  - brotli 压缩完体积比 Gzip 的小 10-20%，且解压速度更快。  


### 5.7 CORS:  跨域。 
  ```nginx 
  add_header Access-Control-Allow-Origin *; # 一般写指定域名

  # 跨域支持的请求类型
  # add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS; 

  # 跨域请求是否允许发送Cookie，true:支持，false:不支持
  # add_header Access-Control-Allow-Credentials true; 
  
  # 跨域请求允许的Header头信息字段，以逗号分隔的字符串
  # add_header Access-Control-Allow-Headers DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,x-auth-token; 
  ```


### 5.8 HSTS : HTTP 严格传输安全（HTTP Strict Transport Security)。       
  ```nginx
  listen 443 ssl;

  # 设置 HSTS Header 的过期时间
  add_header Strict-Transport-Security max-age=7200;
  
  # 当前前域名及其子域名均开启HSTS的保护
  add_header Strict-Transport-Security "max-age=7200;includeSubDomains"; 
  
  ```
  但是有首次访问不受 HSTS 保护的问题：可以通过 [Preload List](https://hstspreload.org/)，在主流浏览器第一次访问也会使用 HTTPS 。


### 5.9 CSP： 内容安全策略CSP（Content-Security-Policy）, 可用于防范XSS注入   
  内容安全策略通过 HTTP 响应标头传递，与 HSTS 非常相似      
  ```nginx
  # self 同源策略
  # 默认策略，应用于请求等所有访问 可以指定源
  add_header Content-Security-Policy "default-src 'self';";

  # 定义js文件的过滤策略 可以指定源
  add_header Content-Security-Policy "script-src 'self' js.example.com;";
  ```
  > 浏览器加载此页面时，会同时加载许多其他资源，如果攻击者钻空子在评论提交了一个特定的评论，以从第三方域加载一些恶意 javascript。其它用户浏览器访问网页后会加载恶意代码。所以浏览器需要设置信任来管理自外部链接的资源，这就是 CSP。

### 5.10 Rewrite 内部重定向，服务器获取指定资源后响应给客户端
  单页应用的所有 `*.html` 均为读取根目录 index.html。
  ```nginx
    server {
      listen       80;
      server_name  localhost;

      root   /usr/share/nginx/html;
      index  index.html index.htm;

      location / {
        expires -1;
        try_files $uri index.html; # 尝试匹配
      }
    }
  ```


### 5.11 Redirect 重定向，服务器通过 301/302 状态码，将资源地址存放在Location 响应头告知客户端
  rewrite regex replacement [flag];          
  flag：
  - redirect：返回状态码 302 临时重定向，根据重定向头 Location 跳转
  - permanent：返回状态码 301 永久重定向，根据重定向头 Location 跳转
  ```nginx
    server {
      listen       80;
      server_name  localhost;

      root   /usr/share/nginx/html;
      index  index.html index.htm;

      location / {
        expires -1;
        rewrite ^ http://www.bing.com redirect;
      }
    }
  ```



## 6. 502 和 504 区别
- 502：网关错误，代理服务器的真实服务器节点没响应。
- 504：网关超时，代理服务器的真实服务器节点超时，可能真实服务器已过载，忙不过来。

proxy_read_timeout time：默认60s，如果连续的60s内没有收到1个字节, 连接关闭返回 504。       

proxy_send_timeout time：默认60s，如果连续的60s内没有发送1个字节, 连接关闭返回 504。       



## 疑问
- [x] 在容器内部的 ngixn 配置中，可以通过 http://api 去访问另一个容器里的服务？api 是服务名。 而且是是通过 3000 端口使用 api，而不是宿主端口 8888？      
docker 中每个容器都有自己的内网 ip，容器间可以通过内网 ip 访问。             
之所以可以使用 http://api 访问，是因为 docker 内部的服务发现，有个 DNS服务器。在内网可以直接通过服务名访问，有点类似于域名，经过 DNS 服务解析出内网 IP。      
可以在容器内通过 `cat /etc/resolv.conf` 找到 DNS 服务器地址      
![](./220802/3.png)              
也可以在容器内通过 `nslookup 服务名` 找到指定服务的内网 IP（即找到提供服务的容器的IP）。      
![](./220802/4.png)    
通过 `docker inspect container_name` 核查，也可以发现跟上方 `nslookup` 找到 IP 一致     
![](./220802/5.png)
由于没有经过真实域名也不会消耗多余流量。



- [x] 如果我宿主机起了个服务，在容器内，如何通过proxy_pass设置访问。         
在开发环境，可以更改 host 文件，设置 `host.docker.internal` 或者  `gateway.docker.internal` ，并在容器内部使用，但不适用于 除了 Docker Desktop 以外的生产环境。
    参考官网[https://docs.docker.com/desktop/networking/](https://docs.docker.com/desktop/networking/)

    不会有这种场景，有也是容器内到另一个 service

- [x] yaml 的 version 3 是什么意思         
这代表我们定义的docker-compose.yml 文件内容所采用的版本，目前Docker Compose的配置文件已经迭代至了第三版，其所支持的功能也越来越丰富，所以我们建议使用最新的版本来定义。

- [x] 即使删掉 `location /` 和 404 路由，也默认有？   
默认带有，类似 403 无权限访问，502 网关错误，504 网关超时等都有默认路由，不建议修改。

- [x]  `load_module modules/ngx_http_brotli_filter_module.so;
          load_module modules/ngx_http_brotli_static_module.so;` 为什么写在 nginx.conf 主文件下，而不是conf.d/default.config      
为了写在 http 块以上，而 conf.d 在 http 内部引用的。




## 提问

- [x] rewrite 和 redirect 区别
- [x] 502 和 504 区别
- [x] brotli 和 gzip 区别










