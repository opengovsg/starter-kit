// Hehe ripped from OpenSpace

import { Divider, Icon, IconButton, Tooltip, Wrap } from '@chakra-ui/react'
import { type Editor } from '@tiptap/react'
import { type IconType } from 'react-icons'
import {
  BiBold,
  BiCode,
  BiCodeBlock,
  BiItalic,
  BiListOl,
  BiListUl,
  BiRedo,
  BiStrikethrough,
  BiText,
  BiUndo,
} from 'react-icons/bi'
import { VscHorizontalRule } from 'react-icons/vsc'
import { MdFormatClear } from 'react-icons/md'
import { TbBlockquote, TbH1, TbH2 } from 'react-icons/tb'

type MenuButton =
  | {
      type: 'button'
      label: string
      icon: IconType
      onClick: (editor: Editor) => void
      isActive?: (editor: Editor) => boolean
    }
  | {
      type: 'divider'
    }

const MENU_BUTTONS: MenuButton[] = [
  {
    type: 'button',
    label: 'Bold',
    onClick: (editor: Editor) => editor.chain().focus().toggleBold().run(),
    icon: BiBold,
    isActive: (editor: Editor) => editor.isActive('bold'),
  },
  {
    type: 'button',
    label: 'Italic',
    onClick: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
    icon: BiItalic,
    isActive: (editor: Editor) => editor.isActive('italic'),
  },
  {
    type: 'button',
    label: 'Strike',
    icon: BiStrikethrough,
    onClick: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor: Editor) => editor.isActive('strike'),
  },

  { type: 'divider' },
  {
    type: 'button',
    label: 'Paragraph',
    icon: BiText,
    onClick: (editor: Editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor: Editor) => editor.isActive('paragraph'),
  },
  {
    type: 'button',
    label: 'Heading 1',
    icon: TbH1,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor: Editor) => editor.isActive('heading', { level: 1 }),
  },
  {
    type: 'button',
    label: 'Heading 2',
    icon: TbH2,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor: Editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    type: 'button',
    label: 'Bullet List',
    icon: BiListUl,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleBulletList().run(),
    isActive: (editor: Editor) => editor.isActive('bulletList'),
  },
  {
    type: 'button',
    label: 'Ordered List',
    icon: BiListOl,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor: Editor) => editor.isActive('orderedList'),
  },
  {
    type: 'divider',
  },
  {
    type: 'button',
    label: 'Code',
    icon: BiCode,
    onClick: (editor: Editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor: Editor) => editor.isActive('code'),
  },
  {
    type: 'button',
    label: 'Code Block',
    icon: BiCodeBlock,
    onClick: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor: Editor) => editor.isActive('codeBlock'),
  },

  {
    type: 'button',
    label: 'Blockquote',
    icon: TbBlockquote,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor: Editor) => editor.isActive('blockquote'),
  },
  {
    type: 'divider',
  },
  {
    type: 'button',
    label: 'Horizontal Rule',
    icon: VscHorizontalRule,
    onClick: (editor: Editor) =>
      editor.chain().focus().setHorizontalRule().run(),
  },
  // {
  //   label: 'Hard Break',
  //   icon: 'text-wrap',
  //   onClick: (editor: Editor) => editor.chain().focus().setHardBreak().run(),
  // },
  {
    type: 'button',
    label: 'Clear Format',
    icon: MdFormatClear,
    onClick: (editor: Editor) =>
      editor.chain().focus().clearNodes().unsetAllMarks().run(),
  },
  {
    type: 'button',
    label: 'Undo',
    icon: BiUndo,
    onClick: (editor: Editor) => editor.chain().focus().undo().run(),
  },
  {
    type: 'button',
    label: 'Redo',
    icon: BiRedo,
    onClick: (editor: Editor) => editor.chain().focus().redo().run(),
  },
]

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  return (
    <Wrap
      p="0.25rem"
      shouldWrapChildren
      bg="grey.50"
      borderColor="base.divider.strong"
      borderWidth="1px 1px 0 1px"
      borderTopRadius="sm"
    >
      {MENU_BUTTONS.map((button, index) => {
        if (button.type === 'divider') {
          return (
            <Divider
              orientation="vertical"
              borderColor="base.divider.strong"
              h="2.75rem"
              key={`rtm-divider-${index}`}
            />
          )
        }
        const { onClick, label, icon, isActive } = button
        return (
          <Tooltip label={label} key={label}>
            <IconButton
              variant="clear"
              colorScheme="neutral"
              aria-label={label}
              onClick={() => onClick(editor)}
              isActive={isActive?.(editor)}
              icon={<Icon as={icon} />}
            />
          </Tooltip>
        )
      })}
    </Wrap>
  )
}
