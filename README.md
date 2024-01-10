# Guccho

## Overview

Guccho is a web-based service designed for interacting with private osu! servers, focusing on compatibility and ease of use.

## System Requirements

- Node.js version 18 or higher.
- A compatible platform (details on supported platforms provided below).

## Installation and Setup

- Configuration preparation is crucial:

  - Generate `guccho.ui.ts` based on `guccho.ui.example.ts`.
  - Create `guccho.backend.ts` using `guccho.backend.example.ts` as a template.
  - Edit the newly created configuration files as guided by the included comments.
  - If using `env()` or `safeEnv()`, set up a `.env` file using `.env.example` as a reference.

- Install dependencies:
  ```bash
  pnpm install
  ```

## Tooling

For use with `bancho.py` or `ppy.sb@bancho.py`, ensure `DB_DSN` is set in your environment variables to enable Prisma/Drizzle tooling.

## Supported Backends

- **bancho.py (also known as gulag)**
- **ppy.sb**

## Production Deployment

- To build the application for production:

  ```bash
  pnpm build
  ```

- To start the production server:

  ```bash
  pnpm start:prod
  ```

- Further details on deployment can be found in the [Nuxt.js deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets).

## Development Environment

- Launch the development server at <http://localhost:3000>:
  ```bash
  pnpm dev
  ```

### Upcoming Features (To-Dos)

- Implement functionality to grant owner privileges to the first registered user.

## Architecture Diagram

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
- Guccho
