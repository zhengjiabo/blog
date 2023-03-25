---
title: 苹果更新app描述文件
date: 2022-07-01
tags:
 - 杂货铺
categories: 
 - article
---

## 1. 实现拆分
1. 新建CSR   
2. 新建证书
3. 导出p12
4. 描述文件
5. 新建描述文件 


## 2. 新建CSR
![图片](../assets/1.png '新建csr')  
Mac打开, 钥匙串 -> 钥匙串访问 -> 证书助理 -> 从证书办法机构请求证书    
填完信息, 会得到一个 ***.certSigningRequest** 文件.

## 3. 新建证书
打开苹果开发者中心[https://developer.apple.com/](https://developer.apple.com/) 
![图片](../assets/2.png '新建证书')     
登录 -> Certificates, Identifiers & Profiles -> Certificates -> +号     
选择要新建的证书类型, 例如Apple Distribution.    
选择上一步的 **CSR** 文件, 便创建成功了
![图片](../assets/3.png '证书列表')    
图里便是我刚刚新建的发布证书, 点击该证书信息会进入详情页, 在详情页点击下载按钮, 可以得到证书 **distribution.cer**.    
点击下载完的cer证书文件, 会自动打开Mac的 钥匙串访问 -> 证书 窗口, 可以看到选择的证书已经成功添加了.


## 4. 导出p12
![图片](../assets/4.png '导出p12') 
在钥匙串访问 -> 证书 窗口, 选择上一步添加的证书, 点击菜单栏里的 文件 -> 导出项目, 选择P12导出, 设置完密码便获得了 ***.p12** 文件


## 5. 新建描述文件
![图片](../assets/5.png '新建描述文件') 

打开 Profiles -> +号, 选择和填写好相关信息, 一直continue下去    

![图片](../assets/6.png '新建描述文件')   
点击Download, 下载该描述文件.

## 6. 打包
在App Store Connect新建新版本    
利用p12 和 描述文件, 给代码打包后上传App Store后选择新版本提交审核便完成了.

## 总结




## 参考资料

