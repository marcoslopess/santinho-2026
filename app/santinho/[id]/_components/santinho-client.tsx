"use client";

import { useMemo } from "react";
import { useSantinhos } from "@/hooks/use-santinhos";
import { Container } from "@/components/layouts/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/animate";
import { CandidatoFoto } from "@/components/candidato-foto";
import type { CandidatoSalvo } from "@/types/candidato";
import { CARGO_LABELS, UF_NAMES, cargosDaUf } from "@/types/candidato";
import {
  ArrowLeft,
  Plus,
  Vote,
  Trash2,
  Share2,
  MapPin,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  MessageCircle,
  Instagram,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { gerarImagemSantinho } from "@/lib/gerar-imagem-santinho";

interface SantinhoClientProps {
  santinhoId: string;
}

export function SantinhoClient({ santinhoId }: SantinhoClientProps) {
  const router = useRouter();
  const { loaded, removerCandidato, getSantinho } = useSantinhos();
  const santinho = getSantinho(santinhoId);
  const uf = santinho?.uf ?? "";

  const cargos = useMemo(() => {
    return cargosDaUf(uf).map(({ cargo, max }) => ({
      cargo,
      max,
      escolhidos: (santinho?.candidatos ?? []).filter((c: CandidatoSalvo) => c?.cargo === cargo),
    }));
  }, [santinho, uf]);

  const totalVagas = cargos.reduce((acc, c) => acc + c.max, 0);
  const totalEscolhidos = cargos.reduce((acc, c) => acc + Math.min(c.escolhidos.length, c.max), 0);

  const abrirBusca = (cargo: string) => {
    router.push(`/buscar?santinho=${santinhoId}&cargo=${encodeURIComponent(cargo)}`);
  };

  const montarTexto = () => {
    const linhas = cargos
      .filter((c) => c.escolhidos.length > 0)
      .map((c) => {
        const items = c.escolhidos
          .map((e) => `  *${e?.numero ?? ""}* — ${e?.nomeUrna ?? ""} (${e?.partido ?? ""})`)
          .join("\n");
        return `*${CARGO_LABELS[c.cargo] ?? c.cargo}*\n${items}`;
      })
      .join("\n\n");
    return `🗳️ *Meu Santinho 2026 — ${santinho?.nome ?? ""}*\n${UF_NAMES[uf] ?? uf}\n\n${linhas}\n\n👉 Monte o seu grátis: ${window.location.origin}\n_Uma ferramenta Veltarc_`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(montarTexto())}`, "_blank");
  };

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(montarTexto());
      toast.success("Texto copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleInstagram = async () => {
    if (!santinho) return;
    if (totalEscolhidos === 0) {
      toast.error("Escolha pelo menos um candidato antes de gerar a imagem.");
      return;
    }
    try {
      toast("Gerando imagem...");
      const blob = await gerarImagemSantinho({
        nome: santinho.nome,
        ufNome: UF_NAMES[uf] ?? uf,
        cargos,
        site: window.location.host,
      });
      const file = new File([blob], "santinho-2026.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Meu Santinho 2026" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "santinho-2026.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada! Poste nos seus Stories.");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        console.error(e);
        toast.error("Não foi possível gerar a imagem");
      }
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Vote className="w-10 h-10 text-primary" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!santinho) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="font-display text-xl font-bold">Santinho não encontrado</h1>
        <p className="text-muted-foreground text-sm text-center">O santinho pode ter sido excluído.</p>
        <Button onClick={() => router.push("/")}>Voltar ao início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <Container size="lg">
          <div className="flex items-center gap-3 h-14 sm:h-16">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm sm:text-base truncate">{santinho?.nome ?? "Santinho"}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {UF_NAMES[uf] ?? uf}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Compartilhar">
                  <Share2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" /> Enviar no WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleInstagram}>
                  <Instagram className="w-4 h-4 mr-2" /> Imagem para Instagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopiar}>
                  <Copy className="w-4 h-4 mr-2" /> Copiar texto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Container>
      </header>

      <Container size="md" className="py-6 sm:py-8">
        <div className="space-y-6">
          <FadeIn>
            <div className="santinho-gradient rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Vote className="w-5 h-5" />
                  <span className="font-display font-bold text-sm">Santinho 2026</span>
                </div>
                <Badge className="bg-white/20 text-white border-0 text-xs">{UF_NAMES[uf] ?? uf}</Badge>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mt-2">{santinho?.nome ?? "Santinho"}</h2>
              <p className="text-white/80 text-sm mt-1">
                {totalEscolhidos} de {totalVagas} votos escolhidos · na ordem da urna
              </p>
            </div>
          </FadeIn>

          {cargos.map(({ cargo, max, escolhidos }, idx) => {
            const completo = escolhidos.length >= max;
            return (
              <FadeIn key={cargo} delay={idx * 0.04}>
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-bold text-base sm:text-lg">{CARGO_LABELS[cargo] ?? cargo}</h3>
                    <Badge variant={completo ? "default" : "secondary"} className="text-xs">
                      {escolhidos.length}/{max} {max > 1 ? "votos" : "voto"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {escolhidos.map((c: CandidatoSalvo) => (
                      <Card key={c?.id} className="overflow-hidden">
                        <div className="flex items-stretch">
                          <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
                            <CandidatoFoto id={c?.id} nome={c?.nomeUrna} className="w-14 sm:w-16" />
                            <div className="min-w-0 flex-1">
                              <p className="font-mono font-bold text-2xl sm:text-3xl text-primary leading-none">
                                {c?.numero}
                              </p>
                              <h4 className="font-semibold text-sm sm:text-base truncate mt-1">
                                {c?.nomeUrna ?? "Sem nome"}
                              </h4>
                              <Badge variant="outline" className="text-[10px] py-0 mt-1">
                                {c?.partido ?? ""}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col border-l">
                            <button
                              className="flex-1 px-3 sm:px-4 hover:bg-accent/60 transition-colors flex items-center justify-center"
                              onClick={() => abrirBusca(cargo)}
                              title="Trocar"
                            >
                              <RefreshCw className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              className="flex-1 px-3 sm:px-4 border-t hover:bg-destructive/10 transition-colors flex items-center justify-center"
                              onClick={() => {
                                removerCandidato(santinhoId, c?.id);
                                toast("Candidato removido");
                              }}
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {!completo && (
                      <button
                        onClick={() => abrirBusca(cargo)}
                        className="w-full rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors p-4 flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            Escolher {CARGO_LABELS[cargo] ?? cargo}
                            {max > 1 ? ` (${escolhidos.length + 1}º voto)` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">Toque para buscar candidatos</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </section>
              </FadeIn>
            );
          })}
        </div>
      </Container>

      <footer className="border-t py-6 mt-8">
        <Container size="md">
          <div className="text-center text-xs text-muted-foreground">
            <p>
              Santinho 2026 — Ferramenta gratuita por <span className="font-semibold text-foreground">Veltarc</span>
            </p>
            <p className="mt-1">Dados e fotos do TSE — Repositório de Dados Eleitorais</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
