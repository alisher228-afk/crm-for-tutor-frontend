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
import { useLanguage } from '@/i18n'
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

function formatPaymentDate(dateStr: string | undefined, dateLocale: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(dateLocale, {
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
  const { t, language } = useLanguage()
  const dateLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
  const numLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'

  const deleteMutation = useDeletePayment()

  if (!payment) return null

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        id: payment.id,
        studentId,
      })
      toast.success(t('tutor_payments.toast_deleted'))
      onOpenChange(false)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || t('tutor_payments.toast_delete_err'),
      )
    }
  }

  const formattedAmount = payment.amount.toLocaleString(numLocale)
  const formattedDate = formatPaymentDate(payment.paymentDate, dateLocale)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t('tutor_payments.modal_delete_title')}</DialogTitle>
              <DialogDescription className="pt-1">
                {t('tutor_payments.modal_delete_subtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-sm text-foreground/80 space-y-2">
          <p>
            {t('tutor_payments.confirm_text_part1', { amount: formattedAmount })}
            {formattedDate && (
              <>
                {t('tutor_payments.confirm_text_date', { date: formattedDate })}
              </>
            )}
            {studentName && (
              <>
                {t('tutor_payments.confirm_text_student', { name: studentName })}
              </>
            )}
            ?
          </p>
          <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border">
            {t('tutor_payments.warning_balance')}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t('tutor_payments.btn_cancel')}
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
            <span>{t('tutor_payments.btn_delete_confirm')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
