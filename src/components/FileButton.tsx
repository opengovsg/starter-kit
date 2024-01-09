import {
  forwardRef,
  useRef,
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type ReactNode,
} from 'react'
import { assignRef, useMergeRefs } from '@chakra-ui/react'

interface SingleFileButtonProps {
  value: File | null

  /** Determines whether user can pick more than one file */
  multiple?: false

  /** Called when files are picked */
  onChange(payload: File | null): void

  append?: never
}

interface MultipleFileButtonProps {
  value: File[]

  /** Determines whether user can pick more than one file */
  multiple: true

  /** Called when files are picked */
  onChange(payload: File[]): void

  /** Determines whether picked files should be appended to existing value instead of replacing */
  append?: boolean
}

interface CommonFileButtonProps {
  /** Function that receives button props and returns react node that should be rendered */
  children: (props: { onClick(): void }) => ReactNode

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

export type FileButtonProps = (
  | SingleFileButtonProps
  | MultipleFileButtonProps
) &
  CommonFileButtonProps

type FileButtonComponent = React.FC<FileButtonProps>

export const FileButton: FileButtonComponent = forwardRef<
  HTMLInputElement,
  FileButtonProps
>(
  (
    {
      onChange,
      children,
      multiple,
      accept,
      name,
      form,
      resetRef,
      disabled,
      capture,
      inputProps,
      value,
      ...others
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>()

    const onClick = () => {
      !disabled && inputRef?.current?.click()
    }

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      if (multiple) {
        const nextFiles = Array.from(event.currentTarget.files ?? [])
        if (others.append) {
          onChange([...(value ?? []), ...nextFiles])
        } else {
          onChange(Array.from(event.currentTarget.files ?? []))
        }
      } else {
        onChange(event.currentTarget.files?.[0] ?? null)
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
  },
)

FileButton.displayName = 'FileButton'
