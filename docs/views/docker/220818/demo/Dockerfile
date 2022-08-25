# FROM node:14-alpine as builder 找不到 obsutil 很奇怪
# FROM node:14 as builder 可以找到 obsutil


# FROM node:14 as builder
FROM node:14-alpine as builder


# 设置好ARG，构建时
ARG ACCESS_KEY_ID
ARG ACCESS_KEY_SECRET
ARG ENDPOINT
ARG PUBLIC_URL

# 环境变量 cra 设置打包静态资源的基础路径，通过 arg 传入也可以不暴露 
ENV PUBLIC_URL ${PUBLIC_URL}

WORKDIR /code

# obsutil 安装配置 参考文档 https://support.huaweicloud.com/utiltg-obs/obs_11_0049.html
# 我使用 stepup.sh 无法成功，只能手动添加

# 为了更好的缓存，把它放在前边
    # 下载 obsutil
    # -O：指定下载目录和文件名
    # -P：指定下载目录 试验了如果无目录不会主动创建目录
RUN wget https://obs-community.obs.cn-north-1.myhuaweicloud.com/obsutil/current/obsutil_linux_amd64.tar.gz \ 
    # 解压
    # -C：指定解压目录，此处不使用，因为解压后内部还有个文件夹 obsutil_linux_amd64_x.x.x
    && tar -xzvf obsutil_linux_amd64.tar.gz  \
    && find /code -name obsutil_linux_amd64_* | xargs -i cp {}/obsutil /usr/local/bin/obsutil \
    # 设置权限 775  读（r=4），写（w=2），执行（x=1）  
    # 7 可读可写可执行（rwx=7=4+2+1）
    # 6 可读可写（rw=6=4+2）
    # 5 可读可执行（rx=5=4+1）
    # 7            5           5
    # 文件所有者   同用户组    其它用户组
    # && cat /etc/profile \
    && chmod 755 /usr/local/bin/obsutil \
    && ls /usr/local/bin/ -lah \
    && /usr/local/bin/obsutil config -i $ACCESS_KEY_ID -k $ACCESS_KEY_SECRET -e $ENDPOINT


# 单独分离 package.json，是为了安装依赖可最大限度利用缓存
ADD package.json yarn.lock /code/
RUN yarn

# 这里可以优化，只添加需要被打包的文件
ADD . /code
RUN npm run build && npm run obs:cli

# 选择更小体积的基础镜像
FROM nginx:alpine
ADD nginx.conf /etc/nginx/conf.d/default.conf

# 虽然网页内容只用到了index.html，其它网页内容静态资源都在oss。
# 但还有类似于 robots.txt 爬虫配置等非网页内容资源，要么全部抽出来 COPY，要么就方便些直接都 COPY
COPY --from=builder code/build /usr/share/nginx/html