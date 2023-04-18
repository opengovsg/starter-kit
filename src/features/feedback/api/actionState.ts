import { atom } from 'jotai'
import { type RouterOutput } from '~/utils/trpc'

type ActionState = {
  post: RouterOutput['post']['byId'] | null
  state: 'edit' | 'delete' | null
}

const INITIAL_STATE: ActionState = {
  post: null,
  state: null,
}

export const actionStateAtom = atom<ActionState>(INITIAL_STATE)

export const resetActionAtom = atom(null, (_get, set) => {
  set(actionStateAtom, INITIAL_STATE)
})
