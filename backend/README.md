# Backend

Spring Boot API for the Van Moc website.

## Database

The backend uses PostgreSQL and Flyway. The migration file is located at:

```text
src/main/resources/db/migration/V1__init_schema.sql
```

When the backend starts, Flyway runs the migration automatically and creates the database schema.

## Run With Docker

Start Docker Desktop first, then run from the project root:

```bash
docker compose --profile backend up -d db backend
```

Backend URL:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

PostgreSQL connection:

```text
Host: localhost
Port: 5432
Database: van_moc
Username: van_moc
Password: van_moc
```

## Run Locally

If Maven and Java 17 are installed:

```bash
cd backend
mvn spring-boot:run
```

```text
backend/
└── src/
    └── main/
        ├── java/com/vanmoc/
        │   ├── VanMocApplication.java
        │   ├── config/
        │   ├── common/
        │   ├── auth/
        │   ├── product/
        │   ├── category/
        │   ├── personalization/
        │   ├── traceability/
        │   ├── cart/
        │   ├── order/
        │   ├── payment/
        │   ├── content/
        │   ├── review/
        │   ├── media/
        │   └── admin/
        └── resources/
            ├── application.yml
            └── db/
```
