"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, ChevronsUpDown, LogOut, PanelLeft, Sparkles } from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/app/components/ui/sidebar";
import { navGroups } from "@/app/components/nav-config";
import { cn } from "@/app/lib/utils";

// ─── App Sidebar ───────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <Sidebar>
      {/* Header: collapse trigger only */}
      <SidebarHeader>
        <div className="flex w-full items-center p-2">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      {/* Scrollable nav area */}
      <SidebarContent>
        {navGroups.map((group, gi) => (
          <SidebarGroup key={gi}>
            {group.title && (
              <SidebarGroupLabel className="text-[10px]">{group.title}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => {
                if (item.adminOnly && user?.role !== "ADMIN") return null;

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <Collapsible
                    key={item.href}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem className="mb-1">
                      {hasChildren ? (
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActive}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            <span className="text-sm font-medium">{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      ) : (
                        <SidebarMenuButton
                          href={item.href}
                          tooltip={item.title}
                          isActive={isActive}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="text-sm font-medium">{item.title}</span>
                          <ChevronRight className="ml-auto opacity-40 hover:opacity-100" />
                        </SidebarMenuButton>
                      )}

                      {/* Sub-menu */}
                      {hasChildren && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children!.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  href={child.href}
                                  isActive={pathname === child.href}
                                >
                                  {child.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <UserFooterItem />
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── User footer area ──────────────────────────────────────
function UserFooterItem() {
  const { open } = useSidebar();
  const { user, logout } = useAuth();
  
  const displayName = user?.name || "User Account";
  const displayEmail = user?.email || "user@example.com";
  // fallback initials
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-3 overflow-hidden rounded-md px-2 py-2 text-left outline-none transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          )}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.avatar_url || ""} />
            <AvatarFallback className="rounded-lg text-xs font-semibold bg-gray-200 text-gray-800">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              "flex flex-col transition-opacity duration-200 overflow-hidden",
              open ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0"
            )}
          >
            <span className="text-sm font-medium truncate text-sidebar-foreground">
              {displayName}
            </span>
            <span className="text-xs text-sidebar-foreground/60 truncate">
              {displayEmail}
            </span>
          </div>
          
          <ChevronsUpDown className={cn("ml-auto h-4 w-4 shrink-0 transition-opacity", open ? "opacity-50" : "opacity-0")} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg shadow-lg"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-2 text-left">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.avatar_url || ""} />
              <AvatarFallback className="rounded-lg text-xs bg-gray-200 text-gray-800">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold text-sm">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="py-2 cursor-pointer">
          <Sparkles className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="py-2 cursor-pointer">Account</DropdownMenuItem>
        <DropdownMenuItem className="py-2 cursor-pointer">Notifications</DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => logout().catch(console.error)}
          className="py-2 text-red-600 focus:text-red-500 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
