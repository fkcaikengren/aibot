# 1. 构建基础镜像
FROM node:18.20.6-alpine3.21 AS base

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production \
  APP_PATH=/app

WORKDIR $APP_PATH


# 2. 基于基础镜像安装项目依赖
FROM base AS dependencies

COPY package.json yarn.lock ./

RUN yarn install

# 3. 基于基础镜像进行最终构建
FROM base AS builder

# 拷贝 上面生成的 node_modules 文件夹复制到最终的工作目录下
COPY --from=dependencies $APP_PATH/node_modules ./node_modules

# 拷贝当前目录下的所有文件(除了.dockerignore里排除的)，都拷贝到工作目录下
COPY . .

RUN yarn build
RUN rm -rf ./.next/cache

# 4. 创建最终的生产镜像
FROM node:18.20.6-alpine3.21 AS production

ENV NODE_ENV=production \
  APP_PATH=/app

WORKDIR $APP_PATH
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder $APP_PATH/.next/standalone ./standalone
COPY --from=builder $APP_PATH/public ./standalone/public
COPY --from=builder $APP_PATH/.next/static ./standalone/.next/static
COPY --from=builder $APP_PATH/.env.production ./standalone

EXPOSE 3000
ENV PORT 3000
CMD [ "node", "./standalone/server.js" ] 
