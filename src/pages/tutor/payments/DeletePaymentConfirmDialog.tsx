import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeletePayment } from '@/hooks/usePayments'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { Payment } from '@/types'
import type { AxiosError } from 'axios'

interface DeletePaymentConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
  studentId: string
  studentName?: string
}

function formatPaymentDate(dateStr?: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DeletePaymentConfirmDialog({
  open,
  onOpenChange,
  payment,
  studentId,
  studentName,
}: DeletePaymentConfirmDialogProps) {
  const deleteMutation = useDeletePayment()

  if (!payment) return null

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        id: payment.id,
        studentId,
      })
      toast.success('Запись об оплате успешно удалена')
      onOpenChange(false)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось удалить запись об оплате',
      )
    }
  }

  const formattedAmount = payment.amount.toLocaleString('ru-RU')
  const formattedDate = formatPaymentDate(payment.paymentDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Удалить запись об оплате?</DialogTitle>
              <DialogDescription className="pt-1">
                Это действие отменит зачисление средств
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-sm text-foreground/80 space-y-2">
          <p>
            Вы действительно хотите удалить платёж на сумму{' '}
            <span className="font-semibold text-foreground">
              {formattedAmount} ₽
            </span>
            {formattedDate && (
              <>
                {' '}
                от <span className="font-medium text-foreground">{formattedDate}</span>
              </>
            )}
            {studentName && (
              <>
                {' '}
                для ученика{' '}
                <span className="font-medium text-foreground">{studentName}</span>
              </>
            )}
            ?
          </p>
          <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border">
            Внимание: удаление платежа повлияет на баланс уроков ученика и общую статистику доходов.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
            className="gap-2"
          >
            {deleteMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <span>Удалить оплату</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
