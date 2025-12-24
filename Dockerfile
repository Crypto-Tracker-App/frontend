# Stage 1 - build the app
FROM node:18-alpine AS build
WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

# Stage 2 - serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
