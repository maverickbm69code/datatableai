import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[52px] w-full rounded-md border border-input bg-card px-4 text-base text-foreground shadow-card transition-colors duration-200 placeholder:text-muted-foreground/70 hover:border-border-strong focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-secondary disabled:opacity-60 md:text-[15px]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
