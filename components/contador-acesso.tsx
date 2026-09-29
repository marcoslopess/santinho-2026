"use client";

import { useEffect } from "react";

export function ContadorAcesso() {
  useEffect(() => {
    if (sessionStorage.getItem("acesso_registrado")) return;
    let id = localStorage.getItem("visitante_id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("visitante_id", id);
    }
    sessionStorage.setItem("acesso_registrado", "1");
    fetch("/api/acessos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitanteId: id }),
    }).catch(() => {});
  }, []);
  return null;
}
