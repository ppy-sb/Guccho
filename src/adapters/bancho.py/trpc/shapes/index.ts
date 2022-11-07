import z from 'zod'

export const zodHandle = z.union([z.string(), z.number()])
export const zodRelationType = z.union([z.literal('friend'), z.literal('block')])
