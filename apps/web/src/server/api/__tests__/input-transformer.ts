import { createTRPCRouter } from '../trpc'

export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null

export const inputTransformer = createTRPCRouter({})._def._config.transformer
  .input
