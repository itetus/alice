"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export interface BadgeProps extends useRender.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  asChild?: boolean
  dotClassName?: string
  disabled?: boolean
}

export interface BadgeButtonProps extends useRender.ComponentProps<"button">, VariantProps<typeof badgeButtonVariants> {
  asChild?: boolean
}

export type BadgeDotProps = React.HTMLAttributes<HTMLSpanElement>

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md border font-medium focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-2 focus:ring-offset-background [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-primary bg-primary text-primary-foreground",
        secondary: "border-secondary bg-secondary text-secondary-foreground",
        success: "border-emerald-500/30 bg-emerald-500 text-white",
        warning: "border-amber-500/30 bg-amber-500 text-white",
        info: "border-sky-500/30 bg-sky-500 text-white",
        outline: "border-border bg-transparent text-secondary-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground",
      },
      appearance: {
        default: "",
        light: "",
        outline: "bg-transparent",
        ghost: "border-transparent bg-transparent px-0",
      },
      disabled: {
        true: "pointer-events-none opacity-50",
      },
      size: {
        lg: "h-7 min-w-7 px-2 text-xs [&_svg]:size-3.5",
        md: "h-6 min-w-6 px-2 text-xs [&_svg]:size-3.5",
        sm: "h-5 min-w-5 px-1.5 text-[0.6875rem] [&_svg]:size-3",
        xs: "h-4 min-w-4 px-1 text-[0.625rem] [&_svg]:size-3",
      },
      shape: {
        default: "",
        circle: "rounded-full",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        appearance: "light",
        className: "border-red-500/15 bg-red-500/12 text-red-200",
      },
      {
        variant: "secondary",
        appearance: "light",
        className: "border-white/10 bg-white/8 text-zinc-100",
      },
      {
        variant: "destructive",
        appearance: "light",
        className: "border-red-500/15 bg-red-500/12 text-red-200",
      },
      {
        variant: "success",
        appearance: "light",
        className: "border-emerald-500/15 bg-emerald-500/12 text-emerald-200",
      },
      {
        variant: "warning",
        appearance: "light",
        className: "border-amber-500/15 bg-amber-500/12 text-amber-200",
      },
      {
        variant: "info",
        appearance: "light",
        className: "border-sky-500/15 bg-sky-500/12 text-sky-200",
      },
    ],
    defaultVariants: {
      variant: "primary",
      appearance: "default",
      size: "md",
      disabled: false,
      shape: "default",
    },
  },
)

const badgeButtonVariants = cva(
  "inline-flex size-4 items-center justify-center rounded-md p-0 opacity-60 transition-opacity hover:opacity-100 [&>svg]:size-3.5 [&>svg]:!opacity-100",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  render,
  asChild = false,
  children,
  className,
  variant,
  size,
  appearance,
  shape,
  disabled,
  ...props
}: BadgeProps) {
  const defaultProps = {
    className: cn(badgeVariants({ variant, size, appearance, shape, disabled }), className),
    "data-slot": "badge",
  }

  const renderElement =
    asChild && React.isValidElement(children)
      ? (children as React.ReactElement<Record<string, unknown>, string | React.JSXElementConstructor<unknown>>)
      : render || <span />

  const finalProps =
    asChild && React.isValidElement(children)
      ? mergeProps(defaultProps, props)
      : mergeProps(defaultProps, { ...props, children })

  return useRender({
    render: renderElement,
    props: finalProps,
  })
}

function BadgeButton({ render, asChild = false, children, className, variant, ...props }: BadgeButtonProps) {
  const defaultProps = {
    className: cn(badgeButtonVariants({ variant, className })),
    role: "button" as const,
    "data-slot": "badge-button",
  }

  const renderElement =
    asChild && React.isValidElement(children)
      ? (children as React.ReactElement<Record<string, unknown>, string | React.JSXElementConstructor<unknown>>)
      : render || <button />

  const finalProps =
    asChild && React.isValidElement(children)
      ? mergeProps(defaultProps, props)
      : mergeProps(defaultProps, { ...props, children })

  return useRender({
    render: renderElement,
    props: finalProps,
  })
}

function BadgeDot({ className, ...props }: BadgeDotProps) {
  return <span data-slot="badge-dot" className={cn("size-1.5 rounded-full bg-current opacity-75", className)} {...props} />
}

export { Badge, BadgeButton, BadgeDot, badgeVariants }
