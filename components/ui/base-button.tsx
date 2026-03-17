"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-primary bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90 data-[popup-open]:bg-primary/90",
        mono: "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-900 data-[state=open]:bg-zinc-900 data-[popup-open]:bg-zinc-900",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 data-[state=open]:bg-destructive/90 data-[popup-open]:bg-destructive/90",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 data-[state=open]:bg-secondary/90 data-[popup-open]:bg-secondary/90",
        outline:
          "border-input bg-background text-accent-foreground hover:bg-accent data-[state=open]:bg-accent data-[popup-open]:bg-accent",
        dashed:
          "border-input border-dashed bg-background text-accent-foreground hover:bg-accent data-[state=open]:bg-accent data-[popup-open]:bg-accent",
        ghost:
          "border-transparent bg-transparent text-accent-foreground hover:bg-accent data-[state=open]:bg-accent data-[popup-open]:bg-accent",
        dim: "border-transparent bg-transparent text-muted-foreground hover:text-foreground data-[state=open]:text-foreground data-[popup-open]:text-foreground",
        foreground: "border-transparent bg-transparent text-foreground",
        inverse: "border-white/20 bg-white/10 text-white hover:bg-white/15",
      },
      appearance: {
        default: "",
        ghost: "shadow-none",
      },
      underline: {
        solid: "",
        dashed: "",
      },
      underlined: {
        solid: "",
        dashed: "",
      },
      size: {
        lg: "h-10 gap-1.5 px-4 text-sm [&_svg:not([class*=size-])]:size-4",
        md: "h-9 gap-1.5 px-3 text-sm [&_svg:not([class*=size-])]:size-4",
        sm: "h-7 gap-1.25 px-2.5 text-xs [&_svg:not([class*=size-])]:size-3.5",
        icon: "size-9 shrink-0 [&_svg:not([class*=size-])]:size-4",
      },
      autoHeight: {
        true: "h-auto min-h-9 py-2",
        false: "",
      },
      shape: {
        default: "",
        circle: "rounded-full",
      },
      mode: {
        default: "",
        icon: "px-0",
        link: "h-auto border-transparent bg-transparent p-0 text-primary hover:bg-transparent",
        input:
          "justify-start bg-background font-normal hover:bg-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
      },
      placeholder: {
        true: "text-muted-foreground",
        false: "",
      },
    },
    compoundVariants: [
      {
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/10",
      },
      {
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/10",
      },
      {
        mode: "link",
        underline: "solid",
        className: "hover:underline hover:underline-offset-4",
      },
      {
        mode: "link",
        underline: "dashed",
        className: "hover:underline hover:decoration-dashed hover:underline-offset-4",
      },
      {
        mode: "link",
        underlined: "solid",
        className: "underline underline-offset-4",
      },
      {
        mode: "link",
        underlined: "dashed",
        className: "underline decoration-dashed underline-offset-4",
      },
    ],
    defaultVariants: {
      variant: "primary",
      mode: "default",
      size: "md",
      shape: "default",
      appearance: "default",
      autoHeight: false,
      placeholder: false,
    },
  },
)

export interface ButtonProps extends useRender.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  selected?: boolean
  asChild?: boolean
}

function Button({
  render,
  asChild = false,
  children,
  className,
  selected,
  variant,
  shape,
  appearance,
  mode,
  size,
  autoHeight,
  underlined,
  underline,
  placeholder,
  ...props
}: ButtonProps) {
  const defaultProps = {
    "data-slot": "button",
    className: cn(
      buttonVariants({
        variant,
        size,
        shape,
        appearance,
        mode,
        autoHeight,
        placeholder,
        underlined,
        underline,
        className,
      }),
      asChild && props.disabled && "pointer-events-none opacity-50",
    ),
    ...(selected && { "data-state": "open" as const }),
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

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon
}

function ButtonArrow({ icon: Icon = ChevronDown, className, ...props }: ButtonArrowProps) {
  return <Icon data-slot="button-arrow" className={cn("ms-auto -me-1", className)} {...props} />
}

export { Button, ButtonArrow, buttonVariants }
