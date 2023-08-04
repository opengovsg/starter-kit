import { Tooltip } from '@chakra-ui/react'
import { IconButton } from '@opengovsg/design-system-react'
import { useState, type MouseEventHandler, useEffect } from 'react'
import { BiLink } from 'react-icons/bi'

interface CopyActionProps {
  postId: string
}

export const CopyAction = ({ postId }: CopyActionProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [isOpen])

  const handleCopyLink: MouseEventHandler = async (e) => {
    setIsOpen(true)
    e.stopPropagation()
    const url = `${window.location.origin}/thread/${postId}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <Tooltip label="Link copied!" hasArrow isOpen={isOpen}>
      <IconButton
        onMouseLeave={() => setIsOpen(false)}
        data-value="post-action"
        aria-label="Link to post"
        icon={<BiLink fontSize="1.25rem" />}
        onClick={handleCopyLink}
      />
    </Tooltip>
  )
}
