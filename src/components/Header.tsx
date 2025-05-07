
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-tibet-red rounded-md flex items-center justify-center">
            <span className="font-bold text-white">TC</span>
          </div>
          <span className="font-semibold text-lg">Tibet Carpet</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            {user.role === "admin" && (
              <Button 
                variant={location.pathname === "/admin" ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link to="/admin">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Portal
                </Link>
              </Button>
            )}
            <Button 
              variant={location.pathname === "/dashboard" ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Welcome, {user.clientName}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.clientName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Client Code: {user.clientCode}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
