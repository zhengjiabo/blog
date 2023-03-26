---
title: HTTP 报文
date: 2022-12-11
tags:
 - http
categories: 
 - http
---


## 总结
-  





## 提问
- [x] 1. 什么是 `\r\n`
    > `LF`、`CRLF`: 都是换行符，用于不同系统。   
    > - `LF`: 即 `\n`，`0x0a` 用于 `Unix/Mac OS X`     
    > - `CRLF`：即 `\n\r`，`0x0d 0x0a` 用于 `Windows`、`http` 请求      

- [x] 2. 如何找到文件中的 `\r\n`
    > - `cat -e` 
    > - `bat -A`
    > - `vim` `:set invlist`

- [x] 3. `HTTP` 报文格式是什么样的
    > 请求行(方法 路径 协议版本)、请求头、请求体     
    > 响应行(协议版本 状态码 状态描述)、响应头、响应体

- [x] 4. 我们如何查看某次请求的 `HTTP` 报文
    > `curl/http -vvv`







## 1. 前提提要、场景
`HTTP`(`Hyper Text Transfer Protocol`)，超文本传输协议。可用于浏览器（`HTTP Client`）与服务器（`HTTP Server`）之间的通信。         
`HTTP` 是前后端沟通的桥梁，了解 `HTTP` 协议及报文相当重要。


## 2. HTTP 报文
`HTTP` 是基于文本的协议，且由请求（`Request`）、响应（`Response`）两种 `HTTP` 报文构成。               

`HTTP` 报文，也称为 `HTTP Message`，用于在客户端与服务器间传送数据。

报文每行都由 `\r\n` 换行（即 `CRLF`）。

`LF`、`CRLF`: 都是换行符，用于不同系统。   
- `LF`: 即 `\n`，`0x0a` 用于 `Unix/Mac OS X`     
- `CRLF`：即 `\n\r`，`0x0d 0x0a` 用于 `Windows`、`http` 请求      


### 2.1 GET
```sh
# -v: 更详细的输出 包含 request 和 response
# httpbin.org: 一个用来学习 http 的服务，各种例子
$ curl -v httpbin.org/get 

# 以下为输出
# 每一行结尾是: \r\n
# 第一部分为 request
# 请求行：由 Method Path Version 构成
> GET /get HTTP/1.1
# 请求头：
> Host: httpbin.org
> User-Agent: curl/7.64.0
> Accept: */*
>
# 注意 ↑ 这个空行，实际是相隔两个 \r\n，将会收到响应报文
# 第二部分为 response
# 响应行：由 Version StatusCode StatusText 组成
# 在 HTTP/2 中，没有 StatusText，常用项已存储在静态索引表
< HTTP/1.1 200 OK
# 响应头:
< Date: Sun, 11 Dec 2022 04:14:10 GMT
< Content-Type: application/json
< Content-Length: 252
< Connection: keep-alive
< Server: gunicorn/19.9.0
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Credentials: true
<
# 注意 ↑ 这个空行，实际是相隔两个 \r\n，作为响应头和响应体的分隔
{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "Host": "httpbin.org",
    "User-Agent": "curl/7.64.0",
    "X-Amzn-Trace-Id": "Root=1-63955912-159cebb650fd9f3661ce40bc"  },
  "origin": "xx.xx.xx.xx",
  "url": "http://httpbin.org/get"
}
```


### 2.2 POST
`POST` 与 `GET` 相比只是多了个请求体

```sh
$ curl httpbin.org/post -X POST -H "content-type: application/json" -d '{"age": "18"}' -v

> POST /post HTTP/1.1
> Host: httpbin.org
> User-Agent: curl/7.64.0
> Accept: */*
> content-type: application/json
> Content-Length: 13
>
# 注意 ↑ 这个空行，实际是相隔两个 \r\n，作为请求头和请求体的分隔。请求体和响应报文之间就没有空行了
* upload completely sent off: 13 out of 13 bytes
< HTTP/1.1 200 OK
< Date: Sun, 11 Dec 2022 06:08:38 GMT
< Content-Type: application/json
< Content-Length: 420
< Connection: keep-alive
< Server: gunicorn/19.9.0
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Credentials: true
<
{
  "args": {},
  "data": "{\"age\": \"18\"}",
  "files": {},
  "form": {},
  "headers": {
    "Accept": "*/*",
    "Content-Length": "13",
    "Content-Type": "application/json",
    "Host": "httpbin.org",
    "User-Agent": "curl/7.64.0",
    "X-Amzn-Trace-Id": "Root=1-639573e6-0c1aa7244e5ae06a564743d2"  },
  "json": {
    "age": "18"
  },
  "origin": "xxx.xx.xx.x",
  "url": "http://httpbin.org/post"
}
```

## 3. HTTP Client/Server

`HTTP Client`: 即 `HTTP` 客户端，如：浏览器里的 `fetch/XHR`，命令行里的 `curl`。往大了想，也可以将浏览器当成客户端。 `API` 管理工具 [ Apifox ](https://www.apifox.cn/) 与 [ Postman ](https://www.postman.com/) 也是客户端

`HTTP Server`: 即 `HTTP` 服务端，如: `nginx/django/express/koa`。主要功能：接收 `HTTP` 客户端的请求，分析路由、请求方法请求体，并返回对应的响应报文



