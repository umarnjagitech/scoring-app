# web/Dockerfile
# Use the official PHP 8.2 Apache image as a base
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
# pdo_mysql is crucial for database connection
RUN docker-php-ext-install pdo pdo_mysql gd zip

# Enable Apache rewrite module (for cleaner URLs if needed, good practice)
RUN a2enmod rewrite

# Copy custom Apache virtual host configuration
# This ensures our app runs from /var/www/html and allows .htaccess if needed
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Remove default Apache index.html (optional, our index.html will replace it)
RUN rm /var/www/html/index.html || true

# Copy the application source code into the container's web root
# We use a named volume in docker-compose for development, so this is mainly for production builds
# For development, the volume mount will override this.
COPY html/ /var/www/html/

# Set appropriate permissions for the web root
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && find /var/www/html -type f -exec chmod 644 {} \;

# Expose port 80 (Apache's default)
EXPOSE 80

# The default command for php:apache images is to start Apache
# CMD ["apache2-foreground"]