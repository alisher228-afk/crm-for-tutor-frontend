import React from 'react'
import { cn } from '@/lib/utils'

export type LogoVariant = 'mark' | 'full'
export type LogoSize = 'sm' | 'md' | 'lg' | number
export type LogoConcept = 'a' | 'b' | 'c'

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LogoVariant
  size?: LogoSize
  concept?: LogoConcept
  monochrome?: boolean
  className?: string
}

export const LogoMarkConceptA: React.FC<{
  size: number
  monochrome?: boolean
  className?: string
}> = ({ size, monochrome, className }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0 select-none overflow-visible', className)}
    aria-hidden="true"
  >
    <path
      d="M21 8.5H14C11.2386 8.5 9 10.7386 9 13.5C9 16.2614 11.2386 18.5 14 18.5H18C20.7614 18.5 23 20.7386 23 23.5C23 26.2614 20.7614 28.5 18 28.5H11"
      stroke="currentColor"
      strokeWidth="3.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <rect
      x="23.5"
      y="6"
      width="4.5"
      height="4.5"
      fill={monochrome ? 'currentColor' : 'var(--red, #E11D48)'}
    />
  </svg>
)

export const LogoMarkConceptB: React.FC<{
  size: number
  monochrome?: boolean
  className?: string
}> = ({ size, monochrome, className }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0 select-none', className)}
    aria-hidden="true"
  >
    <rect x="6.5" y="6" width="19" height="5.5" fill="currentColor" />
    <rect x="6.5" y="6" width="5.5" height="13.5" fill="currentColor" />
    <rect x="6.5" y="13.5" width="19" height="5.5" fill="currentColor" />
    <rect x="20" y="13.5" width="5.5" height="13" fill="currentColor" />
    <rect x="6.5" y="21" width="19" height="5.5" fill="currentColor" />
    <rect
      x="24"
      y="6.75"
      width="4"
      height="4"
      fill={monochrome ? 'currentColor' : 'var(--red, #E11D48)'}
    />
  </svg>
)

export const LogoMarkConceptC: React.FC<{
  size: number
  monochrome?: boolean
  className?: string
}> = ({ size, monochrome, className }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0 select-none', className)}
    aria-hidden="true"
  >
    <rect
      x="3.5"
      y="3.5"
      width="25"
      height="25"
      className="fill-muted/60 stroke-border"
      strokeWidth="1.25"
    />
    <path
      d="M9.5 16.5L14 21L22.5 11.5"
      stroke="currentColor"
      strokeWidth="3.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <rect
      x="23"
      y="5"
      width="4"
      height="4"
      fill={monochrome ? 'currentColor' : 'var(--red, #E11D48)'}
    />
  </svg>
)

export function Logo({
  variant = 'full',
  size = 'md',
  concept = 'a',
  monochrome = false,
  className,
  ...props
}: LogoProps) {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 20
      : size === 'lg'
      ? 32
      : 24

  const textSizeClass =
    typeof size === 'number'
      ? size >= 32
        ? 'text-2xl'
        : size >= 24
        ? 'text-lg'
        : 'text-base'
      : size === 'sm'
      ? 'text-base'
      : size === 'lg'
      ? 'text-xl'
      : 'text-lg'

  const renderMark = () => {
    switch (concept) {
      case 'b':
        return <LogoMarkConceptB size={pixelSize} monochrome={monochrome} className="text-foreground" />
      case 'c':
        return <LogoMarkConceptC size={pixelSize} monochrome={monochrome} className="text-foreground" />
      case 'a':
      default:
        return <LogoMarkConceptA size={pixelSize} monochrome={monochrome} className="text-foreground" />
    }
  }

  if (variant === 'mark') {
    return (
      <div
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        {renderMark()}
      </div>
    )
  }

  return (
    <div
      className={cn('inline-flex items-center gap-2.5 select-none', className)}
      {...props}
    >
      <div className="flex items-center justify-center shrink-0">
        {renderMark()}
      </div>
      <div className="flex items-center gap-1.5 leading-none">
        <span
          className={cn(
            'font-heading font-bold tracking-tight text-foreground leading-none',
            textSizeClass
          )}
        >
          Studly<span className="text-red-accent font-black">.</span>
        </span>
        <span className="font-mono text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-1.5 py-0.5 rounded border border-border bg-muted/40 leading-none inline-flex items-center gap-1">
          <span className="h-1 w-1 bg-red-accent shrink-0" />
          CRM
        </span>
      </div>
    </div>
  )
}
