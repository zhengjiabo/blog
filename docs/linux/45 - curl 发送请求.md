---
title: curl 发送请求
date: 2022-12-03
tags:
 - linux
categories: 
 - linux
---


## 总结

- `curl url`: 发起 `get` 请求
  - `-X/--request`: 指定请求方法
  - `-I/--head`: 发送 `HEAD` 请求，只返回响应头
  - `-i/--include`: 返回响应头 和 响应体
  - `-v/--verbose`: 查看详细过程，查看发送、响应以及 `TLS handshake` 过程。`-vvv` 多个 `v` 为更详细   
  - `-L/--location`: 追踪重定向
  - `-H`: 添加头信息
  - `-d`: 添加请求体，文件用 `@`

- `http`:
  - `[METHOD] url`: 发起请求
  - `-f/--form`: `Content-Type: application/x-www-form-urlencoded`
  - `-F/--follow`: 追踪重定向
  - `--multipart`: `Content-Type: multipart/form-data` 文件用 `@`


> 这里的响应头实际是：响应行 + 响应头


## 提问
- [x] 1. `curl/httpie` 如何发送一个 `GET` 请求
  > `curl httpbin.org/get [-X GET]` 不要写成小写的 `get`     
  > `http [GET] httpbin.org/get`
- [x] 2. `curl/httpie` 如何发送 `JSON` 数据给服务器端
  > `curl httpbin.org/post -X POST -H "content-type: application/json" -d '{"age": "18"}'`      
  > `http POST httpbin.org/post age=18`
- [x] 3. `curl/httpie` 如何发送 `FORM` 数据给服务器端
  > `curl httpbin.org/post -X POST -d age=18`     
  > `http -f POST httpbin.org/post age=18`
- [x] 4. `curl/httpie` 如何追踪重定向路径
  > `curl httpbin.org/absolute-redirect/1 -L`      
  > `http httpbin.org/absolute-redirect/1 -F`
- [x] 5. `curl/httpie` 如何仅返回 `Response Header`
  > `curl httpbin.org/get -I`    
  > `http HEAD httpbin.org/get` 如果是只打印响应头 `-ph` 或者 `-h/--head/--headers`
  





## 1. 前提提要、场景
`curl`，用于发送请求的命令行工具，一个 `HTTP` 请求客户端（实际上它也可以做 `FTP`/`SCP`/`TELNET` 协议的事情），可在命令行中发起请求。类似浏览器中的 `fetch`
> `SCP`: 全称 `Secure Copy`，指两个主机之间基于 `SSH` 协议进行安全的远程文件传输。    
> `TELNET`: 提供了连接远程主机的能力，与 `SSH` 类似。应用层协议，基于 `TCP`。`SSH` 协议在发送数据时会对数据进行加密操作，数据传输更安全，因此 `SSH` 协议几乎在所有应用领域代替了 `Telnet` 协议。在一些测试、无需加密的场合（如局域网），`Telnet` 协议仍常被使用。

在学习及调试 `HTTP` 的过程中，可结合 `curl` 与 [ httpbin ](https://httpbin.org/) 一同使用。`httpbin` 可用以测试 `HTTP` 各种方法、状态码、头部、基本认证及摘要认证等


## 2. curl 

### 2.1 `curl url` 发起 get 请求

紧跟 `URL`，发起 `get` 请求，默认只返回响应体    
命令：`curl <url>`     
示例：`curl ifconfig.me`


```sh
# https://ifconfig.me 是一个获取客户端公网 IP 的服务。
$ curl ifconfig.me
118.73.227.215#
```


### 2.2 `curl -X/--request` 指定请求方法


命令：`curl <url> -X <method>`     
示例：`curl https://httpbin.org/post -X POST`

```sh
# -X: 指定请求方法
# -H: 添加请求头。请求头不区分大小写。
$ curl https://httpbin.org/post -X POST -H "a: 3" -H "b: 4"

{
  "args": {},
  "data": "",
  "files": {},
  "form": {},
  "headers": {
    "A": "3",
    "Accept": "*/*",
    "B": "4",
...
```


### 2.3 `curl -I/--head` 发送 HEAD 请求 / 只返回响应头

发送 `HEAD` 请求，只返回响应头    
命令：`curl <url> -I `     
示例：`curl https://httpbin.org/get -I`

```sh
$ curl https://httpbin.org/get -I

HTTP/2 200 
date: Sun, 04 Dec 2022 03:37:07 GMT
content-type: application/json
content-length: 253
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true
```


### 2.4 `curl -i/--include` 返回响应头 和 响应体

返回响应头 和 响应体    
命令：`curl <url> -i`     
示例：`curl https://httpbin.org/get -i`

```sh
# 返回响应头 和 响应体    
$ curl https://httpbin.org/get -i

HTTP/2 200 
date: Sun, 04 Dec 2022 05:09:41 GMT
content-type: application/json
content-length: 253
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "Host": "httpbin.org",
    "User-Agent": "curl/7.64.0",
    "X-Amzn-Trace-Id": "Root=1-638c2b95-157d55a4332670744ae0efd9"
  },
  "origin": "xxx.xx.xx.xx",
  "url": "https://httpbin.org/get"
}
```
> ps：可以看到 `HTTP2` 响应行 200 后面没有 `OK` 的描述了。因为常见的字段有一份静态索引表维护 [Static Table Definition](https://httpwg.org/specs/rfc7541.html#static.table.definition)


### 2.5 `curl -v/--verbose` 查看详细过程

查看发送、响应以及 `TLS handshake` 过程    
命令：`curl <url> -v` 或者更详细 `curl <url> -vvv`     
示例：`curl https://shanyue.tech/ -vvv`

```sh
# -vvv: 查看更详细的过程，如 TLS handshake
$ curl https://shanyue.tech/ -vvv -I
*   Trying 122.228.7.237...
* TCP_NODELAY set
* Connected to shanyue.tech (122.228.7.237) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/pki/tls/certs/ca-bundle.crt
  CApath: none
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, [no content] (0):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, [no content] (0):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, [no content] (0):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, [no content] (0):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, [no content] (0):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: CN=shanyue.tech
*  start date: Feb  5 00:00:00 2022 GMT
*  expire date: Feb  6 23:59:59 2023 GMT
*  subjectAltName: host "shanyue.tech" matched cert's "shanyue.tech"  
*  issuer: C=US; O=DigiCert Inc; OU=www.digicert.com; CN=Encryption Everywhere DV TLS CA - G1
*  SSL certificate verify ok.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* TLSv1.3 (OUT), TLS app data, [no content] (0):
* TLSv1.3 (OUT), TLS app data, [no content] (0):
* TLSv1.3 (OUT), TLS app data, [no content] (0):
* Using Stream ID: 1 (easy handle 0x561384565690)
* TLSv1.3 (OUT), TLS app data, [no content] (0):
> HEAD / HTTP/2
> Host: shanyue.tech
> User-Agent: curl/7.61.1
> Accept: */*
>
* TLSv1.3 (IN), TLS handshake, [no content] (0):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.3 (IN), TLS handshake, [no content] (0):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.3 (IN), TLS app data, [no content] (0):
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
* TLSv1.3 (OUT), TLS app data, [no content] (0):
* TLSv1.3 (IN), TLS app data, [no content] (0):
< HTTP/2 200 
HTTP/2 200
< server: Tengine
server: Tengine
< content-type: text/html; charset=utf-8
content-type: text/html; charset=utf-8
< content-length: 33229
content-length: 33229
< vary: Accept-Encoding
vary: Accept-Encoding
< date: Sun, 04 Dec 2022 05:42:09 GMT
date: Sun, 04 Dec 2022 05:42:09 GMT
< vary: Accept-Encoding
vary: Accept-Encoding
< x-oss-request-id: 638C3331ED63F03936E62C71
x-oss-request-id: 638C3331ED63F03936E62C71
< x-oss-cdn-auth: success
x-oss-cdn-auth: success
< accept-ranges: bytes
accept-ranges: bytes
< etag: "F540C0D57CDB57215AF11970EF4AAEF6"
etag: "F540C0D57CDB57215AF11970EF4AAEF6"
< last-modified: Wed, 23 Mar 2022 14:57:44 GMT
last-modified: Wed, 23 Mar 2022 14:57:44 GMT
< x-oss-object-type: Normal
x-oss-object-type: Normal
< x-oss-hash-crc64ecma: 8545542358272103335
x-oss-hash-crc64ecma: 8545542358272103335
< x-oss-storage-class: Standard
x-oss-storage-class: Standard
< x-oss-meta-mtime: 1648047444.796073379
x-oss-meta-mtime: 1648047444.796073379
< cache-control: no-cache
cache-control: no-cache
< content-md5: 9UDA1XzbVyFa8Rlw70qu9g==
content-md5: 9UDA1XzbVyFa8Rlw70qu9g==
< x-oss-server-time: 9
x-oss-server-time: 9
< ali-swift-global-savetime: 1670132529
ali-swift-global-savetime: 1670132529
< via: cache4.l2cn3047[67,67,200-0,M], cache67.l2cn3047[68,0], kunlun9.cn3468[83,83,200-0,M], kunlun3.cn3468[87,0]
via: cache4.l2cn3047[67,67,200-0,M], cache67.l2cn3047[68,0], kunlun9.cn3468[83,83,200-0,M], kunlun3.cn3468[87,0]
< x-cache: MISS TCP_MISS dirn:-2:-2
x-cache: MISS TCP_MISS dirn:-2:-2
< x-swift-savetime: Sun, 04 Dec 2022 05:42:09 GMT
x-swift-savetime: Sun, 04 Dec 2022 05:42:09 GMT
< x-swift-cachetime: 0
x-swift-cachetime: 0
< timing-allow-origin: *
timing-allow-origin: *
< eagleid: 7ae4079716701325292036477e
eagleid: 7ae4079716701325292036477e

<
* Connection #0 to host shanyue.tech left intact
```



### 2.6 `curl -L/--location` 追踪重定向

命令：`curl <url> -L`    
示例：`curl http://httpbin.org/absolute-redirect/1 -LI`

```sh
# -L: 追踪重定向
# -I: 只返回响应头
$ curl http://httpbin.org/absolute-redirect/1 -LI

HTTP/2 302
date: Sun, 04 Dec 2022 06:04:03 GMT
content-type: text/html; charset=utf-8
content-length: 251
location: http://httpbin.org/get
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

HTTP/1.1 200 OK
Date: Sun, 04 Dec 2022 06:04:04 GMT
Content-Type: application/json
Content-Length: 252
Connection: keep-alive
Server: gunicorn/19.9.0
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
# 可以看到，第一个响应头返回了 302 临时重定向到 http://httpbin.org/get 
# 由于 -L 追踪重定向。继续请求 http://httpbin.org/get 并返回了第二个响应头 


# 分析知乎的重定向
# 以下结果过滤了无关响应头
$ curl http://zhihu.com -LI

# 永久重定向 跳转 https 协议
HTTP/1.1 301 Moved Permanently
Content-Type: text/html
Content-Length: 182
Connection: keep-alive
Location: https://www.zhihu.com/

# 发现未登录，302 临时重定向，跳转登录页
HTTP/2 302 
server: CLOUD ELB 1.0.0
content-type: text/html; charset=utf-8
expires: 0
location: //www.zhihu.com/signin?next=%2F
cache-control: private, must-revalidate, no-cache, no-store, max-age=0  
content-length: 93

# 返回登录页信息
HTTP/2 200 
server: CLOUD ELB 1.0.0
content-type: text/html; charset=utf-8
expires: 0
cache-control: private, must-revalidate, no-cache, no-store, max-age=0  
content-length: 38114
```


### 2.7 `httpie && examples` 更人性化的 HTTP 命令行客户端

`httpie` [官网](https://httpie.io/) 是现代化更为流行的一个 `HTTP` 客户端，支持色彩、`JSON` 等。根据官网安装后便可以使用。

命令：`http[s] [METHOD] URL [REQUEST_ITEM ...]`            
示例：`http http://httpbin.org/get`

```sh
# 人性化识别 get/post
# 不带 body 默认 get
# -p: 打印
#     H: 请求头
#     B: 请求体
#     h: 响应头  还可以更简洁 直接 -h
#     b: 响应体  还可以更简洁 直接 -b
$ http http://httpbin.org/get -pH

# 携带 body 时以键值对形式存在，且自动识别为 post。但为了养成习惯，请要求自己显性写上方法
$ http http://httpbin.org/post hello=word -pH


# httpie 比 curl 方便很多，head 使用双引号，且携带 body 不需要自己写 Content-Type
  # httpie 默认: application/json 即携带 body 时默认发送 JSON 格式
  # curl 默认: application/x-www-form-urlencoded
$ http POST httpbin.org/post "a: 3" name=shanyue -pH
# -d: 携带 body
# -o /dev/null: 比特桶 忽略响应体
$ curl -X POST httpbin.org/post -H "a: 3" -H "content-type: application/json" -d '{"name": "shanyue"}' -vo /dev/null


# 发送 Form 数据给服务器端，curl/httpie 都比较方便
# -f/--form: Content-Type 设置为 application/x-www-form-urlencoded  
$ http -f POST httpbin.org/post "a: 3" name=shanyue
$ curl -X POST httpbin.org/post -H "a: 3" -d name=shanyue


# 上传文件
$ http POST httpbin.org/post < Readme.md
$ curl -X POST httpbin.org/post -H "content-type: application/json" -d @Readme.md


# multipart 上传文件
$ http --multipart httpbin.org/post a=3 b@'Readme.md' -pH
# curl 上传 multipart/form-data 很麻烦，需要将格式处理好，放在 -d 参数后，不推荐纯手敲命令。

# -F/--follow: 追踪重定向
$ http http://httpbin.org/absolute-redirect/1 -FpH
```






