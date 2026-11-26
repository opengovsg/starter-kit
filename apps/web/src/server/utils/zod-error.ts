import { z } from 'zod'

// A request can fail validation with one issue per key it sends, and an issue's
// message or path can echo request keys, so every size here is capped.
const MAX_ISSUES = 10
const MAX_PATH_DEPTH = 5
const MAX_STRING_LENGTH = 200

/** Longest error message returned to a caller or written to a log. */
export const MAX_ERROR_MESSAGE_LENGTH = 1000

export const truncate = (value: string, maxLength = MAX_STRING_LENGTH) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}…` : value

const boundedIssues = (error: z.core.$ZodError) =>
  error.issues.slice(0, MAX_ISSUES).map((issue) => ({
    ...issue,
    message: truncate(issue.message),
    path: issue.path
      .slice(0, MAX_PATH_DEPTH)
      .map((segment) => truncate(String(segment))),
  }))

/**
 * Size-bounded summary of a validation error for logs: the total issue count
 * and the path and code of the first few issues.
 */
export const summarizeZodError = (error: z.core.$ZodError) => ({
  issueCount: error.issues.length,
  issues: boundedIssues(error).map(({ code, path }) => ({
    code,
    path: path.join('.'),
  })),
})

/** `z.flattenError` over the first few issues, with capped paths and messages. */
export const flattenZodError = (error: z.core.$ZodError) =>
  z.flattenError(new z.core.$ZodError(boundedIssues(error)))
