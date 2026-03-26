'use client'

import { memo } from 'react'

const FONT = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace"

interface Props {
  content: string
}

export default memo(function TextFileView({ content }: Props) {
  return (
    <div style={{
      padding: '12px 16px',
      fontFamily: FONT,
      fontSize: 11,
      lineHeight: 1.75,
      color: 'rgba(196,181,253,0.82)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      minHeight: 120,
    }}>
      {content}
    </div>
  )
})
