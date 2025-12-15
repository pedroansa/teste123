// services/restrictions/types.ts
// DTOs e Types para o sistema de restrições hospitalares

// ============================================
// SELETORES DE ELEMENTOS
// ============================================

/**
 * Seletor básico por ID
 * Usado para: Mobiliário qualquer, porta, pilar, janela
 */
export interface SeletorId {
  value: string;
}

/**
 * Seletor com ID wrapper
 */
export interface SeletorComId {
  Id: SeletorId;
}

/**
 * Seletor de bordas de zona
 * Usado para: Parede qualquer
 */
export interface SeletorZoneEdges {
  id: string;
}

/**
 * Seletor de bordas adjacentes entre zonas
 * Usado para: Parede vizinha de ambiente
 */
export interface SeletorEdgesAdjacentToZone {
  id: string;
  adjacent_id: string;
}

/**
 * Seletor de portas adjacentes a zonas
 * Usado para: Porta vizinha de ambiente
 */
export interface SeletorDoorsAdjacentToZone {
  zones_ids_to_consider: string[];
}

// ============================================
// TIPOS DE SELETOR (UNION)
// ============================================

/**
 * Union type para todos os tipos de seletor de elemento
 */
export type ElementSelector =
  | { Id: SeletorId }
  | { ZoneEdges: SeletorZoneEdges }
  | { EdgesAdjacentToZone: SeletorEdgesAdjacentToZone }
  | { DoorsAdjacentToZone: SeletorDoorsAdjacentToZone };

/**
 * Tipos de seletor para uso no formulário
 */
export type TipoSeletor =
  | 'Id'
  | 'ZoneEdges'
  | 'EdgesAdjacentToZone'
  | 'DoorsAdjacentToZone';

// ============================================
// TIPOS DE OBJETO
// ============================================

export type TipoObjeto =
  | 'mobiliario_qualquer'
  | 'mobiliario_especifico'
  | 'parede_qualquer'
  | 'parede_vizinha'
  | 'porta_qualquer'
  | 'porta_vizinha'
  | 'pilar'
  | 'janela';

// ============================================
// CONFIGURAÇÃO DE LINHAS (LADOS)
// ============================================

/**
 * BackLines - Configuração de linha de encosto
 * Pode usar diferentes seletores dependendo do tipo de referência
 */
export type BackLines =
  | { ZoneEdges: SeletorZoneEdges }
  | { EdgesAdjacentToZone: SeletorEdgesAdjacentToZone }
  | { Id: SeletorId }
  | { DoorsAdjacentToZone: SeletorDoorsAdjacentToZone };

/**
 * Lados disponíveis para configuração
 */
export type Lado = 'back' | 'front' | 'right' | 'left';

/**
 * Tipo de referência para o lado
 */
export type TipoReferencia =
  | 'parede_qualquer'
  | 'parede_vizinha'
  | 'porta_qualquer'
  | 'porta_vizinha'
  | 'pilar'
  | 'janela'
  | 'mobiliario_qualquer'
  | 'mobiliario_especifico';

// ============================================
// SIDE FLAGS (para Visible/NotVisible)
// ============================================

/**
 * SideFlag enum values
 * Front = 1, Back = 2, Left = 4, Right = 8
 */
export enum SideFlag {
  Front = 1,
  Back = 2,
  Left = 4,
  Right = 8,
}

export type SideFlagCombination = number;


/**
 * Calcula o valor combinado dos lados selecionados
 */
export function calcularSideFlag(lados: Lado[]): number {
  let flag = 0;
  if (lados.includes('front')) flag |= SideFlag.Front;
  if (lados.includes('back')) flag |= SideFlag.Back;
  if (lados.includes('left')) flag |= SideFlag.Left;
  if (lados.includes('right')) flag |= SideFlag.Right;
  return flag;
}

/**
 * Converte um valor de flag para array de lados
 */
export function sideFlagToLados(flag: number): Lado[] {
  const lados: Lado[] = [];
  if (flag & SideFlag.Front) lados.push('front');
  if (flag & SideFlag.Back) lados.push('back');
  if (flag & SideFlag.Left) lados.push('left');
  if (flag & SideFlag.Right) lados.push('right');
  return lados;
}

// ============================================
// CONSTRAINT SIDEONANYLINE
// ============================================

/**
 * Estrutura interna do SideOnAnyLine
 */
export interface SideOnAnyLineData {
  object: ElementSelector;
  back_lines?: BackLines;
  front_lines?: BackLines;
  right_lines?: BackLines;
  left_lines?: BackLines;
}

/**
 * Constraint SideOnAnyLine completo
 */
export interface SideOnAnyLineConstraint {
  SideOnAnyLine: SideOnAnyLineData;
}

// ============================================
// CONSTRAINT VISIBLE / NOTVISIBLE
// ============================================

/**
 * ObjectPolygon para vision_field
 */
export interface ObjectPolygon {
  ObjectPolygon: {
    id: ElementSelector;
  };
}

/**
 * Estrutura interna do Visible/NotVisible
 */
export interface VisibleData {
  object: ElementSelector;
  lines: number; // SideFlag value
  lines_owner: ElementSelector;
  vision_field: ObjectPolygon;
}

/**
 * Constraint Visible completo
 */
export interface VisibleConstraint {
  Visible: VisibleData;
}

/**
 * Constraint NotVisible completo
 */
export interface NotVisibleConstraint {
  NotVisible: VisibleData;
}

// ============================================
// CONSTRAINT CIRCULATION
// ============================================

/**
 * Estrutura Any para Circulation objects
 */
export interface CirculationAny {
  Any: {
    value: ElementSelector[];
  };
}

/**
 * Estrutura interna do Circulation
 */
export interface CirculationData {
  objects: CirculationAny;
  gap: number;
}

/**
 * Constraint Circulation completo
 */
export interface CirculationConstraint {
  Circulation: CirculationData;
}

// ============================================
// UNION DE TODOS OS CONSTRAINTS
// ============================================

export type AnyConstraint =
  | SideOnAnyLineConstraint
  | VisibleConstraint
  | NotVisibleConstraint
  | CirculationConstraint;

export type TipoRestricao = 
  | 'SideOnAnyLine' 
  | 'Visible' 
  | 'NotVisible' 
  | 'Circulation';

// ============================================
// DTOs PARA API
// ============================================

/**
 * DTO completo para envio à API
 */
export interface RestricaoPosicionamentoDTO {
  tipo: TipoRestricao;
  constraint: AnyConstraint;
  metadata: {
    criado_via: string;
    criado_em: string;
    [key: string]: any;
  };
}

/**
 * Resposta da API
 */
export interface RestricaoAPIResponse {
  id: string;
  status: 'success' | 'error';
  created_at: string;
  message?: string;
}

// ============================================
// FORM STATE - SIDEONANYLINE
// ============================================

/**
 * Configuração de um lado do formulário
 */
export interface LadoFormConfig {
  ativo: boolean;
  tipoReferencia: TipoReferencia;
  ambiente?: string;
  ambienteVizinho?: string;
  zonasPorta?: string[];
  familyPath?: string;
}

/**
 * Estado do formulário SideOnAnyLine
 */
export interface SideOnAnyLineFormState {
  tipoObjeto: TipoObjeto;
  ambiente: string;
  familyPath?: string;
  ambienteVizinho?: string;
  zonasPorta?: string[];
  back: LadoFormConfig;
  front: LadoFormConfig;
  right: LadoFormConfig;
  left: LadoFormConfig;
}

// ============================================
// FORM STATE - VISIBLE
// ============================================

/**
 * Estado do formulário Visible/NotVisible
 */
export interface VisibleFormState {
  isVisible: boolean; // true = Visible, false = NotVisible
  ambiente: string;
  // Objeto que deve ver/não ver (ex: sofá)
  objetoTipo: TipoObjeto;
  objetoFamilyPath?: string;
  // Linhas do objeto a observar (ex: frente da TV)
  ladosSelecionados: Lado[];
  // Dono das linhas (ex: TV)
  linesOwnerTipo: TipoObjeto;
  linesOwnerFamilyPath?: string;
}

// ============================================
// FORM STATE - CIRCULATION
// ============================================

/**
 * Estado do formulário Circulation
 */
export interface CirculationFormState {
  ambiente: string;
  gap: number;
}

// ============================================
// FORM STATE GENÉRICO
// ============================================

/**
 * Estado do formulário para qualquer restrição (deprecated - use specific states)
 */
export interface RestrictionFormState extends SideOnAnyLineFormState {}

/**
 * Estado inicial do formulário SideOnAnyLine
 */
export const initialSideOnAnyLineFormState: SideOnAnyLineFormState = {
  tipoObjeto: 'mobiliario_qualquer',
  ambiente: '',
  back: { ativo: false, tipoReferencia: 'parede_qualquer' },
  front: { ativo: false, tipoReferencia: 'parede_qualquer' },
  right: { ativo: false, tipoReferencia: 'parede_qualquer' },
  left: { ativo: false, tipoReferencia: 'parede_qualquer' },
};

/**
 * Estado inicial do formulário Visible
 */
export const initialVisibleFormState: VisibleFormState = {
  isVisible: true,
  ambiente: '',
  objetoTipo: 'mobiliario_especifico',
  ladosSelecionados: [],
  linesOwnerTipo: 'mobiliario_especifico',
};

/**
 * Estado inicial do formulário Circulation
 */
export const initialCirculationFormState: CirculationFormState = {
  ambiente: '',
  gap: 100,
};

// Alias para compatibilidade
export const initialFormState = initialSideOnAnyLineFormState;

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  valido: boolean;
  erros: string[];
}

// ============================================
// CONSTANTES
// ============================================

export const TIPOS_OBJETO: { value: TipoObjeto; label: string }[] = [
  { value: 'mobiliario_qualquer', label: 'Mobiliário Qualquer' },
  { value: 'mobiliario_especifico', label: 'Mobiliário Específico' },
  { value: 'parede_qualquer', label: 'Parede Qualquer' },
  { value: 'parede_vizinha', label: 'Parede Vizinha' },
  { value: 'porta_qualquer', label: 'Porta Qualquer' },
  { value: 'porta_vizinha', label: 'Porta Vizinha' },
  { value: 'pilar', label: 'Pilar' },
  { value: 'janela', label: 'Janela' },
];

export const TIPOS_REFERENCIA: { value: TipoReferencia; label: string }[] = [
  { value: 'parede_qualquer', label: 'Parede Qualquer' },
  { value: 'parede_vizinha', label: 'Parede Vizinha de Ambiente' },
  { value: 'porta_qualquer', label: 'Porta Qualquer' },
  { value: 'porta_vizinha', label: 'Porta Vizinha de Ambiente' },
  { value: 'pilar', label: 'Pilar' },
  { value: 'janela', label: 'Janela' },
  { value: 'mobiliario_qualquer', label: 'Mobiliário Qualquer' },
  { value: 'mobiliario_especifico', label: 'Mobiliário Específico' },
];

export const LADOS: { value: Lado; label: string }[] = [
  { value: 'back', label: 'Traseira (Back)' },
  { value: 'front', label: 'Frontal (Front)' },
  { value: 'right', label: 'Direita (Right)' },
  { value: 'left', label: 'Esquerda (Left)' },
];

export const TIPOS_RESTRICAO: { value: TipoRestricao; label: string }[] = [
  { value: 'SideOnAnyLine', label: 'Deve Encostar Em' },
  { value: 'Visible', label: 'Deve Estar Visível' },
  { value: 'NotVisible', label: 'Não Deve Estar Visível' },
  { value: 'Circulation', label: 'Circulação' },
];

// Ambientes hospitalares de exemplo
export const AMBIENTES_HOSPITAL: string[] = [
  'SALA_CIRURGIA',
  'UTI',
  'ENFERMARIA',
  'RECEPCAO',
  'CORREDOR',
  'FARMACIA',
  'LABORATORIO',
  'RADIOLOGIA',
  'EMERGENCIA',
  'BLOCO_CIRURGICO',
  'ZONA_REPOUSO',
  'SALA_ESPERA',
  'CONSULTORIO',
  'BANHEIRO',
];
