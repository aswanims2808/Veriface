# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Define build argument
ARG VITE_API_URL
# Set environment variable during build
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy custom nginx template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default port for Nginx is 80, but Cloud Run provides $PORT
ENV PORT=80

EXPOSE 80

# The nginx image supports templates out of the box in /etc/nginx/templates/
# It will substitute environment variables into .template files and save them in /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
