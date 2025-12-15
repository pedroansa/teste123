import { Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type RestrictionCategory = 
  | 'visibilidade'
  | 'deve_encostar'
  | 'deve_estar_proximo'
  | 'circulacao'
  | 'nao_visivel'
  | 'deve_estar_distante';

interface RestrictionCategoryInfo {
  id: RestrictionCategory;
  label: string;
  count: number;
}

interface RestrictionsTableProps {
  categories: RestrictionCategoryInfo[];
  onAddNew: (category: RestrictionCategory) => void;
  onView: (category: RestrictionCategory) => void;
}

export function RestrictionsTable({
  categories,
  onAddNew,
  onView,
}: RestrictionsTableProps) {
  const totalCount = categories.reduce((acc, cat) => acc + cat.count, 0);

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      {/* Header with count badge */}
      <div className="flex items-center gap-4 px-6 py-3 bg-card border-b border-border">
        <Badge className="bg-primary-light text-primary-light-foreground hover:bg-primary-light/80">
          {totalCount} restrições disponíveis
        </Badge>
      </div>

      {/* Table header */}
      <div className="flex items-center bg-gray-50">
        <div className="w-48 px-6 py-3">
          <span className="text-xs text-muted-foreground">Categoria da restrição</span>
        </div>
        <div className="w-32 px-6 py-3">
          <span className="text-xs text-muted-foreground">Quantidade de regras</span>
        </div>
        <div className="flex-1 px-6 py-3" />
        <div className="w-28 px-6 py-3" />
        <div className="w-24 px-6 py-3" />
      </div>

      {/* Table rows */}
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
        >
          <div className="w-48 px-6 py-4">
            <span className="text-sm font-medium text-muted-foreground">
              {category.label}
            </span>
          </div>
          <div className="w-32 px-6 py-4">
            <span className="text-sm font-medium text-muted-foreground">
              {category.count}
            </span>
          </div>
          <div className="flex-1 px-6 py-4" />
          <div className="w-28 px-6 py-4">
            <button
              onClick={() => onView(category.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Visualizar
            </button>
          </div>
          <div className="w-24 px-6 py-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => onAddNew(category.id)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
