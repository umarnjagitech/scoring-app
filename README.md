# Scoring App - Local Development Setup with Docker Compose

This repository contains a simple PHP-based "Scoring App" designed to run locally using Docker Compose. It leverages Nginx/PHP-FPM for the web server and MariaDB as the database.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Docker Desktop** (for Windows/macOS) or **Docker Engine & Docker Compose Plugin** (for Linux).
    * **Docker Engine:** [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
    * **Docker Compose Plugin:** [https://docs.docker.com/compose/install/compose-plugin/](https://docs.docker.com/compose/install/compose-plugin/)

    You can verify your Docker installation by running:
    ```bash
    docker --version
    docker compose version
    ```

---

## Project Structure

```
.
├── docker-compose.yml        # Defines Docker services (web, db)
├── web/                      # Nginx/PHP-FPM configuration and PHP application code
│   ├── nginx/                # Nginx specific configuration
│   │   └── default.conf      # Nginx server block configuration
│   ├── Dockerfile            # Dockerfile for building the web image
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

## Setup Instructions

Follow these steps to get the Scoring App running on your local machine using Docker Compose.

### 1. Clone the Repository (if you haven't already)

```bash
git clone <your_repository_url>
cd scoring-app # Or whatever your project root directory is called
```

### 2. Configure Environment Variables

Your project uses a `.env` file to manage sensitive information like database passwords. This keeps your secrets out of the public repository.

1.  **Create your `.env` file:**
    ```bash
    cp .env.example .env
    ```
2.  **Edit the `.env` file:**
    Open the newly created `.env` file in a text editor.
    ```bash
    nano .env
    ```
    Fill in the values for your local environment.

    ```ini
    # .env file

    # MySQL/MariaDB Configuration
    MYSQL_ROOT_PASSWORD=your_root_password_here
    MYSQL_DATABASE=scoring_app_db
    MYSQL_USER=app_user
    MYSQL_PASSWORD=your_app_user_password_here

    # (Optional) Port mapping for the web server
    # If 8080 is already in use, change this.
    WEB_PORT=8080
    ```
    **Crucially, ensure that `MYSQL_PASSWORD` in this `.env` file matches the password you've set for `app_user` within your `mysql/init.sql` script.** This is how the database user's password is synchronized.

### 3. Database Initialization (`init.sql`)

The `mysql/init.sql` script in the `mysql/` directory will automatically run when the `db` container starts for the first time. It's responsible for:

* Creating the `scoring_app_db` database.
* Creating the `app_user` database user and granting it privileges.
* Defining the `judges` table schema.
* Inserting initial judge data.

**Make sure the `IDENTIFIED BY` password in your `mysql/init.sql` for `app_user` exactly matches the `MYSQL_PASSWORD` you set in your `.env` file.** For example, your `init.sql` might look like this:

```sql
-- mysql/init.sql (excerpt)
CREATE DATABASE IF NOT EXISTS scoring_app_db;

-- Create user and grant privileges (password must match .env's MYSQL_PASSWORD)
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'your_app_user_password_here';
GRANT ALL PRIVILEGES ON scoring_app_db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- ... (rest of your table creation and data insertion) ...
```

### 4. Build and Run Docker Containers

Navigate to the root of your project directory where `docker-compose.yml` is located.

1.  **Build the Docker images:**
    ```bash
    docker compose build
    ```
    This command will build the `web` service image based on your `web/Dockerfile`.

2.  **Start the containers:**
    ```bash
    docker compose up -d
    ```
    * `up`: Starts the services defined in `docker-compose.yml`.
    * `-d`: Runs the containers in detached mode (in the background).
    * The `db` container will execute `init.sql` on its first run to set up the database.

---

## Verify the Setup

1.  **Check container status:**
    ```bash
    docker compose ps
    ```
    You should see both `web` and `db` services listed as `Up`.

2.  **Check application logs:**
    ```bash
    docker compose logs web
    docker compose logs db
    ```
    Look for any errors, especially related to PHP execution or database connection issues.

3.  **Access the application:**
    Open your web browser and go to:
    `http://localhost:8080` (or the port you configured in your `.env` file for `WEB_PORT`)

    You should see your "Scoring App" interface. The "Failed to load judges" error should now be resolved, and you should see the judges loaded from the database.

    You can also try directly accessing the API endpoint to see the raw JSON output:
    `http://localhost:8080/api/get_judges.php`
    This should display valid JSON data like `[{"id":"1", "username":"judge1", "full_name":"Judge One"}, ...]`.

---

## Stopping and Cleaning Up

When you're done working, you can manage your Docker containers with these commands:

* **Stop containers (keeps data volumes intact):**
    ```bash
    docker compose stop
    ```

* **Stop and remove containers, networks (keeps data volumes):**
    ```bash
    docker compose down
    ```

* **Stop and remove containers, networks, AND volumes (deletes all database data for a fresh start):**
    ```bash
    docker compose down --volumes
    ```
    Use this if you want a completely fresh start and don't need the current database data.

---

## Troubleshooting

* **Containers not starting / Docker daemon errors:**
    * Ensure your Docker daemon is running and healthy.
    * Consult Docker's official troubleshooting documentation or community forums for specific Docker daemon errors.
* **"Failed to load judges: Unexpected end of JSON input":**
    * Check `docker compose logs web` for detailed PHP errors. This is the most common cause.
    * Verify `web/html/includes/db_connection.php` uses `db` as the **host** for database connection (since `db` is the service name in `docker-compose.yml`).
    * Confirm that your `MYSQL_PASSWORD` in `.env` *exactly* matches the password for `app_user` in `mysql/init.sql`.
    * Check `docker compose logs db` for any database startup errors or `init.sql` execution issues.
    * You can connect directly to the database container to verify data: `docker exec -it scoring_db mysql -u root -p` (then `USE scoring_app_db; SELECT * FROM judges;`).
* **"Connection refused" or browser can't connect:**
    * Make sure `docker compose ps` shows your `web` container is `Up`.
    * Confirm no other application is using `localhost:8080` (or your configured `WEB_PORT`). You can change `WEB_PORT` in your `.env` file.

