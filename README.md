# guweb@next

## What is guweb-nuxt?

guweb is the front-facing appearance of the osu! server protocol, [gulag](https://github.com/cmyui/gulag)!

## Requirements

- Nodejs >= 14
- at least one supported platform (see supporting platforms down below)

## Setup

- Config .env
- Config `activeAdapter` in nuxt.config.ts
- Run `yarn`

## supporting platforms

guweb-next has multi-platform support in mind. It's modular but not hot-swapable. Some procedures need to be done before it's ready for dev/prod.

- ### guweb

- Run `yarn build:schemas`

## Development Server

Start the development server on <http://localhost:3000>

```bash
yarn dev
```

## Production

Build the application for production:

```bash
# yarn
yarn build
```

Locally preview production build:

```bash
# yarn
yarn preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.

## The team (guweb-nuxt)

- [ppy.sb](https://github.com/ppy-sb)
- [Varkaria](https://github.com/Varkaria)

### dev notes

todo: search 'TODO' in repo.

### todo(s)

TODO Register
TODO Give first registered user owner privilege

TODO Session [x] half baked, currently lives in memory
TODO standardize error string

## AppConfig and ServerConfig

see `src/app.config.ts` and `src/adapters/bancho.py/exports.ts`, more detailed readme will be provided later
