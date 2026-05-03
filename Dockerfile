FROM node:20-alpine AS dev
WORKDIR /app
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
CMD ["sh", "-c", "npx nest start ${APP_NAME} --watch"]

FROM node:20-alpine AS build
WORKDIR /app
ARG APP_NAME
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN npx nest build ${APP_NAME}

FROM node:20-alpine AS production
WORKDIR /app
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=build /app/dist ./dist
CMD ["sh", "-c", "node dist/apps/$APP_NAME/main"]
