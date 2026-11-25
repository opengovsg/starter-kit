import { useState } from 'react'

import { useSignInWizard } from './context'

export const useNewCodeChallenge = () => {
  const { newChallenge } = useSignInWizard()
  const [pending, setPending] = useState(false)

  const create = async (): Promise<string | undefined> => {
    setPending(true)
    let codeChallenge: string | undefined

    try {
      codeChallenge = await newChallenge()
    } catch (error) {
      console.error(error)
    }

    setPending(false)

    return codeChallenge
  }

  return { create, pending }
}
