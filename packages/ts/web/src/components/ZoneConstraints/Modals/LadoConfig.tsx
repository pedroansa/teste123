import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  LadoFormConfig,
  TIPOS_REFERENCIA,
  AMBIENTES_HOSPITAL,
  Lado,
  TipoReferencia,
} from '@/services/restrictions/types';
import { cn } from '@/lib/utils';

interface LadoConfigProps {
  lado: Lado;
  label: string;
  config: LadoFormConfig;
  ambientePrincipal: string;
  onChange: (config: LadoFormConfig) => void;
}

export function LadoConfig({
  lado,
  label,
  config,
  ambientePrincipal,
  onChange,
}: LadoConfigProps) {
  const needsAmbienteVizinho =
    config.tipoReferencia === 'parede_vizinha' ||
    config.tipoReferencia === 'porta_vizinha';

  const needsFamilyPath =
    config.tipoReferencia === 'mobiliario_especifico';

  const handleTipoReferenciaChange = (tipoReferencia: TipoReferencia) => {
    onChange({
      ...config,
      tipoReferencia,
      familyPath: undefined,
      ambienteVizinho: undefined,
    });
  };

  return (
    <div
      className={cn(
        'lado-toggle flex-col items-start',
        config.ativo && 'active'
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Switch
            id={`lado-${lado}`}
            checked={config.ativo}
            onCheckedChange={(ativo) => onChange({ ...config, ativo })}
          />
          <Label htmlFor={`lado-${lado}`} className="font-medium cursor-pointer">
            {label}
          </Label>
        </div>
      </div>

      {config.ativo && (
        <div className="w-full mt-3 space-y-3 animate-fade-in">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tipo de Referência
            </Label>
            <Select
              value={config.tipoReferencia}
              onValueChange={handleTipoReferenciaChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_REFERENCIA.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsAmbienteVizinho && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Ambiente Vizinho
              </Label>
              <Select
                value={config.ambienteVizinho || ''}
                onValueChange={(ambienteVizinho) =>
                  onChange({ ...config, ambienteVizinho })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {AMBIENTES_HOSPITAL.filter((a) => a !== ambientePrincipal).map(
                    (ambiente) => (
                      <SelectItem key={ambiente} value={ambiente}>
                        {ambiente}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {needsFamilyPath && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Family Path do Mobiliário
              </Label>
              <Input
                placeholder="Ex: MACA, TV, SOFA"
                value={config.familyPath || ''}
                onChange={(e) =>
                  onChange({ ...config, familyPath: e.target.value })
                }
                className="h-9"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
