// services/restrictions/visibleController.ts
import {
  NotVisibleConstraint,
  RestricaoAPIResponse,
  RestricaoPosicionamentoDTO,
  ValidationResult,
  VisibleConstraint,
  VisibleFormState,
} from './types';
import { VisibleFactory } from './visibleFactory';

// API mock
const apiMock = {
  post: async (endpoint: string, data: any): Promise<{ data: RestricaoAPIResponse }> => {
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

export class VisibleController {
  private constraint: VisibleConstraint | NotVisibleConstraint | null = null;
  private metadata: Record<string, any> = {};

  /**
   * Cria constraint a partir do formulário
   */
  criarConstraintFromForm(formState: VisibleFormState): this {
    this.constraint = VisibleFactory.criarConstraintFromForm(formState);
    return this;
  }

  /**
   * Obtém o constraint atual
   */
  getConstraint(): VisibleConstraint | NotVisibleConstraint | null {
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

    return VisibleFactory.criarDTOPosicionamento(this.constraint, this.metadata);
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

    const data = 'Visible' in this.constraint ? this.constraint.Visible : this.constraint.NotVisible;

    if (!data.object) {
      erros.push('Objeto observador não configurado');
    }

    if (!data.lines_owner) {
      erros.push('Objeto a ser observado não configurado');
    }

    if (data.lines === 0) {
      erros.push('Pelo menos um lado deve ser selecionado');
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
      const response = await apiMock.post('/api/restricoes/visibilidade', dadosCompletos);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || 'Erro ao enviar restrição de visibilidade'],
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

export const visibleController = new VisibleController();
