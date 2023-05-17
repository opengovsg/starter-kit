import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { AvatarUpload } from '~/features/settings/components/AvatarUpload'
import { useZodForm } from '~/lib/form'
import { NextPageWithLayout } from '~/lib/types'
import { updateMeSchema } from '~/schemas/me'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import { trpc } from '~/utils/trpc'

import {
  Link,
  useToast,
  FormLabel as DFormLabel,
} from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { BiAt, BiLeftArrowAlt } from 'react-icons/bi'
import { PROFILE } from '~/lib/routes'
import { AppGrid } from '~/templates/AppGrid'
import { registerWithDebounce } from '~/utils/registerWithDebounce'
import { z } from 'zod'
import { isEmpty } from 'lodash'
import { useMe } from '~/features/me/api'

const PROFILE_GRID_TEMPLATE_COLUMN = {
  base: 'repeat(4, 1fr)',
  md: 'repeat(10, 1fr)',
}
const PROFILE_GRID_COLUMN = { base: '1 / 5', md: '2/10', lg: '3 / 7' }

const Profile: NextPageWithLayout = () => {
  const { me } = useMe()
  const utils = trpc.useContext()
  const toast = useToast({
    status: 'success',
  })

  const usernameExistsMutation = trpc.profile.checkUsernameExists.useMutation()

  const updateMutation = trpc.me.update.useMutation({
    async onSuccess() {
      toast({
        description: 'Profile updated successfully.',
      })
      await utils.me.get.invalidate()
    },
    onError: (err) => {
      toast({
        status: 'error',
        description: err.message,
      })
    },
  })

  const {
    formState: { errors },
    handleSubmit,
    register,
    trigger,
  } = useZodForm({
    schema: updateMeSchema.extend({
      username: z
        .string()
        .nonempty({
          message: 'Username is required',
        })
        .refine(
          async (val) => {
            if (!val) return false
            if (val === me?.username) return true
            const exists = await usernameExistsMutation.mutateAsync(val)
            return !exists
          },
          { message: 'That username has been taken. Please choose another.' }
        ),
    }),
    values: useMemo(() => {
      return {
        username: me?.username ?? '',
        name: me?.name ?? '',
        bio: me?.bio ?? '',
      }
    }, [me]),
  })

  const handleProfileUpdate = handleSubmit((values) =>
    updateMutation.mutate(values)
  )

  return (
    <Box w="100%">
      <AppGrid
        templateColumns={PROFILE_GRID_TEMPLATE_COLUMN}
        bg="base.canvas.brand-subtle"
        py="1rem"
      >
        <Link
          gridColumn={PROFILE_GRID_COLUMN}
          size="sm"
          variant="standalone"
          as={NextLink}
          href={`${PROFILE}/${me?.username}`}
        >
          <Icon
            as={BiLeftArrowAlt}
            aria-hidden
            fontSize="1.25rem"
            mr="0.25rem"
          />
          Back to your profile
        </Link>
      </AppGrid>
      <AppGrid
        templateColumns={PROFILE_GRID_TEMPLATE_COLUMN}
        bg="white"
        py="1.5rem"
      >
        <Stack flex={1} spacing="2rem" gridColumn={PROFILE_GRID_COLUMN}>
          <AvatarUpload url={me?.image} name={me?.name} />
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input isDisabled value={me?.email ?? ''} />
          </FormControl>
          <FormControl id="name" isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <Icon color="interaction.neutral.default" as={BiAt} />
              </InputLeftElement>
              <Input
                {...registerWithDebounce('username', 500, trigger, register)}
              />
            </InputGroup>
            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
          </FormControl>
          <FormControl id="name" isInvalid={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Input {...register('name')} />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl id="title" isInvalid={!!errors.bio}>
            <FormLabel optionalIndicator={<DFormLabel.OptionalIndicator />}>
              Bio
            </FormLabel>
            <Textarea {...register('bio')} />
            <FormErrorMessage>{errors.bio?.message}</FormErrorMessage>
          </FormControl>
          <ButtonGroup justifyContent="end">
            <Button
              isDisabled={!isEmpty(errors)}
              onClick={handleProfileUpdate}
              isLoading={updateMutation.isLoading}
            >
              Save user profile
            </Button>
          </ButtonGroup>
        </Stack>
      </AppGrid>
    </Box>
  )
}

Profile.getLayout = AdminLayout

export default Profile
