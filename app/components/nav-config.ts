import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  Building2,
  FileText,
  ChartBar,
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
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: ChartBar,
      },
    ],
  },
  {
    title: "Reimbursements",
    items: [
      {
        title: "My Requests",
        href: "/dashboard/requests",
        icon: Receipt,
        children: [
          { title: "Pending", href: "/dashboard/requests/pending" },
          { title: "Approved", href: "/dashboard/requests/approved" },
          { title: "Rejected", href: "/dashboard/requests/rejected" },
        ],
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Organisation",
    items: [
      {
        title: "Team",
        href: "/dashboard/team",
        icon: Users,
      },
      {
        title: "Company",
        href: "/dashboard/company",
        icon: Building2,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
