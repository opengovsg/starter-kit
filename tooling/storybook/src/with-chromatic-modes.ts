import type { ChromaticModeKey } from './modes'
import { modes } from './modes'

export const withChromaticModes = (args: ChromaticModeKey[]) => {
  const modesArr = [...new Set(args)]
  const result: Partial<typeof modes> = {}

  for (const mode of modesArr) {
    // Only want to preserve width, and not height for Chromatic snapshots.
    result[mode] = modes[mode]
  }

  return { modes: result }
}
