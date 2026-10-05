# Welcome to next-app-starter

## Pre-requisites

<mark>Create .env file base on .env.example. Replace the DATABASE_URL to match with your local database server before go to next steps.</mark>

## Default users

These are the default users that are created when you seed the database.

Supper Admin
> Email: supper@example.com <br>
> Password: 123456Aa

Admin
> Email: admin@example.com <br>
> Password: 123456Aa

Normal User
> Email: user@example.com <br>
> Password: 123456Aa

<br>

## Basic commands

Don't use `npm` to install packages. Use `yarn` instead.

### Install

```sh
yarn install
```

### Run local
```sh
yarn dev
```

### Run build
```sh
yarn build
```

<br>

## Database commands

### Create migration

*Your need to contact database admin to create a new migration.*

### Update database

```sh
yarn db:push
```

### Seed database

```sh
yarn seed
```

### Reset database

Use this command to reset database and seed it again.

```sh
yarn db:reset
```