"use client"

import { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { Bell, Menu, X, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Create a context for the mobile menu state
export const MobileMenuContext = createContext({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (value: boolean) => {},
});

export function DashboardHeader() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useContext(MobileMenuContext);
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 z-40 h-12">
      <div className="px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Bercerita</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-gray-500">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
              3
            </span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                <Avatar className="h-8 w-8 border-2 border-gray-100 dark:border-gray-800">
                  <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-sm font-medium">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                Signed in as <span className="font-medium text-gray-700 dark:text-gray-300">Jamie Doe</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm text-red-500 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}