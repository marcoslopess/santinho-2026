import { Suspense } from 'react'
import { BuscarClient } from './_components/buscar-client'
import { Vote } from 'lucide-react'

function BuscarLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <Vote className="w-10 h-10 text-primary" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<BuscarLoading />}>
      <BuscarClient />
    </Suspense>
  )
}
