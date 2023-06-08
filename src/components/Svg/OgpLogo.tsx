import { chakra } from '@chakra-ui/react'
import { type SVGProps } from 'react'

const _OgpLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    {...props}
  >
    <g mask="url(#mask0)">
      <path
        fill="currentColor"
        d="M10.7 25.6c.1-.2.1-.3 0-.5 0-.1-.1-.3-.2-.3-2.8-1.9-4.6-5.1-4.6-8.8 0-3.7 1.8-6.9 4.6-8.8.1 0 .2-.2.2-.3.1-.2.1-.3 0-.5L9.5 4.3l-.2-.2S9.2 4 9.1 4h-.2c-.1 0-.2.1-.3.1C4.8 6.6 2.3 11 2.3 16s2.5 9.4 6.3 11.9c.1 0 .2.1.3.1h.2c.1 0 .2-.1.2-.1l.2-.2 1.2-2.1Z"
      />
    </g>
    <path
      fill="currentColor"
      d="m22.6 4.3-1.1 2.1c-.1.2-.1.3-.1.5 0 .1.1.3.2.3 2.8 1.9 4.7 5.1 4.7 8.8 0 3.7-1.9 6.9-4.7 8.8-.1 0-.2.2-.2.3 0 .2 0 .3.1.5l1.1 2.1.2.2c.1 0 .2.1.2.1h.3c.1 0 .1-.1.2-.1 3.8-2.5 6.3-6.9 6.3-11.9s-2.5-9.4-6.3-11.9c-.1 0-.1-.1-.2-.1H23s-.1.1-.2.1l-.2.2"
    />
  </svg>
)

export const OgpLogo = chakra(_OgpLogo)
