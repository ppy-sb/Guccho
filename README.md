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
# important: follow platform specific procedures first
npm run dev
```

## Production

Build the application for production:

```bash
# important: follow platform specific procedures first
npm run build
```

Locally preview production build:

```bash
# important: follow platform specific procedures first
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.

What is guweb-nuxt?
------

guweb is the front-facing appearance of the osu! server protocol, [gulag](https://github.com/cmyui/gulag)!
Using Nuxt for Frontend with tRPC to community with backend

Requirements
------

- Nodejs >= 14
- at least one supported platform (see supporting platforms down below)

The team (guweb-nuxt)
------

- [ppy.sb](https://github.com/ppy-sb)
- [Varkaria](https://github.com/Varkaria)

Plan: deprecate Python api server and use Nuxt 3 only.

- phase 1: migrate to nuxt 3 with typescript support [x]
- phase 2: define tRPC schema for both frontend and backend [x]
- phase 3: migrate legacy python server to nuxt 3 api.

todo: search 'TODO' in repo.

markdown for userpage

## supporting platforms

guweb-next has multi-platform support in mind while developing the app.

### guweb

#### pre requests

```bash
# make sure you did run `yarn install`
yarn prisma generate prisma/bancho.py.prisma
```

### todo

TODO Register
TODO Give first registered user owner privilege

TODO Session [x] half baked, using nuxt-store, will replace with nuxt-auth when available
TODO Login (require session & store)
