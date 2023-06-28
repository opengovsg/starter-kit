import { assignRef, useMergeRefs } from '@chakra-ui/react'
import {
  useRef,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type ForwardedRef,
  type ReactElement,
  type ChangeEventHandler,
} from 'react'

export interface FileButtonProps<Multiple extends boolean = false> {
  value: Multiple extends true ? File[] : File | null
  /** Called when files are picked */
  onChange(payload: Multiple extends true ? File[] : File | null): void

  /** Function that receives button props and returns react node that should be rendered */
  children(props: { onClick(): void }): ReactNode

  /** Determines whether user can pick more than one file */
  multiple?: Multiple

  /** Determines whether picked files should be appended to existing value instead of replacing */
  append?: Multiple extends boolean ? boolean : never

  /** File input accept attribute, for example, "image/png,image/jpeg" */
  accept?: string

  /** Input name attribute */
  name?: string

  /** Input form attribute */
  form?: string

  /** Function that should be called when value changes to null or empty array */
  resetRef?: ForwardedRef<() => void>

  /** Disables file picker */
  disabled?: boolean

  /**
   * Specifies that, optionally, a new file should be captured,
   * and which device should be used to capture that new media of a type defined
   * by the accept attribute. */
  capture?: boolean | 'user' | 'environment'

  /** Spreads props to input element used to capture files */
  inputProps?: ComponentPropsWithoutRef<'input'>
}

type FileButtonComponent = (<Multiple extends boolean = false>(
  props: FileButtonProps<Multiple>
) => ReactElement) & { displayName?: string }

export const FileButton: FileButtonComponent = forwardRef<
  HTMLInputElement,
  FileButtonProps
>(
  (
    {
      onChange,
      children,
      multiple = false,
      accept,
      name,
      form,
      resetRef,
      disabled,
      capture,
      inputProps,
      value,
      append,
      ...others
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>()

    const onClick = () => {
      !disabled && inputRef?.current?.click()
    }

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      if (multiple) {
        const nextFiles = Array.from(event.currentTarget.files || [])
        if (append) {
          // @ts-expect-error type inference is not working here
          onChange([...(value || []), ...nextFiles])
        } else {
          // @ts-expect-error type inference is not working here
          onChange(Array.from(event.currentTarget.files || []))
        }
      } else {
        onChange(event.currentTarget.files?.[0] || null)
      }
    }

    const reset = () => {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }

    assignRef(resetRef, reset)
    const mergedRefs = useMergeRefs(ref, inputRef)

    return (
      <>
        {children({ onClick, ...others })}

        <input
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          multiple={multiple}
          // Use onClick event to clear value of target input, each time user clicks on field.
          // This ensures that the onChange event will be triggered for the same file as well.
          onClick={(event) => ((event.target as HTMLInputElement).value = '')}
          onChange={handleChange}
          ref={mergedRefs}
          name={name}
          form={form}
          capture={capture}
          {...inputProps}
        />
      </>
    )
  }
) as any

FileButton.displayName = 'FileButton'
