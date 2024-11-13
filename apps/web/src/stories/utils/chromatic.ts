import { modes } from './modes'

export const withChromaticModes = (args: (keyof typeof modes)[]) => {
  const modesArr = Array.from(new Set(args))
  return {
    modes: modesArr.reduce(
      (acc, mode) => {
        return {
          ...acc,
          // Only want to preserve width, and not height for Chromatic snapshots.
          [mode]: modes[mode],
        }
      },
      {} as Partial<typeof modes>,
    ),
  }
}
