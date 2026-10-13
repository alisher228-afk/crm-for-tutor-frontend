import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '@/i18n'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTests } from '@/hooks/useTests'
import { TestFormDialog } from './tests/TestFormDialog'
import { TestPreviewModal } from './tests/TestPreviewModal'
import { DeleteTestConfirmDialog } from './tests/DeleteTestConfirmDialog'
import { TestSubmissionsModal } from './tests/TestSubmissionsModal'
import {
  BrainCircuit,
  ExternalLink,
  Plus,
  Search,
  X,
  AlertCircle,
  Copy,
  Check,
  Edit,
  Trash2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Users,
  User,
  Globe,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TestItem, TestType, TestTargetType } from '@/types'

type TargetFilter = 'ANY' | 'ALL' | 'GROUP' | 'INDIVIDUAL'

export function TutorTestsPage() {
  const { t, language } = useLanguage()
  const dateLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 12
  const [typeFilter, setTypeFilter] = useState<'ALL' | TestType>('ALL')
  const [targetFilter, setTargetFilter] = useState<TargetFilter>('ANY')

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<TestItem | null>(null)

  const [previewTest, setPreviewTest] = useState<TestItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const [deletingTest, setDeletingTest] = useState<TestItem | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [submissionsTest, setSubmissionsTest] = useState<TestItem | null>(null)
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false)

  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsFormOpen(true)
    }
  }, [searchParams])

  const { data, isLoading, isError, refetch } = useTests({
    page,
    size: pageSize,
    search: search.trim() || undefined,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    targetType: targetFilter === 'ANY' ? undefined : targetFilter,
  })

  const tests = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

  const handleOpenCreate = () => {
    setEditingTest(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (test: TestItem) => {
    setEditingTest(test)
    setIsFormOpen(true)
  }

  const handleOpenPreview = (test: TestItem) => {
    setPreviewTest(test)
    setIsPreviewOpen(true)
  }

  const handleOpenSubmissions = (test: TestItem) => {
    setSubmissionsTest(test)
    setIsSubmissionsOpen(true)
  }

  const handleOpenDelete = (test: TestItem) => {
    setDeletingTest(test)
    setIsDeleteOpen(true)
  }

  const formatDeadline = (dateStr?: string): string => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const getSafeUrl = (url?: string): string => {
    if (!url) return ''
    const trimmed = url.trim()
    if (!trimmed) return ''
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`
  }

  const handleCopyLink = (test: TestItem) => {
    const url = getSafeUrl(test.externalUrl)
    if (url) {
      navigator.clipboard.writeText(url)
      setCopiedId(test.id)
      toast.success(t('tutor_tests.toast_link_copied'))
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const getQuestionCount = (test: TestItem): number => {
    if (!test.questionsJson) return 0
    try {
      let parsed: any = test.questionsJson
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed)
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray((parsed as Record<string, unknown>).questions)) {
        parsed = (parsed as Record<string, unknown>).questions
      }
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  }

  const getDomainName = (url?: string): string => {
    if (!url) return t('tutor_tests.default_external_domain')
    try {
      const normalized = getSafeUrl(url)
      return new URL(normalized).hostname.replace(/^www\./, '')
    } catch {
      return t('tutor_tests.default_external_domain')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('tutor_tests.title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('tutor_tests.subtitle')}
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="self-start sm:self-auto gap-2">
          <Plus className="h-4 w-4" />
          <span>{t('tutor_tests.btn_create_test')}</span>
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant={typeFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={() => {
              setTypeFilter('ALL')
              setPage(0)
            }}
          >
            {t('tutor_tests.tab_all', { count: totalElements })}
          </Button>

          <Button
            variant={typeFilter === 'INTERNAL' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs font-medium gap-1.5"
            onClick={() => {
              setTypeFilter('INTERNAL')
              setPage(0)
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{t('tutor_tests.tab_interactive')}</span>
          </Button>

          <Button
            variant={typeFilter === 'EXTERNAL' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs font-medium gap-1.5"
            onClick={() => {
              setTypeFilter('EXTERNAL')
              setPage(0)
            }}
          >
            <ExternalLink className="h-3.5 w-3.5 text-sky-600" />
            <span>{t('tutor_tests.tab_external')}</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('tutor_tests.search_placeholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-8 text-xs h-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Target Audience Filters */}
      <div className="flex flex-wrap items-center gap-1.5 -mt-2">
        <span className="text-xs text-muted-foreground mr-1">{t('tutor_tests.filter_target_label')}</span>
        <button
          type="button"
          onClick={() => {
            setTargetFilter('ANY')
            setPage(0)
          }}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
            targetFilter === 'ANY'
              ? 'bg-primary text-primary-foreground border-primary font-medium shadow-xs'
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          {t('tutor_tests.target_any')}
        </button>
        <button
          type="button"
          onClick={() => {
            setTargetFilter('ALL')
            setPage(0)
          }}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
            targetFilter === 'ALL'
              ? 'bg-emerald-600 text-white border-emerald-600 font-medium shadow-xs'
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          <Globe className="h-3 w-3" />
          <span>{t('tutor_tests.target_all')}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTargetFilter('GROUP')
            setPage(0)
          }}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
            targetFilter === 'GROUP'
              ? 'bg-purple-600 text-white border-purple-600 font-medium shadow-xs'
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          <Users className="h-3 w-3" />
          <span>{t('tutor_tests.target_group')}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTargetFilter('INDIVIDUAL')
            setPage(0)
          }}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
            targetFilter === 'INDIVIDUAL'
              ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-xs'
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          <User className="h-3 w-3" />
          <span>{t('tutor_tests.target_individual')}</span>
        </button>
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">{t('tutor_tests.err_load_title')}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {t('tutor_tests.err_load_desc')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('tutor_tests.btn_retry')}
          </Button>
        </div>
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => {
            const isInternal = test.type === 'INTERNAL'
            const qCount = getQuestionCount(test)
            const domain = getDomainName(test.externalUrl)

            return (
              <Card
                key={test.id}
                className="group relative flex flex-col justify-between border-border hover:border-primary/40 hover:shadow-sm transition-all bg-card overflow-hidden"
              >
                <CardHeader className="pb-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          isInternal
                            ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                            : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-600 group-hover:text-white'
                        }`}
                      >
                        {isInternal ? (
                          <BrainCircuit className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-bold truncate tracking-tight">
                          {test.title}
                        </CardTitle>
                        {test.topic && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {test.topic}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => handleOpenEdit(test)}
                        title={t('tutor_tests.action_edit')}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleOpenDelete(test)}
                        title={t('tutor_tests.action_delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2 flex-1 space-y-2">
                  {test.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {test.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">{t('tutor_tests.no_desc')}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {test.targetType === 'GROUP' ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-medium"
                      >
                        <Users className="h-3 w-3" />
                        <span>{t('tutor_tests.badge_group_prefix', { name: test.groupName || '' })}</span>
                      </Badge>
                    ) : test.targetType === 'INDIVIDUAL' ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-medium"
                      >
                        <User className="h-3 w-3" />
                        <span>{test.studentName ? t('tutor_tests.badge_student_prefix', { name: test.studentName }) : t('tutor_tests.badge_student_indiv')}</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[11px] gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      >
                        <Globe className="h-3 w-3" />
                        <span>{t('tutor_tests.badge_for_all')}</span>
                      </Badge>
                    )}

                    {isInternal ? (
                      <Badge
                        variant="secondary"
                        className="text-[11px] bg-primary/10 text-primary border-primary/20"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {qCount === 1 ? t('tutor_tests.q_count_1', { count: qCount }) : t('tutor_tests.q_count_many', { count: qCount })}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[11px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {domain}
                      </Badge>
                    )}

                    {test.timeLimitMinutes && (
                      <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{t('tutor_tests.unit_minutes', { count: test.timeLimitMinutes })}</span>
                      </Badge>
                    )}

                    {test.deadline && (
                      <Badge variant="outline" className="text-[11px] gap-1 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                        <Calendar className="h-3 w-3" />
                        <span>{t('tutor_tests.deadline_prefix', { date: formatDeadline(test.deadline) })}</span>
                      </Badge>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenSubmissions(test)}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                      title={t('tutor_tests.submissions_count', { count: test.submissionsCount ?? 0 })}
                    >
                      <Users className="h-3 w-3 text-primary" />
                      <span>{t('tutor_tests.submissions_count', { count: test.submissionsCount ?? 0 })}</span>
                      {test.averageScore !== undefined && test.averageScore !== null && (test.submissionsCount ?? 0) > 0 && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-0.5">
                          • {test.averageScore}%
                        </span>
                      )}
                    </button>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2 bg-muted/10">
                  {isInternal ? (
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 h-8"
                      onClick={() => handleOpenPreview(test)}
                    >
                      <BrainCircuit className="h-3.5 w-3.5" />
                      <span>{t('tutor_tests.btn_preview_test')}</span>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 w-full">
                      <Button
                        size="sm"
                        className="flex-1 text-xs font-semibold gap-1.5 h-8"
                        onClick={() => {
                          const safe = getSafeUrl(test.externalUrl)
                          if (safe) {
                            window.open(safe, '_blank', 'noopener,noreferrer')
                          } else {
                            toast.error(t('tutor_tests.err_no_external_url'))
                          }
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{t('tutor_tests.btn_go_to_test')}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => handleOpenPreview(test)}
                        title={t('tutor_tests.tooltip_preview')}
                      >
                        <BrainCircuit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => handleCopyLink(test)}
                        title={t('tutor_tests.tooltip_copy_link')}
                      >
                        {copiedId === test.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">
            {search ? t('tutor_tests.empty_search_title') : t('tutor_tests.empty_tests_title')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1 mb-4">
            {search
              ? t('tutor_tests.empty_search_desc', { query: search })
              : t('tutor_tests.empty_tests_desc')}
          </p>
          {search ? (
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              {t('tutor_tests.btn_reset_search')}
            </Button>
          ) : (
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('tutor_tests.btn_create_first')}
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted-foreground">
          <div>{t('tutor_tests.pagination_total', { total: totalElements })}</div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="h-8 px-2.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>{t('tutor_tests.btn_prev')}</span>
            </Button>
            <span className="px-2 font-medium">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= totalPages || isLoading}
              className="h-8 px-2.5"
            >
              <span>{t('tutor_tests.btn_next')}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TestFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingTest(null)
            if (searchParams.get('create')) {
              const next = new URLSearchParams(searchParams)
              next.delete('create')
              next.delete('targetType')
              next.delete('groupName')
              next.delete('studentId')
              setSearchParams(next)
            }
          }
        }}
        initialData={editingTest}
        initialTargetType={
          (searchParams.get('targetType') as TestTargetType) ||
          (searchParams.get('groupName')
            ? 'GROUP'
            : searchParams.get('studentId')
            ? 'INDIVIDUAL'
            : 'ALL')
        }
        initialGroupName={searchParams.get('groupName') || undefined}
        initialStudentId={searchParams.get('studentId') || undefined}
        onSuccess={() => refetch()}
      />

      <TestPreviewModal
        test={previewTest}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />

      <DeleteTestConfirmDialog
        test={deletingTest}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />

      <TestSubmissionsModal
        test={submissionsTest}
        open={isSubmissionsOpen}
        onOpenChange={setIsSubmissionsOpen}
      />
    </div>
  )
}
