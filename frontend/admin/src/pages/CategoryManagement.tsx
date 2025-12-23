import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import {
  useMenuCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryActive,
} from '../api/menu'
import type { MenuCategory } from '../types'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import CategoryCard from '../components/menu/CategoryCard'
import CategoryForm from '../components/menu/CategoryForm'

export default function CategoryManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MenuCategory | null>(null)

  // Fetch data
  const { data: allCategories = [], isLoading } = useMenuCategories()

  // Mutations
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const toggleMutation = useToggleCategoryActive()

  // Filter categories
  const filteredCategories = allCategories
    .filter((cat) => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesActiveFilter = showInactive || cat.isActive
      return matchesSearch && matchesActiveFilter
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)

  // Handlers
  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, data })
      setEditingCategory(null)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleToggleActive = async (category: MenuCategory) => {
    await toggleMutation.mutateAsync(category.id)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">{filteredCategories.length} categories</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors sm:text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Show inactive
          </label>
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">
            {searchTerm || !showInactive
              ? 'No categories found matching your filters.'
              : 'No categories yet. Create your first category!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={setEditingCategory}
              onDelete={setDeleteConfirm}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Category"
      >
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleUpdate}
          onCancel={() => setEditingCategory(null)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
        size="sm"
      >
        <div>
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          </p>
          {deleteConfirm && deleteConfirm.itemCount > 0 && (
            <p className="text-red-600 text-sm mb-4">
              This category has {deleteConfirm.itemCount} item(s). Please move or delete them first.
            </p>
          )}
          {(!deleteConfirm || deleteConfirm.itemCount === 0) && (
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone.
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              disabled={deleteConfirm ? deleteConfirm.itemCount > 0 : false}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
