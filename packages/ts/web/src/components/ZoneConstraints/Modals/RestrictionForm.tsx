import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { JsonPreview } from './JsonPreview';
import { LadoConfig } from './LadoConfig';
import { SideOnAnyLineController } from '@/services/restrictions/sideOnAnyLineController';
import { SideOnAnyLineFactory } from '@/services/restrictions/sideOnAnyLineFactory';
import {
  RestrictionFormState,
  initialFormState,
  TIPOS_OBJETO,
  AMBIENTES_HOSPITAL,
  LADOS,
  TipoObjeto,
  LadoFormConfig,
  Lado,
} from '@/services/restrictions/types';
import { toast } from 'sonner';
import {
  Box,
  Layers,
  Send,
  RotateCcw,
  Copy,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function RestrictionForm() {
  const [formState, setFormState] =
    useState<RestrictionFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcula o JSON em tempo real
  const generatedJson = useMemo(() => {
    if (!formState.ambiente) return null;

    const constraint =
      SideOnAnyLineFactory.criarConstraintFromForm(formState);
    return constraint;
  }, [formState]);

  // Valida o formulário
  const validation = useMemo(() => {
    const controller = new SideOnAnyLineController();
    controller.criarConstraintFromForm(formState);
    return controller.validarDados();
  }, [formState]);

  const handleTipoObjetoChange = useCallback((tipo: TipoObjeto) => {
    setFormState((prev) => ({
      ...prev,
      tipoObjeto: tipo,
      familyPath: undefined,
      ambienteVizinho: undefined,
      zonasPorta: undefined,
    }));
  }, []);

  const handleAmbienteChange = useCallback((ambiente: string) => {
    setFormState((prev) => ({ ...prev, ambiente }));
  }, []);

  const handleLadoChange = useCallback(
    (lado: Lado, config: LadoFormConfig) => {
      setFormState((prev) => ({ ...prev, [lado]: config }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setFormState(initialFormState);
    toast.info('Formulário resetado');
  }, []);

  const handleCopyJson = useCallback(() => {
    if (generatedJson) {
      navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      toast.success('JSON copiado para a área de transferência');
    }
  }, [generatedJson]);

  const handleSubmit = useCallback(async () => {
    if (!validation.valido) {
      toast.error('Corrija os erros antes de enviar');
      return;
    }

    setIsSubmitting(true);
    const controller = new SideOnAnyLineController();
    controller.criarConstraintFromForm(formState);

    const result = await controller.enviar();

    if (result.success) {
      toast.success('Restrição enviada com sucesso!', {
        description: `ID: ${result.data?.id}`,
      });
    } else {
      toast.error('Erro ao enviar restrição', {
        description: result.errors?.join(', '),
      });
    }

    setIsSubmitting(false);
  }, [formState, validation]);

  const needsFamilyPath =
    formState.tipoObjeto === 'mobiliario_especifico';
  const needsAmbienteVizinho =
    formState.tipoObjeto === 'parede_vizinha' ||
    formState.tipoObjeto === 'porta_vizinha';

  const activeLados = [
    formState.back.ativo,
    formState.front.ativo,
    formState.right.ativo,
    formState.left.ativo,
  ].filter(Boolean).length;

  return (
    <div className="grid lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
      {/* Formulário */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Box className="h-5 w-5 text-primary" />
              Objeto Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Objeto</Label>
              <Select
                value={formState.tipoObjeto}
                onValueChange={handleTipoObjetoChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_OBJETO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ambiente</Label>
              <Select
                value={formState.ambiente}
                onValueChange={handleAmbienteChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente..." />
                </SelectTrigger>
                <SelectContent>
                  {AMBIENTES_HOSPITAL.map((ambiente) => (
                    <SelectItem key={ambiente} value={ambiente}>
                      {ambiente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsFamilyPath && (
              <div className="space-y-2 animate-fade-in">
                <Label>Family Path</Label>
                <Input
                  placeholder="Ex: MESA_CIRURGICA"
                  value={formState.familyPath || ''}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      familyPath: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {needsAmbienteVizinho && (
              <div className="space-y-2 animate-fade-in">
                <Label>Ambiente Vizinho</Label>
                <Select
                  value={formState.ambienteVizinho || ''}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      ambienteVizinho: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AMBIENTES_HOSPITAL.filter(
                      (a) => a !== formState.ambiente
                    ).map((ambiente) => (
                      <SelectItem key={ambiente} value={ambiente}>
                        {ambiente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-primary" />
                Lados de Encosto
              </CardTitle>
              <Badge variant="secondary" className="font-mono">
                {activeLados}/4 ativos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {LADOS.map((lado) => (
              <LadoConfig
                key={lado.value}
                lado={lado.value}
                label={lado.label}
                config={formState[lado.value]}
                ambientePrincipal={formState.ambiente}
                onChange={(config) => handleLadoChange(lado.value, config)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Validação e Ações */}
        <Card>
          <CardContent className="pt-4">
            {!validation.valido && validation.erros.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Erros:</p>
                    <ul className="list-disc list-inside text-destructive/80">
                      {validation.erros.map((erro, i) => (
                        <li key={i}>{erro}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validation.valido && generatedJson && (
              <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Constraint válido!</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!validation.valido || isSubmitting}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview JSON */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-mono">Preview JSON</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJson}
                disabled={!generatedJson}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <JsonPreview data={generatedJson} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
