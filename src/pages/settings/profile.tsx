import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { AvatarUpload } from '~/features/settings/components'
import { useZodForm } from '~/lib/form'
import { type NextPageWithLayout } from '~/lib/types'
import { updateMeSchema } from '~/schemas/me'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import { trpc } from '~/utils/trpc'

import { useToast } from '@opengovsg/design-system-react'
import { isEmpty } from 'lodash'
import isEmail from 'validator/lib/isEmail'
import { z } from 'zod'
import { BackBannerLink } from '~/components/BackBannerLink'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { useMe } from '~/features/me/api'
import { HOME } from '~/lib/routes'
import { AppGrid } from '~/templates/AppGrid'
import { registerWithDebounce } from '~/utils/registerWithDebounce'

const Profile: NextPageWithLayout = () => {
  const { me } = useMe()
  const utils = trpc.useContext()
  const toast = useToast({
    status: 'success',
  })

  const emailExistsMutation = trpc.profile.checkEmailExists.useMutation()

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
          }
        ),
    }),
    values: useMemo(() => {
      return {
        email: me?.email ?? '',
        name: me?.name ?? '',
      }
    }, [me]),
  })

  const handleProfileUpdate = handleSubmit((values) =>
    updateMutation.mutate(values)
  )

  return (
    <Box w="100%">
      <AppGrid
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        bg="base.canvas.brand-subtle"
        py="1rem"
      >
        <BackBannerLink gridColumn={APP_GRID_COLUMN} href={HOME}>
          Back to home page
        </BackBannerLink>
      </AppGrid>
      <AppGrid
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        bg="white"
        py="1.5rem"
        px="1rem"
      >
        <Stack flex={1} spacing="2rem" gridColumn={APP_GRID_COLUMN}>
          <AvatarUpload url={me?.image} name={me?.name} />
          <FormControl id="email" isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input {...registerWithDebounce('email', 500, trigger, register)} />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>
          <FormControl id="name" isInvalid={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Input {...register('name')} />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
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
