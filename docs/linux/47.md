---
title: nc/telnet 发送 TCP/UDP
date: 2022-12-10
tags:
 - linux
categories: 
 - linux
---


## 总结
- `nc`: 支持 `TCP/UDP`
- `telnet`: 支持 `TCP`

> 两者都需要键入请求行、请求头、请求体。两次 `CRLR` 作为区分。




## 提问
- [x] 通过 `nc/telnet` 发送 `GET/POST` 报文
    > ```bash
    > [nc/telnet] httpbin.org 80         
    > GET /get HTTP/1.1       
    > Host: httpbin.org`
    > ```

    > ```bash
    > [nc/telnet] httpbin.org 80         
    > POST /post  HTTP/1.1       
    > Host: httpbin.org`
    > Content-Length: 3
    > 
    > a=3
    > ```






## 1. 前提提要、场景
`nc` （`netcat` 简称）、`telnet` 能够连接 `TCP/UDP` 端口号与其通信，也可用于端口连通性测试。

> `telnet` 也可以跟 `SSH` 一样用于登录远程服务器，但是明文的，没有 `SSH` 的加密，所以登录远程服务器还是使用 `SSH`


## 2. 编写 HTTP 报文测试

一般而言，`HTTP` 默认监听的是 `80` 端口，可通过 `nc/telnet` 与网站的 `80` 端口直接通过 `HTTP` 报文进行通信。


### 2.1 nc 支持 TCP/UDP

输入 `nc httpbin.org 80` 命令后回车执行命令，随后手动输入 `HTTP` 请求报文，输入完毕后，键入两次回车后发送请求。


```bash
# 以下三行都是手动输入
# 域名 端口 请求头都是手动输入
# 两次 CRCL 后发送请求（两次回车）
$ nc httpbin.org 80
GET /get HTTP/1.1
Host: httpbin.org


HTTP/1.1 200 OK
Date: Sat, 10 Dec 2022 10:08:34 GMT
Content-Type: application/json
Content-Length: 196
Connection: keep-alive
Server: gunicorn/19.9.0
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

{
  "args": {},
  "headers": {
    "Host": "httpbin.org",
    "X-Amzn-Trace-Id": "Root=1-63945aa0-1935bb5d28efb94f64350446"       
  },
  "origin": "xxx.xx.xx.xx",
  "url": "http://httpbin.org/get"
}

```


### 2.2 telnet 仅支持 TCP

通过 `telnet` 同样可以达到效果
- `nc` 支持 `TCP/UDP`
- `telnet` 只支持 `UDP`     

所以建议使用 `nc`

```bash
$ telnet httpbin.org 80
Trying 54.166.148.227...
Connected to httpbin.org.
Escape character is '^]'.
# 看到此提示后， 输入请求头
# 两次 CRCL 后发送请求（两次回车）
GET /get HTTP/1.1
Host: httpbin.org


HTTP/1.1 200 OK
Date: Sat, 10 Dec 2022 10:31:53 GMT
Content-Type: application/json
Content-Length: 196
Connection: keep-alive
Server: gunicorn/19.9.0
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

{
  "args": {},
  "headers": {
    "Host": "httpbin.org",
    "X-Amzn-Trace-Id": "Root=1-63946015-5bf8b4f779bb89a872db82cc"       
  },
  "origin": "xxx.xx.xx.xx",
  "url": "http://httpbin.org/get"
}
```



## 3. 模拟 POST 请求

模拟 `POST` 请求时，一定要带上头信息 `Content-Length`，指明 `Body` 字符数量。

```bash
# 如果输入请求头 Content-Length 
# 两次 CRCL 后发送请求（两次回车） 可以输入 Body
# 当 Body 长度达到 Content-length 时，键入回车键就会发送请求。
# 如果未达到长度，则回车键仅被识别未换行符一个字符。
$ nc httpbin.org 80
POST /post HTTP/1.1
Host: httpbin.org
Content-Length: 3

a=3

# 以下为响应
HTTP/1.1 200 OK
Date: Sat, 10 Dec 2022 11:24:24 GMT
Content-Type: application/json
Content-Length: 291
Connection: keep-alive
Server: gunicorn/19.9.0
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

{
  "args": {},
  "data": "a=3",
  "files": {},
  "form": {},
  "headers": {
    "Content-Length": "3",
    "Host": "httpbin.org",
    "X-Amzn-Trace-Id": "Root=1-63946c67-4c0ca97f55d16a7f540d1a47"
  },
  "json": null,
  "origin": "119.3.41.35",
  "url": "http://httpbin.org/post"
}
```



