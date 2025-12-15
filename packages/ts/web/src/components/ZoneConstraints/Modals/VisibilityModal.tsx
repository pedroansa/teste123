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
import { AMBIENTES_HOSPITAL, SideFlag } from '@/services/restrictions/types';
import { 
  VisibleController, 
  VisibleConstraint, 
  NotVisibleConstraint,
  VisibleFormState,
  Lado,
  TipoObjeto,
} from '@/services/restrictions'; // Import your classes
import { toast } from 'sonner';
import { PenLine, Copy, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface VisibilityModalProps {
  open: boolean;
  onClose: () => void;
  type: 'visible' | 'not_visible';
}

interface FormState {
  ambiente: string;
  object?: ObjectSelection; // Objeto observador (de onde se olha)
  linesOwner?: ObjectSelection; // Objeto que é visto (TV)
  side: Lado; // Lado do objeto visto - Changed to Lado type
  visibilityType: 'visible' | 'not_visible';
}

const initialState: FormState = {
  ambiente: '',
  side: '' as Lado,
  visibilityType: 'visible',
};

const SIDES = [
  { value: 'front' as Lado, label: 'Frente', flag: SideFlag.Front },
  { value: 'back' as Lado, label: 'Costas', flag: SideFlag.Back },
  { value: 'left' as Lado, label: 'Lateral Esquerda', flag: SideFlag.Left },
  { value: 'right' as Lado, label: 'Lateral Direita', flag: SideFlag.Right },
];

// Helper to convert ObjectSelection to TipoObjeto
const getTipoObjeto = (selection: ObjectSelection): TipoObjeto => {
  switch (selection.type) {
    case 'mobiliario_qualquer':
      return 'mobiliario_qualquer';
    case 'mobiliario_especifico':
      return 'mobiliario_especifico';
    case 'parede_qualquer':
    case 'parede_vizinha':
      return 'mobiliario_qualquer'; // Map to appropriate type
    case 'porta_qualquer':
    case 'porta_vizinha':
      return 'porta_qualquer';
    case 'pilar':
      return 'mobiliario_qualquer'; // Map to appropriate type
    case 'janela':
      return 'janela';
    default:
      return 'mobiliario_qualquer';
  }
};

export function VisibilityModal({ open, onClose, type }: VisibilityModalProps) {
  const [form, setForm] = useState<FormState>({
    ...initialState,
    visibilityType: type,
  });
  const title = type === 'visible' ? 'Visibilidade' : 'Não Visível';

  const generatedJson = useMemo(() => {
    if (!form.ambiente || !form.linesOwner || !form.object || !form.side) {
      return null;
    }

    try {
      // Convert your form state to VisibleFormState
      const formState: VisibleFormState = {
        isVisible: form.visibilityType === 'visible',
        ambiente: form.ambiente,
        objetoTipo: getTipoObjeto(form.object),
        // You need to extract the family path from ObjectSelection
        objetoFamilyPath: form.object.type === 'mobiliario_especifico' 
          ? form.object.value || ''
          : undefined,
        ladosSelecionados: [form.side], // Single side as array
        linesOwnerTipo: getTipoObjeto(form.linesOwner),
        linesOwnerFamilyPath: form.linesOwner.type === 'mobiliario_especifico'
          ? form.linesOwner.value || ''
          : undefined,
      };

      // Use the controller to create the constraint
      const controller = new VisibleController();
      controller.criarConstraintFromForm(formState);
      const constraint = controller.getConstraint();

      // Return the JSON representation
      return constraint;
    } catch (error) {
      console.error('Error generating constraint:', error);
      return null;
    }
  }, [form]);

  const validation = useMemo(() => {
  const errors: string[] = [];
  if (!form.ambiente) errors.push('Selecione um ambiente');
  if (!form.linesOwner) errors.push('Selecione o objeto principal'); // ← linesOwner
  if (!form.side) errors.push('Selecione o lado');
  if (!form.object) errors.push('Selecione o objeto observador'); // ← object
  return { valid: errors.length === 0, errors };
}, [form]);

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
    setForm({ ...initialState, visibilityType: type });
  };

  const handleCopy = () => {
    if (generatedJson) {
      navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      toast.success('JSON copiado!');
    }
  };

  const handleClose = () => {
    onClose();
    setForm({ ...initialState, visibilityType: type });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <div className="flex items-start gap-2">
            <PenLine className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            <div>
              <DialogTitle className="text-lg font-medium text-foreground">
                Adicionar nova regra para a restrição "{title}"
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {type === 'visible' 
                  ? 'O objeto principal DEVE ser visível a partir do objeto observador' 
                  : 'O objeto principal NÃO DEVE ser visível a partir do objeto observador'
                }
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Fix the ambiente selector - remove duplicate */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Ambiente <span className="text-destructive">*</span>
            </Label>
            <Select value={form.ambiente} onValueChange={v => setForm(p => ({ ...p, ambiente: v }))}>
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

          {/* Row 1: Objeto (lines_owner) + Lado */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Objeto Principal (a ser visto) <span className="text-destructive">*</span>
              </Label>
              <ObjectSelector
                value={form.linesOwner}
                onChange={obj => setForm(p => ({ ...p, linesOwner: obj }))}
                placeholder="Selecione o objeto principal..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Lado <span className="text-destructive">*</span>
              </Label>
              <Select value={form.side} onValueChange={v => setForm(p => ({ ...p, side: v as Lado }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {SIDES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Tipo de visibilidade + A partir do objeto */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tipo de visibilidade</Label>
              <Select
                value={form.visibilityType}
                onValueChange={v => setForm(p => ({ ...p, visibilityType: v as 'visible' | 'not_visible' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">É visível</SelectItem>
                  <SelectItem value="not_visible">Não é visível</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Objeto Observador <span className="text-destructive">*</span>
              </Label>
              <ObjectSelector
                value={form.object}
                onChange={obj => setForm(p => ({ ...p, object: obj }))}
                placeholder="Selecione de onde se olha..."
              />
            </div>
          </div>

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
                  Usando {form.visibilityType === 'visible' ? 'VisibleConstraint' : 'NotVisibleConstraint'}
                </span>
              </div>
            </div>
          )}

          {/* JSON Preview (collapsible) */}
          {generatedJson && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Constraint Gerado</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar JSON
                </Button>
              </div>
              <div className="max-h-[200px] overflow-auto">
                <JsonPreview data={generatedJson} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!validation.valid} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}