import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Users, Phone, Send, Search, GraduationCap, ChevronRight } from 'lucide-react'

export interface GroupStudentInfo {
  id: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  telegram?: string
  currentLevel?: string
  lessonBalance?: number
}

interface GroupStudentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  students: GroupStudentInfo[]
  onSelectStudent?: (studentId: string) => void
}

function getStudentNoun(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return 'учеников'
  if (mod10 === 1) return 'ученик'
  if (mod10 >= 2 && mod10 <= 4) return 'ученика'
  return 'учеников'
}

export function GroupStudentsDialog({
  open,
  onOpenChange,
  groupName,
  students,
  onSelectStudent,
}: GroupStudentsDialogProps) {
  const [search, setSearch] = useState('')

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Группа «{groupName}»
              </DialogTitle>
              <DialogDescription className="text-xs">
                Список учеников, записанных на это занятие ({students.length}{' '}
                {getStudentNoun(students.length)})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {students.length > 4 && (
          <div className="relative pt-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Поиск по ученикам группы..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/20"
            />
          </div>
        )}

        <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1 pt-1">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((st, idx) => {
              const initial = st.name.charAt(0).toUpperCase() || 'У'
              const tgClean = st.telegram?.replace(/^@/, '')

              return (
                <div
                  key={st.id || idx}
                  onClick={() => st.id && onSelectStudent?.(st.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border border-border bg-card transition-all ${
                    onSelectStudent && st.id
                      ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/40 group'
                      : 'hover:bg-muted/30'
                  }`}
                  title={onSelectStudent && st.id ? 'Нажмите, чтобы открыть информацию об ученике' : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${onSelectStudent && st.id ? 'group-hover:text-primary transition-colors' : 'text-foreground'}`}>
                        {st.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {st.currentLevel && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                            <GraduationCap className="h-3 w-3 text-muted-foreground/70" />
                            {st.currentLevel}
                          </span>
                        )}
                        {st.lessonBalance !== undefined && (
                          <span
                            className={`text-[11px] font-medium ${
                              st.lessonBalance > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : st.lessonBalance < 0
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            Баланс: {st.lessonBalance} ур.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contacts & Action */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tgClean && (
                        <a
                          href={`https://t.me/${tgClean}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                          title={`Telegram: @${tgClean}`}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {st.phone && (
                        <a
                          href={`tel:${st.phone}`}
                          className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title={`Телефон: ${st.phone}`}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    {onSelectStudent && st.id && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              Ученики не найдены
            </p>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs"
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
