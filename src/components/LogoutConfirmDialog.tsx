import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Выйти из аккаунта?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Вы будете перенаправлены на страницу входа
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-xs sm:text-sm text-muted-foreground py-2">
          Вы уверены, что хотите завершить текущую сессию? Для следующего входа вам потребуется ввести логин и пароль.
        </p>

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
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Да, выйти</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
