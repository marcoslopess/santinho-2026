'use client'

import { useState, useEffect } from 'react'
import { useSantinhos } from '@/hooks/use-santinhos'
import { Container } from '@/components/layouts/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FadeIn, Stagger, StaggerItem, HoverLift } from '@/components/ui/animate'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UF_NAMES } from '@/types/candidato'
import type { Santinho } from '@/types/candidato'
import { Plus, FileText, Trash2, Pencil, Vote, Users, ChevronRight, MapPin, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const UF_LIST = Object.keys(UF_NAMES).filter((u) => u !== 'BR').sort()

export function HomeClient() {
  const router = useRouter()
  const { santinhos, loaded, criarSantinho, renomearSantinho, excluirSantinho } = useSantinhos()
  const [novoNome, setNovoNome] = useState('')
  const [novoUf, setNovoUf] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoNome, setEditandoNome] = useState('')
  const [criarDialogOpen, setCriarDialogOpen] = useState(false)
  const [excluirId, setExcluirId] = useState<string | null>(null)

  const handleCriar = () => {
    if (!novoUf) {
      toast.error('Selecione um estado')
      return
    }
    const id = criarSantinho(novoNome || 'Meu Santinho', novoUf)
    toast.success('Santinho criado!')
    setNovoNome('')
    setNovoUf('')
    setCriarDialogOpen(false)
    router.push(`/santinho/${id}`)
  }

  const handleRenomear = () => {
    if (editandoId && editandoNome?.trim()) {
      renomearSantinho(editandoId, editandoNome)
      toast.success('Santinho renomeado!')
      setEditandoId(null)
      setEditandoNome('')
    }
  }

  const handleExcluir = () => {
    if (excluirId) {
      excluirSantinho(excluirId)
      toast.success('Santinho excluído')
      setExcluirId(null)
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Vote className="w-10 h-10 text-primary" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <Container size="lg">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg santinho-gradient flex items-center justify-center">
                <Vote className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">Santinho 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">por Veltarc</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="hero-gradient py-12 sm:py-20">
        <Container size="md">
          <FadeIn>
            <div className="text-center">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Calendar className="w-3 h-3" />
                Eleições 2026 — 4 de outubro
              </motion.div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                Monte seu <span className="text-primary">santinho</span> digital
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
                Pesquise candidatos, salve seus favoritos e consulte no dia da votação.
                Seus dados ficam salvos apenas neste aparelho.
              </p>
              <Dialog open={criarDialogOpen} onOpenChange={setCriarDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 text-base">
                    <Plus className="w-5 h-5" />
                    Criar novo santinho
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Novo santinho</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Nome do santinho</label>
                      <Input
                        placeholder="Ex: Meu Santinho, Santinho da Mãe..."
                        value={novoNome}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoNome(e?.target?.value ?? '')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Estado (UF)</label>
                      <Select value={novoUf} onValueChange={setNovoUf}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {UF_LIST.map((uf: string) => (
                            <SelectItem key={uf} value={uf}>
                              {uf} — {UF_NAMES[uf] ?? uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleCriar}>Criar santinho</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Santinhos list */}
      <section className="py-8 sm:py-12">
        <Container size="md">
          {(santinhos?.length ?? 0) === 0 ? (
            <FadeIn>
              <Card className="text-center py-12 border-dashed">
                <CardContent>
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-1">Nenhum santinho ainda</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Crie seu primeiro santinho para começar a montar sua lista de candidatos.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Seus santinhos
                </h2>
                <Badge variant="secondary">{santinhos?.length ?? 0}</Badge>
              </div>
              <Stagger className="grid gap-3 sm:gap-4">
                {(santinhos ?? []).map((s: Santinho) => (
                  <StaggerItem key={s?.id}>
                    <HoverLift>
                      <Card variant="interactive" className="overflow-hidden">
                        <div className="flex items-stretch">
                          <button
                            className="flex-1 text-left p-4 sm:p-5 flex items-center gap-4 hover:bg-accent/50 transition-colors"
                            onClick={() => router.push(`/santinho/${s?.id}`)}
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg santinho-gradient flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold truncate">{s?.nome ?? 'Santinho'}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {s?.uf ?? '?'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {s?.candidatos?.length ?? 0} candidato{(s?.candidatos?.length ?? 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </button>
                          <div className="flex flex-col border-l">
                            <button
                              className="flex-1 px-3 hover:bg-accent/50 transition-colors flex items-center justify-center"
                              onClick={() => {
                                setEditandoId(s?.id ?? null)
                                setEditandoNome(s?.nome ?? '')
                              }}
                              title="Renomear"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              className="flex-1 px-3 hover:bg-destructive/10 transition-colors flex items-center justify-center border-t"
                              onClick={() => setExcluirId(s?.id ?? null)}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <Container size="md">
          <div className="text-center text-xs text-muted-foreground">
            <p>Santinho 2026 — Ferramenta gratuita por <span className="font-semibold text-foreground">Veltarc</span></p>
            <p className="mt-1">Dados do TSE — Repositório de Dados Eleitorais</p>
          </div>
        </Container>
      </footer>

      {/* Rename Dialog */}
      <Dialog open={!!editandoId} onOpenChange={(open: boolean) => !open && setEditandoId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear santinho</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editandoNome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditandoNome(e?.target?.value ?? '')}
              placeholder="Novo nome"
              onKeyDown={(e: React.KeyboardEvent) => e?.key === 'Enter' && handleRenomear()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleRenomear}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!excluirId} onOpenChange={(open: boolean) => !open && setExcluirId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir santinho?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Essa ação é irreversível. Todos os candidatos salvos neste santinho serão perdidos.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleExcluir}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
