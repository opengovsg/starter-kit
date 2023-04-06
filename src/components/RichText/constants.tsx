export const TIP_TAP_STYLES = {
  '.ProseMirror': {
    textStyle: 'body-2',
    outline: 'none',
    fontSize: 'md',
    minH: '10rem',
    'ul, ol': {
      padding: '0 1rem',
    },
    'p.is-editor-empty:first-of-type::before': {
      color: 'interaction.support.placeholder',
      content: 'attr(data-placeholder)',
      float: 'left',
      height: 0,
      pointerEvents: 'none',
    },
    h1: {
      lineHeight: 1.5,
      fontSize: '1.5rem',
      fontWeight: 600,
      mb: '0.5rem',
    },
    h2: {
      lineHeight: 1.3,
      fontSize: '1.3rem',
      fontWeight: 500,
      mb: '0.2rem',
    },
    code: {
      bg: 'rgb(20, 20, 20, 1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '0.1rem 0.2rem',
      borderRadius: '0.4rem',
      marginX: '0.2rem',
      color: 'orange.500',
    },
    pre: {
      bg: '#0d0d0d',
      borderRadius: '0.4rem',
      color: 'white',
      fontFamily: 'monospace',
      padding: '0.75rem 1rem',
      code: {
        color: 'inherit',
        border: 'none',
        bg: 'none',
        padding: 0,
      },
    },
    mark: {
      bg: 'yellow.400',
    },
    hr: {
      my: '1rem',
    },
    blockquote: {
      borderLeft: '2px solid',
      borderColor: 'base.divider.strong',
      paddingLeft: '1rem',
    },
    'li, ul': {
      paddingLeft: '0.5rem',
      marginLeft: '0.5rem',
    },
    a: {
      color: 'blue.400',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  '.ProseMirror-focused': {
    outline: 'none',
  },
}
