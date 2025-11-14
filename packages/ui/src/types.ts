// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type As<Props = any> = React.ElementType<Props>

/**
 * Extract the props of a React element or component
 */
export type PropsOf<T extends As> = React.ComponentPropsWithoutRef<T> & {
  as?: As
}

/**
 * Type that omits default React HTML props that conflicts with RAC and theming UI props.
 */
export type HtmlUiProps<
  T extends As = 'div',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OmitKeys extends keyof any = never,
> = Omit<
  PropsOf<T>,
  | 'ref'
  | 'color'
  | 'slot'
  | 'size'
  | 'defaultChecked'
  | 'defaultValue'
  | OmitKeys
> & {
  as?: As
}
