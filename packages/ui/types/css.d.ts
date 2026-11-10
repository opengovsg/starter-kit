import 'csstype'

declare module 'csstype' {
  interface Properties {
    // Allow any CSS Custom Properties
    [index: `--${string}`]: string
  }
}
