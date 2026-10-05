import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteTest } from '@/hooks/useTests'
import { toast } from 'sonner'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { TestItem } from '@/types'

interface DeleteTestConfirmDialogProps {
  test: TestItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteTestConfirmDialog({
  test,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTestConfirmDialogProps) {
  const deleteMutation = useDeleteTest()

  if (!test) return null

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(test.id)
      toast.success(`Тест "${test.title}" успешно удален`)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Не удалось удалить тест')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Удалить тест?</DialogTitle>
              <DialogDescription>
                Вы уверены, что хотите удалить «{test.title}»? Это действие нельзя отменить.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
