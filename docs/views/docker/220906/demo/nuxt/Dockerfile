# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:14-alpine

WORKDIR /app

COPY package*.json /app/

RUN yarn install

COPY ./ /app/

ARG FRONTEND_ENV=production

RUN yarn build

ENV HOST 0.0.0.0

EXPOSE 3000

CMD ["yarn", "start"]

