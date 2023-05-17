// https://github.com/react-hook-form/react-hook-form/issues/40#issuecomment-1139970269
import { debounce } from 'lodash'
import {
  FieldPath,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
  UseFormRegisterReturn,
  UseFormTrigger,
} from 'react-hook-form'

/**
 * Replacement of register from react-hook-form with debounce
 */
export const registerWithDebounce = <
  TFieldValues extends FieldValues = FieldValues
>(
  name: FieldPath<TFieldValues>,
  delay: number,
  trigger: UseFormTrigger<TFieldValues>,
  register: UseFormRegister<TFieldValues>,
  options?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>
) => {
  const useFormRegisterReturn: UseFormRegisterReturn = register(name, options)
  const { onChange } = useFormRegisterReturn
  const debouncedValidate = debounce(() => {
    trigger(name)
  }, delay)
  return {
    ...useFormRegisterReturn,
    onChange: (e: any) => {
      onChange(e)
      debouncedValidate()
    },
  }
}
