# PROD BUILD
FROM node:20-bullseye-slim AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable \
    && yarn install --frozen-lockfile

COPY . .

ARG VITE_DEBUG
ARG VITE_APP_TITLE
ARG VITE_APP_VERSION
ARG VITE_BACKEND_URL

ENV VITE_DEBUG=$VITE_DEBUG
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN yarn build

# PROD STAGE
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]