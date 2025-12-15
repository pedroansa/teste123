import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

// Mock data - em produção viria do backend
const MOBILIARIOS = ['Mesa Cirúrgica', 'Maca', 'Cadeira', 'Armário', 'Bancada'];
const AMBIENTES = ['Banheiro', 'Sala de Espera', 'UTI', 'Recepção', 'Consultório'];

export type ObjectType = 
  | 'mobiliario_qualquer'
  | 'mobiliario_especifico'
  | 'parede_qualquer'
  | 'parede_vizinha'
  | 'porta_qualquer'
  | 'porta_vizinha'
  | 'pilar'
  | 'janela';

export interface ObjectSelection {
  type: ObjectType;
  label: string;
  value?: string;
  adjacentZone?: string;
}

interface ObjectSelectorProps {
  value?: ObjectSelection;
  onChange: (selection: ObjectSelection) => void;
  placeholder?: string;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  type?: ObjectType;
  children?: MenuItem[];
  needsValue?: boolean;
  valueOptions?: string[];
}

const MENU_STRUCTURE: MenuItem[] = [
  {
    id: 'mobiliario',
    label: 'Mobiliário',
    children: [
      { id: 'mob_qualquer', label: 'Qualquer', type: 'mobiliario_qualquer' },
      ...MOBILIARIOS.map(m => ({
        id: `mob_${m}`,
        label: m,
        type: 'mobiliario_especifico' as ObjectType,
      })),
    ],
  },
  {
    id: 'parede',
    label: 'Parede',
    children: [
      { id: 'parede_qualquer', label: 'Qualquer', type: 'parede_qualquer' },
      {
        id: 'parede_vizinha',
        label: 'Vizinha de',
        children: AMBIENTES.map(a => ({
          id: `parede_viz_${a}`,
          label: a,
          type: 'parede_vizinha' as ObjectType,
        })),
      },
    ],
  },
  {
    id: 'porta',
    label: 'Porta',
    children: [
      { id: 'porta_qualquer', label: 'Qualquer', type: 'porta_qualquer' },
      {
        id: 'porta_vizinha',
        label: 'Vizinha de',
        children: AMBIENTES.map(a => ({
          id: `porta_viz_${a}`,
          label: a,
          type: 'porta_vizinha' as ObjectType,
        })),
      },
    ],
  },
  { id: 'pilar', label: 'Pilar', type: 'pilar' },
  { id: 'janela', label: 'Janela', type: 'janela' },
];

export function ObjectSelector({
  value,
  onChange,
  placeholder = 'Selecionar objeto...',
  className,
}: ObjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSelect = (item: MenuItem, parentLabel?: string, grandparentLabel?: string) => {
    if (!item.type) return;

    let label = item.label;
    let adjacentZone: string | undefined;

    if (grandparentLabel) {
      // e.g., "Parede > Vizinha de > Banheiro"
      label = `${grandparentLabel} vizinha de ${item.label}`;
      adjacentZone = item.label;
    } else if (parentLabel && item.type !== 'mobiliario_qualquer' && item.type !== 'parede_qualquer' && item.type !== 'porta_qualquer') {
      label = `${parentLabel}: ${item.label}`;
    }

    onChange({
      type: item.type,
      label,
      value: item.type.includes('especifico') ? item.label : undefined,
      adjacentZone,
    });
    setOpen(false);
    setExpandedMenus([]);
  };

  const renderMenuItem = (item: MenuItem, level = 0, parentLabel?: string, grandparentLabel?: string) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isSelected = value?.label === item.label || 
      (value?.type === item.type && value?.value === item.label);

    return (
      <div key={item.id}>
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              handleSelect(item, parentLabel, grandparentLabel);
            }
          }}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
            'hover:bg-muted',
            isSelected && 'bg-primary-light text-primary-light-foreground',
            level > 0 && 'pl-6',
            level > 1 && 'pl-9'
          )}
        >
          <span>{item.label}</span>
          {hasChildren && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform text-muted-foreground',
                isExpanded && 'rotate-90'
              )}
            />
          )}
          {isSelected && !hasChildren && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="ml-2 border-l border-border">
            {item.children!.map(child =>
              renderMenuItem(
                child,
                level + 1,
                item.label,
                level > 0 ? parentLabel : undefined
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {value?.label || placeholder}
          <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 z-50 bg-popover" align="start">
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {MENU_STRUCTURE.map(item => renderMenuItem(item))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
