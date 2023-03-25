---
title: Header 头信息
date: 2022-12-12
tags:
 - http
categories: 
 - http
---


## 总结

- `Header` 规则:
  - 头信息大小写：`HTTP/1.x`：大小写不区分，都是正确写法。`HTTP/2.x`：只允许小写。
  - `HTTP Header` 名称与值由 `:` 分割，值首部空格将被忽略，更严格地说，是被 `/:\s+/` 分割。`A:3` 与 `A:  3` 无差别。
  - `HTTP Header` 中的非标准自定义首部由 `X-` 作为前缀，虽已被废弃，但仍然有大量使用。比如 `X-Powered-By`，仍被大量服务器框架所使用。

- `pseudo-header`(伪头)：`http/2` 中，以 `:` 开头的字段，不属于头字段。用于替换 `http/1.x` 中的请求行和响应行。为了提供 `http/1.x` 所欠缺非幂等性请求的重试机制。
  - `:scheme`：替代 `SCHEME`，即 `HTTPS/HTTP`
  - `:method`：替代 `METHOD`
  - `:authority`：替代 `Host`
  - `:path`：替代 `PATH`
  - `:status`：替代 `Status Code`


## 提问
- [x] 1. `HTTP` 响应头中 `Cache-Control`，有时为首字母大写，有时为小写，哪个是正确写法
    > `HTTP/1.x`：大小写不区分，都是正确写法。
    > `HTTP/2.x`：只允许小写。
- [x] 2. 什么是伪头
    > `http/2` 中，以 `:` 开头的字段，用于替换 `http/1.x` 中的请求行和响应行。为了提供 `http/1.x` 所欠缺非幂等性请求的重试机制。 
- [x] 3. 如何自定义 `HTTP` 头部
    > 使用 `X-` 开头头部字段
- [x] 4. 通过 `curl` 与 `httpbin` 测试请求头部
    > - `curl httpbin.org/get -Iv`
    > - `http HEAD httpbin.org/get -pH`






## 1. 前提提要、场景

`HTTP` 中的 `Header` 有一些规则：
1. `HTTP/1.x Header` 名称不区分大小写: `Content-Type` 与 `content-type` 无差别。但是 `HTTP/2` 要求使用小写。 [HTTP Fields](https://www.rfc-editor.org/rfc/rfc9113.html#section-8.2)。所以请养成习惯使用小写吧。
2. `HTTP Header` 名称与值由 `:` 分割，值首部空格将被忽略，更严格地说，是被 `/:\s+/` 分割。`A:3` 与 `A:  3` 无差别。
3. `HTTP Header` 中的非标准自定义首部由 `X-` 作为前缀，虽已被废弃，但仍然有大量使用。比如 `X-Powered-By`，仍被大量服务器框架所使用。



`HTTP/1.x Header` 虽然不区分大小写，但有时也希望能获取到原始的 `Header`，因此在 `Node.js` 中提供了两个 `API`：
- [ message.headers ](https://nodejs.org/api/http.html#messageheaders)：对头部全部转化为小写形式返回
- [ message.rawHeaders ](https://nodejs.org/api/http.html#messagerawheaders)：对头部不做大小写转化进行返回




## 2. pseudo-header (伪头)

### 2.1 定义
在 `HTTP/1.x` 协议中，使用消息起始行（请求行和响应行）来传达目标 `URI` 和 响应状态。[ RFC7230 ](https://www.rfc-editor.org/rfc/rfc7230#section-3.1)       
在 `HTTP/2` 协议中，不再有请求行和响应行。而是使用伪头（以 `:` 开头）替代。见 [ RFC9113 ](https://www.rfc-editor.org/rfc/rfc9113.html#name-request-pseudo-header-field)     


有以下 `4 + 1` 个伪头，`4` 个用于请求:
- `:scheme`：替代 `SCHEME`，即 `HTTPS/HTTP`
- `:method`：替代 `METHOD`
- `:authority`：替代 `Host`
- `:path`：替代 `PATH`

`1` 个用于响应:
- `:status`：替代 `Status Code`

替代效果
```bash
   # request
   GET /resource HTTP/1.1           HEADERS
     Host: example.org          ==>     :method: GET
                                        :authority: example.org
                                        :scheme: https
                                        :path: /resource 
```
```bash
  # response
  HTTP/1.1 304 Not Modified        HEADERS
                                ==>     :status = 304
```

### 2.2 浏览器中的 pseudo-header
**伪头不属于 `HTTP` 头部字段**，但仍然跟头部列再一起，在 `Chrome/Edge` 浏览器控制台网络面板中也将他们置于一起。

![](../assets/1%2018.png)


> 若要试验，可以查看网站 [HTTP/1 和 HTTP/2 速度对比 demo](https://http2.akamai.com/demo)，可以看到 `HTTP/2` 的伪头，也可以看到 `HTTP/1.1` 和 `HTTP/2` 速度的对比

看了上面的图，会发现响应头少了个 `:status` 响应伪头，是因为在 `Chrome/Edge` 浏览器中不显示在头部字段中，而是处理后显示在状态代码中，用抓包软件 `fiddler` 或 `Charles` 便可以看到原本文本。


### 2.3 抓包软件中的 pseudo-header
以下为 `Charles` 抓取 `HTTP/2` 包
![](../assets/2%2015.png)

以下为 `Charles` 抓取 `HTTP/1.1` 包
![](../assets/3%2011.png)

这也可以进一步说明 
- **伪头不属于 `HTTP` 头部字段**。
- 伪头用于替代 `HTTP/1.1` 中请求行/响应行中的信息，`HTTP/2` 中没有请求行、响应行。





### 2.4 为什么要有 pseudo-header


> [8.7. Request Reliability](https://www.rfc-editor.org/rfc/rfc9113.html#name-request-reliability) 写到了
> In general, an HTTP client is unable to retry a non-idempotent request when an error occurs because there is no means to determine the nature of the error...
>
> HTTP/2 provides two mechanisms for providing a guarantee to a client that a request has not been processed:
>
> The GOAWAY frame indicates the highest stream number that might have been processed. Requests on streams with higher numbers are therefore guaranteed to be safe to retry.
The REFUSED_STREAM error code can be included in a RST_STREAM frame to indicate that the stream is being closed prior to any processing having occurred. Any request that was sent on the reset stream can be safely retried.

目前理解下来是：`HTTP/2` 使用伪头，提供了 `HTTP/1.x` 所欠缺非幂等性请求的重试机制。

> 推荐这两篇译文 [http2-http-semantics](https://halfrost.com/http2-http-semantics/)、[rfc7540-translation-zh_cn](https://github.com/abbshr/rfc7540-translation-zh_cn/blob/master/8-zh-cn.md#8121-pseudo-header-fields-%E4%BC%AA%E5%A4%B4%E9%83%A8%E5%AD%97%E6%AE%B5)





