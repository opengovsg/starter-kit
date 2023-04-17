import { atom } from 'jotai'

type ActionState = {
  postId: string | null
  state: 'edit' | 'delete' | null
}

const INITIAL_STATE: ActionState = {
  postId: null,
  state: null,
}

export const actionStateAtom = atom<ActionState>(INITIAL_STATE)

export const resetActionAtom = atom(null, (_get, set) => {
  set(actionStateAtom, INITIAL_STATE)
})
