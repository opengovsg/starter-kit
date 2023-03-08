import { Box, Container, FormControl, Text } from '@chakra-ui/react';
import {
  Button,
  FormErrorMessage,
  FormLabel,
  Textarea,
} from '@opengovsg/design-system-react';
import { Controller } from 'react-hook-form';
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs';
import { Tiptap } from '~/components/Tiptap';
import { useZodForm } from '~/lib/form';
import { NextPageWithAuthAndLayout } from '~/lib/types';
import { addPostSchema } from '~/server/schemas/post';
import { trpc } from '~/utils/trpc';

const transformBreadcrumbLabel = (label: string) => {
  switch (label) {
    case 'feedback':
      return 'New feedback';
    default:
      return label;
  }
};

const PostFeedbackPage: NextPageWithAuthAndLayout = () => {
  const utils = trpc.useContext();

  const mutation = trpc.post.add.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useZodForm({
    schema: addPostSchema,
  });

  return (
    <Box>
      <AppBreadcrumbs
        transformLabel={transformBreadcrumbLabel}
        rootLabel="All feedback"
      />
      <Container>
        <Text textStyle="h5" color="base.content.strong">
          Write feedback
        </Text>
        <Text textStyle="subhead-2" mb="2.5rem">
          Share your concerns and ideas directly with your organization.
        </Text>
        <form
          onSubmit={handleSubmit(async (values) => {
            console.log('submitting', values);
            await mutation.mutateAsync(values);
            reset();
          })}
        >
          <FormControl
            id="feedback"
            isRequired
            isInvalid={!!errors.contentHtml}
          >
            <FormLabel>What&apos;s on your mind?</FormLabel>
            <Controller
              control={control}
              name="contentHtml"
              render={({ field }) => <Tiptap {...field} />}
            />
            <FormErrorMessage>{errors.contentHtml?.message}</FormErrorMessage>
          </FormControl>
          <Button type="submit" isLoading={mutation.isLoading}>
            Submit feedback
          </Button>
        </form>
      </Container>
    </Box>
  );
};

PostFeedbackPage.auth = true;

export default PostFeedbackPage;
