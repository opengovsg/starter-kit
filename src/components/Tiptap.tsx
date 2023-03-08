import { Tag } from '@opengovsg/design-system-react';
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapProps {
  value: string;
  onChange: (contentHtml: string) => void;
}

export const Tiptap = ({ value, onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <>
      {editor && (
        <BubbleMenu tippyOptions={{ duration: 100 }} editor={editor}>
          <Tag
            cursor="pointer"
            borderRightRadius={0}
            onClick={() => editor.chain().focus().toggleBold().run()}
            colorScheme={editor.isActive('bold') ? 'main' : 'sub'}
          >
            Bold
          </Tag>
          <Tag
            cursor="pointer"
            borderRadius={0}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            colorScheme={editor.isActive('italic') ? 'main' : 'sub'}
          >
            Italic
          </Tag>
          <Tag
            cursor="pointer"
            borderLeftRadius={0}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            colorScheme={editor.isActive('strike') ? 'main' : 'sub'}
          >
            Strike
          </Tag>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu tippyOptions={{ duration: 100 }} editor={editor}>
          <Tag
            cursor="pointer"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            colorScheme={
              editor.isActive('heading', { level: 1 }) ? 'main' : 'sub'
            }
            borderRightRadius={0}
          >
            H1
          </Tag>
          <Tag
            cursor="pointer"
            borderRadius={0}
            colorScheme={
              editor.isActive('heading', { level: 2 }) ? 'main' : 'sub'
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </Tag>
          <Tag
            cursor="pointer"
            borderLeftRadius={0}
            colorScheme={editor.isActive('bulletList') ? 'main' : 'sub'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            Bullet List
          </Tag>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </>
  );
};
