import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full p-6 text-center rounded-2xl border border-border bg-card shadow-lg space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Что-то пошло не так</h2>
              <p className="text-xs text-muted-foreground mt-1.5">
                Произошла неожиданная ошибка интерфейса. Мы сохранили данные сессии.
              </p>
              {this.state.error && (
                <div className="mt-3 p-2.5 rounded-lg bg-muted text-[11px] text-muted-foreground font-mono text-left max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button size="sm" onClick={this.handleReload} className="gap-1.5 text-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Перезагрузить</span>
              </Button>
              <Button variant="outline" size="sm" onClick={this.handleGoHome} className="gap-1.5 text-xs">
                <Home className="h-3.5 w-3.5" />
                <span>На главную</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
