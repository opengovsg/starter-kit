import {
  Box,
  type BoxProps,
  Flex,
  type FlexProps,
  forwardRef,
} from '@chakra-ui/react'
import { memo, useEffect, useMemo, useState } from 'react'

import { dataAttr } from '@chakra-ui/utils'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { safeJsonParse } from '~/utils/safeJsonParse'

import Placeholder from '@tiptap/extension-placeholder'
import { merge } from 'lodash'
import { TIP_TAP_STYLES } from './constants'
import { MenuBar } from './RichTextMenu'

interface TextAreaFieldProps extends Omit<FlexProps, 'value' | 'onChange'> {
  value?: string
  defaultValue?: string
  isReadOnly?: boolean
  onChange?: (value: string | undefined, rawValue?: string) => void
  placeholder?: string
}

const ReadonlyContainer = forwardRef<BoxProps, 'div'>(
  ({ children, ...boxProps }, ref) => {
    return (
      <Box
        {...boxProps}
        ref={ref}
        textStyle="body-2"
        color="base.content.default"
        sx={{
          '.ProseMirror': {
            minH: 'auto',
          },
        }}
      >
        {children}
      </Box>
    )
  },
)

const EditorContainer = forwardRef<BoxProps, 'div'>(
  ({ children, ...boxProps }, ref) => {
    return (
      <Box
        borderBottomRadius="sm"
        borderTopRadius={0}
        mt="-px"
        bg="white"
        borderWidth="1px"
        borderColor="base.divider.strong"
        px="1rem"
        py="0.5rem"
        ref={ref}
        {...boxProps}
      >
        {children}
      </Box>
    )
  },
)

const UnmemoedRichText = forwardRef<TextAreaFieldProps, 'div'>(
  (
    {
      isReadOnly,
      value,
      defaultValue,
      onChange,
      placeholder = 'Add details and give concrete examples to explain how you feel.',
      sx,
      ...flexProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const componentStyles = useMemo(() => merge({}, TIP_TAP_STYLES, sx), [sx])

    const editor = useEditor({
      extensions: [
        StarterKit,
        Link,
        Placeholder.configure({
          // Use a placeholder:
          placeholder,
          // Use different placeholders depending on the node type:
          // placeholder: ({ node }) => {
          //   if (node.type.name === 'heading') {
          //     return 'What’s the title?'
          //   }

          //   return 'Can you add some further context?'
          // },
        }),
      ],
      content: safeJsonParse(value),
      editable: !isReadOnly,
      onCreate: ({ editor }) => {
        if (isReadOnly) return
        // Required to focus the editor on creation
        editor.commands.focus()
      },
      onUpdate: ({ editor }) => {
        if (isReadOnly) return
        if (editor.isEmpty) {
          return onChange?.(undefined)
        }
        const json = editor.getJSON()
        const rawTextValue = editor.getText()
        onChange?.(JSON.stringify(json), rawTextValue)
      },
    })

    const EditorWrapper = useMemo(
      () => (isReadOnly ? ReadonlyContainer : EditorContainer),
      [isReadOnly],
    )

    // this is required as value will not be set after the first render
    useEffect(() => {
      if (!editor) return
      if (defaultValue) {
        editor.commands.setContent(safeJsonParse(defaultValue))
      }
      if (!defaultValue && !value) {
        editor.commands.clearContent()
      }
    }, [defaultValue, editor, value])

    return (
      <Flex
        direction="column"
        borderRadius="sm"
        data-group
        // TODO: Add error or invalid styling
        sx={componentStyles}
        {...flexProps}
      >
        <Box
          tabIndex={isReadOnly ? undefined : 0}
          ref={ref}
          onFocus={() => {
            if (isReadOnly) return
            editor?.commands.focus()
          }}
        >
          {!isReadOnly && <MenuBar editor={editor} />}
          <EditorWrapper data-focus={dataAttr(isFocused)}>
            <EditorContent
              editor={editor}
              onFocus={() => {
                if (!isReadOnly) {
                  setIsFocused(true)
                }
              }}
              onBlur={() => {
                if (!isReadOnly) {
                  setIsFocused(false)
                }
              }}
            />
          </EditorWrapper>
        </Box>
      </Flex>
    )
  },
)

export const RichText = memo(UnmemoedRichText)
