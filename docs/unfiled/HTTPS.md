
## 如何建立 `TLS` 连接

1.  客户端：发送支持的 TLS 版本、加密套件、随机数（防止重放攻击）等信息。
2.  服务器：确定TLS版本、加密套件、随机数等信息，并发送证书链，包含公钥证书和公钥。
3.  客户端：验证服务器的证书是否合法，生成一个随机数，并使用服务器的公钥加密这个随机数，发送给服务器。
4.  服务器：接收客户端发送的随机数，并使用自己的私钥解密这个消息，得到客户端生成的随机数。服务器和客户端使用这个随机数和服务器随机生成的一个随机数，生成一个Master Secret。
5.  服务器和客户端：使用Master Secret生成加密密钥和MAC密钥，开始加密通信。