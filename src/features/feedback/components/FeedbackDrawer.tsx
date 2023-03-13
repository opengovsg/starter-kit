import {
  Avatar,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { RichText } from '~/components/RichText';
import { RouterOutput, trpc } from '~/utils/trpc';
import { FeedbackCommentRichText } from './FeedbackCommentRichText';

type PostByIdOutput = Pick<
  RouterOutput['post']['byId'],
  'author' | 'contentHtml' | 'createdAt'
>;

const FeedbackComment = ({ post }: { post?: PostByIdOutput }) => {
  return (
    <Stack direction="row">
      <Avatar src={post?.author.image ?? undefined} size="xs" />
      <Box flex={1}>
        <Stack>
          <RichText
            sx={{
              '.ProseMirror': {
                minH: 'auto',
              },
            }}
            defaultValue={post?.contentHtml}
            isReadOnly
          />
          <Text textStyle="caption-2" color="base.content.medium">
            {`${post?.author.name}, ${post?.createdAt}`}
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
};

export const FeedbackDrawer = (): JSX.Element | null => {
  const router = useRouter();
  const feedbackId = Number(router.query.feedbackId);

  const isOpen = !!feedbackId;

  const utils = trpc.useContext();

  const setReadMutation = trpc.readPost.set.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate();
    },
  });

  const { data, isLoading } = trpc.post.byId.useQuery(
    { id: feedbackId },
    {
      enabled: isOpen,
      onSuccess: () => setReadMutation.mutate({ id: feedbackId }),
    },
  );

  const handleCloseDrawer = useCallback(() => {
    delete router.query.feedbackId;
    router.push(router);
  }, [router]);

  if (!data) return null;

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      size="lg"
      onClose={handleCloseDrawer}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">{data?.author.name}</DrawerHeader>

        <DrawerBody>
          <FeedbackComment post={data} />
          <Stack spacing="1.5rem">
            {data?.comments.map((comment) => (
              <FeedbackComment key={comment.id} post={comment} />
            ))}
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <FeedbackCommentRichText
            postId={data.id}
            handleCancel={handleCloseDrawer}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
