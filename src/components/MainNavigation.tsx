import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, LineChart, Settings, Receipt, LogOut, Brain } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface MainNavigationProps {
  isCollapsed: boolean;
}

export function MainNavigation({ isCollapsed }: MainNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    {
      icon: Receipt,
      label: "Transactions",
      path: "/",
    },
    {
      icon: Brain,
      label: "Assistant",
      path: "/assistant",
    },
    {
      icon: Calendar,
      label: "Calendrier",
      path: "/calendar",
    },
    {
      icon: LineChart,
      label: "Statistiques",
      path: "/stats",
    },
    {
      icon: Settings,
      label: "Paramètres",
      path: "/settings",
    },
  ];

  const NavItem = ({ icon: Icon, label, path }: (typeof menuItems)[0]) => {
    const isActive = location.pathname === path;

    const button = (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start",
          isCollapsed ? "px-2" : "px-4",
          "transition-colors",
          isActive && "bg-primary/10 hover:bg-primary/20",
          !isActive && "hover:bg-accent"
        )}
        onClick={() => navigate(path)}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            !isCollapsed && "mr-2",
            isActive && "text-primary"
          )}
        />
        {!isCollapsed && (
          <span className={cn(isActive && "text-primary")}>{label}</span>
        )}
      </Button>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="font-normal">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <div className="space-y-2 py-4">
      {menuItems.map((item) => (
        <NavItem key={item.path} {...item} />
      ))}
      <div className="pt-4">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100",
                isCollapsed ? "px-2" : "px-4"
              )}
              onClick={handleSignOut}
            >
              <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && "Déconnexion"}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="font-normal">
              Déconnexion
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}
