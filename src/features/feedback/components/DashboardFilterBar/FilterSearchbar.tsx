import { Box } from '@chakra-ui/react'
import { Searchbar } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

export const FilterSearchbar = (): JSX.Element => {
  const router = useRouter()
  const handleSearch = useCallback(
    (value: string) => {
      router.push(`/search?q=${value}`)
    },
    [router]
  )

  return (
    <Box maxW="20rem" w="100%">
      <Searchbar
        placeholder="Search posts and comments..."
        isExpanded
        onSearch={handleSearch}
      />
    </Box>
  )
}
