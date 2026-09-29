'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Santinho, CandidatoSalvo } from '@/types/candidato'
import { maxEscolhas } from '@/types/candidato'

const STORAGE_KEY = 'santinho2026_santinhos'

function loadSantinhos(): Santinho[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage?.getItem?.(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) ?? []
  } catch {
    return []
  }
}

function saveSantinhos(santinhos: Santinho[]): void {
  try {
    localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(santinhos ?? []))
  } catch {
    // storage full or unavailable
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function useSantinhos() {
  const [santinhos, setSantinhos] = useState<Santinho[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSantinhos(loadSantinhos())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      saveSantinhos(santinhos)
    }
  }, [santinhos, loaded])

  const criarSantinho = useCallback((nome: string, uf: string): string => {
    const id = generateId()
    const now = new Date().toISOString()
    const novo: Santinho = {
      id,
      nome: nome?.trim() || 'Meu Santinho',
      uf,
      candidatos: [],
      criadoEm: now,
      atualizadoEm: now,
    }
    setSantinhos((prev) => [...(prev ?? []), novo])
    return id
  }, [])

  const renomearSantinho = useCallback((id: string, novoNome: string) => {
    setSantinhos((prev) =>
      (prev ?? []).map((s: Santinho) =>
        s?.id === id ? { ...(s ?? {}), nome: novoNome?.trim() || s?.nome || 'Santinho', atualizadoEm: new Date().toISOString() } : s
      )
    )
  }, [])

  const excluirSantinho = useCallback((id: string) => {
    setSantinhos((prev) => (prev ?? []).filter((s: Santinho) => s?.id !== id))
  }, [])

  const adicionarCandidato = useCallback((santinhoId: string, candidato: CandidatoSalvo) => {
    setSantinhos((prev) =>
      (prev ?? []).map((s: Santinho) => {
        if (s?.id !== santinhoId) return s
        const lista = s?.candidatos ?? []
        if (lista.some((c: CandidatoSalvo) => c?.id === candidato?.id)) return s
        const max = maxEscolhas(candidato.cargo)
        let mesmoCargo = lista.filter((c) => c.cargo === candidato.cargo)
        const outros = lista.filter((c) => c.cargo !== candidato.cargo)
        // Cargo com escolha única: substitui. Senador (2): mantém os mais recentes.
        while (mesmoCargo.length >= max) mesmoCargo = mesmoCargo.slice(1)
        return {
          ...(s ?? {}),
          candidatos: [...outros, ...mesmoCargo, candidato],
          atualizadoEm: new Date().toISOString(),
        }
      })
    )
  }, [])

  const removerCandidato = useCallback((santinhoId: string, candidatoId: string) => {
    setSantinhos((prev) =>
      (prev ?? []).map((s: Santinho) => {
        if (s?.id !== santinhoId) return s
        return {
          ...(s ?? {}),
          candidatos: (s?.candidatos ?? []).filter((c: CandidatoSalvo) => c?.id !== candidatoId),
          atualizadoEm: new Date().toISOString(),
        }
      })
    )
  }, [])

  const getSantinho = useCallback((id: string): Santinho | undefined => {
    return (santinhos ?? []).find((s: Santinho) => s?.id === id)
  }, [santinhos])

  return {
    santinhos: santinhos ?? [],
    loaded,
    criarSantinho,
    renomearSantinho,
    excluirSantinho,
    adicionarCandidato,
    removerCandidato,
    getSantinho,
  }
}
