import {
  Avatar,
  HStack,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';

export interface ConsentAccountRowProps {
  /** If not provided, will show loading state */
  accountId?: string;
}

export const ConsentAccountRow = ({
  accountId,
}: ConsentAccountRowProps): JSX.Element => {
  return (
    <HStack spacing="0.75rem" px="1rem" py="0.5rem" w="100%">
      <SkeletonCircle isLoaded={!!accountId}>
        <Avatar size="xs" name={accountId} />
      </SkeletonCircle>
      <Skeleton isLoaded={!!accountId} w={0} flex={1}>
        <Text textStyle="body-1" isTruncated>
          {accountId ?? 'loading@example.com'}
        </Text>
      </Skeleton>
    </HStack>
  );
};
