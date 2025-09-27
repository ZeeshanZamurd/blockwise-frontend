
import React from 'react';
import { Home, MapPin, GanttChart, Archive, Shield, Menu, X, PoundSterling } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ activeSection, onSectionChange, collapsed = false, onCollapsedChange }: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'building-management', label: 'Building Management', icon: GanttChart, hasNotification: true },
    { id: 'governance', label: 'Boardroom', icon: Archive },
    { id: 'compliance-hub', label: 'Compliance', icon: Shield },
    { id: 'financials', label: 'Financials', icon: PoundSterling },
    { id: 'building-info', label: 'Building Info', icon: MapPin },
  ];

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border h-full transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64",
      "lg:relative lg:translate-x-0",
      "md:fixed md:translate-x-0 lg:static",
      // Mobile: show only hamburger when collapsed, full menu when expanded
      "fixed inset-y-0 left-0"
    )}>
        {/* Toggle button - only show on mobile when collapsed */}
        <div className={cn(
          "p-2 border-b border-sidebar-border",
          "md:block", // Always show on tablet/desktop
          collapsed ? "block" : "hidden" // On mobile: show only when collapsed
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange?.(!collapsed)}
            className="w-full justify-start hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <Menu className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Menu</span>}
          </Button>
        </div>

        {/* Close button - only show when menu is expanded */}
        {!collapsed && (
          <div className="p-2 border-b border-sidebar-border md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapsedChange?.(true)}
              className="w-full justify-start hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              <span>Close Menu</span>
            </Button>
          </div>
        )}

        <nav className={cn("p-4", collapsed ? "md:block hidden" : "block")}>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onSectionChange(item.id);
                      // Auto-close on mobile after selection
                      if (window.innerWidth < 768) {
                        onCollapsedChange?.(true);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center rounded-lg text-left transition-colors relative group",
                      collapsed ? "justify-center p-3" : "space-x-3 px-3 py-2",
                      activeSection === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {item.hasNotification && (
                      <div className={cn(
                        "w-2 h-2 bg-destructive rounded-full",
                        collapsed ? "absolute -top-1 -right-1" : "absolute top-2 left-6"
                      )}></div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
  );
};

export default Sidebar;
