import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-card hover:-translate-y-px hover:bg-primary-hover hover:shadow-card-hover active:translate-y-0 active:scale-[0.985] active:bg-primary-active",
        secondary:
          "border border-border bg-card text-foreground shadow-card hover:-translate-y-px hover:border-border-strong hover:bg-secondary active:translate-y-0 active:scale-[0.985]",
        ghost:
          "text-muted-foreground hover:bg-primary-soft hover:text-accent-foreground",
        band:
          "border border-band-border bg-band-card text-band-foreground shadow-band hover:-translate-y-px hover:bg-band-hover active:translate-y-0",
        outline:
          "border border-border bg-transparent text-foreground hover:border-border-strong hover:bg-card",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:-translate-y-px active:translate-y-0",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-sm px-3.5 text-[13px]",
        lg: "h-12 rounded-md px-6 text-[15px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
