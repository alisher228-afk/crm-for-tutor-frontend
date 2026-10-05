import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import type { Homework } from '@/types'

interface DeleteHomeworkConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  homework: Homework | null
  onConfirm: () => Promise<void> | void
  isPending?: boolean
}

export function DeleteHomeworkConfirmDialog({
  open,
  onOpenChange,
  homework,
  onConfirm,
  isPending = false,
}: DeleteHomeworkConfirmDialogProps) {
  if (!homework) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Удалить домашнее задание?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                «{homework.title}»
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs sm:text-sm text-muted-foreground">
          <p>
            Вы уверены, что хотите удалить домашнее задание{' '}
            <strong className="text-foreground">«{homework.title}»</strong>?
          </p>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span>
              Все прикрепленные файлы, ответы ученика и история проверки будут удалены навсегда. Это действие нельзя отменить.
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Удалить задание</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
