/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Candidato } from "@/types/candidato";
import { CARGOS_VOTAVEIS } from "@/types/candidato";

const cache: Record<string, Candidato[]> = {};

export function useCandidatos(uf: string) {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uf) {
      setCandidatos([]);
      return;
    }

    const key = uf?.toLowerCase();
    if (cache[key]) {
      setCandidatos(cache[key] ?? []);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const carregar = (arquivo: string) =>
      fetch(`/data/uf/${arquivo}.json`).then((res) => {
        if (!res?.ok) throw new Error("Erro ao carregar candidatos");
        return res.json() as Promise<Candidato[]>;
      });

    // Presidente fica no arquivo nacional (BR)
    Promise.all([carregar(key), carregar("br")])
      .then(([estaduais, nacionais]) => {
        if (cancelled) return;
        const data = [...(estaduais ?? []), ...(nacionais ?? [])];
        // Filter only votable positions
        // O TSE às vezes publica o mesmo candidato duas vezes (mesmo cargo e número): mantém um.
        const vistos = new Set<string>();
        const votaveis = (data ?? []).filter((c: Candidato) => {
          if (!(CARGOS_VOTAVEIS as readonly string[]).includes(c?.DS_CARGO ?? "")) return false;
          const chave = `${c.DS_CARGO}|${c.NR_CANDIDATO}`;
          if (vistos.has(chave)) return false;
          vistos.add(chave);
          return true;
        });
        cache[key] = votaveis;
        setCandidatos(votaveis);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message ?? "Erro desconhecido");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uf]);

  const partidos = useMemo(() => {
    const set = new Set<string>();
    (candidatos ?? []).forEach((c: Candidato) => {
      if (c?.SG_PARTIDO) set.add(c.SG_PARTIDO);
    });
    return Array.from(set).sort();
  }, [candidatos]);

  const cargos = useMemo(() => {
    const set = new Set<string>();
    (candidatos ?? []).forEach((c: Candidato) => {
      if (c?.DS_CARGO) set.add(c.DS_CARGO);
    });
    const order = CARGOS_VOTAVEIS as readonly string[];
    return Array.from(set).sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [candidatos]);

  const filtrar = useCallback(
    (cargo?: string, partido?: string, busca?: string) => {
      let resultado = candidatos ?? [];
      if (cargo) {
        resultado = resultado.filter((c: Candidato) => c?.DS_CARGO === cargo);
      }
      if (partido) {
        resultado = resultado.filter((c: Candidato) => c?.SG_PARTIDO === partido);
      }
      if (busca && busca?.trim()) {
        const term = busca.trim().toLowerCase();
        resultado = resultado.filter((c: Candidato) => {
          const nome = (c?.NM_URNA_CANDIDATO ?? "").toLowerCase();
          const nomeCompleto = (c?.NM_CANDIDATO ?? "").toLowerCase();
          const numero = String(c?.NR_CANDIDATO ?? "");
          return nome?.includes(term) || nomeCompleto?.includes(term) || numero?.includes(term);
        });
      }
      return [...resultado].sort((a, b) =>
        (a?.NM_URNA_CANDIDATO ?? "").localeCompare(b?.NM_URNA_CANDIDATO ?? "", "pt-BR", { sensitivity: "base" }),
      );
    },
    [candidatos],
  );

  return { candidatos, loading, error, partidos, cargos, filtrar };
}
