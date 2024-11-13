import type { SVGProps } from 'react'
import { forwardRef, memo } from 'react'
import { chakra } from '@chakra-ui/react'

const MemoSingpassFullLogo = memo(
  forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
    <svg
      viewBox="0 0 73 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      {...props}
    >
      <g clipPath="url(#clip0_981_45529)">
        <path
          d="M4.11846 13.1432C2.11097 13.1432 0.690398 12.4589 0.0683594 11.8831L1.40069 9.90323C2.23522 10.6231 3.26595 10.9835 4.11846 10.9835C4.84674 10.9835 5.16633 10.7673 5.16633 10.3713C5.16633 10.0656 4.91786 9.83115 4.13646 9.65141L2.55565 9.27365C1.00998 8.91241 0.281703 7.95805 0.281703 6.64418C0.281703 4.84402 1.70228 3.78198 3.816 3.78198C5.44992 3.78198 6.76427 4.28565 7.4043 4.86225L6.07196 6.84218C5.48591 6.30203 4.63339 5.90606 3.816 5.90606C3.14085 5.90606 2.83926 6.14052 2.83926 6.50003C2.83926 6.85953 3.15884 7.05841 3.76289 7.20168L5.34369 7.56206C6.95962 7.92244 7.74187 8.80385 7.74187 10.1004C7.74187 11.9544 6.37356 13.1432 4.11846 13.1432ZM13.6033 12.9626H16.2679V8.12044C16.2679 6.93248 16.836 6.19435 17.9378 6.19435C18.9857 6.19435 19.5367 6.80656 19.5367 8.12044V12.9634H22.2013V7.43615C22.2013 5.02377 21.0112 3.78198 18.9685 3.78198C17.7964 3.78198 16.9079 4.25004 16.2688 5.16792V4.59219C16.2688 4.1962 16.0383 3.96174 15.6467 3.96174H13.6041V12.9626H13.6033ZM33.0004 3.96174V11.7564C33.0004 15.1405 30.8335 16.4908 28.1689 16.4908C26.3927 16.4908 24.9181 16.0227 24.0305 15.2125L25.4159 13.1241C26.0021 13.6998 26.9436 14.2226 28.1689 14.2226C29.5364 14.2226 30.3358 13.3403 30.3358 12.1167V11.541C29.6965 12.3512 28.7729 12.7107 27.636 12.7107C25.4871 12.7107 23.6219 10.8029 23.6219 8.24635C23.6219 5.68982 25.4871 3.78198 27.636 3.78198C28.7729 3.78198 29.7316 4.21444 30.3358 5.13232V4.59219C30.3358 4.1962 30.5671 3.96174 30.9577 3.96174H33.0004ZM30.4248 8.24635C30.4248 7.07664 29.5543 6.15788 28.3471 6.15788C27.2282 6.15788 26.3224 7.07577 26.3224 8.24635C26.3224 9.41606 27.2282 10.3348 28.3471 10.3348C29.5543 10.3348 30.4248 9.41606 30.4248 8.24635ZM44.6521 8.46258C44.6521 11.2353 42.7867 13.1432 40.4776 13.1432C39.2696 13.1432 38.3109 12.7828 37.6177 11.9735V16.2763H34.9531V3.96174H36.9964C37.3872 3.96174 37.6185 4.1962 37.6185 4.59219V5.13232C38.2756 4.21444 39.2704 3.78198 40.4785 3.78198C42.7876 3.78198 44.6521 5.68982 44.6521 8.46258ZM41.9522 8.46258C41.9522 7.11224 41.0107 6.15788 39.7674 6.15788C38.5063 6.15788 37.5295 7.11224 37.5295 8.46258C37.5295 9.81291 38.5063 10.7673 39.7674 10.7673C41.0114 10.7664 41.9522 9.81206 41.9522 8.46258ZM55.4871 3.96174V12.9626H52.8225V11.7928C52.1654 12.7107 51.1706 13.1432 49.9625 13.1432C47.6535 13.1432 45.7881 11.2353 45.7881 8.46258C45.7881 5.68982 47.6535 3.78198 49.9625 3.78198C51.1706 3.78198 52.1654 4.21444 52.8225 5.13232V4.59219C52.8225 4.1962 53.0538 3.96174 53.4446 3.96174H55.4871ZM52.9115 8.46258C52.9115 7.11224 51.9348 6.15788 50.6736 6.15788C49.4303 6.15788 48.4888 7.11224 48.4888 8.46258C48.4888 9.81291 49.4303 10.7673 50.6736 10.7673C51.9348 10.7664 52.9115 9.81206 52.9115 8.46258ZM60.8876 13.1432C63.1436 13.1432 64.511 11.9552 64.511 10.1012C64.511 8.80473 63.7296 7.92332 62.1127 7.56294L60.5319 7.20256C59.9279 7.05841 59.6083 6.86041 59.6083 6.50089C59.6083 6.14138 59.91 5.90692 60.585 5.90692C61.4025 5.90692 62.255 6.30291 62.841 6.84303L64.1735 4.86312C63.5342 4.28738 62.2199 3.78285 60.585 3.78285C58.4714 3.78285 57.0507 4.84489 57.0507 6.64506C57.0507 7.95891 57.779 8.91327 59.3247 9.27365L60.9055 9.65141C61.6869 9.83115 61.9354 10.0656 61.9354 10.3713C61.9354 10.7673 61.6159 10.9835 60.8876 10.9835C60.035 10.9835 59.0051 10.6231 58.1698 9.90323L56.8375 11.8831C57.4595 12.4589 58.88 13.1432 60.8876 13.1432ZM69.3064 13.1432C71.5624 13.1432 72.9299 11.9552 72.9299 10.1012C72.9299 8.80473 72.1485 7.92332 70.5317 7.56294L68.9509 7.20256C68.3468 7.05841 68.0272 6.86041 68.0272 6.50089C68.0272 6.14138 68.3288 5.90692 69.004 5.90692C69.8214 5.90692 70.6739 6.30291 71.2599 6.84303L72.5924 4.86312C71.9531 4.28738 70.6389 3.78285 69.004 3.78285C66.8903 3.78285 65.4697 4.84489 65.4697 6.64506C65.4697 7.95891 66.1979 8.91327 67.7437 9.27365L69.3245 9.65141C70.1058 9.83115 70.3543 10.0656 70.3543 10.3713C70.3543 10.7673 70.0347 10.9835 69.3064 10.9835C68.4539 10.9835 67.424 10.6231 66.5887 9.90323L65.2564 11.8831C65.8785 12.4589 67.2998 13.1432 69.3064 13.1432Z"
          fill="currentColor"
        />
        <path
          d="M10.3711 6.84176C11.2416 6.84176 11.9168 6.15746 11.9168 5.27518C11.9168 4.3929 11.2416 3.70862 10.3711 3.70862C9.50057 3.70862 8.82542 4.3929 8.82542 5.27518C8.82626 6.15746 9.50057 6.84176 10.3711 6.84176ZM8.70117 12.9621H12.0401L11.3298 7.36364C10.7969 7.52605 9.94439 7.52605 9.41145 7.36364L8.70117 12.9621Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )),
)

export const SingpassFullLogo = chakra(MemoSingpassFullLogo)
