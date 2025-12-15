import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JsonPreview } from './JsonPreview';
import { ObjectSelector, ObjectSelection } from './ObjectSelector';
import { SideFlagField } from './SideFlagField';
import { SideOnAnyLineController } from '@/services/restrictions';
import { 
  AMBIENTES_HOSPITAL, 
  SideFlag, 
  SideFlagCombination,
  TipoReferencia,
  TipoObjeto,
  SideOnAnyLineFormState,
  LadoFormConfig
} from '@/services/restrictions/types';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface SideOnAnyLineModalProps {
  open: boolean;
  onClose: () => void;
}

interface SideConfig {
  ativo: boolean;
  tipoReferencia?: TipoReferencia;
  referencia?: ObjectSelection;
}

interface FormState {
  ambiente: string;
  objetoPrincipal?: ObjectSelection;
  ladosFlag: SideFlagCombination;
  back: SideConfig;
  front: SideConfig;
  right: SideConfig;
  left: SideConfig;
}

const initialState: FormState = {
  ambiente: '',
  objetoPrincipal: undefined,
  ladosFlag: 0,
  back: { ativo: false },
  front: { ativo: false },
  right: { ativo: false },
  left: { ativo: false },
};

// Simulação de famílias de mobiliário por ambiente
const FAMILIAS_MOBILIARIO_POR_AMBIENTE: Record<string, Array<{value: string, label: string}>> = {
  'SALA_CIRURGIA': [
    { value: 'MESA_CIRURGICA', label: 'Mesa Cirúrgica' },
    { value: 'CARRO_ANESTESIA', label: 'Carro de Anestesia' },
    { value: 'ARMARIO_INSTRUMENTOS', label: 'Armário de Instrumentos' },
    { value: 'LAMPADA_CIRURGICA', label: 'Lâmpada Cirúrgica' },
    { value: 'CADEIRA_CIRURGIA', label: 'Cadeira para Cirurgia' },
  ],
  'UTI': [
    { value: 'LEITO_UTI', label: 'Leito de UTI' },
    { value: 'MONITOR_CARDIACO', label: 'Monitor Cardíaco' },
    { value: 'RESPIRADOR', label: 'Respirador' },
    { value: 'BOMBA_INFUSAO', label: 'Bomba de Infusão' },
    { value: 'ARMARIO_MEDICAMENTOS', label: 'Armário de Medicamentos' },
  ],
  'ENFERMARIA': [
    { value: 'LEITO_ENFERMARIA', label: 'Leito de Enfermaria' },
    { value: 'CADEIRA_VISITANTE', label: 'Cadeira de Visitante' },
    { value: 'MESA_DE_CABECEIRA', label: 'Mesa de Cabeceira' },
    { value: 'BIOMBO', label: 'Biombo' },
    { value: 'ARMARIO_ROUPAS', label: 'Armário de Roupas' },
  ],
};

export function SideOnAnyLineModal({ open, onClose }: SideOnAnyLineModalProps) {
  const [form, setForm] = useState<FormState>(initialState);

  // Obter famílias disponíveis para o ambiente selecionado
  const familiasDisponiveis = useMemo(() => {
    if (!form.ambiente) return [];
    return FAMILIAS_MOBILIARIO_POR_AMBIENTE[form.ambiente] || [];
  }, [form.ambiente]);

  // Converter ObjectSelection para LadoFormConfig que o controller espera
  const convertToLadoFormConfig = (selection: ObjectSelection, ambiente: string): LadoFormConfig => {
    const getTipoReferenciaFromSelection = (): TipoReferencia => {
      switch (selection.type) {
        case 'mobiliario_qualquer': return 'mobiliario_qualquer';
        case 'mobiliario_especifico': return 'mobiliario_especifico';
        case 'parede_qualquer': return 'parede_qualquer';
        case 'parede_vizinha': return 'parede_vizinha';
        case 'porta_qualquer': return 'porta_qualquer';
        case 'porta_vizinha': return 'porta_vizinha';
        case 'pilar': return 'pilar';
        case 'janela': return 'janela';
        default: return 'parede_qualquer';
      }
    };

    const ladoConfig: LadoFormConfig = {
      ativo: true,
      tipoReferencia: getTipoReferenciaFromSelection(),
      ambiente,
    };

    // Preencher campos específicos baseados no tipo
    switch (selection.type) {
      case 'mobiliario_especifico':
        ladoConfig.familyPath = selection.value;
        break;
      case 'parede_vizinha':
        if (!selection.adjacentZone) {
          throw new Error('Para parede vizinha, selecione um ambiente vizinho');
        }
        ladoConfig.ambienteVizinho = selection.adjacentZone;
        break;
      case 'porta_vizinha':
        if (!selection.adjacentZone) {
          throw new Error('Para porta vizinha, selecione um ambiente adjacente');
        }
        ladoConfig.zonasPorta = [selection.adjacentZone];
        break;
      case 'mobiliario_qualquer':
      case 'parede_qualquer':
      case 'porta_qualquer':
      case 'pilar':
      case 'janela':
        // Não precisa de campos adicionais
        break;
    }

    return ladoConfig;
  };

  // Preparar o form state para o controller usando as interfaces corretas
  const prepareFormStateForController = (): SideOnAnyLineFormState | null => {
    try {
      // Determinar tipoObjeto baseado na seleção do usuário
      let tipoObjeto: TipoObjeto;
      let familyPath: string | undefined;

      if (form.objetoPrincipal) {
        if (form.objetoPrincipal.type === 'mobiliario_qualquer') {
          tipoObjeto = 'mobiliario_qualquer';
        } else if (form.objetoPrincipal.type === 'mobiliario_especifico') {
          tipoObjeto = 'mobiliario_especifico';
          familyPath = form.objetoPrincipal.value;
        } else {
          tipoObjeto = 'mobiliario_qualquer';
        }
      } else {
        tipoObjeto = 'mobiliario_qualquer';
      }

      // Função para preparar configuração de um lado
      const prepareSideConfig = (sideConfig: SideConfig): LadoFormConfig => {
        if (!sideConfig.ativo || !sideConfig.referencia) {
          return {
            ativo: false,
            tipoReferencia: 'parede_qualquer',
          };
        }

        return convertToLadoFormConfig(sideConfig.referencia, form.ambiente);
      };

      return {
        ambiente: form.ambiente,
        tipoObjeto,
        familyPath,
        back: prepareSideConfig(form.back),
        front: prepareSideConfig(form.front),
        right: prepareSideConfig(form.right),
        left: prepareSideConfig(form.left),
      };
    } catch (error) {
      console.error('Error preparing form state:', error);
      return null;
    }
  };

  // Gerar o JSON usando o controller
  const generatedJson = useMemo(() => {
    if (!form.ambiente || form.ladosFlag === 0) {
      return null;
    }

    try {
      const formState = prepareFormStateForController();
      if (!formState) return null;

      // Usar o controller para gerar o constraint
      const controller = new SideOnAnyLineController();
      controller.criarConstraintFromForm(formState);
      const constraint = controller.getConstraint();

      return constraint;
    } catch (error) {
      console.error('Error generating constraint:', error);
      return null;
    }
  }, [form]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!form.ambiente) errors.push('Selecione um ambiente');
    
    if (form.ladosFlag === 0) {
      errors.push('Selecione pelo menos um lado');
    }

    // Validar referências dos lados ativos
    const validateSideReference = (lado: 'back' | 'front' | 'right' | 'left', nome: string) => {
      const referencia = form[lado].referencia;
      if (!referencia) {
        errors.push(`Selecione uma referência para ${nome}`);
        return;
      }

      // Validações específicas por tipo
      if (referencia.type === 'porta_vizinha' && !referencia.adjacentZone) {
        errors.push(`Para ${nome}, selecione um ambiente adjacente para porta vizinha`);
      }
      
      if (referencia.type === 'parede_vizinha' && !referencia.adjacentZone) {
        errors.push(`Para ${nome}, selecione um ambiente vizinho para parede vizinha`);
      }
      
      if (referencia.type === 'mobiliario_especifico' && !referencia.value) {
        errors.push(`Para ${nome}, selecione um mobiliário específico`);
      }
    };

    // Aplicar validação apenas aos lados ativos
    if ((form.ladosFlag & SideFlag.Back)) {
      validateSideReference('back', 'Costas');
    }
    if ((form.ladosFlag & SideFlag.Front)) {
      validateSideReference('front', 'Frente');
    }
    if ((form.ladosFlag & SideFlag.Right)) {
      validateSideReference('right', 'Lateral Direita');
    }
    if ((form.ladosFlag & SideFlag.Left)) {
      validateSideReference('left', 'Lateral Esquerda');
    }

    return { valid: errors.length === 0, errors };
  }, [form]);

  const handleSideFlagChange = (value: SideFlagCombination) => {
    setForm(prev => ({
      ...prev,
      ladosFlag: value,
      back: { ...prev.back, ativo: (value & SideFlag.Back) === SideFlag.Back },
      front: { ...prev.front, ativo: (value & SideFlag.Front) === SideFlag.Front },
      right: { ...prev.right, ativo: (value & SideFlag.Right) === SideFlag.Right },
      left: { ...prev.left, ativo: (value & SideFlag.Left) === SideFlag.Left },
    }));
  };

  const handleSideReference = (
    lado: 'back' | 'front' | 'right' | 'left',
    referencia: ObjectSelection
  ) => {
    const getTipoReferenciaFromSelection = (selection: ObjectSelection): TipoReferencia => {
      switch (selection.type) {
        case 'mobiliario_qualquer': return 'mobiliario_qualquer';
        case 'mobiliario_especifico': return 'mobiliario_especifico';
        case 'parede_qualquer': return 'parede_qualquer';
        case 'parede_vizinha': return 'parede_vizinha';
        case 'porta_qualquer': return 'porta_qualquer';
        case 'porta_vizinha': return 'porta_vizinha';
        case 'pilar': return 'pilar';
        case 'janela': return 'janela';
        default: return 'parede_qualquer';
      }
    };

    const tipoReferencia = getTipoReferenciaFromSelection(referencia);
    
    setForm(prev => ({
      ...prev,
      [lado]: { ...prev[lado], referencia, tipoReferencia },
    }));
  };

  const handleObjetoPrincipalChange = (selecao: ObjectSelection | null) => {
    if (!selecao) {
      setForm(prev => ({ ...prev, objetoPrincipal: undefined }));
      return;
    }
    
    // Garantir que seja um tipo de mobiliário
    if (selecao.type === 'mobiliario_qualquer' || selecao.type === 'mobiliario_especifico') {
      setForm(prev => ({ ...prev, objetoPrincipal: selecao }));
    }
  };

  const handleSubmit = () => {
    if (!validation.valid) {
      toast.error('Corrija os erros antes de enviar');
      return;
    }
    
    if (!generatedJson) {
      toast.error('Erro ao criar a restrição');
      return;
    }
    
    toast.success('Restrição criada com sucesso!');
    onClose();
    setForm(initialState);
  };

  const handleCopy = () => {
    if (generatedJson) {
      navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      toast.success('JSON copiado!');
    }
  };

  // Função para parsear o valor do select
  const parseObjetoPrincipalValue = (value: string): ObjectSelection | null => {
    if (!value) return null;
    
    if (value === 'mobiliario_qualquer') {
      return {
        type: 'mobiliario_qualquer',
        value: '',
        label: 'Qualquer mobiliário do ambiente'
      };
    }
    
    if (value.startsWith('mobiliario_especifico:')) {
      const familyPath = value.split(':')[1];
      const familia = familiasDisponiveis.find(f => f.value === familyPath);
      return {
        type: 'mobiliario_especifico',
        value: familyPath,
        label: familia?.label || familyPath
      };
    }
    
    return null;
  };

  // Função para formatar o valor para o Select
  const formatObjetoPrincipalSelectValue = (selection: ObjectSelection | undefined): string => {
    if (!selection) return '';
    
    if (selection.type === 'mobiliario_qualquer') {
      return 'mobiliario_qualquer';
    }
    
    if (selection.type === 'mobiliario_especifico' && selection.value) {
      return `mobiliario_especifico:${selection.value}`;
    }
    
    return '';
  };

  // Renderizar opções de mobiliário específico
  const renderOpcoesMobiliarioEspecifico = () => {
    if (!form.ambiente || familiasDisponiveis.length === 0) {
      return (
        <SelectItem value="mobiliario_qualquer">
          Qualquer mobiliário do ambiente
        </SelectItem>
      );
    }

    return (
      <>
        <SelectItem value="mobiliario_qualquer">
          Qualquer mobiliário do ambiente
        </SelectItem>
        <SelectItem value="especifico_header" disabled className="font-semibold">
          ── Mobiliário Específico ──
        </SelectItem>
        {familiasDisponiveis.map(familia => (
          <SelectItem 
            key={`mobiliario_especifico_${familia.value}`} 
            value={`mobiliario_especifico:${familia.value}`}
          >
            {familia.label}
          </SelectItem>
        ))}
      </>
    );
  };

  // Função para renderizar referências de lado ativo
  const renderSideReferences = () => {
    const sides = [
      { flag: SideFlag.Back, label: 'Costas', key: 'back' as const },
      { flag: SideFlag.Front, label: 'Frente', key: 'front' as const },
      { flag: SideFlag.Right, label: 'Lateral Direita', key: 'right' as const },
      { flag: SideFlag.Left, label: 'Lateral Esquerda', key: 'left' as const },
    ];

    return sides
      .filter(({ flag }) => (form.ladosFlag & flag) === flag)
      .map(({ flag, label, key }) => (
        <div key={flag} className="space-y-2 p-3 rounded-lg border border-border bg-card animate-fade-in">
          <Label>Referência para {label}</Label>
          <ObjectSelector
            value={form[key].referencia}
            onChange={ref => handleSideReference(key, ref)}
            placeholder="Selecione o que deve encostar..."
          />
        </div>
      ));
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setForm(initialState); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="btn-primary-light gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <DialogTitle className="text-xl font-bold">
              Nova Restrição - Deve Encostar Em
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure em quais lados o objeto deve estar encostado
          </p>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          {/* Form */}
          <div className="space-y-6">
            {/* Ambiente */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Ambiente <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={form.ambiente} 
                onValueChange={v => setForm(p => ({ 
                  ...p, 
                  ambiente: v,
                  objetoPrincipal: undefined // Resetar seleção ao mudar ambiente
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente..." />
                </SelectTrigger>
                <SelectContent>
                  {AMBIENTES_HOSPITAL.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Objeto Principal */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Objeto Principal
              </Label>
              <Select
                value={formatObjetoPrincipalSelectValue(form.objetoPrincipal)}
                onValueChange={value => {
                  const selecao = parseObjetoPrincipalValue(value);
                  handleObjetoPrincipalChange(selecao);
                }}
                disabled={!form.ambiente}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    form.ambiente 
                      ? "Selecione o objeto..." 
                      : "Primeiro selecione um ambiente"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {renderOpcoesMobiliarioEspecifico()}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {form.objetoPrincipal?.type === 'mobiliario_qualquer' 
                  ? 'A restrição se aplicará a qualquer mobiliário do ambiente selecionado'
                  : form.objetoPrincipal?.type === 'mobiliario_especifico'
                  ? `A restrição se aplicará apenas ao mobiliário: ${
                      familiasDisponiveis.find(f => f.value === form.objetoPrincipal?.value)?.label || 
                      form.objetoPrincipal?.value
                    }`
                  : 'Selecione "Qualquer mobiliário" para aplicar a todos, ou escolha um específico'
                }
              </p>
            </div>

            {/* Lados usando SideFlagField */}
            <SideFlagField
              label="Lados de Encosto"
              value={form.ladosFlag}
              onChange={handleSideFlagChange}
            />

            {/* Referências por lado ativo */}
            {renderSideReferences()}

            {/* Validation */}
            {!validation.valid && validation.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <ul className="text-sm text-destructive list-disc list-inside">
                    {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {validation.valid && generatedJson && (
              <div className="p-3 rounded-lg bg-primary-light border border-primary/20">
                <div className="flex items-center gap-2 text-sm text-primary-light-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Constraint criado com sucesso!</span>
                  <span className="text-xs opacity-80 ml-auto">
                    Lados ativos: {[
                      (form.ladosFlag & SideFlag.Front) && 'Frente',
                      (form.ladosFlag & SideFlag.Back) && 'Costas',
                      (form.ladosFlag & SideFlag.Right) && 'Direita',
                      (form.ladosFlag & SideFlag.Left) && 'Esquerda',
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCopy} 
                disabled={!generatedJson} 
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar JSON
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!validation.valid} 
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Criar Restrição
              </Button>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="lg:sticky lg:top-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pré-visualização do JSON</Label>
              <p className="text-xs text-muted-foreground">
                {generatedJson 
                  ? 'JSON gerado pelo SideOnAnyLineController' 
                  : 'Preencha o formulário para gerar o constraint'
                }
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-border overflow-hidden">
              <JsonPreview data={generatedJson} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}