'use client'

import { useState } from 'react'
import { fotoUrl } from '@/types/candidato'
import { cn } from '@/lib/utils'

interface CandidatoFotoProps {
  id: string
  nome: string
  className?: string
}

function iniciais(nome: string) {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase() || '?'
}

export function CandidatoFoto({ id, nome, className }: CandidatoFotoProps) {
  const [erro, setErro] = useState(false)
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-lg bg-muted aspect-[3/4]', className)}>
      {!erro && id ? (
        <img
          src={fotoUrl(id)}
          alt={`Foto de ${nome}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setErro(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-muted-foreground">
          {iniciais(nome)}
        </div>
      )}
    </div>
  )
}
