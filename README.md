# Santinho 2026 — Veltarc

App gratuito para o eleitor montar seu santinho digital (Eleições Gerais 2026).
Não usa banco de dados: os santinhos ficam salvos no `localStorage` do aparelho.
Dados e fotos: TSE (Repositório de Dados Eleitorais), já incluídos em `public/`.

## Requisitos
- Node.js 20.9 ou superior
- npm 10+

## Rodar localmente
```bash
npm install
npm run dev        # http://localhost:3000
```

## Produção (servidor Node / VPS)
```bash
npm ci
npm run build
npm start          # porta 3000 (use PORT=8080 npm start para mudar)
```

### Opção standalone (mais leve, sem node_modules no servidor)
```bash
npm ci && npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
# envie a pasta .next/standalone para o servidor e rode:
node server.js
```

### Docker
```bash
docker build -t santinho-2026 .
docker run -p 3000:3000 santinho-2026
```

## Variáveis de ambiente (opcional)
- `SITE_URL` — URL pública do site (usada nas imagens de compartilhamento). Ex.: `https://santinho.veltarc.com.br`

## Estrutura
- `app/` — páginas (início, santinho, busca por cargo)
- `hooks/` — `useSantinhos` (localStorage) e `useCandidatos` (carrega JSON por UF)
- `public/data/uf/{uf}.json` — candidatos por estado; `br.json` = Presidente
- `public/fotos/{SQ_CANDIDATO}.webp` — fotos oficiais do TSE
