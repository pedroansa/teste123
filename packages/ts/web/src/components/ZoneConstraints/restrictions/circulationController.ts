// services/restrictions/circulationController.ts
import { CirculationFactory } from './circulationFactory';
import {
  CirculationConstraint,
  CirculationFormState,
  RestricaoAPIResponse,
  RestricaoPosicionamentoDTO,
  ValidationResult,
} from './types';

// API mock
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

export class CirculationController {
  private constraint: CirculationConstraint | null = null;
  private metadata: Record<string, any> = {};

  /**
   * Cria constraint a partir do formulário
   */
  criarConstraintFromForm(formState: CirculationFormState): this {
    this.constraint = CirculationFactory.criarConstraintFromForm(formState);
    return this;
  }

  /**
   * Obtém o constraint atual
   */
  getConstraint(): CirculationConstraint | null {
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

    return CirculationFactory.criarDTOPosicionamento(
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

    if (this.constraint.Circulation.gap <= 0) {
      erros.push('O valor de circulação deve ser maior que 0');
    }

    if (this.constraint.Circulation.objects.Any.value.length === 0) {
      erros.push('Nenhum objeto configurado para circulação');
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
        '/api/restricoes/circulacao',
        dadosCompletos
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || 'Erro ao enviar restrição de circulação'],
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

export const circulationController = new CirculationController();
