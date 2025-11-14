declare module '@trpc/client' {
  interface OperationContext {
    /**
     * When set to `true`, the request will be sent with `httpBatchLink` instead of `httpBatchStreamLink`.
     * This is useful if your mutation needs to set cookies,
     * as you cannot update headers after a streaming response has started.
     */
    skipStreaming?: boolean
  }
}
