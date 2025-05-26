# web/Dockerfile
FROM php:8.2-fpm-alpine

# Install Nginx and other necessary packages
RUN apk add --no-cache nginx \
    php-pdo_mysql \
    php-json \
    php-mbstring \
    php-xml \
    php-curl \
    # Clean up cache
    && rm -rf /var/cache/apk/*

# Copy Nginx configuration
COPY web/nginx/default.conf /etc/nginx/http.d/default.conf

# Copy your application code
COPY html/ /var/www/html/

# Fix permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port 80 (for Nginx)
EXPOSE 80

# Command to run Nginx and PHP-FPM
CMD sh -c "php-fpm && nginx -g 'daemon off;'"