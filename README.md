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
    subgraph abstracted [Abstract]
        user(User) --- relation(Relationship)
        user --- score(Score)
        score --- beatmap
        leaderboard(Leaderboard) --- beatmap(Beatmap)
    end
    subgraph extendable [Extendable]
        status(Status)
        article(Article)
        log(Log)
        session(Session)
    end
    subgraph providers [Providers]
      extendable
      abstracted
    end
    subgraph impl [Implementations]
        ppy.sb(ppy.sb) === |extends| bancho.py
    end
    subgraph resource [Resources]
        mysql[(MySQL)]
        gulag[/Bancho.py Server/]
        redis[(Redis)]
        file[(File)]
        memory[/Memory/]
        env
    end
    subgraph server [Server]
      trpc-server(TRPC Server)
      providers
      impl
      bancho.py(Bancho.py) === |implements, extends| $base([Base])
    end
    subgraph pages [Pages]
      page-user(/user/:id)
      pages-other(/...)
    end
    subgraph client [Client]
      search(Search)
      trpc-client(TRPC Client)
      pages --- trpc-client
      pages --- client-session
      search --- trpc-client
      client-session(Client Session) --- trpc-client
    end
    A[Gamer] --> |Browser| pages
    
    trpc-client --> |superjson| trpc-server --> |devalue| trpc-client 

    trpc-server === providers
    
    session --- user
    
    extendable ===== |$def| $base
    abstracted ===== |$active| impl

    ppy.sb --- |additional tables| mysql
    
    bancho.py --- |"gulag api(v1)"| gulag
    bancho.py --- |leaderboard| redis
    bancho.py --- mysql

    $base --- |session| redis
    $base --- |runtime, session| memory
    $base --- |log| file
    $base --- |reads| env
```

## The team (Guccho)

- [ppy.sb](https://github.com/ppy-sb)
- [Varkaria](https://github.com/Varkaria)
