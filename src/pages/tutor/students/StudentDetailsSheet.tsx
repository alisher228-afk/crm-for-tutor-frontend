import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useStudent,
  useGenerateInvite,
  useGenerateTelegramCode,
} from '@/hooks/useStudents'
import { toast } from 'sonner'
import {
  Phone,
  Send,
  Mail,
  Copy,
  Check,
  Edit2,
  Archive,
  Link as LinkIcon,
  Bot,
  Loader2,
  Layers,
  Banknote,
  Clock,
  Sparkles,
  Users,
  BrainCircuit,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import type { StudentProfile } from '@/types'
import type { AxiosError } from 'axios'

interface StudentDetailsSheetProps {
  studentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (student: StudentProfile) => void
  onArchive?: (student: StudentProfile) => void
  onMoveGroup?: (student: StudentProfile) => void
}

export function StudentDetailsSheet({
  studentId,
  open,
  onOpenChange,
  onEdit,
  onArchive,
  onMoveGroup,
}: StudentDetailsSheetProps) {
  const { t, language } = useTranslation()
  const dateLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
  const numLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'

  const { data: student, isLoading } = useStudent(studentId)
  const navigate = useNavigate()

  const inviteMutation = useGenerateInvite()
  const telegramCodeMutation = useGenerateTelegramCode()

  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [hasCopiedInvite, setHasCopiedInvite] = useState(false)

  const [telegramModalOpen, setTelegramModalOpen] = useState(false)
  const [telegramCode, setTelegramCode] = useState('')
  const [hasCopiedCode, setHasCopiedCode] = useState(false)

  const studentName =
    student?.name ||
    [student?.firstName, student?.lastName].filter(Boolean).join(' ') ||
    t('tutor_students.default_student_name')

  const initial = studentName.charAt(0).toUpperCase() || '?'

  // Handle Generate Invite
  const handleInvite = async () => {
    if (!student?.id) return

    try {
      const token = await inviteMutation.mutateAsync(student.id)
      const link = `${window.location.origin}/register/student?token=${encodeURIComponent(token)}`
      setInviteLink(link)
      setHasCopiedInvite(false)
      setInviteModalOpen(true)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || t('tutor_students.toast_create_err'),
      )
    }
  }

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink)
    setHasCopiedInvite(true)
    toast.success(t('tutor_students.toast_invite_copied'))
    setTimeout(() => setHasCopiedInvite(false), 3000)
  }

  // Handle Telegram Link Code
  const handleTelegramCode = async () => {
    if (!student?.id) return

    try {
      const code = await telegramCodeMutation.mutateAsync(student.id)
      setTelegramCode(code)
      setHasCopiedCode(false)
      setTelegramModalOpen(true)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message ||
          t('student_profile.err_generate_code'),
      )
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(telegramCode)
    setHasCopiedCode(true)
    toast.success(t('tutor_students.toast_tg_copied'))
    setTimeout(() => setHasCopiedCode(false), 3000)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0 flex flex-col">
          <SheetHeader className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl font-bold">{studentName}</SheetTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        student?.status === 'ACTIVE'
                          ? 'default'
                          : student?.status === 'ARCHIVED'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs"
                    >
                      {student?.status === 'ACTIVE'
                        ? t('tutor_students.status_active')
                        : student?.status === 'ARCHIVED'
                          ? t('tutor_students.status_archived')
                          : student?.status || t('tutor_students.status_active')}
                    </Badge>
                    {student?.groupName ? (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {student.groupName}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground flex items-center gap-1">
                        {t('tutor_students.format_individual')}
                      </Badge>
                    )}
                    {student?.telegramLinked && (
                      <Badge variant="outline" className="text-[10px] text-sky-600 border-sky-200 bg-sky-50 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400">
                        {`Telegram ${t('student_profile.tg_linked_label')}`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <SheetDescription className="sr-only">
              {t('tutor_students.details_card_desc', { name: studentName })}
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="p-6 space-y-4 flex-1">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : student ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="p-3 text-center border-border">
                  <CardContent className="p-0">
                    <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
                      <Layers className="h-3 w-3" /> {t('student_profile.balance_title')}
                    </p>
                    {(() => {
                      const balance = student.lessonBalance ?? student.balance ?? 0
                      return (
                        <p
                          className={`text-lg font-bold mt-0.5 tabular-nums ${
                            balance < 0
                              ? 'text-red-600 dark:text-red-400 font-black'
                              : balance === 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-foreground'
                          }`}
                        >
                          {balance < 0 && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-accent mr-1 align-middle" />
                          )}
                          {balance} {t('tutor_students.unit_lesson')}
                        </p>
                      )
                    })()}
                  </CardContent>
                </Card>

                <Card className="p-3 text-center border-border">
                  <CardContent className="p-0">
                    <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
                      <Banknote className="h-3 w-3" /> {t('student_profile.rate_label')}
                    </p>
                    <p className="text-lg font-bold mt-0.5 text-foreground">
                      {student.hourlyRate ? `${student.hourlyRate.toLocaleString(numLocale)}` : '—'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-3 text-center border-border">
                  <CardContent className="p-0">
                    <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
                      <Sparkles className="h-3 w-3" /> {t('student_profile.level_label')}
                    </p>
                    <p className="text-sm font-semibold mt-1 truncate text-foreground">
                      {student.currentLevel || '—'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons for Invite & Telegram */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInvite}
                  disabled={inviteMutation.isPending}
                  className="flex items-center gap-1.5"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LinkIcon className="h-3.5 w-3.5" />
                  )}
                  <span>{t('tutor_students.btn_invite')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTelegramCode}
                  disabled={telegramCodeMutation.isPending}
                  className="flex items-center gap-1.5"
                >
                  {telegramCodeMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                  <span>{t('tutor_students.btn_link_tg')}</span>
                </Button>
              </div>

              {/* Assign Personal Test Button */}
              {student && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false)
                    navigate(`/tutor/tests?create=true&targetType=INDIVIDUAL&studentId=${student.id}`)
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs h-8 text-foreground hover:bg-muted"
                >
                  <BrainCircuit className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{t('tutor_students.btn_assign_test')}</span>
                </Button>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('tutor_students.contacts_section')}
                </h4>

                <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
                  {student.phone ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" /> {t('student_profile.phone_label')}
                      </span>
                      <a
                        href={`tel:${student.phone}`}
                        className="font-medium hover:underline text-foreground"
                      >
                        {student.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" /> {t('student_profile.phone_label')}
                      </span>
                      <span>{t('student_profile.not_specified')}</span>
                    </div>
                  )}

                  {student.telegram ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Send className="h-3.5 w-3.5" /> Telegram
                      </span>
                      <a
                        href={
                          student.telegram.startsWith('@')
                            ? `https://t.me/${student.telegram.slice(1)}`
                            : `https://t.me/${student.telegram}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                      >
                        {student.telegram}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Send className="h-3.5 w-3.5" /> Telegram
                      </span>
                      <span>{t('student_profile.not_specified')}</span>
                    </div>
                  )}

                  {student.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </span>
                      <span className="font-medium text-foreground">{student.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes & Extra Info */}
              {student.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('tutor_students.notes_section')}
                  </h4>
                  <div className="rounded-lg bg-muted/40 border border-border p-3 text-sm whitespace-pre-wrap leading-relaxed">
                    {student.notes}
                  </div>
                </div>
              )}

              {/* Dates */}
              {student.createdAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {t('tutor_students.added_date', {
                      date: new Date(student.createdAt).toLocaleDateString(dateLocale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }),
                    })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              {t('tutor_students.not_found')}
            </div>
          )}

          {/* Footer Actions */}
          {student && (onMoveGroup || onEdit || onArchive) && (
            <div className="p-4 border-t border-border flex items-center gap-2 bg-muted/20">
              {onMoveGroup && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onMoveGroup(student)}
                >
                  <Users className="mr-2 h-4 w-4 text-primary" />
                  {student.groupName ? t('tutor_students.btn_change_group') : t('tutor_students.btn_to_group')}
                </Button>
              )}

              {onEdit && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onEdit(student)
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  {t('tutor_students.action_edit')}
                </Button>
              )}

              {onArchive && student.status !== 'ARCHIVED' && (
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                  onClick={() => {
                    onArchive(student)
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {t('tutor_students.btn_to_archive')}
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LinkIcon className="h-4 w-4" />
              </div>
              <DialogTitle>{t('tutor_students.invite_modal_title')}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {t('tutor_students.invite_modal_desc', { name: studentName })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="font-mono text-xs select-all bg-muted/50"
              />
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={handleCopyInvite}
                title={t('student_profile.modal_tg_copy')}
              >
                {hasCopiedInvite ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t('tutor_students.invite_token_notice')}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Telegram Link Code Modal */}
      <Dialog open={telegramModalOpen} onOpenChange={setTelegramModalOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 mb-2">
              <Bot className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl">{t('tutor_students.tg_modal_title')}</DialogTitle>
            <DialogDescription>
              {t('tutor_students.tg_modal_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="p-4 bg-muted/60 border border-border rounded-xl flex items-center justify-center gap-4">
              <span className="text-3xl font-mono font-bold tracking-widest text-foreground">
                {telegramCode || '------'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-9 px-3"
              >
                {hasCopiedCode ? (
                  <Check className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                <span>{hasCopiedCode ? t('student_profile.modal_tg_copied') : t('student_profile.modal_tg_copy')}</span>
              </Button>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 text-left text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">{t('tutor_students.tg_instruction_title')}</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>{t('tutor_students.tg_instruction_1')}</li>
                <li>{t('tutor_students.tg_instruction_2')}</li>
                <li>{t('tutor_students.tg_instruction_3')}</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
