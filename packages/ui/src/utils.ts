/**
 * Utility to separate variant props from other props.
 * @example
 * ```tsx
 * const [props, variantProps] = mapPropsVariants(
 *    originalProps,
 *    modalStyles.variantKeys,
 *  )
 * ```
 */
export const mapPropsVariants = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  K extends keyof T,
>(
  props: T,
  variantKeys?: K[],
  removeVariantProps = true,
): readonly [Omit<T, K> | T, Pick<T, K>] => {
  if (!variantKeys) {
    return [props, {} as Pick<T, K>]
  }

  const picked = variantKeys.reduce(
    (acc, key) => {
      if (key in props) {
        return { ...acc, [key]: props[key] }
      }
      return acc
    },
    {} as Pick<T, K>,
  )

  if (removeVariantProps) {
    const omitted = Object.keys(props)
      .filter((key) => !variantKeys.includes(key as K))
      .reduce((acc, key) => ({ ...acc, [key]: props[key as keyof T] }), {})

    return [omitted, picked] as [Omit<T, K>, Pick<T, K>]
  }
  return [props, picked] as [T, Pick<T, K>]
}
