import {
  chakra,
  Container,
  Flex,
  FormControl,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  Button,
  FormErrorMessage,
  FormLabel,
} from '@opengovsg/design-system-react';
import { useRouter } from 'next/router';
import { Controller } from 'react-hook-form';
import { FeedbackNavbar } from '~/features/feedback/components';
import { useZodForm } from '~/lib/form';
import { NextPageWithAuthAndLayout } from '~/lib/types';
import { addPostSchema } from '~/server/schemas/post';
import { trpc } from '~/utils/trpc';
import Image from 'next/image';

import feedbackUncleSvg from '~/features/feedback/assets/feedback-uncle.svg';
import { RichText } from '~/components/RichText';

const PostFeedbackPage: NextPageWithAuthAndLayout = () => {
  const utils = trpc.useContext();

  const router = useRouter();

  const mutation = trpc.post.add.useMutation({
    async onSuccess({ id }) {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
      router.push(`/feedback/${id}`);
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useZodForm({
    schema: addPostSchema,
  });

  const handleSubmitFeedback = handleSubmit((values) =>
    mutation.mutate(values),
  );

  return (
    <Flex flexDir="column" bg="base.canvas.brand-subtle" minH="$100vh">
      <FeedbackNavbar />
      <Container flex={1} p="1rem" maxW="45rem">
        <HStack justify="space-between">
          <VStack align="start">
            <Text textStyle="h5" color="base.content.strong">
              Write feedback
            </Text>
            <Text textStyle="subhead-2" mb="2.5rem">
              Share your concerns and ideas directly with your organization.
            </Text>
          </VStack>
          <Image src={feedbackUncleSvg} aria-hidden alt="Feedback uncle" />
        </HStack>
        <chakra.form
          borderWidth="1px"
          borderRadius="lg"
          onSubmit={handleSubmitFeedback}
          bg="white"
          py="2.5rem"
          px="3.5rem"
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
              render={({ field }) => <RichText {...field} />}
            />
            <FormErrorMessage>{errors.contentHtml?.message}</FormErrorMessage>
          </FormControl>
          <Button
            mt="2.5rem"
            type="submit"
            isLoading={mutation.isLoading}
            isFullWidth
          >
            Submit feedback
          </Button>
        </chakra.form>
      </Container>
    </Flex>
  );
};

PostFeedbackPage.auth = true;

export default PostFeedbackPage;
