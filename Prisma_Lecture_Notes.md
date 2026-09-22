# Prisma - Introduction, Models & Migrations

## Learning Objectives

By the end of this lecture, you should be able to:

- Explain what an ORM is and why ORMs are used.
- Understand where Prisma fits in a Node.js + PostgreSQL application.
- Install and initialize Prisma in a Node.js project.
- Understand the purpose and structure of `schema.prisma`.
- Define basic Prisma models and fields.
- Understand Prisma field modifiers such as `@id`, `@unique`, `@default`, and `?`.
- Explain what a database migration is.
- Create and apply migrations using Prisma Migrate.
- Understand the difference between the Prisma schema, Prisma Client, and Prisma Migrate.

---

# 1. From PostgreSQL Driver to ORM

In the previous lectures, we used the PostgreSQL driver (`pg`) to communicate with PostgreSQL.

A typical application looked like:

```text
Node.js Application
        ↓
       pg
        ↓
   PostgreSQL
```

For example:

```js
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "test"
});

const result = await pool.query(
  "SELECT * FROM users WHERE id = $1",
  [1]
);

console.log(result.rows);
```

This works well, but as an application grows, we may have:

- Many tables
- Many SQL queries
- Relationships between tables
- Repeated CRUD operations
- Application objects that need to be mapped to database rows
- Database schema changes that need to be tracked

This is where an ORM can help.

---

# 2. What is an ORM?

ORM stands for:

> **Object Relational Mapping**

It provides a way to work with a relational database using programming-language objects and abstractions.

## Breaking down the term

### Object

An object in our application:

```js
const user = {
  id: 1,
  name: "Yash",
  email: "yash@example.com"
};
```

### Relational

A relational database stores data in tables:

```text
users

+----+------+-------------------+
| id | name | email             |
+----+------+-------------------+
| 1  | Yash | yash@example.com  |
+----+------+-------------------+
```

### Mapping

An ORM maps the application representation to the database representation.

```text
Application Object
        ↕
   ORM Mapping
        ↕
Database Row
```

For example:

```text
JavaScript User Object
        ↕
       ORM
        ↕
PostgreSQL users Row
```

---

# 3. Without ORM vs With ORM

## Without ORM

Using the PostgreSQL driver:

```js
const result = await pool.query(
  "SELECT * FROM users WHERE id = $1",
  [1]
);

const user = result.rows[0];
```

We are directly writing SQL.

## With ORM

Conceptually, an ORM may allow us to write:

```js
const user = await prisma.user.findUnique({
  where: {
    id: 1
  }
});
```

Instead of manually writing the SQL query, we describe the data we want using the ORM's API.

The ORM then handles the interaction with the database.

---

# 4. What Does an ORM Actually Do?

An ORM typically provides abstractions for:

- Creating records
- Reading records
- Updating records
- Deleting records
- Defining relationships
- Querying related data
- Mapping database rows to application objects
- Managing schema changes
- Providing type safety or developer tooling

A simplified runtime flow is:

```text
Node.js Application
        ↓
       ORM
        ↓
Database Driver
        ↓
   PostgreSQL
```

An ORM does **not** mean that the database disappears.

SQL is still ultimately involved.

A simplified representation is:

```text
Prisma Query
     ↓
Generated/translated database query
     ↓
    SQL
     ↓
PostgreSQL
```

---

# 5. ORM Trade-offs

ORMs provide a useful abstraction, but they are not a replacement for understanding SQL.

## Advantages

- Less repetitive CRUD code
- Easier application development
- Better developer experience
- Type safety in many ORMs
- Easier handling of relationships
- Schema and migration tooling
- Easier integration with application code

## Trade-offs

- Adds an abstraction layer
- Developers still need database knowledge
- Complex queries may sometimes be easier to express directly in SQL
- Poorly written ORM queries can still have performance problems
- Database-specific features may require raw SQL

A good backend developer should understand both:

```text
ORM
 +
SQL
 +
Database fundamentals
```

---

# 6. Examples of ORMs

Different programming languages have different ORM tools.

| Language / Ecosystem | ORM |
|---|---|
| Node.js / TypeScript | Prisma |
| Node.js / TypeScript | TypeORM |
| Node.js | Sequelize |
| Python | SQLAlchemy |
| Python | Django ORM |
| Java | Hibernate |

In this course, we will focus on **Prisma** for our Node.js applications.

---

# 7. Introduction to Prisma

> **Prisma is a modern ORM and database toolkit for Node.js and TypeScript applications.**

Prisma provides several important components.

```text
Prisma
│
├── Prisma Schema
├── Prisma Client
├── Prisma Migrate
└── Prisma Studio
```

For this lecture, we will primarily focus on:

```text
Prisma Schema
Prisma Migrate
Prisma Client
```

---

# 8. Where Does Prisma Fit?

Previously:

```text
Node.js
   ↓
  pg
   ↓
PostgreSQL
```

With Prisma:

```text
Node.js Application
        ↓
   Prisma Client
        ↓
 Database Driver
        ↓
    PostgreSQL
```

Prisma provides an abstraction between our application and the database.

For example, instead of:

```js
const result = await pool.query(
  "SELECT * FROM users WHERE email = $1",
  [email]
);
```

we can use Prisma Client:

```js
const user = await prisma.user.findUnique({
  where: {
    email: "yash@example.com"
  }
});
```

---

# 9. Prisma's Main Components

## 9.1 Prisma Schema

Usually located at:

```text
prisma/schema.prisma
```

It describes:

- Database connection configuration
- Prisma generators
- Database models
- Relationships
- Constraints
- Defaults

Example:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

---

## 9.2 Prisma Client

Prisma Client is the application-facing API.

It allows our Node.js/TypeScript application to query the database.

Example:

```js
const users = await prisma.user.findMany();
```

or:

```js
const user = await prisma.user.findUnique({
  where: {
    id: 1
  }
});
```

Think of it as:

```text
Application
     ↓
Prisma Client
     ↓
Database
```

---

## 9.3 Prisma Migrate

Prisma Migrate helps us manage changes to the database schema.

For example:

```text
Initial schema
      ↓
Create User table
      ↓
Add age column
      ↓
Create Post table
      ↓
Add relationship
```

Each change can be represented as a migration.

---

## 9.4 Prisma Studio

Prisma Studio provides a graphical interface for viewing and interacting with database data.

It can be launched using:

```bash
npx prisma studio
```

We will explore it in more detail later.

---

# 10. Installing Prisma

Assume that we already have a Node.js project.

First, install Prisma CLI:

```bash
npm install prisma --save-dev
```

Then install Prisma Client:

```bash
npm install @prisma/client
```

## Why are there two packages?

### `prisma`

Used primarily for Prisma's development tools and CLI.

Examples:

```bash
npx prisma init
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

### `@prisma/client`

Used by the application to interact with the database.

Example:

```js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

A simple way to remember:

```text
prisma
    → Development / CLI

@prisma/client
    → Application / Runtime
```

---

# 11. Initialize Prisma

Run:

```bash
npx prisma init
```

This creates the basic Prisma structure.

A typical project may look like:

```text
project/
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── ...
```

---

# 12. Database Connection

Prisma needs to know which database it should connect to.

A PostgreSQL connection string commonly looks like:

```text
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

For example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp"
```

The exact value depends on your PostgreSQL setup.

## Why use `.env`?

Database credentials should generally not be hard-coded in application source code.

Instead of:

```js
const password = "my-secret-password";
```

we use environment variables.

```env
DATABASE_URL="..."
```

and access the configuration through the environment.

> **Never commit real database passwords, API keys, or other secrets to a public repository.**

---

# 13. Understanding `schema.prisma`

The Prisma schema is one of the most important files in a Prisma project.

A simplified schema contains sections such as:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

and models:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Think of the schema as the place where we describe how Prisma should understand our database.

---

# 14. Prisma Model

A Prisma `model` generally represents a database table.

Example:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Conceptually:

```text
Prisma Model
     ↓
Database Table
```

So:

```prisma
model User
```

can correspond to a:

```text
User table
```

with columns such as:

```text
id
name
email
```

---

# 15. Prisma Fields

Inside a model, we define fields.

```prisma
model User {
  id        Int
  name      String
  age       Int
  active    Boolean
  createdAt DateTime
}
```

Common Prisma scalar types include:

| Prisma Type | Typical Meaning |
|---|---|
| `String` | Text |
| `Int` | Integer |
| `Float` | Floating-point number |
| `Boolean` | True/false |
| `DateTime` | Date and time |
| `Json` | JSON data |

---

# 16. Primary Key - `@id`

Example:

```prisma
id Int @id
```

`@id` marks the field as the model's primary key.

For an automatically generated integer ID:

```prisma
id Int @id @default(autoincrement())
```

This means:

- `id` is an integer
- `id` is the primary key
- The database generates the value automatically

Conceptually:

```text
id
 ↓
PRIMARY KEY
```

---

# 17. Default Values - `@default`

We can specify default values.

Example:

```prisma
active Boolean @default(true)
```

If an application does not explicitly provide `active`, the default can be `true`.

Another common example:

```prisma
createdAt DateTime @default(now())
```

This allows the creation timestamp to be generated automatically.

---

# 18. Unique Fields - `@unique`

Example:

```prisma
email String @unique
```

This means that the value of `email` must be unique.

For example:

```text
id | email
---+-------------------
1  | a@example.com
2  | b@example.com
```

This would be valid.

But:

```text
id | email
---+-------------------
1  | a@example.com
2  | a@example.com
```

would violate the uniqueness constraint.

A common use case is:

```prisma
email String @unique
```

because two users should generally not have the same email address.

---

# 19. Optional Fields - `?`

Consider:

```prisma
age Int?
```

The `?` means that the field is optional.

Conceptually:

```text
age can contain an integer
OR
age can be NULL
```

For example:

```text
id | name | age
---+------+-----
1  | Yash | 24
2  | Rahul| NULL
```

Compare:

```prisma
name String
```

with:

```prisma
age Int?
```

The first is required, while the second is nullable.

---

# 20. A Complete Basic Model

Putting these concepts together:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  age       Int?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

We can interpret this as:

```text
User
│
├── id
│   ├── Int
│   ├── Primary Key
│   └── Auto-generated
│
├── name
│   └── Required String
│
├── email
│   ├── Required String
│   └── Unique
│
├── age
│   ├── Int
│   └── Optional / Nullable
│
├── active
│   ├── Boolean
│   └── Default = true
│
└── createdAt
    ├── DateTime
    └── Default = current time
```

---

# 21. Prisma Model vs Database Table

Consider:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Conceptually, this describes a table like:

```text
User
--------------------------------
id       | integer | primary key
name     | text    | required
email    | text    | unique
```

The exact SQL representation depends on the database and Prisma's generated migration.

The important idea is:

```text
Prisma Model
      ↓
Describes
      ↓
Database Structure
```

---

# 22. Introduction to Relationships

Relational databases are useful partly because tables can be related to each other.

For example:

```text
User
  |
  | 1
  |
  | N
  ↓
Post
```

One user can have many posts.

A simplified Prisma representation is:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String

  posts Post[]
}

model Post {
  id     Int    @id @default(autoincrement())
  title  String

  userId Int
  user   User @relation(fields: [userId], references: [id])
}
```

We will study relationships in more detail separately.

For now, remember:

> Prisma allows us to describe database relationships directly in the Prisma schema.

---

# 23. What is a Database Migration?

Suppose our initial schema contains:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Our database has a corresponding table.

Later, we decide to add:

```prisma
age Int?
```

Changing `schema.prisma` alone does not magically change the PostgreSQL database.

We need to apply the schema change to the database.

This is where **migration** comes in.

---

# 24. Definition of a Migration

> A migration is a versioned record of a change made to a database schema.

For example:

```text
Migration 1
Create User table
        ↓
Migration 2
Add age column
        ↓
Migration 3
Create Post table
        ↓
Migration 4
Add User-Post relationship
```

Migrations allow us to track how the database structure evolved over time.

---

# 25. Why Do We Need Migrations?

Imagine a team with several developers.

Without migrations, developers might manually change databases:

```text
Developer A
→ Adds a column manually

Developer B
→ Creates another table manually

Production
→ Has a slightly different schema
```

This can become difficult to track and reproduce.

With migrations:

```text
Migration 001
Migration 002
Migration 003
Migration 004
```

A database can be moved through the same sequence of schema changes.

This provides a history of database structure changes.

---

# 26. Prisma Migrate

Prisma provides a migration system called **Prisma Migrate**.

A common development command is:

```bash
npx prisma migrate dev --name init
```

The `--name` flag gives the migration a descriptive name.

For example:

```bash
npx prisma migrate dev --name add_user_age
```

---

# 27. What Happens During a Migration?

A simplified flow is:

```text
schema.prisma
      ↓
Prisma compares schema
with current database state
      ↓
Migration is generated
      ↓
Migration SQL is executed
      ↓
Database schema is updated
      ↓
Prisma Client is generated/updated
```

The migration is stored inside:

```text
prisma/
└── migrations/
```

---

# 28. Migration Folder

After creating a migration, the project may contain:

```text
prisma/
│
├── schema.prisma
│
└── migrations/
    │
    └── 20260920_init/
        │
        └── migration.sql
```

The exact folder name contains a timestamp and the migration name.

The important file is:

```text
migration.sql
```

It contains SQL representing the database changes.

For example:

```sql
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
```

This is a very important concept:

> Prisma is not bypassing SQL. It is helping us generate and manage database changes.

---

# 29. Example: Creating the First Migration

Suppose `schema.prisma` contains:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Run:

```bash
npx prisma migrate dev --name init
```

Conceptually:

```text
schema.prisma
      ↓
   Migration
      ↓
migration.sql
      ↓
 PostgreSQL
```

The database now contains the corresponding structure.

---

# 30. Example: Creating a Second Migration

Now change the model:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  age       Int?
  createdAt DateTime @default(now())
}
```

Then run:

```bash
npx prisma migrate dev --name add_user_metadata
```

Prisma generates another migration representing the changes.

Conceptually:

```text
Migration 1
Create User
     ↓
Migration 2
Add age + createdAt
```

The migration history now describes how the database evolved.

---

# 31. Important Mental Model

There are two related but different flows.

## Schema / Database Development Flow

```text
schema.prisma
      ↓
Prisma Migrate
      ↓
Migration SQL
      ↓
PostgreSQL
```

## Application Runtime Flow

```text
Node.js Application
      ↓
Prisma Client
      ↓
PostgreSQL
```

Do not confuse:

```text
Prisma Migrate
```

with:

```text
Prisma Client
```

### Prisma Migrate

Primarily deals with:

> **Changing the database structure.**

### Prisma Client

Primarily deals with:

> **Reading and changing application data at runtime.**

---

# 32. Prisma: Big Picture

At this point, think of Prisma as:

```text
                    Prisma
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      Schema         Client         Migrate
        │              │              │
        │              │              │
   Describe DB     Query DB      Change DB
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                  PostgreSQL
```

---

# 33. Quick Comparison: `pg` vs Prisma

| Feature | `pg` | Prisma |
|---|---|---|
| Database driver | Yes | Uses database connectivity underneath |
| Write SQL directly | Yes | Possible, but ORM API is commonly used |
| Object abstraction | Limited | Yes |
| Type-safe query API | Limited | Strong TypeScript support |
| Schema definition | Database-side | Prisma schema + database |
| Migration tooling | No built-in ORM migration system | Prisma Migrate |
| Relationships | SQL queries | ORM abstractions + schema |
| CRUD API | SQL | Prisma Client |

The important point is not:

> "Prisma is better than `pg`."

Instead:

> "`pg` and Prisma solve problems at different abstraction levels."

---

# 34. Common Mistakes

## Mistake 1: Thinking ORM means SQL is unnecessary

Incorrect:

```text
ORM → I don't need to understand SQL.
```

Better:

```text
ORM → I can work at a higher abstraction level,
      but I still need database fundamentals.
```

---

## Mistake 2: Confusing Prisma Schema with the database itself

`schema.prisma` describes the schema from Prisma's perspective.

It is not the PostgreSQL database itself.

The database still exists independently.

---

## Mistake 3: Changing the Prisma schema and assuming the DB automatically changes

Changing:

```prisma
age Int?
```

does not by itself mean PostgreSQL has changed.

You need to apply the schema change using the appropriate Prisma workflow.

For development, this commonly means:

```bash
npx prisma migrate dev --name <migration-name>
```

---

## Mistake 4: Treating migrations as data backups

Migrations describe **schema changes**.

They are not a replacement for database backups.

For example:

```text
Migration:
"Add email column"

Backup:
"Snapshot of the actual database data"
```

These are different concepts.

---

# 35. Practical Exercise

Create a Prisma model for an `Employee` table with:

- An automatically generated integer ID
- Required name
- Unique email
- Optional age
- Salary
- Active status with a default of `true`
- Account creation timestamp

### Expected solution

```prisma
model Employee {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  age       Int?
  salary    Float
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

Then create a migration:

```bash
npx prisma migrate dev --name create_employee
```

---

# 36. Check Your Understanding

### Question 1

What does ORM stand for?

<details>
<summary>Answer</summary>

Object Relational Mapping.
</details>

---

### Question 2

What does a Prisma `model` generally represent?

<details>
<summary>Answer</summary>

A model generally represents a database table/entity.
</details>

---

### Question 3

What does `@id` mean?

<details>
<summary>Answer</summary>

It marks a field as the primary key.
</details>

---

### Question 4

What does `@unique` mean?

<details>
<summary>Answer</summary>

The value of that field must be unique.
</details>

---

### Question 5

What does `Int?` mean?

<details>
<summary>Answer</summary>

The field is an integer and can be nullable.
</details>

---

### Question 6

What is Prisma Migrate used for?

<details>
<summary>Answer</summary>

It is used to manage and apply changes to the database schema through migrations.
</details>

---

### Question 7

What is the difference between Prisma Client and Prisma Migrate?

<details>
<summary>Answer</summary>

Prisma Client is primarily used by the application to query and modify data at runtime.

Prisma Migrate is primarily used to manage changes to the database schema.
</details>

---

# 37. Key Takeaways

Remember these five ideas:

### 1. ORM

```text
Application Objects ↔ Relational Database
```

### 2. Prisma

Prisma is an ORM and database toolkit for Node.js and TypeScript.

### 3. Prisma Schema

```text
schema.prisma
```

describes models, fields, relationships, and other database-related configuration.

### 4. Prisma Client

```text
Application → Prisma Client → Database
```

It provides the API through which our application interacts with the database.

### 5. Prisma Migrate

```text
Schema Change → Migration → Database
```

It helps us track and apply database schema changes in a controlled and versioned manner.

---

# 38. Final Mental Model

If you remember only one diagram from this lecture, remember this:

```text
                         DEVELOPMENT
                              │
                              ↓
                       schema.prisma
                              │
                              ↓
                       Prisma Migrate
                              │
                              ↓
                       migration.sql
                              │
                              ↓
                         PostgreSQL
                              ↑
                              │
                         Prisma Client
                              ↑
                              │
                      Node.js Application
```

In short:

```text
Prisma Schema
     ↓
defines what our database should look like

Prisma Migrate
     ↓
helps make the database match that definition

Prisma Client
     ↓
helps our application work with the data
```
