import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium font-playful ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-toy hover:shadow-float hover:scale-105 transition-bouncy",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-toy hover:shadow-float hover:scale-105 transition-bouncy",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-toy hover:shadow-float hover:scale-105 transition-bouncy",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-toy hover:shadow-float hover:scale-105 transition-bouncy",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-bouncy",
        link: "text-primary underline-offset-4 hover:underline",
        playful: "bg-gradient-rainbow text-white shadow-float hover:shadow-toy hover:scale-110 transition-bouncy animate-pulse-rainbow",
        toy: "bg-gradient-card border-2 border-primary/20 text-foreground shadow-bounce hover:shadow-toy hover:scale-105 transition-bouncy",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 rounded-lg px-4 text-sm",
        lg: "h-16 rounded-xl px-10 text-lg font-bold",
        icon: "h-12 w-12 rounded-xl",
        xl: "h-20 rounded-2xl px-12 text-xl font-bold",
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

export { Button, buttonVariants }
