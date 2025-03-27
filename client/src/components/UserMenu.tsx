import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import ProfileDialog from "./ProfileDialog";

interface UserMenuProps {
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
  onToggleAdmin: () => void;
}

const UserMenu = ({ user, onToggleAdmin }: UserMenuProps) => {
  const { toast } = useToast();
  
  const logoutMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      localStorage.removeItem('userId');
      window.location.reload();
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full p-0 w-8 h-8">
          <Avatar className="h-8 w-8 bg-primary text-white">
            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => window.location.hash = "settings"}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={onToggleAdmin}
          >
            <i className="bx bx-slider-alt mr-2"></i>
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-500 focus:text-red-500"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
