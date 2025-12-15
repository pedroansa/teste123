// services/restrictions/sideOnAnyLineFactory.ts
import {
  BackLines,
  ElementSelector,
  LadoFormConfig,
  RestricaoPosicionamentoDTO,
  RestrictionFormState,
  SeletorComId,
  SeletorEdgesAdjacentToZone,
  SeletorId,
  SideOnAnyLineConstraint,
  TipoObjeto,
  TipoReferencia,
} from './types';

export class SideOnAnyLineFactory {
  /**
   * Cria um seletor de ID para objeto
   */
  static criarSeletorId(path: string): SeletorId {
    return {
      value: path,
    };
  }

  /**
   * Cria um SeletorComId
   */
  static criarSeletorComId(path: string): SeletorComId {
    return {
      Id: {
        value: path,
      },
    };
  }

  /**
   * Cria um seletor de bordas adjacentes entre zonas
   */
  static criarSeletorBordas(
    zone1: string,
    zone2: string
  ): SeletorEdgesAdjacentToZone {
    return {
      id: `/zone/${zone1}`,
      adjacent_id: `/zone/${zone2}`,
    };
  }

  /**
   * Cria BackLines a partir de zonas
   */
  static criarBackLines(zoneId: string, adjacentZoneId: string): BackLines {
    return {
      EdgesAdjacentToZone: {
        id: `/zone/${zoneId}`,
        adjacent_id: `/zone/${adjacentZoneId}`,
      },
    };
  }

  /**
   * Cria um ElementSelector baseado no tipo de objeto e configuração
   */
  static criarElementSelector(
    tipoObjeto: TipoObjeto,
    ambiente: string,
    options?: {
      familyPath?: string;
      ambienteVizinho?: string;
      zonasPorta?: string[];
    }
  ): ElementSelector {
    switch (tipoObjeto) {
      case 'mobiliario_qualquer':
        return { Id: { value: `/furniture/${ambiente}` } };

      case 'mobiliario_especifico':
        return {
          Id: { value: `/furniture/${ambiente}/family/${options?.familyPath || ''}` },
        };

      case 'parede_qualquer':
        return { ZoneEdges: { id: `/zone/${ambiente}` } };

      case 'parede_vizinha':
        return {
          EdgesAdjacentToZone: {
            id: `/zone/${ambiente}`,
            adjacent_id: `/zone/${options?.ambienteVizinho || ''}`,
          },
        };

      case 'porta_qualquer':
        return { Id: { value: '/door' } };

      case 'porta_vizinha':
        return {
          DoorsAdjacentToZone: {
            zones_ids_to_consider: (options?.zonasPorta || []).map(
              (z) => `/zone/${z}`
            ),
          },
        };

      case 'pilar':
        return { Id: { value: '/pillar' } };

      case 'janela':
        return { Id: { value: '/window' } };

      default:
        return { Id: { value: `/furniture/${ambiente}` } };
    }
  }

  /**
   * Cria BackLines baseado na configuração do lado
   */
  static criarBackLinesFromConfig(
    config: LadoFormConfig,
    ambientePrincipal: string
  ): BackLines | undefined {
    if (!config.ativo) return undefined;

    const ambiente = config.ambiente || ambientePrincipal;

    switch (config.tipoReferencia) {
      case 'parede_qualquer':
        return { ZoneEdges: { id: `/zone/${ambiente}` } };

      case 'parede_vizinha':
        return {
          EdgesAdjacentToZone: {
            id: `/zone/${ambiente}`,
            adjacent_id: `/zone/${config.ambienteVizinho || ''}`,
          },
        };

      case 'porta_qualquer':
        return { Id: { value: '/door' } };

      case 'porta_vizinha':
        return {
          DoorsAdjacentToZone: {
            zones_ids_to_consider: (config.zonasPorta || []).map(
              (z) => `/zone/${z}`
            ),
          },
        };

      case 'pilar':
        return { Id: { value: '/pillar' } };

      case 'janela':
        return { Id: { value: '/window' } };

      case 'mobiliario_qualquer':
        return { Id: { value: `/family/${ambiente}` } };

      case 'mobiliario_especifico':
        return {
          Id: { value: `/family/${ambiente}/${config.familyPath || ''}` },
        };

      default:
        return undefined;
    }
  }

  /**
   * Cria um SideOnAnyLineConstraint a partir do estado do formulário
   */
  static criarConstraintFromForm(
    formState: RestrictionFormState
  ): SideOnAnyLineConstraint | null {
    if (!formState.ambiente) return null;

    const objeto = this.criarElementSelector(
      formState.tipoObjeto,
      formState.ambiente,
      {
        familyPath: formState.familyPath,
        ambienteVizinho: formState.ambienteVizinho,
        zonasPorta: formState.zonasPorta,
      }
    );

    const constraint: SideOnAnyLineConstraint = {
      SideOnAnyLine: {
        object: objeto,
      },
    };

    const backLines = this.criarBackLinesFromConfig(
      formState.back,
      formState.ambiente
    );
    const frontLines = this.criarBackLinesFromConfig(
      formState.front,
      formState.ambiente
    );
    const rightLines = this.criarBackLinesFromConfig(
      formState.right,
      formState.ambiente
    );
    const leftLines = this.criarBackLinesFromConfig(
      formState.left,
      formState.ambiente
    );

    if (backLines) constraint.SideOnAnyLine.back_lines = backLines;
    if (frontLines) constraint.SideOnAnyLine.front_lines = frontLines;
    if (rightLines) constraint.SideOnAnyLine.right_lines = rightLines;
    if (leftLines) constraint.SideOnAnyLine.left_lines = leftLines;

    return constraint;
  }

  /**
   * Cria uma restrição SideOnAnyLine completa (método legado)
   */
  static criarRestricaoEncostar(
    objectId: string,
    environment: string,
    config: {
      zone1: string;
      zone2: string;
      back_lines?: BackLines;
      front_lines?: BackLines;
      right_lines?: BackLines;
      left_lines?: BackLines;
    }
  ): SideOnAnyLineConstraint {
    const backLinesDefault: BackLines = {
      EdgesAdjacentToZone: {
        id: `/zone/${config.zone1}`,
        adjacent_id: `/zone/${config.zone2}`,
      },
    };

    const constraint: SideOnAnyLineConstraint = {
      SideOnAnyLine: {
        object: {
          Id: {
            value: `/family/${environment}/${objectId}`,
          },
        },
        back_lines: config.back_lines || backLinesDefault,
      },
    };

    const side = constraint.SideOnAnyLine;
    if (config.front_lines) side.front_lines = config.front_lines;
    if (config.right_lines) side.right_lines = config.right_lines;
    if (config.left_lines) side.left_lines = config.left_lines;

    return constraint;
  }

  /**
   * Versão V2 que usa SeletorComId
   */
  static criarRestricaoEncostarV2(
    objectId: string,
    environment: string,
    config: {
      zone1: string;
      zone2: string;
      back_lines?: BackLines;
      front_lines?: BackLines;
      right_lines?: BackLines;
      left_lines?: BackLines;
    }
  ): SideOnAnyLineConstraint {
    const backLinesDefault: BackLines = {
      EdgesAdjacentToZone: {
        id: `/zone/${config.zone1}`,
        adjacent_id: `/zone/${config.zone2}`,
      },
    };

    const constraint: SideOnAnyLineConstraint = {
      SideOnAnyLine: {
        object: this.criarSeletorComId(`/family/${environment}/${objectId}`),
        back_lines: config.back_lines || backLinesDefault,
      },
    };

    const side = constraint.SideOnAnyLine;
    if (config.front_lines) side.front_lines = config.front_lines;
    if (config.right_lines) side.right_lines = config.right_lines;
    if (config.left_lines) side.left_lines = config.left_lines;

    return constraint;
  }

  /**
   * Cria um DTO de posicionamento completo
   */
  static criarDTOPosicionamento(
    constraint: SideOnAnyLineConstraint,
    metadata?: Record<string, any>
  ): RestricaoPosicionamentoDTO {
    return {
      tipo: 'SideOnAnyLine',
      constraint,
      metadata: {
        criado_via: 'frontend_saas',
        criado_em: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Exemplo: Mesa cirúrgica encostada na parede
   */
  static exemploMesaCirurgica(): SideOnAnyLineConstraint {
    return this.criarRestricaoEncostar('MESA_CIRURGICA', 'BLOCO_CIRURGICO', {
      zone1: 'SALA_CIRURGIA',
      zone2: 'PAREDE',
      back_lines: this.criarBackLines('SALA_CIRURGIA', 'PAREDE'),
    });
  }

  /**
   * Exemplo: Cama encostada em zona de repouso
   */
  static exemploCamaEncostada(): SideOnAnyLineConstraint {
    return this.criarRestricaoEncostar('CAMA_REPOUSO', 'ENFERMARIA', {
      zone1: 'ZONA_REPOUSO',
      zone2: 'PAREDE_LATERAL',
      back_lines: this.criarBackLines('ZONA_REPOUSO', 'PAREDE_LATERAL'),
    });
  }
}
