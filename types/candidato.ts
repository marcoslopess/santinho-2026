export interface Candidato {
  id: string
  SG_UF: string
  DS_CARGO: string
  NM_CANDIDATO: string
  NM_URNA_CANDIDATO: string
  NR_CANDIDATO: string
  SG_PARTIDO: string
  NM_PARTIDO: string
  TP_AGREMIACAO: string
  NM_COLIGACAO: string
  DS_GENERO: string
  DS_COR_RACA: string
  DS_GRAU_INSTRUCAO: string
  DS_OCUPACAO: string
  CD_CARGO: string
}

export interface Santinho {
  id: string
  nome: string
  uf: string
  candidatos: CandidatoSalvo[]
  criadoEm: string
  atualizadoEm: string
}

export interface CandidatoSalvo {
  id: string
  nome: string
  nomeUrna: string
  numero: string
  cargo: string
  partido: string
}

export interface UfIndex {
  ufs: string[]
  contagem: Record<string, number>
}

export const CARGOS_VOTAVEIS = [
  'PRESIDENTE',
  'GOVERNADOR',
  'SENADOR',
  'DEPUTADO FEDERAL',
  'DEPUTADO ESTADUAL',
  'DEPUTADO DISTRITAL',
] as const

/** Cargos na ordem em que aparecem na urna, com o número máximo de escolhas. */
export const CARGOS_URNA: { cargo: string; max: number }[] = [
  { cargo: 'DEPUTADO FEDERAL', max: 1 },
  { cargo: 'DEPUTADO ESTADUAL', max: 1 },
  { cargo: 'DEPUTADO DISTRITAL', max: 1 },
  { cargo: 'SENADOR', max: 2 },
  { cargo: 'GOVERNADOR', max: 1 },
  { cargo: 'PRESIDENTE', max: 1 },
]

export function cargosDaUf(uf: string) {
  return CARGOS_URNA.filter(({ cargo }) =>
    uf === 'DF' ? cargo !== 'DEPUTADO ESTADUAL' : cargo !== 'DEPUTADO DISTRITAL'
  )
}

export function maxEscolhas(cargo: string): number {
  return CARGOS_URNA.find((c) => c.cargo === cargo)?.max ?? 1
}

export function fotoUrl(id: string): string {
  return `/fotos/${id}.webp`
}

export const CARGO_LABELS: Record<string, string> = {
  'PRESIDENTE': 'Presidente',
  'VICE-PRESIDENTE': 'Vice-Presidente',
  'GOVERNADOR': 'Governador',
  'VICE-GOVERNADOR': 'Vice-Governador',
  'SENADOR': 'Senador',
  'DEPUTADO FEDERAL': 'Deputado Federal',
  'DEPUTADO ESTADUAL': 'Deputado Estadual',
  'DEPUTADO DISTRITAL': 'Deputado Distrital',
  '1º SUPLENTE': '1º Suplente',
  '2º SUPLENTE': '2º Suplente',
}

export const UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina',
  SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins', BR: 'Brasil',
}
