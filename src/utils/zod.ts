import { z } from 'zod'

export const normaliseEmail = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Please enter an email address.')
  .email({ message: 'Please enter a valid email address.' })

/**
 * Function to safely parse a JSON string with a Zod schema.
 * @param schema the Zod schema to parse against
 * @param jsonString the JSON string to parse
 * @param parse any custom parsing function, defaults to JSON.parse
 */
export const safeSchemaJsonParse = <T extends z.ZodTypeAny>(
  schema: T,
  jsonString: string,

  parse: (jsonString: string) => unknown = JSON.parse,
): { success: true; data: z.infer<T> } | { success: false; error: Error } => {
  try {
    const parsed = parse(jsonString)
    return schema.safeParse(parsed)
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { success: false, error: e }
    }
    return { success: false, error: new Error(`Unknown JSON parse error`) }
  }
}

/**
 * Creates a Zod schema for an API response object discriminated on `success`
 * The schema is {success: true, data: T} | {success: false, reason: string}
 */
export const createResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
  return z.discriminatedUnion('success', [
    z.object({
      success: z.literal(true),
      data: dataSchema,
    }),
    z.object({
      success: z.literal(false),
      reason: z.string(),
    }),
  ])
}
