import 'csstype'

declare module 'csstype' {
  // oxlint-disable-next-line typescript-eslint/consistent-indexed-object-style
  interface Properties {
    // Allow any CSS Custom Properties
    [index: `--${string}`]: string
  }
}
