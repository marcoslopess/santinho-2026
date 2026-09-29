/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSantinhos } from "@/hooks/use-santinhos";
import { useCandidatos } from "@/hooks/use-candidatos";
import { Container } from "@/components/layouts/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/ui/animate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidatoFoto } from "@/components/candidato-foto";
import type { Candidato, CandidatoSalvo } from "@/types/candidato";
import { CARGO_LABELS, UF_NAMES, maxEscolhas } from "@/types/candidato";
import { ArrowLeft, Search, Vote, X, Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

export function BuscarClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const santinhoId = searchParams?.get("santinho") ?? "";
  const cargo = searchParams?.get("cargo") ?? "";

  const { loaded, adicionarCandidato, removerCandidato, getSantinho } = useSantinhos();
  const santinho = santinhoId ? getSantinho(santinhoId) : undefined;
  const uf = santinho?.uf ?? "";
  const max = maxEscolhas(cargo);
  const cargoLabel = CARGO_LABELS[cargo] ?? cargo;

  const { loading, error, candidatos, filtrar } = useCandidatos(uf);

  const [partidoRaw, setPartidoRaw] = useState("");
  const partido = partidoRaw === "__all__" ? "" : partidoRaw;
  const [busca, setBusca] = useState("");

  const voltar = () => router.push(`/santinho/${santinhoId}`);

  useEffect(() => {
    if (loaded && santinho && !cargo) router.replace(`/santinho/${santinhoId}`);
  }, [loaded, santinho, cargo, santinhoId, router]);

  const partidosDoCargo = useMemo(() => {
    const set = new Set<string>();
    (candidatos ?? []).forEach((c: Candidato) => {
      if (c?.DS_CARGO === cargo && c?.SG_PARTIDO) set.add(c.SG_PARTIDO);
    });
    return Array.from(set).sort();
  }, [candidatos, cargo]);

  const resultados = useMemo(
    () => (cargo ? filtrar(cargo, partido || undefined, busca || undefined) : []),
    [filtrar, cargo, partido, busca],
  );

  const escolhidos = useMemo(
    () => (santinho?.candidatos ?? []).filter((c: CandidatoSalvo) => c?.cargo === cargo),
    [santinho, cargo],
  );
  const escolhidosIds = useMemo(() => new Set(escolhidos.map((c) => c.id)), [escolhidos]);

  const handleSelecionar = (c: Candidato) => {
    if (!santinhoId) return;
    if (escolhidosIds.has(c?.id)) {
      removerCandidato(santinhoId, c?.id);
      toast("Candidato removido");
      return;
    }
    if (max > 1 && escolhidos.length >= max) {
      toast.error(`Você já escolheu ${max} candidatos para ${cargoLabel}. Remova um para escolher outro.`);
      return;
    }
    const salvo: CandidatoSalvo = {
      id: c?.id ?? "",
      nome: c?.NM_CANDIDATO ?? "",
      nomeUrna: c?.NM_URNA_CANDIDATO ?? "",
      numero: String(c?.NR_CANDIDATO ?? ""),
      cargo: c?.DS_CARGO ?? "",
      partido: c?.SG_PARTIDO ?? "",
    };
    adicionarCandidato(santinhoId, salvo);
    const agora = max === 1 ? 1 : escolhidos.length + 1;
    if (agora >= max) {
      toast.success(`${c?.NM_URNA_CANDIDATO} escolhido para ${cargoLabel}!`);
      voltar();
    } else {
      toast.success(`1º voto escolhido. Escolha o ${agora + 1}º candidato para ${cargoLabel}.`);
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
        <p className="text-muted-foreground text-sm text-center">
          O santinho pode ter sido excluído ou o link é inválido.
        </p>
        <Button onClick={() => router.push("/")}>Voltar ao início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <Container size="lg">
          <div className="flex items-center gap-3 h-14 sm:h-16">
            <Button variant="ghost" size="icon" onClick={voltar}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm sm:text-base truncate">{cargoLabel}</h1>
              <p className="text-xs text-muted-foreground truncate">
                {santinho?.nome} · {UF_NAMES[uf] ?? uf}
              </p>
            </div>
            <Badge variant={escolhidos.length >= max ? "default" : "secondary"}>
              {escolhidos.length}/{max}
            </Badge>
          </div>
        </Container>
      </header>

      <div className="border-b bg-muted/30">
        <Container size="lg">
          <div className="py-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              {max > 1
                ? `Para ${cargoLabel} você vota em ${max} candidatos.`
                : `Escolha 1 candidato para ${cargoLabel}.`}
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou número..."
                value={busca}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e?.target?.value ?? "")}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={partidoRaw} onValueChange={setPartidoRaw}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os partidos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos os partidos</SelectItem>
                  {partidosDoCargo.map((p: string) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(partido || busca) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPartidoRaw("");
                    setBusca("");
                  }}
                  className="gap-1 text-muted-foreground"
                >
                  <X className="w-3 h-3" /> Limpar
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container size="lg" className="py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 mx-auto text-destructive mb-3" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">{resultados?.length ?? 0}</span> candidato
              {(resultados?.length ?? 0) !== 1 ? "s" : ""} para {cargoLabel}
            </p>

            {(resultados?.length ?? 0) === 0 ? (
              <FadeIn>
                <Card className="text-center py-12 border-dashed">
                  <CardContent>
                    <Search className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">Nenhum candidato encontrado com esses filtros.</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {resultados?.map((c: Candidato) => {
                  const selecionado = escolhidosIds.has(c?.id);
                  return (
                    <Card
                      key={c?.id}
                      className={`transition-all ${selecionado ? "ring-2 ring-primary bg-primary/5" : ""}`}
                    >
                      <button
                        className="w-full text-left p-3 flex items-center gap-3"
                        onClick={() => handleSelecionar(c)}
                      >
                        <CandidatoFoto id={c?.id} nome={c?.NM_URNA_CANDIDATO} className="w-14 sm:w-16" />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono font-bold text-xl text-primary leading-none">{c?.NR_CANDIDATO}</p>
                          <h3 className="font-semibold text-sm sm:text-base truncate mt-1">
                            {c?.NM_URNA_CANDIDATO ?? "Sem nome"}
                          </h3>
                          <Badge variant="outline" className="text-[10px] py-0 mt-1">
                            {c?.SG_PARTIDO ?? ""}
                          </Badge>
                        </div>
                        {selecionado ? (
                          <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground/40 shrink-0" />
                        )}
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
