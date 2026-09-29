import type { CandidatoSalvo } from "@/types/candidato";
import { CARGO_LABELS, fotoUrl } from "@/types/candidato";

const W = 1080;
const H = 1920;

function carregarImagem(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function cortar(ctx: CanvasRenderingContext2D, texto: string, largura: number) {
  let t = texto;
  while (t.length > 1 && ctx.measureText(t).width > largura) t = t.slice(0, -1);
  return t === texto ? t : t.trimEnd() + "…";
}

export async function gerarImagemSantinho(opts: {
  nome: string;
  ufNome: string;
  cargos: { cargo: string; escolhidos: CandidatoSalvo[] }[];
  site: string;
}): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Fundo roxo Veltarc
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#7c3aed");
  grad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Cabeçalho
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText("SANTINHO 2026", 80, 90);
  ctx.font = "bold 72px sans-serif";
  ctx.fillText(cortar(ctx, opts.nome, W - 160), 80, 160);
  ctx.globalAlpha = 0.8;
  ctx.font = "40px sans-serif";
  ctx.fillText(opts.ufNome, 80, 250);
  ctx.globalAlpha = 1;

  // Candidatos (máx. 6: dep. fed., dep. est./dist., 2 senadores, gov., pres.)
  const itens = opts.cargos.flatMap((c) => c.escolhidos.map((e) => ({ label: CARGO_LABELS[c.cargo] ?? c.cargo, e })));
  let y = 340;
  for (const { label, e } of itens.slice(0, 6)) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(60, y, W - 120, 200, 28);
    ctx.fill();

    const foto = await carregarImagem(fotoUrl(e.id));
    if (foto) {
      ctx.drawImage(foto, 90, y + 20, 120, 160);
    } else {
      ctx.fillStyle = "#ede9fe";
      ctx.fillRect(90, y + 20, 120, 160);
    }

    ctx.fillStyle = "#6b7280";
    ctx.font = "600 30px sans-serif";
    ctx.fillText(label.toUpperCase(), 240, y + 24);
    ctx.fillStyle = "#7c3aed";
    ctx.font = "bold 76px monospace";
    ctx.fillText(e.numero, 240, y + 62);
    ctx.fillStyle = "#111827";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(cortar(ctx, `${e.nomeUrna} · ${e.partido}`, W - 360), 240, y + 146);
    y += 225;
  }

  // Rodapé com referência à Veltarc
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "32px sans-serif";
  ctx.fillText("Monte o seu santinho grátis em", W / 2, 1730);
  ctx.font = "bold 38px sans-serif";
  ctx.fillText(opts.site, W / 2, 1775);
  ctx.globalAlpha = 0.85;
  ctx.font = "28px sans-serif";
  ctx.fillText("Uma ferramenta Veltarc", W / 2, 1845);
  ctx.globalAlpha = 1;

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem"))), "image/png"),
  );
}
