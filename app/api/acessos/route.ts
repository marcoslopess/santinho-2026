import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export const dynamic = "force-dynamic";

// Registra um acesso
export async function POST(req: Request) {
  try {
    const { visitanteId } = await req.json();
    if (typeof visitanteId !== "string" || visitanteId.length > 40) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await pool.execute("INSERT INTO acessos (visitante_id) VALUES (?)", [visitanteId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro ao registrar acesso", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Consulta o contador: /api/acessos?chave=SUA_CHAVE
export async function GET(req: Request) {
  const chave = new URL(req.url).searchParams.get("chave");
  if (!process.env.ACESSOS_CHAVE || chave !== process.env.ACESSOS_CHAVE) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  const [rows] = await pool.query(`
    SELECT
      COUNT(DISTINCT visitante_id) AS pessoas,
      COUNT(*) AS acessos,
      COUNT(DISTINCT CASE WHEN DATE(criado_em) = CURDATE() THEN visitante_id END) AS pessoas_hoje
    FROM acessos`);
  return NextResponse.json((rows as any[])[0]);
}
