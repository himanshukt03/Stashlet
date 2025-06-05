"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  FileIcon,
  HomeIcon,
  SearchIcon,
  SettingsIcon,
  FolderIcon,
  ClockIcon,
  TagIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const routes = [
  {
    label: "Dashboard",
    icon: HomeIcon,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "All Documents",
    icon: FileIcon,
    href: "/documents",
    color: "text-violet-500",
  },
  {
    label: "Categories",
    icon: FolderIcon,
    href: "/categories",
    color: "text-pink-700",
  },
  {
    label: "Recent",
    icon: ClockIcon,
    href: "/recent",
    color: "text-orange-500",
  },
  {
    label: "Tags",
    icon: TagIcon,
    href: "/tags",
    color: "text-emerald-500",
  },
  {
    label: "Search",
    icon: SearchIcon,
    href: "/search",
    color: "text-blue-500",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 md:hidden z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XIcon className="h-6 w-6" />
        ) : (
          <MenuIcon className="h-6 w-6" />
        )}
      </Button>

      {/* Sidebar for desktop and mobile */}
      <div
        className={cn(
          "pb-12 h-full bg-background/50 backdrop-blur-md transition-all duration-300 border-r shadow-md",
          isMobileMenuOpen
            ? "fixed inset-y-0 left-0 w-72 z-40"
            : "-translate-x-full md:translate-x-0 fixed md:relative inset-y-0 left-0 w-72 z-40",
          className
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-6 py-2 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <FileIcon className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Stashlet</h2>
            </Link>
            <ThemeToggle />
          </div>
          <Separator className="opacity-50" />
          <ScrollArea className="px-3 py-2 h-[calc(100vh-10rem)]">
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent/50 rounded-lg transition",
                    pathname === route.href
                      ? "bg-accent/80 text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}