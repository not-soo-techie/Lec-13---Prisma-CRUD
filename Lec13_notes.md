# Prisma — Lecture 2
## Prisma Generate, Prisma Client & CRUD

---

## 1. Today's Learning Goals

By the end of this lecture, you should understand:

- Why we need Prisma Client
- What Prisma Client is
- How `schema.prisma` is connected to Prisma Client
- What `prisma generate` does
- Difference between **Prisma Migrate** and **Prisma Generate**
- How to create and use a Prisma Client instance
- How Prisma Client provides a programmatic API for database operations
- How to perform basic CRUD operations
- How our Node.js application ultimately communicates with PostgreSQL

---

# 2. Recap: What We Did Previously

In the previous lecture, we used Prisma Migrate to manage our **database structure**.

```text
schema.prisma
      ↓
Prisma Migrate
      ↓
PostgreSQL
      ↓
Tables
```

### Key idea

**Prisma Migrate → changes/manages the database structure.**

---

# 3. Today's Problem

We already have:

```text
Node.js Application

        ?

PostgreSQL Database
```

Suppose PostgreSQL has:

```text
users
----------------
id
name
email
```

Our Node.js application receives:

```http
POST /users
```

with:

```json
{
  "name": "Rahul",
  "email": "rahul@gmail.com"
}
```

The application needs to insert this data into PostgreSQL.

Without an ORM, we could write SQL:

```sql
INSERT INTO users(name, email)
VALUES ('Rahul', 'rahul@gmail.com');
```

But a large application can contain hundreds of database operations.

We don't want our application code to be filled with manually written SQL queries.

This is one of the problems an **ORM** such as Prisma helps solve.

---

# 4. Prisma Client

Our application works primarily with JavaScript/TypeScript:

```js
const user = {
  name: "Rahul",
  email: "rahul@gmail.com"
};
```

PostgreSQL works with SQL:

```sql
INSERT INTO users ...
```

Prisma provides a layer between our application and the database:

```text
Node.js Application
        ↓
   Prisma Client
        ↓
    PostgreSQL
```

### Definition

> **Prisma Client is a generated JavaScript/TypeScript client that our application uses to interact with the database.**

Instead of manually writing SQL for every operation, we can use Prisma Client methods:

```js
prisma.user.create()

prisma.user.findMany()

prisma.user.update()

prisma.user.delete()
```

---

# 5. Prisma Client API

The word **API** does not always mean an HTTP API.

There are two different APIs in our backend:

### HTTP API

```text
Frontend
   ↓
GET /users
   ↓
Express
```

### Prisma Client API

```text
Express
   ↓
prisma.user.findMany()
   ↓
Database
```

Complete flow:

```text
Frontend
    ↓
   HTTP
    ↓
Express API
    ↓
Prisma Client API
    ↓
PostgreSQL
```

### Important distinction

- **Express API** → allows clients to communicate with our backend.
- **Prisma Client API** → allows our backend code to communicate with the database.

---

# 6. Why Is Prisma Client Generated?

Consider our Prisma schema:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

From this schema, Prisma knows:

- There is a `User` model
- `User` has an `id`
- `User` has a `name`
- `User` has an `email`
- `email` must be unique
- `id` is automatically generated

Now consider:

```js
prisma.user.create()
```

How does Prisma know that:

```text
user
```

exists?

Because Prisma Client is **generated from our schema**.

---

# 7. Prisma Generate

Command:

```bash
npx prisma generate
```

Conceptually:

```text
schema.prisma
      ↓
prisma generate
      ↓
Generated Prisma Client
      ↓
prisma.user
prisma.user.create()
prisma.user.findMany()
prisma.user.update()
...
```

### Key idea

> The Prisma Client API is generated based on the models and fields defined in `schema.prisma`.

---

# 8. Seeing the Generated API

After generating the client, try:

```js
prisma.
```

Then:

```js
prisma.user.
```

Your editor can provide methods such as:

```text
create
findMany
findUnique
findFirst
update
delete
upsert
...
```

These methods are available because Prisma generated a client based on our schema.

For example, if the schema contains:

```prisma
model Product {
  id    Int    @id @default(autoincrement())
  name  String
  price Int
}
```

after generation, the client can expose:

```js
prisma.product
```

with database operations for that model.

---

# 9. Prisma Migrate vs Prisma Generate

This is one of the most important distinctions.

```text
                  schema.prisma
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
          Migrate             Generate
             ↓                   ↓
       PostgreSQL          Prisma Client
       DB Structure              ↓
                              Application
```

### Prisma Migrate

Concerned with the **database structure**.

Example:

```prisma
email String
```

Migration can create the corresponding database column.

### Prisma Generate

Concerned with the **generated client used by the application**.

It updates Prisma Client based on the current schema.

---

## Example

Suppose we add:

```prisma
phone String
```

to our model.

There are two separate concerns:

```text
Schema changed
      ↓
   Migrate
      ↓
Database gets phone column
```

and:

```text
Schema changed
      ↓
   Generate
      ↓
Prisma Client knows about phone
```

### Remember

> **Migrate → database**

> **Generate → client**

---

# 10. Prisma Client Instance

We import Prisma Client:

```js
import { PrismaClient } from "@prisma/client";
```

Then create an instance:

```js
const prisma = new PrismaClient();
```

Think of this as:

```text
PrismaClient
     ↓
Client class

new PrismaClient()
     ↓
Client instance

prisma.user.findMany()
     ↓
Use that instance to perform a database operation
```

So:

```js
prisma.user.findMany()
```

can be broken into:

```text
prisma
  ↓
Prisma Client instance

user
  ↓
User model

findMany()
  ↓
Database operation
```

---

# 11. What Happens When We Run a Prisma Query?

Consider:

```js
const users = await prisma.user.findMany();
```

PostgreSQL does not understand this JavaScript code.

Simplified flow:

```text
prisma.user.findMany()
          ↓
     Prisma Client
          ↓
   Database interaction
          ↓
      PostgreSQL
          ↓
       Result
          ↓
     Prisma Client
          ↓
   JavaScript objects
```

The important mental model:

> Prisma Client provides a convenient API for our application to perform database operations and receive the results back in a form the application can use.

---

# 12. Prisma and SQL

Prisma:

```js
const users = await prisma.user.findMany();
```

Conceptually corresponds to a database operation such as:

```sql
SELECT * FROM "User";
```

Another example:

```js
const user = await prisma.user.findUnique({
  where: {
    id: 10
  }
});
```

Conceptually:

```sql
SELECT *
FROM "User"
WHERE id = 10;
```

### Important

The SQL examples help us understand what the database operation represents.

We should still understand SQL even when using an ORM.

> **ORM reduces the amount of SQL we need to write manually; it does not eliminate the need to understand databases and SQL.**

---

# 13. Student Management System

We will now use Prisma Client to build basic database operations for a Student Management System.

### Model

```prisma
model Student {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  age   Int
}
```

Our operations will be:

```text
CREATE
READ
UPDATE
DELETE
```

---

# 14. CREATE

To create a student:

```js
const student = await prisma.student.create({
  data: {
    name: "Rahul",
    email: "rahul@gmail.com",
    age: 20
  }
});
```

The returned value contains the created record:

```js
{
  id: 1,
  name: "Rahul",
  email: "rahul@gmail.com",
  age: 20
}
```

Mental model:

```text
create()
   ↓
Create record
   ↓
Database
   ↓
Created object returned
```

### Pattern

```js
prisma.<model>.create({
  data: {
    ...
  }
});
```

---

# 15. READ — Get All Records

To get all students:

```js
const students = await prisma.student.findMany();
```

### Mental model

```text
findMany()
    ↓
Multiple records
```

---

# 16. READ — Get One Record

To find one student using a unique field:

```js
const student = await prisma.student.findUnique({
  where: {
    id: 1
  }
});
```

### Mental model

```text
findUnique()
    ↓
One uniquely identifiable record
```

For example, because:

```prisma
email String @unique
```

we can also use:

```js
const student = await prisma.student.findUnique({
  where: {
    email: "rahul@gmail.com"
  }
});
```

### Remember

`findUnique()` requires the `where` condition to identify a unique record.

---

# 17. UPDATE

Suppose Rahul's age changes from 20 to 21.

```js
const student = await prisma.student.update({
  where: {
    id: 1
  },
  data: {
    age: 21
  }
});
```

`update()` has two important parts:

```text
where → Which record should change?

data  → What should change?
```

General pattern:

```js
prisma.<model>.update({
  where: {
    ...
  },
  data: {
    ...
  }
});
```

---

# 18. DELETE

To delete a student:

```js
await prisma.student.delete({
  where: {
    id: 1
  }
});
```

General pattern:

```js
prisma.<model>.delete({
  where: {
    ...
  }
});
```

---

# 19. CRUD Mental Model

Don't memorize the methods as unrelated functions.

Think in terms of the operation you want:

```text
CREATE → create()

READ   → findMany()
         findUnique()

UPDATE → update()

DELETE → delete()
```

---

# 20. Constraints Still Matter

Consider:

```prisma
email String @unique
```

Now try to create two students with the same email:

```js
await prisma.student.create({
  data: {
    name: "A",
    email: "same@gmail.com",
    age: 20
  }
});

await prisma.student.create({
  data: {
    name: "B",
    email: "same@gmail.com",
    age: 21
  }
});
```

The second operation will fail because `email` is unique.

### Important connection

Previous lecture:

```text
Schema
  ↓
Constraints
  ↓
Database
```

Today's lecture:

```text
Prisma Client
  ↓
Database operation
  ↓
Database constraints still apply
```

Prisma does not remove the database rules.

---

# 21. Filtering Data

Suppose we want:

> Students whose age is greater than 18.

We can use:

```js
const students = await prisma.student.findMany({
  where: {
    age: {
      gt: 18
    }
  }
});
```

The important idea is the structure:

```text
findMany()
    ↓
where
    ↓
condition
```

Prisma provides different operators for filtering.

For example:

```text
gt  → greater than
gte → greater than or equal
lt  → less than
lte → less than or equal
```

Don't try to memorize every operator at once. Understand the pattern and refer to the documentation when needed.

---

# 22. Mini Challenge

## Student Management API

Identify the Prisma operation needed for each requirement:

### 1. Create a student

```text
?
```

### 2. Get all students

```text
?
```

### 3. Get a student by ID

```text
?
```

### 4. Update a student's age

```text
?
```

### 5. Delete a student

```text
?
```

### Answers

```text
Create → create()

Get all → findMany()

Get one → findUnique()

Update → update()

Delete → delete()
```

---

# 23. Final Mental Model

```text
                    schema.prisma
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
          Migrate                Generate
              │                     │
              ▼                     ▼
         PostgreSQL          Prisma Client
         DB Structure               │
                                    ▼
                              Node.js App
                                    │
                                    ▼
                                   CRUD
```

---

# 24. The 5 Things to Remember

### 1. `schema.prisma`

Describes our **data model**.

### 2. Prisma Migrate

Changes/manages the **database structure**.

```bash
npx prisma migrate dev
```

### 3. Prisma Generate

Generates/updates the **Prisma Client** based on the schema.

```bash
npx prisma generate
```

### 4. Prisma Client

Provides a **programmatic API** for our application to interact with the database.

```js
prisma.user.findMany()
```

### 5. CRUD

```text
CREATE → create()

READ   → findMany()
         findUnique()

UPDATE → update()

DELETE → delete()
```

---

# Key Takeaway

> **Don't memorize Prisma methods.**

First ask:

> **"What do I want to do with the data?"**

Then choose the appropriate Prisma Client operation.

```text
Want to create?
        ↓
     create()

Want to read?
        ↓
 findMany()
 findUnique()

Want to update?
        ↓
     update()

Want to delete?
        ↓
     delete()
```
