import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialsApi } from '@/api/materials'
import type { MaterialCreatePayload, MaterialUpdatePayload } from '@/types'

export const MATERIAL_KEYS = {
  all: ['materials'] as const,
  lists: () => [...MATERIAL_KEYS.all, 'list'] as const,
  list: (search?: string, category?: string) =>
    [...MATERIAL_KEYS.lists(), { search, category }] as const,
  myLists: () => [...MATERIAL_KEYS.all, 'my'] as const,
  myList: (search?: string, category?: string) =>
    [...MATERIAL_KEYS.myLists(), { search, category }] as const,
  myCategories: () => [...MATERIAL_KEYS.all, 'my-categories'] as const,
  categories: () => [...MATERIAL_KEYS.all, 'categories'] as const,
  detail: (id: string) => [...MATERIAL_KEYS.all, 'detail', id] as const,
}

export function useMaterials(
  searchOrParams?: string | { search?: string; category?: string },
  categoryParam?: string,
) {
  const search = typeof searchOrParams === 'object' ? searchOrParams?.search : searchOrParams
  const category = typeof searchOrParams === 'object' ? searchOrParams?.category : categoryParam

  return useQuery({
    queryKey: MATERIAL_KEYS.list(search, category),
    queryFn: () => materialsApi.getMaterials(search, category),
  })
}

export function useMaterialCategories() {
  return useQuery({
    queryKey: MATERIAL_KEYS.categories(),
    queryFn: () => materialsApi.getCategories(),
  })
}

export function useMyMaterials(
  searchOrParams?: string | { search?: string; category?: string },
  categoryParam?: string,
) {
  const search = typeof searchOrParams === 'object' ? searchOrParams?.search : searchOrParams
  const category = typeof searchOrParams === 'object' ? searchOrParams?.category : categoryParam

  return useQuery({
    queryKey: MATERIAL_KEYS.myList(search, category),
    queryFn: () => materialsApi.getMyMaterials(search, category),
  })
}

export function useMyMaterialCategories() {
  return useQuery({
    queryKey: MATERIAL_KEYS.myCategories(),
    queryFn: () => materialsApi.getMyCategories(),
  })
}

export function useCreateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: MaterialCreatePayload) => materialsApi.createMaterial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.all })
    },
  })
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MaterialUpdatePayload }) =>
      materialsApi.updateMaterial(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.all })
    },
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => materialsApi.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.all })
    },
  })
}

export function useAttachMaterialToHomework(homeworkId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: string | { hwId: string; materialId: string }) => {
      const hwId = typeof arg === 'string' ? homeworkId! : arg.hwId
      const matId = typeof arg === 'string' ? arg : arg.materialId
      return materialsApi.attachToHomework(hwId, matId)
    },
    onSuccess: () => {
      if (homeworkId) {
        queryClient.invalidateQueries({ queryKey: ['homework', homeworkId, 'attachments'] })
      }
      queryClient.invalidateQueries({ queryKey: ['homework'] })
    },
  })
}
