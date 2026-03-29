import {
  LayoutDashboard,
  Users,
  GitMerge,
  Receipt,
  FileCheck,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  isActive?: boolean;
  children?: NavSubItem[];
};

export type NavSubItem = {
  title: string;
  href: string;
  isActive?: boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

/** Main sidebar navigation configuration.
 *  Add, remove or reorder items here to extend the sidebar.
 */
export const navGroups: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Employees",
        href: "/dashboard/employees",
        icon: Users,
      },
      {
        title: "Approval Chains",
        href: "/dashboard/approval-chains",
        icon: GitMerge,
      },
      {
        title: "Expenses",
        href: "/dashboard/expenses",
        icon: Receipt,
      },
      {
        title: "Approvals",
        href: "/dashboard/approvals",
        icon: FileCheck,
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
