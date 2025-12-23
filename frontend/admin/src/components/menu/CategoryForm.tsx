import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { MenuCategory, CreateMenuCategoryRequest, UpdateMenuCategoryRequest } from '../../types'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

interface CategoryFormProps {
  category?: MenuCategory
  onSubmit: (data: Omit<CreateMenuCategoryRequest, 'restaurantId'> | UpdateMenuCategoryRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function CategoryForm({ category, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || '',
          displayOrder: category.displayOrder,
        }
      : {
          name: '',
          description: '',
          displayOrder: 0,
        },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder,
      })
    }
  }, [category, reset])

  const onSubmitForm = (data: any) => {
    const formattedData = {
      name: data.name,
      description: data.description || undefined,
      displayOrder: Number(data.displayOrder),
    }
    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Input
        label="Category Name"
        required
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
        placeholder="e.g. Appetizers, Main Course, Desserts"
      />

      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Brief description of this category..."
      />

      <Input
        label="Display Order"
        type="number"
        min="0"
        required
        {...register('displayOrder', {
          required: 'Display order is required',
          min: { value: 0, message: 'Display order must be 0 or greater' },
        })}
        error={errors.displayOrder?.message}
        placeholder="0"
        helpText="Lower numbers appear first"
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}
