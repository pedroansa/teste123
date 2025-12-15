// services/restrictions/circulationFactory.ts
import {
  CirculationConstraint,
  CirculationFormState,
  ElementSelector,
  RestricaoPosicionamentoDTO,
} from './types';

export class CirculationFactory {
  /**
   * Cria os objetos padrão de circulação para um ambiente
   */
  static criarObjectsPadrao(ambiente: string): ElementSelector[] {
    return [
      { Id: { value: `/zone/${ambiente}` } },
      { Id: { value: `/family/${ambiente}` } },
      { Id: { value: '/pillar' } },
    ];
  }

  /**
   * Cria um CirculationConstraint a partir do estado do formulário
   */
  static criarConstraintFromForm(
    formState: CirculationFormState
  ): CirculationConstraint | null {
    if (!formState.ambiente || formState.gap <= 0) {
      return null;
    }

    return {
      Circulation: {
        objects: {
          Any: {
            value: this.criarObjectsPadrao(formState.ambiente),
          },
        },
        gap: formState.gap,
      },
    };
  }

  /**
   * Cria um CirculationConstraint com objetos customizados
   */
  static criarConstraintCustom(
    objects: ElementSelector[],
    gap: number
  ): CirculationConstraint {
    return {
      Circulation: {
        objects: {
          Any: {
            value: objects,
          },
        },
        gap,
      },
    };
  }

  /**
   * Cria um DTO de posicionamento completo
   */
  static criarDTOPosicionamento(
    constraint: CirculationConstraint,
    metadata?: Record<string, any>
  ): RestricaoPosicionamentoDTO {
    return {
      tipo: 'Circulation',
      constraint,
      metadata: {
        criado_via: 'frontend_saas',
        criado_em: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Exemplo: Circulação padrão de 110cm
   */
  static exemploCirculacao(ambiente: string): CirculationConstraint {
    return {
      Circulation: {
        objects: {
          Any: {
            value: this.criarObjectsPadrao(ambiente),
          },
        },
        gap: 110.0,
      },
    };
  }
}
