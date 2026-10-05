import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "border-border bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300 [a]:hover:bg-red-500/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "border-transparent hover:bg-muted hover:text-muted-foreground",
        link: "border-transparent text-foreground underline-offset-4 hover:underline",

        /* Strict CRM Status Badges */
        scheduled:
          "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 font-medium",
        completed:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium",
        cancelled:
          "border-red-500/20 bg-red-500/10 text-red-800 dark:text-red-300 font-medium",
        unpaid:
          "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium",
        today:
          "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300 font-medium",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium",
        info:
          "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 font-medium",
        danger:
          "border-red-500/20 bg-red-500/10 text-red-800 dark:text-red-300 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
