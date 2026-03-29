"use client";

/**
 * Sidebar — a scalable, collapsible sidebar system.
 *
 * Architecture:
 *   SidebarProvider            – manages open/collapsed state via context
 *   Sidebar                    – the sidebar panel itself
 *   SidebarHeader              – top section (logo / brand)
 *   SidebarContent             – scrollable nav area
 *   SidebarFooter              – bottom section (user / settings)
 *   SidebarGroup               – logical group of nav items
 *   SidebarGroupLabel          – group heading
 *   SidebarMenu                – <ul> wrapper for nav items
 *   SidebarMenuItem            – <li> wrapper
 *   SidebarMenuButton          – the clickable nav button
 *   SidebarMenuSub             – nested sub-menu
 *   SidebarMenuSubItem         – sub-menu item
 *   SidebarMenuSubButton       – the clickable sub-menu button
 *   SidebarTrigger             – hamburger toggle button
 *   SidebarInset               – the main content area next to the sidebar
 */

import * as React from "react";
import Link from "next/link";
import { PanelLeft } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

// ─────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────
type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}

// ─────────────────────────────────────────────────────────
// SidebarProvider
// ─────────────────────────────────────────────────────────
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggleSidebar = React.useCallback(() => setOpen((v) => !v), []);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────
// Sidebar (panel)
// ─────────────────────────────────────────────────────────
interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { open } = useSidebar();

  return (
    <aside
      data-open={open}
      className={cn(
        "relative flex flex-col h-screen bg-background text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 ease-in-out shrink-0",
        open ? "w-[var(--sidebar-width,16rem)]" : "w-[var(--sidebar-width-collapsed,3.5rem)]",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarHeader
// ─────────────────────────────────────────────────────────
export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex h-16 items-center px-3 shrink-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarContent
// ─────────────────────────────────────────────────────────
export function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarFooter
// ─────────────────────────────────────────────────────────
export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex shrink-0 flex-col gap-2 px-3 py-3 border-t border-sidebar-border", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarGroup
// ─────────────────────────────────────────────────────────
export function SidebarGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-3 py-1", className)} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarGroupLabel
// ─────────────────────────────────────────────────────────
export function SidebarGroupLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { open } = useSidebar();
  return (
    <p
      className={cn(
        "mb-1 px-2 text-xs font-semibold tracking-widest uppercase text-sidebar-foreground/50 transition-opacity duration-200",
        open ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarMenu / MenuItem
// ─────────────────────────────────────────────────────────
export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("list-none", className)} {...props} />;
}

// ─────────────────────────────────────────────────────────
// SidebarMenuButton
// ─────────────────────────────────────────────────────────
interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
  href?: string;
}

export function SidebarMenuButton({
  className,
  isActive,
  tooltip,
  icon,
  href,
  children,
  asChild: _asChild,
  ...props
}: SidebarMenuButtonProps) {
  const { open } = useSidebar();

  const inner = (
    <span className="flex items-center gap-3 w-full">
      {icon && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span
        className={cn(
          "flex flex-1 items-center gap-2 transition-opacity duration-200 overflow-hidden",
          open ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
        )}
      >
        {children}
      </span>
    </span>
  );

  const buttonClass = cn(
    "flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
    !open && "justify-center",
    className
  );

  const el = href ? (
    <Link href={href} className={buttonClass}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={buttonClass} {...props}>
      {inner}
    </button>
  );

  if (!open && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{el}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return el;
}

// ─────────────────────────────────────────────────────────
// SidebarMenuSub (nested nav)
// ─────────────────────────────────────────────────────────
export function SidebarMenuSub({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  const { open } = useSidebar();
  return (
    <ul
      className={cn(
        "ml-7 flex flex-col gap-0.5 border-l border-sidebar-border pl-3 transition-all",
        !open && "hidden",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("list-none", className)} {...props} />;
}

interface SidebarMenuSubButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  href?: string;
}

export function SidebarMenuSubButton({
  className,
  isActive,
  href = "#",
  children,
  ...props
}: SidebarMenuSubButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-8 items-center rounded-md px-2 text-sm transition-colors",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "text-sidebar-accent-foreground font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarTrigger
// ─────────────────────────────────────────────────────────
export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle sidebar"
      onClick={toggleSidebar}
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
}

// ─────────────────────────────────────────────────────────
// SidebarInset (main content wrapper)
// ─────────────────────────────────────────────────────────
export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-h-screen",
        className
      )}
      {...props}
    />
  );
}
