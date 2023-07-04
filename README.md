# Guccho

## What is Guccho?

Guccho is a client interface to interact with osu private servers with compatibility in mind.

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

## Diagram

```mermaid
flowchart TB
    subgraph backend [Abstracted Providers]
        session(Session) --- user(User)
        user --- avatar(Avatar)
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
    subgraph client [Client]
      client-session(Client Session)
      trpc-client(TRPC Client)
    end
    subgraph server [Server]
      backend
      impl
    end
    A[Gamer] ---> |Browser| client[/Guccho client/]
    
    trpc-client ===> |superjson| backend
    backend ===> |devalue| trpc-client

    

    session ----- $base
    log ----- $base
    status ----- $base


    backend ====== |$active| impl

    ppy.sb --- |additional tables| mysql
    
    bancho.py --- |api v1| gulag
    bancho.py --- |leaderboard| redis
    bancho.py --- mysql

    $base --- |session| redis
    $base --- |runtime, session| memory
    $base --- |log| file

```

## The team (Guccho)

- [ppy.sb](https://github.com/ppy-sb)
- [Varkaria](https://github.com/Varkaria)
