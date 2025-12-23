import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import type { MenuCategory } from '../../types'
import Button from '../ui/Button'

interface CategoryCardProps {
  category: MenuCategory
  onEdit: (category: MenuCategory) => void
  onDelete: (category: MenuCategory) => void
  onToggleActive: (category: MenuCategory) => void
}

export default function CategoryCard({ category, onEdit, onDelete, onToggleActive }: CategoryCardProps) {
  return (
    <div className={`bg-white rounded-lg border-2 ${category.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            {!category.isActive && (
              <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded">
                Inactive
              </span>
            )}
          </div>
          {category.description && (
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          )}
        </div>
        <div className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
          Order: {category.displayOrder}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-sm text-gray-500">
          {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleActive(category)}
            title={category.isActive ? 'Deactivate' : 'Activate'}
          >
            {category.isActive ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onEdit(category)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(category)}
            disabled={category.itemCount > 0}
            title={category.itemCount > 0 ? 'Cannot delete category with items' : 'Delete category'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
