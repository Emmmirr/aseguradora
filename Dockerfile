# Etapa de construcción
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar la configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos de construcción de la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Puerto en el que escuchará Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]