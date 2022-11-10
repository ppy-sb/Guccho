# guweb@next

## What is guweb-nuxt?

guweb is the front-facing appearance of the osu! server protocol, [gulag](https://github.com/cmyui/gulag)!

## Requirements

- Nodejs >= 14
- at least one supported platform (see supporting platforms down below)

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install
```

## supporting platforms

guweb-next has multi-platform support in mind. It's modular but not hot-swapable. Some procedures need to be done before it's ready for dev/prod.

- ### guweb

#### pre requests

```bash
# make sure you did run `yarn install`
yarn prisma generate prisma/bancho.py.prisma
```

## Development Server

Start the development server on <http://localhost:3000>

```bash
# important: follow platform specific procedures first

# npm
npm run dev

# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# important: follow platform specific procedures first

# npm
npm run build

# yarn
yarn build
```

Locally preview production build:

```bash
# important: follow platform specific procedures first

# npm
npm run preview

# yarn
yarn preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.

## The team (guweb-nuxt)

- [ppy.sb](https://github.com/ppy-sb)
- [Varkaria](https://github.com/Varkaria)

### dev notes

Plan: deprecate Python api server and use Nuxt 3 only.

- phase 1: migrate to nuxt 3 with typescript support [x]
- phase 2: define tRPC schema for both frontend and backend [x]
- phase 3: ~~migrate legacy python server to nuxt 3 api.~~ No we don't we create a new one instead.

todo: search 'TODO' in repo.

markdown for userpage

### todo(s)

TODO Register
TODO Give first registered user owner privilege

TODO Session [x] half baked, currently lives in memory
TODO Login (require session & store)

## AppConfig and ServerConfig

TODO AppConfig's type is not generating properly from Nuxt. Type of AppConfig has to be Manually export/imported. Fix it if you can.

An adapter should export configs that has the same structure as AppConfig.
For now an adapter will export 3 objects while AppConfig is providing one object contains the 3 objects mentioned.

see `src/app.config.ts` and `src/adapters/bancho.py/config.ts`

it's still in draft and everything might change in the future.
