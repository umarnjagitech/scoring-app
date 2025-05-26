# Scoring App - Local Development & Railway.app Deployment

This repository contains a simple PHP-based "Scoring App" designed for both local development using Docker Compose and seamless deployment to Railway.app. It leverages Nginx/PHP-FPM for the web server and MariaDB/MySQL as the database.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Git:** For version control and pushing to GitHub.
* **Docker Desktop** (for Windows/macOS) or **Docker Engine & Docker Compose Plugin** (for Linux): For local development.
    * Verify: `docker --version` and `docker compose version`
* **A GitHub account:** For hosting your code.
* **A Railway.app account:** For deploying your application. You'll need to link a payment method as Railway's free tier is usage-based (up to $5/month in credits).

---

## Project Structure

```
.
├── docker-compose.yml        # Defines Docker services for local dev
├── web/                      # Nginx/PHP-FPM configuration and PHP application code
│   ├── nginx/                # Nginx specific configuration
│   │   └── default.conf      # Nginx server block configuration for Docker
│   ├── Dockerfile            # Dockerfile for building the web image (used by Docker Compose & Railway)
│   └── html/                 # Your PHP application files (document root)
│       ├── index.html        # Main application page
│       ├── api/              # API endpoints
│       │   └── get_judges.php
│       └── includes/         # PHP include files
│           └── db_connection.php
├── mysql/                    # MariaDB specific configuration and initialization
│   └── init.sql              # SQL script to initialize database schema and data
└── .env.example              # Example environment variables file (template for .env)
```

---

## Local Development Setup (Docker Compose)

Follow these steps to get the Scoring App running locally using Docker Compose.

### 1. Clone the Repository

```bash
git clone <your_repository_url>
cd scoring-app # Or whatever your project root directory is called
```

### 2. Configure Local Environment Variables

Create a `.env` file in the root of your project directory. This file will hold sensitive information for your local database.

```bash
cp .env.example .env
```

Now, open the newly created `.env` file and fill in the values. **It's crucial that `MYSQL_PASSWORD` matches the password you've set for `app_user` within your `mysql/init.sql` file.**

```ini
# .env file

# MySQL/MariaDB Configuration for Local Docker Compose
MYSQL_ROOT_PASSWORD=your_local_root_password
MYSQL_DATABASE=scoring_app_db
MYSQL_USER=app_user
MYSQL_PASSWORD=your_local_app_user_password

# (Optional) Port mapping for the web server
# If 8080 is taken, change this.
WEB_PORT=8080
```

### 3. Build and Run Docker Containers

Navigate to the root of your project directory where `docker-compose.yml` is located.

1.  **Build the Docker images:**
    ```bash
    docker compose build
    ```
2.  **Start the containers:**
    ```bash
    docker compose up -d
    ```
    The `db` container will automatically run `mysql/init.sql` on its first start to set up your database schema and initial data.

### 4. Verify Local Setup

1.  **Check container status:** `docker compose ps`
2.  **Access the application:** Open your web browser and go to `http://localhost:8080` (or your configured `WEB_PORT`).

---

## Deployment to Railway.app

Railway.app offers an excellent "click a few buttons" deployment experience directly from your GitHub repository.

### 1. Project Preparation for Railway

Before pushing to GitHub, ensure your project is ready for Railway's environment.

a.  **Verify `web/Dockerfile`:**
    Railway uses this `Dockerfile` to build your application container. Ensure it correctly installs PHP extensions and configures Nginx to serve your application from `web/html`.

    ```dockerfile
    # web/Dockerfile
    FROM php:8.2-fpm-alpine # Use a specific PHP-FPM version (e.g., 8.1, 8.3)

    # Install Nginx and necessary PHP extensions
    RUN apk add --no-cache nginx \
        php-pdo_mysql \
        php-json \
        php-mbstring \
        php-xml \
        php-curl \
        && rm -rf /var/cache/apk/*

    # Copy Nginx configuration for Railway (points to PHP-FPM on port 9000)
    COPY web/nginx/default.conf /etc/nginx/http.d/default.conf

    # Copy your application code into the web root
    COPY web/html/ /var/www/html/

    # Ensure correct permissions for the web server
    RUN chown -R www-data:www-data /var/www/html \
        && chmod -R 755 /var/www/html

    # Expose port 80 for Nginx
    EXPOSE 80

    # Start PHP-FPM and Nginx
    CMD sh -c "php-fpm && nginx -g 'daemon off;'"
    ```

b.  **Adjust `web/html/includes/db_connection.php` for Railway:**
    Railway automatically injects database credentials as environment variables. Your PHP code needs to read these for the production environment.

    ```php
    <?php
    // web/html/includes/db_connection.php

    // Railway automatically injects connection variables for linked databases (e.g., MYSQL_HOST, MYSQL_PORT, etc.)
    $dbHost = getenv('MYSQL_HOST');
    $dbPort = getenv('MYSQL_PORT');
    $dbUser = getenv('MYSQL_USER');
    $dbPass = getenv('MYSQL_PASSWORD');
    $dbName = getenv('MYSQL_DATABASE');

    // Fallback to local Docker Compose environment if Railway variables are not set
    if (!$dbHost || !$dbName || !$dbUser || !$dbPass) {
        $dbHost = 'db';
        $dbPort = '3306';
        $dbUser = getenv('MYSQL_USER') ?: 'app_user';
        $dbPass = getenv('MYSQL_PASSWORD') ?: 'your_local_app_user_password';
        $dbName = getenv('MYSQL_DATABASE') ?: 'scoring_app_db';
    }

    try {
        $pdo = new PDO("mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage()); // Logs to Railway logs
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Internal server error. Database connection failed.']);
        exit();
    }
    ?>
    ```

c.  **Ensure `mysql/init.sql` is committed:**
    This script contains your database schema and initial data. You'll use it to manually initialize your Railway database.

d.  **Commit and Push to GitHub:**
    Make sure all these changes are committed and pushed to your GitHub repository (e.g., to the `main` branch).

    ```bash
    git add .
    git commit -m "Prepare for Railway deployment"
    git push origin main
    ```
    **Remember to keep your local `.env` file out of Git (`.gitignore`).**

### 2. Deploy on Railway.app

1.  **Go to Railway.app:** Sign up or log in.
2.  **Create a New Project:**
    * Click "New Project."
    * Select "Deploy from GitHub Repo."
    * Authorize Railway to access your GitHub repositories if prompted.
    * Select your `scoring-app` repository. Railway will attempt to detect your project.
3.  **Add a MySQL Database Service:**
    * Once your project is created, click "Add Service."
    * Choose "Database" and select "MySQL."
    * Railway will provision a managed MySQL database and automatically link its connection details as environment variables to your application service.
4.  **Configure Application Root (if needed):**
    * Click on your application service (named after your repo).
    * Go to the "Settings" tab.
    * If your `Dockerfile` is in a subdirectory (e.g., `web/Dockerfile`), ensure the **"Root Directory"** setting is configured to `web/`. If your `Dockerfile` is at the root of your repo, you can leave this blank.
5.  **Initialize Your Database:**
    * In your Railway project dashboard, click on your **MySQL database service**.
    * Go to the "Connect" tab. You'll find the connection details (Host, Port, User, Password, Database Name).
    * Use a local MySQL client (like MySQL Workbench, DBeaver, or the command-line `mysql` client) to connect to this remote Railway database using these credentials.
    * Once connected, execute the contents of your `mysql/init.sql` file to create tables and insert data. For command-line:
        ```bash
        mysql -h <RAILWAY_MYSQL_HOST> -P <RAILWAY_MYSQL_PORT> -u <RAILWAY_MYSQL_USER> -p<RAILWAY_MYSQL_PASSWORD> <RAILWAY_MYSQL_DATABASE> < mysql/init.sql
        ```
        *(Replace placeholders with actual Railway credentials, no space after -p)*
6.  **Get Your Application URL:**
    * Go back to your application service in Railway.
    * Click the "Domains" tab.
    * Railway will provide a public URL (e.g., `your-app-name-abcdefg.up.railway.app`).

### 3. Verify Deployment

1.  Open the Railway-provided URL in your web browser.
2.  Check the logs in your Railway project dashboard for your application service if you encounter any issues.

Every time you push changes to your `main` branch on GitHub, Railway will automatically redeploy your application!