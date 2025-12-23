import { createRequire } from 'module'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Resolve @tailwindcss/postcss from the tailwind-config package where it's installed
const __dirname = dirname(fileURLToPath(import.meta.url))
const tailwindConfigPath = join(__dirname, '../../tooling/tailwind')
const require = createRequire(join(tailwindConfigPath, 'package.json'))

export default {
  plugins: {
    [require.resolve('@tailwindcss/postcss')]: {},
  },
}
