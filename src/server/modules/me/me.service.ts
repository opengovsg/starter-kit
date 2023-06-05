import { init } from '@paralleldrive/cuid2'
// 202176 generations before 50% chance of collision using square root approximation
// sqrt(36^5)*26)
const cuidLen6 = init({ length: 6 })

export const generateUsername = (prefix: string) => {
  return `${prefix.replace(/\s/g, '')}${cuidLen6()}`
}
