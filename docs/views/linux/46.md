---
title: dig 解析域名
date: 2022-12-08
tags:
 - linux
categories: 
 - linux
---


## 总结
- `dig`: 解析域名  
  - `+short`: 仅返回 `IP`
  - `+tract`: 追踪整个过程
  - `-x`: 反向解析，寻找域名。一般可以用来寻找 `DNS` 服务器的域名，判断是否可信

- `traceroute`: 追踪网络数据包的路由途径
  - `-n`: 不展示过多信息（ 在显示IP地址时，不要试图将其映射为主机名称。）


## 提问
- [x]用 `dig` 找到百度所对应的 `IP` 地址 
> `dig www.baidu.com`     





## 1. 前提提要、场景
想要知道一个域名对应的 `IP`，我们经常去具有域名解析功能的网站上解析。`Linux` 可以使用 `dig`（`domain information groper`) 解析域名。


## 2. dig 安装

```bash
# Debian / Ubuntu
$ sudo apt-get install dnsutils

# CentOS / RedHat:
$ sudo yum install bind-utils
```

## 3. dig 

命令：`dig <domain>`     
示例：`dig www.bilibili.com`

### 3.1 dig 直接解析域名
```bash
# 查找哔哩哔哩的 IP 地址，
# 可以看到 CNAME 到某个 CDN 全局负载服务器上。判断出网站部署在 CDN。
# 哔哩哔哩做了负载均衡 查到多个 IP 证明负载均衡
# www.bilibili.com => a.w.bilibilicdn1.com.
# a.w.bilibilicdn1.com. => ct.w.bilicdn1.com.
# ct.w.bilicdn1.com. => x.x.x.x   从这里开始打到任一服务器上
# ct.w.bilicdn1.com. => x.x.x.x
# 每次访问都会被打到负载均衡中的任一服务器上
$ dig www.bilibili.com 

; <<>> DiG 9.11.5-P4-5.1+deb10u7-Debian <<>> www.bilibili.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 38571
;; flags: qr rd ra; QUERY: 1, ANSWER: 22, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.bilibili.com.              IN      A

;; ANSWER SECTION:
www.bilibili.com.       57      IN      CNAME   a.w.bilicdn1.com.
a.w.bilicdn1.com.       41      IN      CNAME   ct.w.bilicdn1.com.
ct.w.bilicdn1.com.      25      IN      A       124.239.244.16
ct.w.bilicdn1.com.      25      IN      A       61.147.236.43
ct.w.bilicdn1.com.      25      IN      A       61.147.236.44
ct.w.bilicdn1.com.      25      IN      A       183.131.147.27
ct.w.bilicdn1.com.      25      IN      A       124.239.244.15
ct.w.bilicdn1.com.      25      IN      A       61.147.236.46
ct.w.bilicdn1.com.      25      IN      A       183.131.147.30
ct.w.bilicdn1.com.      25      IN      A       116.207.137.66
ct.w.bilicdn1.com.      25      IN      A       183.131.147.28
ct.w.bilicdn1.com.      25      IN      A       171.214.10.141
ct.w.bilicdn1.com.      25      IN      A       171.214.10.142
ct.w.bilicdn1.com.      25      IN      A       183.131.147.29
ct.w.bilicdn1.com.      25      IN      A       61.147.236.42
ct.w.bilicdn1.com.      25      IN      A       116.207.137.67
ct.w.bilicdn1.com.      25      IN      A       124.239.244.18
ct.w.bilicdn1.com.      25      IN      A       116.207.137.68
ct.w.bilicdn1.com.      25      IN      A       124.239.244.17
ct.w.bilicdn1.com.      25      IN      A       61.147.236.45
ct.w.bilicdn1.com.      25      IN      A       183.131.147.48
ct.w.bilicdn1.com.      25      IN      A       171.214.10.140

;; Query time: 1 msec
;; SERVER: 100.125.135.29#53(100.125.135.29)
;; WHEN: Thu Dec 08 17:40:56 CST 2022
;; MSG SIZE  rcvd: 409
```

看到 `;; ANSWER SECTION:` 第二列那串数字了吧，`DNS TTL`(`DNS TIME TO LIVE`) 存活时间，以秒为单位（可以尝试一秒 `dig` 试验一次，会减少 1）。在缓存时间内重复访问会返回相同的映射域名或 `IP`。
结合上面 `dig` 的返回内容
```bash
www.bilibili.com 57 => a.w.bilibilicdn1.com.
a.w.bilibilicdn1.com. 41 => ct.w.bilicdn1.com.
ct.w.bilicdn1.com. 25 => x.x.x.x   从这里开始打到任一服务器上
ct.w.bilicdn1.com. 25 => x.x.x.x
...
```
所以能看到 `CDN` 服务器 `a.w.bilicdn1.com.` 的 `TTL` 可以剩余缓存时间 `57` 秒 ，后续转到 `ct.w.bilicdn1.com.` 。最后 `ct.w.bilicdn1.com.` 根据服务器负担，转到任一负载服务器上，这些负载服务器上的剩余缓存时间都是相同的 `25` 秒。


> 如果发布上线流程走完了，发现线上的网站还没更新，有可能是 `CDN` 服务器的资源还未更新。如果更换了 `CDN` 的 `CNAME` (此项很少更改，`DNS TTL` 一般设置为 12h 或者一天），还有可能是 `DNS TTL` 缓存时间未过期，仍然指向老的 `CDN` 服务。



### 3.2 `dig +short` 仅返回 IP
过滤其他信息，仅仅返回 `IP`
```bash
$ dig +short www.bilibili.com
a.w.bilicdn1.com.
ct.w.bilicdn1.com.
117.21.179.18
183.131.147.28
117.21.179.19
116.207.137.66
183.131.147.48
61.147.236.42
116.207.137.67
61.147.236.44
117.23.60.12
61.147.236.46
116.207.137.68
117.21.179.20
171.214.10.142
183.131.147.29
183.131.147.30
183.131.147.27
61.147.236.45
171.214.10.141
61.147.236.43
117.23.60.13
```


### 3.3 `dig -x` 反向解析

```bash
# 例如查找 dns 服务器的域名，发现是谷歌系的，安心使用该 dns 服务器
$ dig -x 8.8.8.8 +short 
dns.google.
```



### 3.4 `dig +trace` 追踪整个过程


```bash
$ dig +trace a.w.bilicdn1.com. 
; <<>> DiG 9.11.5-P4-5.1+deb10u7-Debian <<>> +trace a.w.bilicdn1.com.
;; global options: +cmd
.                       21552   IN      NS      f.root-servers.net.
.                       21552   IN      NS      i.root-servers.net.
.                       21552   IN      NS      m.root-servers.net.
.                       21552   IN      NS      l.root-servers.net.
.                       21552   IN      NS      h.root-servers.net.
.                       21552   IN      NS      e.root-servers.net.
.                       21552   IN      NS      c.root-servers.net.
.                       21552   IN      NS      j.root-servers.net.
.                       21552   IN      NS      k.root-servers.net.
.                       21552   IN      NS      g.root-servers.net.
.                       21552   IN      NS      b.root-servers.net.
.                       21552   IN      NS      a.root-servers.net.
.                       21552   IN      NS      d.root-servers.net.
;; Received 239 bytes from 100.125.135.29#53(100.125.135.29) in 1 ms

com.                    172800  IN      NS      e.gtld-servers.net.
com.                    172800  IN      NS      g.gtld-servers.net.
com.                    172800  IN      NS      a.gtld-servers.net.
com.                    172800  IN      NS      c.gtld-servers.net.
com.                    172800  IN      NS      i.gtld-servers.net.
com.                    172800  IN      NS      m.gtld-servers.net.
com.                    172800  IN      NS      k.gtld-servers.net.
com.                    172800  IN      NS      d.gtld-servers.net.
com.                    172800  IN      NS      f.gtld-servers.net.
com.                    172800  IN      NS      h.gtld-servers.net.
com.                    172800  IN      NS      j.gtld-servers.net.
com.                    172800  IN      NS      l.gtld-servers.net.
com.                    172800  IN      NS      b.gtld-servers.net.
com.                    86400   IN      DS      30909 8 2 E2D3C916F6DEEAC73294E8268FB5885044A833FC5459588F4A9184CF C41A5766
com.                    86400   IN      RRSIG   DS 8 1 86400 20221221050000 20221208040000 18733 . kncnR3wTm4XC/2IjTtAsSiSbKDotqQsx9zDysfBszbyocbaIywz8Vihs aCgvuzmFgQS6zTi0QghgkbzG/OiDeKM1wKY/zy2j4u/noSHusIxfRqox ho0tv/qUR82LVIOEmQJcP6bf+xd/hVtibzcmmqDtYgmAiu7FZ1Zl12mo C+pMD5blHjhLAh6GyERZwOtUb/POVfuIbXy+OpF6YYqdrs0j0V4ggawb QkpaWW8H6I2wt9uNetaDV++DpO69taYpvOzdVJSw0ah/3yhbd6+IFmMY gLmUZrWy7k3D4rUL7Gy63m8ADYkcMObnMs4LH1VGGnpx7WaISamyMChO y+87kQ==
;; Received 1204 bytes from 192.33.4.12#53(c.root-servers.net) in 12 ms

bilicdn1.com.           172800  IN      NS      ns3.dnsv5.com.
bilicdn1.com.           172800  IN      NS      ns4.dnsv5.com.
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 86400 IN NSEC3 1 1 0 - CK0Q2D6NI4I7EQH8NA30NS61O48UL8G5 NS SOA RRSIG DNSKEY NSEC3PARAM
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 86400 IN RRSIG NSEC3 8 2 86400 20221213052435 20221206041435 53929 com. Kf5Q1vq6SCsqlKJThCyWesc8D9x/agamQYybsKkqA4WYmm8bySHKgAyE yzD2rLqTn31lwpdccGYurVRIRt5KS6xPZFBe4oNvix8mP/jH0RsXWUMN v7i9u00ycNGEZk0w/d7flhXbrNGJM4BTiZtJDnCC1eMqwBDaonSH/xks mPIN9pUSl0cwlfr16As8+ugYTZUh4mbzTQrsMftnpqIVtw==
78IDJJ8BD8J8D7PIS2HPCDAJDGQHDAKN.com. 86400 IN NSEC3 1 1 0 - 78IDSM7E0N1FILAHG6MUNE0L5I9IIM0K NS DS RRSIG
78IDJJ8BD8J8D7PIS2HPCDAJDGQHDAKN.com. 86400 IN RRSIG NSEC3 8 2 86400 20221214071508 20221207060508 53929 com. G67yfKhsD4/T0zLExpgx7s7AqHQyCuD/Tv/8ZD71Z6D2F5sOC4CV5ff4 UKRlCOHDoh2HwXIxSw40zo3oShvj4RgmlYyt9wRRxZnXBO8xwSU5MOAK tgApCzGeELz2bLgrZxYQq0y9iv78V8jl0dbrMbISsS+gaFLP09GPdYyi TH6SMxO7HWFCYeu4KPxH+6VyXHVmtTSBhmnB3BbpjOuARw==
;; Received 964 bytes from 192.54.112.30#53(h.gtld-servers.net) in 205 ms

a.w.bilicdn1.com.       300     IN      CNAME   ct.w.bilicdn1.com.
ct.w.bilicdn1.com.      90      IN      A       61.147.236.42
ct.w.bilicdn1.com.      90      IN      A       61.147.236.43
ct.w.bilicdn1.com.      90      IN      A       61.147.236.44
ct.w.bilicdn1.com.      90      IN      A       61.147.236.45
ct.w.bilicdn1.com.      90      IN      A       61.147.236.46
ct.w.bilicdn1.com.      90      IN      A       116.207.137.66
ct.w.bilicdn1.com.      90      IN      A       116.207.137.67
ct.w.bilicdn1.com.      90      IN      A       116.207.137.68
ct.w.bilicdn1.com.      90      IN      A       117.21.179.18
ct.w.bilicdn1.com.      90      IN      A       117.21.179.19
ct.w.bilicdn1.com.      90      IN      A       117.21.179.20
ct.w.bilicdn1.com.      90      IN      A       117.23.60.12
ct.w.bilicdn1.com.      90      IN      A       117.23.60.13
ct.w.bilicdn1.com.      90      IN      A       117.23.60.14
ct.w.bilicdn1.com.      90      IN      A       117.23.60.15
ct.w.bilicdn1.com.      90      IN      A       118.116.2.140
ct.w.bilicdn1.com.      90      IN      A       118.116.2.141
ct.w.bilicdn1.com.      90      IN      A       118.116.2.142
ct.w.bilicdn1.com.      90      IN      A       124.239.244.15
ct.w.bilicdn1.com.      90      IN      A       124.239.244.16
bilicdn1.com.           86400   IN      NS      ns3.dnsv5.com.
bilicdn1.com.           86400   IN      NS      ns4.dnsv5.com.
;; Received 450 bytes from 1.12.0.18#53(ns3.dnsv5.com) in 5 ms

```



### 4 `traceroute` 追踪路由路径
前面使用 `dig` 可以进行域名解析，知道在域名服务器的绑定 `IP`、剩余缓存时间及是否使用负载均衡。只能知道服务器路由相关的信息，如果想要知道从我们主机到服务器，整个路由路径，便需要使用 `traceroute` 命令，去追踪路由路径。


在讲 `traceroute` 之前需要聊一下 `TTL`

`DNS TTL` 跟 `TTL` 是不同的，上面讲的剩余缓存时间，是在 `DNS` 上的定义，指代剩余的缓存时间。在缓存时间内会返回相同的映射域名或 `IP`

而 `TTL`(`TIME TO LIVE`)存活时间的定义为：使用一个初始值，经过一个中间设备（路由器）便会减 1，直至 0 便会丢弃该数据包并返回互联网控制报文协议 `ICMP`(`IP` 的辅助协议) 给发送点，告知差错信息（内含有报错地址和原因）。之所以有 `TTL` 是为了防止错误的路由表导致回环。           

所以相同初始值下，`TTL` 数值越大证明离得越近。初始值惯例为：      
 - 0: 相同主机
 - 1: 同一子网
 - 32: 同一站点（市）
 - 64: 同一区域（省，国）
 - 128: 同一大陆板块
 - 255: 没有限制

可以使用 `traceroute` 查看实际经过多少个中间设备到B站 `traceroute www.bilibili.com`

```bash
# -n: 不展示过多信息 在显示IP地址时，不要试图将其映射为主机名称。
# 可以看到经过的路由数不算多
$ traceroute -n www.bilibili.com

traceroute to www.bilibili.com (117.21.179.20), 30 hops max, 60 byte packets
 1  * * *
 2  * * *
 3  * * *
 4  * * *
 5  * * *
 6  10.1.16.25  1.810 ms  1.188 ms  1.061 ms
 7  172.16.33.142  0.976 ms  0.869 ms  0.832 ms
 8  172.16.33.25  2.963 ms 172.16.33.38  5.702 ms 172.16.33.25  2.728 ms
 9  180.163.107.161  2.436 ms  2.393 ms 180.163.107.177  1.684 ms
10  101.89.241.61  3.782 ms 101.89.241.209  4.875 ms 101.95.246.81  5.042 ms
11  101.95.219.17  5.412 ms 101.95.224.17  4.344 ms 101.95.219.77  5.026 ms
12  202.97.122.202  15.182 ms 202.97.94.214  13.744 ms 202.97.81.166  16.202 ms
13  111.74.121.130  21.927 ms 111.74.123.98  23.452 ms 111.74.121.26  20.554 ms
14  * * *
15  * * *
16  * * *
17  117.21.179.20  18.846 ms  18.695 ms  18.705 ms
```








