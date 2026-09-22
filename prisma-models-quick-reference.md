# Prisma Models --- Quick Reference

## 1. Model Basics

A Prisma model represents a database table.

``` prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  age       Int?
  createdAt DateTime @default(now())
}
```

A field has three main parts:

``` text
fieldName   Type       Attributes
   │          │            │
   ▼          ▼            ▼
email      String       @unique
```

------------------------------------------------------------------------

## 2. Scalar Data Types

  Prisma Type   Typical PostgreSQL Type   Example
  ------------- ------------------------- --------------------
  `String`      `TEXT`                    `"Yash"`
  `Int`         `INTEGER`                 `25`
  `BigInt`      `BIGINT`                  `9007199254740992`
  `Float`       `DOUBLE PRECISION`        `10.5`
  `Decimal`     `DECIMAL/NUMERIC`         `99.99`
  `Boolean`     `BOOLEAN`                 `true`
  `DateTime`    `TIMESTAMP`               `2026-09-20...`
  `Json`        `JSON/JSONB`              `{"role":"admin"}`
  `Bytes`       `BYTEA`                   Binary data

Example:

``` prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  price       Decimal
  rating      Float?
  stock       Int
  isActive    Boolean  @default(true)
  metadata    Json?
  createdAt   DateTime @default(now())
}
```

------------------------------------------------------------------------

## 3. Optional Fields --- `?`

`?` means the field is nullable/optional.

``` prisma
age Int?
```

Conceptually:

``` sql
age INTEGER
```

A required field:

``` prisma
age Int
```

is conceptually:

``` sql
age INTEGER NOT NULL
```

------------------------------------------------------------------------

## 4. Lists / Arrays --- `[]`

`[]` represents a list.

``` prisma
interests String[]
```

It can also represent the "many" side of a relation:

``` prisma
posts Post[]
```

------------------------------------------------------------------------

# 5. Field-Level Attributes --- `@`

Field-level attributes modify an individual field.

## `@id` --- Primary Key

``` prisma
id Int @id
```

Marks the field as the primary key.

------------------------------------------------------------------------

## `@default`

Defines a default value.

``` prisma
id        Int      @default(autoincrement())
isActive  Boolean  @default(true)
createdAt DateTime @default(now())
status    String   @default("ACTIVE")
```

------------------------------------------------------------------------

## `@unique`

Requires values to be unique.

``` prisma
email String @unique
```

Two users cannot have the same email.

------------------------------------------------------------------------

## `@updatedAt`

Automatically updates the timestamp when Prisma updates the record.

``` prisma
updatedAt DateTime @updatedAt
```

Common pattern:

``` prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

------------------------------------------------------------------------

## `@map`

Maps a Prisma field to a differently named database column.

``` prisma
model User {
  firstName String @map("first_name")
}
```

Prisma:

``` text
firstName
```

Database:

``` text
first_name
```

------------------------------------------------------------------------

## `@relation`

Defines relationships between models.

``` prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}
```

Here:

``` text
User 1 ───────── N Post
```

`authorId` is the foreign-key field.

------------------------------------------------------------------------

# 6. Model-Level Attributes --- `@@`

Model-level attributes apply to the model/table rather than one field.

## `@@id` --- Composite Primary Key

``` prisma
model Enrollment {
  studentId Int
  courseId  Int

  @@id([studentId, courseId])
}
```

The combination of `studentId + courseId` is the primary key.

------------------------------------------------------------------------

## `@@unique` --- Composite Unique Constraint

``` prisma
model User {
  id             Int    @id @default(autoincrement())
  username       String
  organizationId Int

  @@unique([username, organizationId])
}
```

The combination must be unique.

------------------------------------------------------------------------

## `@@index` --- Database Index

``` prisma
model User {
  id    Int    @id @default(autoincrement())
  email String

  @@index([email])
}
```

Useful for fields frequently used in filtering, searching, joins, or
sorting, depending on the query workload.

Composite indexes are also possible:

``` prisma
@@index([lastName, firstName])
```

------------------------------------------------------------------------

## `@@map` --- Table Mapping

Maps a Prisma model to a differently named database table.

``` prisma
model User {
  id   Int    @id @default(autoincrement())
  name String

  @@map("users")
}
```

Prisma:

``` text
User
```

Database:

``` text
users
```

This is useful when your database uses `snake_case` or plural table
names.

------------------------------------------------------------------------

# 7. Relationships

## One-to-Many

``` prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}
```

``` text
User 1 ───────── N Posts
```

------------------------------------------------------------------------

## One-to-One

``` prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
}
```

The `@unique` on `userId` ensures one profile per user.

------------------------------------------------------------------------

## Many-to-Many

``` prisma
model Student {
  id      Int      @id @default(autoincrement())
  courses Course[]
}

model Course {
  id       Int       @id @default(autoincrement())
  students Student[]
}
```

Prisma can manage the implicit join table for this relationship.

------------------------------------------------------------------------

# 8. Enums

Enums restrict a field to predefined values.

``` prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   Int  @id @default(autoincrement())
  name String
  role Role @default(USER)
}
```

Valid values are only:

``` text
USER
ADMIN
MODERATOR
```

------------------------------------------------------------------------

# 9. Native Database Types

Prisma types are database-independent, but native types let you specify
database-specific types.

For PostgreSQL:

``` prisma
price    Decimal @db.Decimal(10, 2)
name     String  @db.VarChar(255)
content  String  @db.Text
```

Think of it as:

``` text
Prisma type       →    Database-specific type

Decimal           →    @db.Decimal(10, 2)
String            →    @db.VarChar(255)
String            →    @db.Text
```

Available native types depend on the database provider.

------------------------------------------------------------------------

# 10. Complete Example

``` prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        Int      @id @default(autoincrement())

  firstName String   @map("first_name")
  lastName  String?  @map("last_name")

  email     String   @unique
  age       Int?

  role      Role     @default(USER)
  isActive  Boolean  @default(true)

  metadata  Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]

  @@index([lastName])
  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?

  authorId  Int      @map("author_id")
  author    User     @relation(fields: [authorId], references: [id])

  createdAt DateTime @default(now())

  @@index([authorId])
  @@map("posts")
}
```

------------------------------------------------------------------------

# 11. Quick Mental Model

``` text
                    Prisma Model
                         │
          ┌──────────────┴──────────────┐
          │                             │
        Fields                    Model Attributes
          │                             │
     ┌────┴────┐                  ┌─────┴─────┐
     │         │                  │           │
   Types    Attributes       Constraints    Mapping
     │         │                  │           │
 String     @id                @@id         @@map
 Int        @default           @@unique
 Boolean    @unique            @@index
 DateTime   @updatedAt
 Json       @map
 Decimal    @relation
```

### Remember these four symbols

  Syntax   Meaning                 Example
  -------- ----------------------- ------------------------
  `@`      Field-level attribute   `email String @unique`
  `@@`     Model-level attribute   `@@index([email])`
  `?`      Nullable/optional       `age Int?`
  `[]`     List / many relation    `posts Post[]`

------------------------------------------------------------------------

# 12. Prisma vs Database

A Prisma model is a schema definition used to describe how your
application maps to the database.

``` text
                 schema.prisma
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
     prisma migrate     prisma generate
             │                 │
             ▼                 ▼
       PostgreSQL        Prisma Client
       schema/data       generated API
```

**Key distinction:**

> `prisma migrate` changes the database schema.

> `prisma generate` generates/updates Prisma Client based on the Prisma
> schema.

They are related, but they perform different jobs.
