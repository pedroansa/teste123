// services/restrictions/visibleFactory.ts
import {
  ElementSelector,
  NotVisibleConstraint,
  ObjectPolygon,
  RestricaoPosicionamentoDTO,
  TipoObjeto,
  VisibleConstraint,
  VisibleData,
  VisibleFormState,
  calcularSideFlag,
} from './types';

export class VisibleFactory {
  /**
   * Cria um ElementSelector baseado no tipo de objeto
   */
  static criarElementSelector(tipoObjeto: TipoObjeto, ambiente: string, familyPath?: string): ElementSelector {
    switch (tipoObjeto) {
      case 'mobiliario_qualquer':
        return { Id: { value: `/furniture/${ambiente}` } };

      case 'mobiliario_especifico':
        return {
          Id: { value: `/family/${ambiente}/${familyPath || ''}` },
        };

      case 'parede_qualquer':
        return { ZoneEdges: { id: `/zone/${ambiente}` } };

      case 'porta_qualquer':
        return { Id: { value: '/door' } };

      case 'pilar':
        return { Id: { value: '/pillar' } };

      case 'janela':
        return { Id: { value: '/window' } };

      default:
        return { Id: { value: `/furniture/${ambiente}` } };
    }
  }

  /**
   * Cria um ObjectPolygon para vision_field
   */
  static criarVisionField(ambiente: string): ObjectPolygon {
    return {
      ObjectPolygon: {
        id: {
          Id: {
            value: `/zone/${ambiente}`,
          },
        },
      },
    };
  }

  /**
   * Cria os dados base do Visible/NotVisible
   */
  static criarVisibleData(formState: VisibleFormState): VisibleData {
    const objeto = this.criarElementSelector(formState.objetoTipo, formState.ambiente, formState.objetoFamilyPath);

    const linesOwner = this.criarElementSelector(
      formState.linesOwnerTipo,
      formState.ambiente,
      formState.linesOwnerFamilyPath
    );

    const linesFlag = calcularSideFlag(formState.ladosSelecionados);

    return {
      object: objeto,
      lines: linesFlag,
      lines_owner: linesOwner,
      vision_field: this.criarVisionField(formState.ambiente),
    };
  }

  /**
   * Cria um VisibleConstraint a partir do estado do formulário
   */
  static criarVisibleConstraintFromForm(formState: VisibleFormState): VisibleConstraint | null {
    if (!formState.ambiente || formState.ladosSelecionados.length === 0) {
      return null;
    }

    return {
      Visible: this.criarVisibleData(formState),
    };
  }

  /**
   * Cria um NotVisibleConstraint a partir do estado do formulário
   */
  static criarNotVisibleConstraintFromForm(formState: VisibleFormState): NotVisibleConstraint | null {
    if (!formState.ambiente || formState.ladosSelecionados.length === 0) {
      return null;
    }

    return {
      NotVisible: this.criarVisibleData(formState),
    };
  }

  /**
   * Cria o constraint correto baseado em isVisible
   */
  static criarConstraintFromForm(formState: VisibleFormState): VisibleConstraint | NotVisibleConstraint | null {
    if (formState.isVisible) {
      return this.criarVisibleConstraintFromForm(formState);
    } else {
      return this.criarNotVisibleConstraintFromForm(formState);
    }
  }

  /**
   * Cria um DTO de posicionamento completo
   */
  static criarDTOPosicionamento(
    constraint: VisibleConstraint | NotVisibleConstraint,
    metadata?: Record<string, any>
  ): RestricaoPosicionamentoDTO {
    const tipo = 'Visible' in constraint ? 'Visible' : 'NotVisible';

    return {
      tipo,
      constraint,
      metadata: {
        criado_via: 'frontend_saas',
        criado_em: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Exemplo: Frente da TV deve estar visível a partir do sofá
   */
  static exemploTvSofa(ambiente: string): VisibleConstraint {
    return {
      Visible: {
        object: { Id: { value: `/family/${ambiente}/SOFA` } },
        lines: 1, // Front
        lines_owner: { Id: { value: `/family/${ambiente}/TV` } },
        vision_field: this.criarVisionField(ambiente),
      },
    };
  }
}
