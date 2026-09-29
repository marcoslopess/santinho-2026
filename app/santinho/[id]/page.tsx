import { SantinhoClient } from './_components/santinho-client'

export default async function SantinhoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SantinhoClient santinhoId={id} />
}
