import 'csstype'

declare module 'csstype' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface Properties {
    // Allow any CSS Custom Properties
    [index: `--${string}`]: string
  }
}
