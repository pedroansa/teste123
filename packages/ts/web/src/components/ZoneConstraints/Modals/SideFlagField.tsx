import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SideFlag, SideFlagCombination } from '@/services/restrictions/types';

interface SideFlagFieldProps {
  label: string;
  value: SideFlagCombination;
  onChange: (value: SideFlagCombination) => void;
}

export function SideFlagField({ label, value, onChange }: SideFlagFieldProps) {
  const flags = [
    { flag: SideFlag.Front, label: 'Front' },
    { flag: SideFlag.Back, label: 'Back' },
    { flag: SideFlag.Left, label: 'Left' },
    { flag: SideFlag.Right, label: 'Right' },
  ];

  const hasFlag = (flag: SideFlag) => (value & flag) === flag;

  const toggleFlag = (flag: SideFlag) => {
    if (hasFlag(flag)) {
      onChange(value & ~flag);
    } else {
      onChange(value | flag);
    }
  };

  return (
    <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/30">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-4">
        {flags.map(({ flag, label: flagLabel }) => (
          <div key={flag} className="flex items-center space-x-2">
            <Checkbox
              id={`flag-${flag}`}
              checked={hasFlag(flag)}
              onCheckedChange={() => toggleFlag(flag)}
            />
            <Label htmlFor={`flag-${flag}`} className="text-sm cursor-pointer">
              {flagLabel}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Valor combinado: {value}
      </p>
    </div>
  );
}
