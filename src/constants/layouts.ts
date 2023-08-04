export const APP_GRID_TEMPLATE_COLUMN = {
  base: 'repeat(4, 1fr)',
  md: 'repeat(10, 1fr)',
}
export const APP_GRID_COLUMN = { base: '1 / 5', md: '1 / 12', lg: '3 / 8' }

export const ADMIN_NAVBAR_HEIGHT = '3.5rem'

export const ADMIN_DASHBAR_WIDTHS = {
  base: '2.75rem',
  md: '10.5rem',
  lg: '13.5rem',
}

export const APP_GRID_TEMPLATE_AREA = {
  base: `${ADMIN_NAVBAR_HEIGHT} 1fr / ${ADMIN_DASHBAR_WIDTHS.base} 1fr`,
  md: `${ADMIN_NAVBAR_HEIGHT} 1fr / ${ADMIN_DASHBAR_WIDTHS.md} 1fr`,
  lg: `${ADMIN_NAVBAR_HEIGHT} 1fr / ${ADMIN_DASHBAR_WIDTHS.lg} 1fr`,
}
