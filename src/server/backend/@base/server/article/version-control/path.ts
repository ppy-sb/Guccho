import { ZodSchema, z } from 'zod'

type Key = string | number | symbol

interface UpdatePath<FromSchema extends ZodSchema, ToSchema extends ZodSchema> {
  from: {
    v: Key
    schema: FromSchema
  }
  to: {
    v: Key
    schema: ToSchema
  }
  update: (from: z.infer<FromSchema>) => z.infer<ToSchema>
}

export function createUpdatePath<FromSchema extends ZodSchema, ToSchema extends ZodSchema>(
  from: UpdatePath<FromSchema, ToSchema>['from'],
  to: UpdatePath<FromSchema, ToSchema>['to'],
  updateFn: UpdatePath<FromSchema, ToSchema>['update'],
): UpdatePath<FromSchema, ToSchema> {
  return {
    from,
    to,
    update: updateFn,
  }
}

export function findShortestPath<
  Graph extends UpdatePath<any, any>,
  Graphs extends Graph[],
  From extends Key,
  To extends Key,
>(
  graph: Graphs,
  from: From,
  to: To
) {
  const adjacencyMap: Record<Key, Key[]> = {}

  for (const node of graph) {
    const fromVertex = node.from.v
    const toVertex = node.to.v

    if (!(fromVertex in adjacencyMap)) {
      adjacencyMap[fromVertex] = []
    }

    adjacencyMap[fromVertex].push(toVertex)
  }

  const queue: [Key, Key[], Graph[]][] = [[from, [], []]]
  const visited: Record<Key, boolean> = {}

  while (queue.length > 0) {
    const [currentVertex, path, rawPath] = queue.shift()!

    if (currentVertex === to) {
      return {
        path: [...path, currentVertex] as [From, ...Key[], To],
        rawPath: [
          ...rawPath,
          ...graph.filter(
            node =>
              path.includes(node.from.v) && currentVertex === node.to.v
          ),
        ] as const,
      }
    }

    if (visited[currentVertex]) {
      continue
    }

    visited[currentVertex] = true

    const adjacentVertices = adjacencyMap[currentVertex] || []

    for (const adjacentVertex of adjacentVertices) {
      queue.push([
        adjacentVertex,
        [...path, currentVertex],
        [
          ...rawPath,
          ...graph.filter(
            node =>
              path.includes(node.from.v) && currentVertex === node.to.v
          ),
        ],
      ])
    }
  }

  return null // No path found
}
