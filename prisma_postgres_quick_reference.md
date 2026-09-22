# Prisma + PostgreSQL Quick Reference

## Prisma

``` bash
# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Create and apply a migration
npx prisma migrate dev --name init

# Check migration status
npx prisma migrate status

# Open Prisma Studio
npx prisma studio

# Format schema
npx prisma format

# Validate schema
npx prisma validate

# Show Prisma version
npx prisma -v
```

## PostgreSQL / psql

``` bash
# Connect to PostgreSQL
psql -U postgres

# Connect directly to a database
psql -U postgres -d myapp

# Connect using a connection string
psql "postgresql://postgres:PASSWORD@localhost:5432/myapp"
```

### Useful `psql` commands

``` sql
-- List databases
\l

-- Connect to a database
\c myapp

-- List tables
\dt

-- Describe a table
\d users

-- List schemas
\dn

-- List roles/users
\du

-- Show current database
SELECT current_database();

-- Show PostgreSQL version
SELECT version();

-- Show connection settings
SHOW listen_addresses;
SHOW port;

-- List current connections
SELECT * FROM pg_stat_activity;

-- Exit psql
\q
```

## Get Database Connection String

Typical local PostgreSQL URL:

``` text
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

Example:

``` text
postgresql://postgres:password@localhost:5432/myapp
```

Check the database name:

``` sql
SELECT current_database();
```

Check the port:

``` sql
SHOW port;
```

Check the host/listen address:

``` sql
SHOW listen_addresses;
```

## Prisma + PostgreSQL Flow

``` text
schema.prisma
      ↓
prisma migrate dev
      ↓
PostgreSQL
      ↓
prisma generate
      ↓
Prisma Client
      ↓
Node.js application
```
