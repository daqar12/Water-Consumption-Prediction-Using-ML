import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    /** When true, the Button will pass its props and classes to the direct child element using React.cloneElement */
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', asChild = false, children, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90",
            secondary: "bg-secondary text-white hover:bg-secondary/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            danger: "bg-danger text-white hover:bg-danger/90",
            success: "bg-success text-white hover:bg-success/90",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-11 px-8",
            icon: "h-10 w-10",
        };

        const classes = cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            variants[variant],
            sizes[size],
            className
        );

        // If asChild is used, clone the single child and merge props
        if (asChild && React.isValidElement(children)) {
            // Clone the child and merge className + pass through props and ref.
            // We cast to `any` here to avoid strict element prop typing; this keeps the API ergonomic
            // and mirrors common implementations (e.g. Radix Slot) without adding a dependency.
            const childProps: any = {
                className: cn((children.props as any)?.className, classes),
                ...props,
            };

            // If a ref was forwarded, attach it using a callback ref so React accepts it on any element
            if (ref) {
                childProps.ref = ref as any;
            }

            return React.cloneElement(children, childProps);
        }

        return (
            <button className={classes} ref={ref} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
