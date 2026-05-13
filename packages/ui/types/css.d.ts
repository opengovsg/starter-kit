import 'csstype'

declare module 'csstype' {
  // oxlint-disable-next-line typescript/consistent-indexed-object-style
  interface Properties {
    // Allow any CSS Custom Properties
    [index: `--${string}`]: string
  }
}
