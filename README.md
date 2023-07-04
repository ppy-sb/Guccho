# Guccho

## What is Guccho?

Guccho is a web interface to interact with osu private servers with compatibility in mind.

## Requirements

- Nodejs >= 14
- at least one supported platform (see supporting platforms down below)

## Setup

- Config .env *important*
create .env from .env.example.

- Run `yarn`
- Run `yarn build:hljs`

## upgrade

```sh
yarn && yarn build:all
```

## backends

- ### bancho.py (aka gulag)

- ### ppy.sb

  Run `yarn build:schemas`

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
yarn preview:dev # or yarn preview:prod
```

Start Production server

```bash
# yarn
yarn start:prod
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.

### todo(s)

TODO Give first registered user owner privilege

## AppConfig

see `src/app.config.ts`

```mermaid
flowchart TB
    A[Gamer] --> |Browser| web[/Guccho Web/]
    web --> |superjson| trpc(TRPC)
    trpc --> |devalue| web
    subgraph backend [Abstraction]
        session(Session) --- user(User)
        user --- relation(Relationship)
        user --- score(Score)
        score --- beatmap
        leaderboard(Leaderboard) --- beatmap(Beatmap)
        status(Status)
        log(Log)
    end
    subgraph impl [Implementations]
        ppy.sb(ppy.sb) === |extends| bancho.py
        bancho.py(Bancho.py) === |implements, extends| $base
        $base([Base])
    end
    subgraph resource [Resources]
        mysql[(MySQL)]
        gulag[/Bancho.py Server/]
        redis[(Redis)]
        file[(File)]
        memory[/Memory/]
    end

    trpc --- auth(Auth)
    auth --- session
    session ----- $base
    log ----- $base
    status ----- $base

    trpc ==== backend
    backend ====== impl

    $base --- memory
    $base --- redis
    $base --- file
    
    ppy.sb --- |customize| mysql
    
    bancho.py --- gulag
    bancho.py --- redis
    bancho.py --- mysql

```

## The team (Guccho)

- [ppy.sb](https://github.com/ppy-sb)
- [Varkaria](https://github.com/Varkaria)
