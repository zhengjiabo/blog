# alpine 版本的体积小
FROM node:14-alpine

# 设置工作目录，后续RUN/CMD 都是在该工作目录中执行
WORKDIR /code

# 宿主机的代码添加到镜像中
ADD . /code

# 安装依赖 node镜像中，下载了 yarn 包
RUN yarn

# 暴露端口号
# EXPOSE，不是只有注释作用
# 在 docker run -P 自动映射时，会取 EXPOSE 暴露出来的端口，随机映射到宿主机的端口上。
EXPOSE 3000

# 启动 serve
CMD npm start