import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default: "gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-none",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none",
        outline: "border-2 border-black bg-background hover:bg-[#007bff] hover:text-white hover:border-[#007bff] rounded-none transition-all",
        ghost: "hover:bg-[#007bff] hover:text-white border-2 border-transparent hover:border-[#007bff] rounded-none transition-all",
        link: "text-[#007bff] underline-offset-4 hover:underline",
        subtle: "bg-muted text-muted-foreground hover:text-foreground rounded-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-none",
        lg: "h-11 px-8 rounded-none",
        icon: "h-9 w-9 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

