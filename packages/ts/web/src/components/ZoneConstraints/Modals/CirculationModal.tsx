import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JsonPreview } from './JsonPreview';
import { X } from 'lucide-react';
import { 
  CirculationFactory, 
  CirculationConstraint,
  ElementSelector,
} from '@/services/restrictions';
import { AMBIENTES_HOSPITAL } from '@/services/restrictions/types';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface CirculationModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  ambiente: string;
  gap: string;
  selectedObjects: ElementSelector[];
  currentSelection: string;
}

// Default objects: pillar is always included
const defaultObjects: ElementSelector[] = [
  { Id: { value: '/pillar' } }
];

const initialState: FormState = {
  ambiente: '',
  gap: '110',
  selectedObjects: defaultObjects,
  currentSelection: '',
};

export function CirculationModal({ open, onClose }: CirculationModalProps) {
  const [form, setForm] = useState<FormState>(initialState);

  // Available object options for selection
  const objectOptions = useMemo(() => {
    const options = [];
    
    // Zones
    options.push(
      ...AMBIENTES_HOSPITAL.map(zone => ({
        id: `/zone/${zone}`,
        name: `Zone: ${zone}`,
        type: 'zone' as const
      }))
    );
    
    // Furniture by environment
    options.push(
      ...AMBIENTES_HOSPITAL.map(zone => ({
        id: `/family/${zone}`,
        name: `Furniture (${zone})`,
        type: 'furniture' as const
      }))
    );
    
    // Specific furniture examples
    const commonFurniture = [
      { id: '/family/SALA_CIRURGIA/MESA_CIRURGICA', name: 'Surgical Table' },
      { id: '/family/ENFERMARIA/CAMA_HOSPITALAR', name: 'Hospital Bed' },
      { id: '/family/CORREDOR/MESA_AUXILIAR', name: 'Auxiliary Table' },
      { id: '/family/RECEPCAO/BALCAO_ATENDIMENTO', name: 'Reception Counter' },
    ];
    options.push(...commonFurniture);
    
    // Fixed elements
    const fixedElements = [
      { id: '/pillar', name: 'Pillar' },
      { id: '/door', name: 'Door' },
      { id: '/window', name: 'Window' },
    ];
    options.push(...fixedElements);
    
    // Generic furniture
    options.push({
      id: '/furniture',
      name: 'Any Furniture',
      type: 'furniture_generic' as const
    });
    
    return options;
  }, []);

  const generatedJson = useMemo(() => {
    if (!form.ambiente || !form.gap || form.selectedObjects.length === 0) {
      return null;
    }

    const gapValue = parseFloat(form.gap);
    if (isNaN(gapValue) || gapValue <= 0) return null;

    try {
      // Always include zone and furniture for the selected environment
      const allObjects = [
        ...form.selectedObjects,
        { Id: { value: `/zone/${form.ambiente}` } },
        { Id: { value: `/family/${form.ambiente}` } }
      ];

      // Use the same factory as CirculationForm
      const constraint = CirculationFactory.criarConstraintCustom(allObjects, gapValue);
      
      return constraint;
    } catch (error) {
      console.error('Error generating circulation constraint:', error);
      return null;
    }
  }, [form]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!form.ambiente) errors.push('Select an environment');
    
    const gapValue = parseFloat(form.gap);
    if (!form.gap || isNaN(gapValue)) {
      errors.push('Enter a valid circulation value');
    } else if (gapValue <= 0) {
      errors.push('Circulation value must be greater than zero');
    } else if (gapValue > 1000) {
      errors.push('Circulation value cannot exceed 1000 cm');
    }
    
    if (form.selectedObjects.length === 0) {
      errors.push('Add at least one object for circulation');
    }
    
    return { valid: errors.length === 0, errors };
  }, [form]);

  const addObject = () => {
    if (form.currentSelection) {
      // Check if already exists
      const exists = form.selectedObjects.some(obj => {
        if ('Id' in obj) {
          return obj.Id.value === form.currentSelection;
        }
        return false;
      });

      if (!exists) {
        const newObject: ElementSelector = { Id: { value: form.currentSelection } };
        setForm(prev => ({
          ...prev,
          selectedObjects: [...prev.selectedObjects, newObject],
          currentSelection: ''
        }));
      }
    }
  };

  const removeObject = (index: number) => {
    setForm(prev => ({
      ...prev,
      selectedObjects: prev.selectedObjects.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!validation.valid) {
      toast.error('Fix errors before submitting');
      return;
    }
    
    if (!generatedJson) {
      toast.error('Error creating constraint');
      return;
    }
    
    toast.success('Constraint created successfully!');
    onClose();
    setForm(initialState);
  };

  const handleCopy = () => {
    if (generatedJson) {
      navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      toast.success('JSON copied!');
    }
  };

  const getObjectName = (id: string) => {
    const found = objectOptions.find(o => o.id === id);
    return found?.name || id;
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setForm(initialState); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="btn-primary-light gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <DialogTitle className="text-xl font-bold">
              New Constraint - Circulation
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure minimum circulation distance between objects
          </p>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          {/* Form */}
          <div className="space-y-6">
            {/* Environment */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Environment <span className="text-destructive">*</span>
              </Label>
              <Select value={form.ambiente} onValueChange={v => setForm(p => ({ ...p, ambiente: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment..." />
                </SelectTrigger>
                <SelectContent>
                  {AMBIENTES_HOSPITAL.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Objects */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Additional Objects <span className="text-destructive">*</span>
              </Label>
              
              <div className="flex gap-2">
                <Select 
                  value={form.currentSelection} 
                  onValueChange={v => setForm(p => ({ ...p, currentSelection: v }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an element..." />
                  </SelectTrigger>
                  <SelectContent>
                    {objectOptions.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={addObject} 
                  variant="secondary"
                  disabled={!form.currentSelection}
                >
                  Add
                </Button>
              </div>

              {form.selectedObjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 p-2 border border-border rounded-md bg-muted/30">
                  {form.selectedObjects.map((obj, index) => {
                    const id = 'Id' in obj ? obj.Id.value : '';
                    if (!id) return null;
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                      >
                        <span>{getObjectName(id)}</span>
                        <button
                          type="button"
                          onClick={() => removeObject(index)}
                          className="hover:text-destructive ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Automatically included: Zone, Furniture of environment, and Pillar
              </p>
            </div>

            {/* Gap */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Circulation Distance (cm) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                max="1000"
                step="10"
                placeholder="Ex: 110"
                value={form.gap}
                onChange={e => setForm(p => ({ ...p, gap: e.target.value }))}
              />
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  Minimum distance between all objects
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended: 80-120 cm
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                This constraint ensures a minimum circulation area of <strong>{form.gap || '0'} cm</strong> between all elements in the environment {form.ambiente ? `"${form.ambiente}"` : ''}.
              </p>
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
                  <span className="font-medium">Constraint created successfully!</span>
                  <span className="text-xs opacity-80 ml-auto">
                    Using CirculationFactory
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
                Copy JSON
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!validation.valid} 
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Constraint
              </Button>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="lg:sticky lg:top-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">JSON Preview</Label>
              <p className="text-xs text-muted-foreground">
                {generatedJson 
                  ? 'JSON generated by CirculationFactory' 
                  : 'Fill the form to generate the constraint'
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