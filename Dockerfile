FROM nginx:stable-alpine

# Copia tu sitio estático al directorio público de nginx
COPY ./ /usr/share/nginx/html

# Elimina la configuración por defecto si no la necesitas
RUN rm /etc/nginx/conf.d/default.conf

# Crea una configuración básica de nginx
RUN echo 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ =404;\n\
    }\n\
}' > /etc/nginx/conf.d/sorpresa.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
