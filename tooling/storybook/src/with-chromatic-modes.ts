import type { ChromaticModeKey } from './modes'
import { modes } from './modes'
import type { ViewportKey } from './viewports'

export const withChromaticModes = (args: ChromaticModeKey[]) => {
  const modesArr = [...new Set(args)]
  const result: Partial<Record<ChromaticModeKey, { viewport: ViewportKey }>> =
    {}

  for (const mode of modesArr) {
    // Only want to preserve width, and not height for Chromatic snapshots.
    result[mode] = { viewport: modes[mode].viewport }
  }

  return { modes: result }
}
