import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../../types'
import { useMenuCategories } from '../../api/menu'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'

interface MenuItemFormProps {
  item?: MenuItem
  onSubmit: (data: Omit<CreateMenuItemRequest, 'restaurantId'> | UpdateMenuItemRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function MenuItemForm({ item, onSubmit, onCancel, isLoading }: MenuItemFormProps) {
  const { data: categories = [] } = useMenuCategories(true)
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: item
      ? {
          name: item.name,
          description: item.description || '',
          price: item.price,
          categoryId: item.categoryId || '',
        }
      : {
          name: '',
          description: '',
          price: 0,
          categoryId: '',
        },
  })

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        description: item.description || '',
        price: item.price,
        categoryId: item.categoryId || '',
      })
      setImageUrl(item.imageUrl || '')
    }
  }, [item, reset])

  const onSubmitForm = (data: any) => {
    const formattedData = {
      name: data.name,
      description: data.description || undefined,
      price: Number(data.price),
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      imageUrl: imageUrl || undefined,
    }
    onSubmit(formattedData)
  }

  const categoryOptions = [
    { value: '', label: '-- No Category --' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Input
        label="Item Name"
        required
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
        placeholder="e.g. Margherita Pizza"
      />

      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Describe the menu item..."
      />

      <Input
        label="Price"
        type="number"
        step="0.01"
        min="0"
        required
        {...register('price', {
          required: 'Price is required',
          min: { value: 0, message: 'Price must be positive' },
        })}
        error={errors.price?.message}
        placeholder="0.00"
      />

      <Select
        label="Category"
        {...register('categoryId')}
        options={categoryOptions}
        error={errors.categoryId?.message}
      />

      <ImageUpload
        label="Menu Item Image"
        value={imageUrl}
        onChange={setImageUrl}
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  )
}
