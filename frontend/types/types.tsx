export interface Plano {
  [x: string]: unknown;
  id: string | number;
  originalName: string;
  filePath: string;
  objetivos: string;
  atividades: string;
  avaliacao: string;
}
