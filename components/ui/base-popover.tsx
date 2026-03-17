"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverPositioner({ sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Positioner>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner data-slot="popover-positioner" sideOffset={sideOffset} {...props} />
    </PopoverPrimitive.Portal>
  )
}

export interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Popup> {
  align?: PopoverPrimitive.Positioner.Props["align"]
  sideOffset?: PopoverPrimitive.Positioner.Props["sideOffset"]
  alignOffset?: PopoverPrimitive.Positioner.Props["alignOffset"]
  side?: PopoverPrimitive.Positioner.Props["side"]
  collisionPadding?: PopoverPrimitive.Positioner.Props["collisionPadding"]
  sticky?: PopoverPrimitive.Positioner.Props["sticky"]
  collisionAvoidance?: PopoverPrimitive.Positioner.Props["collisionAvoidance"]
  showArrow?: boolean
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  side = "bottom",
  collisionPadding = 16,
  sticky = true,
  collisionAvoidance,
  children,
  showArrow = true,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-slot="popover-positioner"
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        side={side}
        collisionPadding={collisionPadding}
        sticky={sticky}
        collisionAvoidance={collisionAvoidance}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md shadow-black/20 outline-hidden transition-[opacity,transform] duration-200 ease-out data-[closed]:pointer-events-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[open]:scale-100 data-[open]:opacity-100 data-[side=bottom]:translate-y-0.5 data-[side=left]:-translate-x-0.5 data-[side=right]:translate-x-0.5 data-[side=top]:-translate-y-0.5 origin-[var(--transform-origin)]",
            className,
          )}
          {...props}
        >
          {children}
          {showArrow ? <PopoverArrow /> : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverArrow({ className, ...props }: React.ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn(
        "z-50 data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180",
        className,
      )}
      {...props}
    >
      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
        <path
          d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V9H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
          className="fill-popover"
        />
        <path
          d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
          className="fill-border"
        />
      </svg>
    </PopoverPrimitive.Arrow>
  )
}

function PopoverAnchor(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverPositioner }
