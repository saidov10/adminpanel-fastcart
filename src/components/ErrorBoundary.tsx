import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 max-w-md text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong.</h2>
            <p className="text-sm text-muted-foreground mb-4">An error occurred while loading this view.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/95 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
