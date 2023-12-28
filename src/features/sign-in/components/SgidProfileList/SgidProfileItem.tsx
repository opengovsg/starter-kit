import { Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { BiChevronRight } from 'react-icons/bi'

import { type RouterOutput } from '~/utils/trpc'

interface SgidProfileItemProps {
  profile: RouterOutput['auth']['sgid']['listStoredProfiles'][number]
  onClick: () => void
}

export const SgidProfileItem = ({ profile, onClick }: SgidProfileItemProps) => {
  return (
    <Button
      variant="reverse"
      h="auto"
      px="1rem"
      py="1.5rem"
      justifyContent="space-between"
      onClick={onClick}
      rightIcon={<BiChevronRight fontSize="1.5rem" />}
    >
      <Stack textAlign="start" color="base.content.medium">
        <Text textStyle="subhead-2" color="base.content.strong">
          {profile.work_email}
        </Text>
        <Text textStyle="caption-2">
          {[profile.agency_name, profile.department_name].join(', ')}
        </Text>
        <Text textStyle="caption-2">{profile.employment_title}</Text>
      </Stack>
    </Button>
  )
}
