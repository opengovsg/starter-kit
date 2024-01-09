import {
  ButtonGroup,
  Flex,
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
import { AvatarUpload } from '~/features/settings/components'
import { useZodForm } from '~/lib/form'
import { type NextPageWithLayout } from '~/lib/types'
import { updateMeSchema } from '~/schemas/me'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import { trpc } from '~/utils/trpc'

import {
  FormLabel as DFormLabel,
  useToast,
} from '@opengovsg/design-system-react'
import { isEmpty } from 'lodash'
import { BiAt } from 'react-icons/bi'
import isEmail from 'validator/lib/isEmail'
import { z } from 'zod'
import { BackBannerLink } from '~/components/BackBannerLink'
import { ResponsiveButton } from '~/components/ResponsiveButton'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { useMe } from '~/features/me/api'
import { PROFILE } from '~/lib/routes'
import { AppGrid } from '~/templates/AppGrid'
import { registerWithDebounce } from '~/utils/registerWithDebounce'

const Profile: NextPageWithLayout = () => {
  const { me } = useMe()
  const utils = trpc.useContext()
  const toast = useToast({
    status: 'success',
  })

  const usernameExistsMutation = trpc.profile.checkUsernameExists.useMutation()
  const emailExistsMutation = trpc.profile.checkEmailExists.useMutation()

  const updateMutation = trpc.me.update.useMutation({
    async onSuccess(updatedUser) {
      toast({
        description: 'Profile updated successfully.',
      })
      await utils.me.get.invalidate()
      if (updatedUser.username) {
        await utils.profile.byUsername.invalidate({
          username: updatedUser.username,
        })
      }
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
          { message: 'That username has been taken. Please choose another.' },
        ),
      email: z
        .string()
        .trim()
        .min(1, 'Please enter an email address.')
        .email({ message: 'Please enter a valid email address.' })
        .refine(
          async (val) => {
            if (!val || !isEmail(val)) return false
            if (val === me?.email) return true
            const exists = await emailExistsMutation.mutateAsync(val)
            return !exists
          },
          {
            message:
              'That email has already been registered with another account.',
          },
        ),
    }),
    values: useMemo(() => {
      return {
        email: me?.email ?? '',
        username: me?.username ?? '',
        name: me?.name ?? '',
        bio: me?.bio ?? '',
      }
    }, [me]),
  })

  const handleProfileUpdate = handleSubmit((values) =>
    updateMutation.mutate(values),
  )

  return (
    <Flex w="100%" flexDir="column">
      <AppGrid
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        bg="base.canvas.brand-subtle"
        py="1rem"
        px={{ base: '1rem', lg: 0 }}
      >
        <BackBannerLink
          gridColumn={APP_GRID_COLUMN}
          href={`${PROFILE}/${me?.username}`}
        >
          Back to your profile
        </BackBannerLink>
      </AppGrid>
      <AppGrid
        pb="2.5rem"
        bg="white"
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        flex={1}
        py="1.5rem"
        px={{ base: '1rem', lg: 0 }}
      >
        <Stack flex={1} spacing="2rem" gridColumn={APP_GRID_COLUMN}>
          <AvatarUpload url={me?.image} name={me?.name} />
          <FormControl id="email" isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input {...registerWithDebounce('email', 500, trigger, register)} />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
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
            <ResponsiveButton
              isDisabled={!isEmpty(errors)}
              onClick={handleProfileUpdate}
              isLoading={updateMutation.isLoading}
            >
              Save user profile
            </ResponsiveButton>
          </ButtonGroup>
        </Stack>
      </AppGrid>
    </Flex>
  )
}

Profile.getLayout = AdminLayout

export default Profile
