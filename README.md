# Nuxt 3 Minimal Starter

Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm (cannot install.)
# pnpm install --shamefully-hoist
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.


Table of Contents
==================
- [Nuxt 3 Minimal Starter](#nuxt-3-minimal-starter)
  - [Setup](#setup)
  - [Development Server](#development-server)
  - [Production](#production)
- [Table of Contents](#table-of-contents)
  - [What is guweb-nuxt?](#what-is-guweb-nuxt)
  - [Requirements](#requirements)
  - [The team (guweb-nuxt)](#the-team-guweb-nuxt)

What is guweb-nuxt?
------

guweb is the front-facing appearance of the osu! server protocol, [gulag](https://github.com/cmyui/gulag)!
Using Nuxt for Frontend and Express.js for Backend (old is using Quart for Frontend and Backend at the same time)
(now is work in progress so don't use this in production right now)

Requirements
------

- Some know-how with Linux (tested on Ubuntu 18.04), Node.js, and general-programming knowledge.
- MySQL
- NGINX

The team (guweb-nuxt)
------
- [Varkaria](https://github.com/Varkaria)


Plan: deprecate Python api server and use Nuxt 3 only.

phase 1: migrate to nuxt 3 with typescript support
phase 2: define tRPC schema for both frontend and backend
phase 3: migrate legacy python server to nuxt 3 api.


todo: search 'TODO' in repo.

markdown for userpage

TODO: floating navbar https://daisyui.com/components/navbar/