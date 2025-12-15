// services/restrictions/sideOnAnyLineController.ts
import { SideOnAnyLineFactory } from './sideOnAnyLineFactory';
import {
  BackLines,
  ElementSelector,
  RestricaoAPIResponse,
  RestricaoPosicionamentoDTO,
  RestrictionFormState,
  SideOnAnyLineConstraint,
  ValidationResult,
} from './types';

// API mock - você substituirá pela real depois
const apiMock = {
  post: async (
    endpoint: string,
    data: any
  ): Promise<{ data: RestricaoAPIResponse }> => {
    console.log('[MOCK] POST para:', endpoint, data);
    return {
      data: {
        id: Math.random().toString(36).substring(7),
        status: 'success',
        created_at: new Date().toISOString(),
      },
    };
  },
};

export class SideOnAnyLineController {
  private constraint: SideOnAnyLineConstraint | null = null;
  private metadata: Record<string, any> = {};

  /**
   * Método principal: cria constraint a partir do formulário
   */
  criarConstraintFromForm(formState: RestrictionFormState): this {
    this.constraint = SideOnAnyLineFactory.criarConstraintFromForm(formState);
    return this;
  }

  /**
   * Método principal: cria constraint baseado nos seletores
   */
  criarConstraint(
    objeto: ElementSelector,
    configuracoes: {
      back_lines?: BackLines;
      front_lines?: BackLines;
      right_lines?: BackLines;
      left_lines?: BackLines;
    }
  ): this {
    this.constraint = {
      SideOnAnyLine: {
        object: objeto,
        back_lines: configuracoes.back_lines,
        front_lines: configuracoes.front_lines,
        right_lines: configuracoes.right_lines,
        left_lines: configuracoes.left_lines,
      },
    };
    return this;
  }

  /**
   * Método original (mantendo compatibilidade)
   */
  configurarEncostar(
    objectId: string,
    environment: string,
    options: {
      zone1: string;
      zone2: string;
      back_lines?: BackLines;
      front_lines?: BackLines;
      right_lines?: BackLines;
      left_lines?: BackLines;
      metadata?: Record<string, any>;
    }
  ): this {
    this.constraint = SideOnAnyLineFactory.criarRestricaoEncostar(
      objectId,
      environment,
      {
        zone1: options.zone1,
        zone2: options.zone2,
        back_lines: options.back_lines,
        front_lines: options.front_lines,
        right_lines: options.right_lines,
        left_lines: options.left_lines,
      }
    );
    this.metadata = options.metadata || {};
    return this;
  }

  /**
   * Versão V2 (opcional)
   */
  configurarEncostarV2(
    objectId: string,
    environment: string,
    options: {
      zone1: string;
      zone2: string;
      back_lines?: BackLines;
      front_lines?: BackLines;
      right_lines?: BackLines;
      left_lines?: BackLines;
      metadata?: Record<string, any>;
    }
  ): this {
    this.constraint = SideOnAnyLineFactory.criarRestricaoEncostarV2(
      objectId,
      environment,
      {
        zone1: options.zone1,
        zone2: options.zone2,
        back_lines: options.back_lines,
        front_lines: options.front_lines,
        right_lines: options.right_lines,
        left_lines: options.left_lines,
      }
    );
    this.metadata = options.metadata || {};
    return this;
  }

  /**
   * Usa um template de exemplo
   */
  usarExemplo(templateName: 'mesa_cirurgica' | 'cama_encostada'): this {
    switch (templateName) {
      case 'mesa_cirurgica':
        this.constraint = SideOnAnyLineFactory.exemploMesaCirurgica();
        this.metadata = { template: 'mesa_cirurgica' };
        break;
      case 'cama_encostada':
        this.constraint = SideOnAnyLineFactory.exemploCamaEncostada();
        this.metadata = { template: 'cama_encostada' };
        break;
      default:
        throw new Error(`Template desconhecido: ${templateName}`);
    }
    return this;
  }

  /**
   * Método simplificado para criar constraints baseados no README
   */
  criarDoREADME(
    tipoObjeto: 'mobiliario' | 'parede' | 'porta' | 'pilar' | 'janela',
    ambiente: string,
    config: {
      familyPath?: string;
      ambienteVizinho?: string;
      zonasPorta?: string[];
      lados: {
        back?: { tipo: 'parede' | 'parede_vizinha'; zona?: string };
        front?: { tipo: 'parede' | 'parede_vizinha'; zona?: string };
        right?: { tipo: 'parede' | 'parede_vizinha'; zona?: string };
        left?: { tipo: 'parede' | 'parede_vizinha'; zona?: string };
      };
    }
  ): this {
    let objeto: ElementSelector;

    switch (tipoObjeto) {
      case 'mobiliario':
        if (config.familyPath) {
          objeto = {
            Id: { value: `/furniture/${ambiente}/family/${config.familyPath}` },
          };
        } else {
          objeto = { Id: { value: `/furniture/${ambiente}` } };
        }
        break;
      case 'parede':
        if (config.ambienteVizinho) {
          objeto = {
            EdgesAdjacentToZone: {
              id: `/zone/${ambiente}`,
              adjacent_id: `/zone/${config.ambienteVizinho}`,
            },
          };
        } else {
          objeto = { ZoneEdges: { id: `/zone/${ambiente}` } };
        }
        break;
      case 'porta':
        if (config.zonasPorta) {
          objeto = {
            DoorsAdjacentToZone: {
              zones_ids_to_consider: config.zonasPorta.map((z) => `/zone/${z}`),
            },
          };
        } else {
          objeto = { Id: { value: '/door' } };
        }
        break;
      case 'pilar':
        objeto = { Id: { value: '/pillar' } };
        break;
      case 'janela':
        objeto = { Id: { value: '/window' } };
        break;
      default:
        throw new Error(`Tipo de objeto desconhecido: ${tipoObjeto}`);
    }

    const configuracoes: any = {};

    const mapearLado = (ladoConfig: any) => {
      if (!ladoConfig) return undefined;

      if (ladoConfig.tipo === 'parede') {
        return { ZoneEdges: { id: `/zone/${ladoConfig.zona || ambiente}` } };
      } else if (ladoConfig.tipo === 'parede_vizinha') {
        return {
          EdgesAdjacentToZone: {
            id: `/zone/${ambiente}`,
            adjacent_id: `/zone/${ladoConfig.zona}`,
          },
        };
      }
      return undefined;
    };

    if (config.lados.back)
      configuracoes.back_lines = mapearLado(config.lados.back);
    if (config.lados.front)
      configuracoes.front_lines = mapearLado(config.lados.front);
    if (config.lados.right)
      configuracoes.right_lines = mapearLado(config.lados.right);
    if (config.lados.left)
      configuracoes.left_lines = mapearLado(config.lados.left);

    this.constraint = {
      SideOnAnyLine: {
        object: objeto,
        ...configuracoes,
      },
    };

    return this;
  }

  /**
   * Obtém o constraint atual
   */
  getConstraint(): SideOnAnyLineConstraint | null {
    return this.constraint ? JSON.parse(JSON.stringify(this.constraint)) : null;
  }

  /**
   * Obtém o constraint como JSON string
   */
  getJSON(): string | null {
    if (!this.constraint) return null;
    return JSON.stringify(this.constraint, null, 2);
  }

  /**
   * Obtém os dados completos do DTO
   */
  getDados(): RestricaoPosicionamentoDTO | null {
    if (!this.constraint) {
      return null;
    }

    return SideOnAnyLineFactory.criarDTOPosicionamento(
      this.constraint,
      this.metadata
    );
  }

  /**
   * Obtém o DTO como JSON string
   */
  getDTOJSON(): string | null {
    const dados = this.getDados();
    return dados ? JSON.stringify(dados, null, 2) : null;
  }

  /**
   * Valida o constraint antes do envio
   */
  validarDados(): ValidationResult {
    const erros: string[] = [];

    if (!this.constraint) {
      erros.push('Nenhum constraint configurado');
      return { valido: false, erros };
    }

    const object = this.constraint.SideOnAnyLine.object;
    if (!object) {
      erros.push('Objeto não configurado corretamente');
    }

    const directions = [
      this.constraint.SideOnAnyLine.back_lines,
      this.constraint.SideOnAnyLine.front_lines,
      this.constraint.SideOnAnyLine.right_lines,
      this.constraint.SideOnAnyLine.left_lines,
    ];

    const hasAnyDirection = directions.some((dir) => !!dir);

    if (!hasAnyDirection) {
      erros.push('Pelo menos um lado deve ser configurado');
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  /**
   * Envia o constraint para a API
   */
  async enviar(): Promise<{
    success: boolean;
    data?: RestricaoAPIResponse;
    errors?: string[];
  }> {
    const validacao = this.validarDados();
    if (!validacao.valido) {
      return {
        success: false,
        errors: validacao.erros,
      };
    }

    try {
      const dadosCompletos = this.getDados();
      const response = await apiMock.post(
        '/api/restricoes/posicionamento',
        dadosCompletos
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || 'Erro ao enviar restrição de posicionamento'],
      };
    }
  }

  /**
   * Reseta o controller
   */
  resetar(): void {
    this.constraint = null;
    this.metadata = {};
  }
}

// Instância global para uso rápido
export const sideOnAnyLineController = new SideOnAnyLineController();
