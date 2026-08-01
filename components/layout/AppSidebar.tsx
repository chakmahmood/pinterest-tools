"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image,
  FileSpreadsheet,
  Settings,
} from "lucide-react";

import Logo from "./Logo";

const menus = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Posts",
    href: "/posts",
    icon: FileText,
  },
  {
    label: "Pins",
    href: "/pins",
    icon: Image,
  },
  {
    label: "Exports",
    href: "/exports",
    icon: FileSpreadsheet,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-6">
        <Logo />
      </div>

      <nav className="px-3 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active =
            pathname === menu.href || pathname.startsWith(menu.href + "/");

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition
              ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Icon size={18} />
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
