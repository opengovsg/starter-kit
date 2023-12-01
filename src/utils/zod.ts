import { z } from 'zod'

export const normaliseEmail = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Please enter an email address.')
  .email({ message: 'Please enter a valid email address.' })
