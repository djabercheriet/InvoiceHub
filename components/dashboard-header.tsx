"use client";

import { Search, Bell, User, Command as CommandIcon, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  signOutAction: () => Promise<void>;
  userEmail?: string;
}

export function DashboardHeader({ signOutAction, userEmail }: DashboardHeaderProps) {
  
  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  const initials = userEmail?.substring(0, 2).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/60 px-8 backdrop-blur-xl">
      {/* Search Trigger (MacOS Style) */}
      <div className="flex flex-1 items-center">
        <button 
          onClick={handleSearchClick}
          className="group flex h-10 w-full max-w-md items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 text-muted-foreground transition-all hover:bg-secondary/50 hover:border-primary/30"
        >
          <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
          <span className="flex-1 text-left text-sm font-medium">Quick Search Documents...</span>
          <div className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">
            <CommandIcon className="h-2.5 w-2.5" /> K
          </div>
        </button>
      </div>

      {/* Action Strip */}
      <div className="flex items-center gap-3 lg:gap-6">
        <ThemeToggle />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-secondary group">
          <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </Button>

        <div className="h-6 w-px bg-border mx-1 hidden md:block" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 transition-transform active:scale-95 overflow-hidden">
              <Avatar className="h-9 w-9 rounded-xl">
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-card mt-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">Account Profile</p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="focus:bg-secondary cursor-pointer rounded-lg m-1 py-2 font-medium">
              <User className="mr-2 h-4 w-4 opacity-70" />
              <span>Personal Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-destructive/10 cursor-pointer rounded-lg m-1 py-2 font-medium text-destructive focus:text-destructive"
              onClick={() => signOutAction()}
            >
              <LogOut className="mr-2 h-4 w-4 opacity-70" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
