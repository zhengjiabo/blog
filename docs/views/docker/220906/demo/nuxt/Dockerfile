FROM node:14-alpine

WORKDIR /app

COPY package*.json /app/

RUN yarn install

COPY ./ /app/

RUN yarn build

# 一定要设置这个，否则 traefik http 无法正常使用
ENV HOST 0.0.0.0 

EXPOSE 3000

CMD ["yarn", "start"]

