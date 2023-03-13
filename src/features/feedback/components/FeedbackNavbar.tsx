import { Flex, HStack } from '@chakra-ui/react';
import { Button } from '@opengovsg/design-system-react';

import { AppBreadcrumbs } from '~/components/AppBreadcrumbs';

const transformBreadcrumbLabel = (label: string) => {
  switch (label) {
    case 'feedback':
      return '';
    case 'new':
      return 'New feedback';
    default:
      return label;
  }
};

export const FeedbackNavbar = (): JSX.Element => {
  return (
    <Flex
      justify="space-between"
      align="center"
      px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
      py="0.75rem"
      bg="white"
      borderBottomWidth="1px"
    >
      <AppBreadcrumbs
        transformLabel={transformBreadcrumbLabel}
        rootLabel="All feedback"
      />
      <HStack textStyle="subhead-1" spacing={{ base: '0.75rem', md: '1.5rem' }}>
        <Button variant="outline">Save as draft</Button>
      </HStack>
    </Flex>
  );
};
