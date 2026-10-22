import { useState } from 'react'
import { FilmIcon } from '../icons/FilmIcon'

interface Props {
  src: string
  className: string
  icon: number
}

export function Poster({ src, className, icon }: Props) {
  const [failed, setFailed] = useState('')
  const shown = src && failed !== src

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden bg-white/6 text-text-2 ${className}`}>
      {shown ? (
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(src)} className="size-full object-cover" />
      ) : (
        <FilmIcon size={icon} />
      )}
    </span>
  )
}
