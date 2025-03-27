import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number;
}

interface UserProfile {
  id: number;
  username: string;
  isAdmin: boolean;
  email?: string;
  notifications?: boolean;
  bio?: string;
}

const ProfileDialog = ({ open, onClose, userId }: ProfileDialogProps) => {
  const { toast } = useToast();
  
  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      // This would be a real API call in a full implementation
      // For now we'll simulate data
      return {
        id: userId,
        username: "User" + userId,
        isAdmin: false,
        email: "user@example.com",
        notifications: true,
        bio: "Motivational quote enthusiast"
      };
    }
  });
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  
  // Update form data when profile is loaded
  useState(() => {
    if (profile) {
      setFormData(profile);
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleToggleChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  
  // Save profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => {
      return apiRequest('PUT', `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
          <DialogDescription>
            View and update your personal information.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-10">Loading profile...</div>
        ) : profile ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-20 w-20 bg-primary text-white text-lg">
                <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
              </Avatar>
              <p className="mt-2 text-lg font-medium">{profile.username}</p>
              <p className="text-sm text-secondary">Member since March 2023</p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <Input 
                  id="bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <p className="text-sm text-secondary">Receive daily quote notifications</p>
                </div>
                <Switch 
                  id="notifications"
                  checked={formData.notifications || false}
                  onCheckedChange={(checked) => handleToggleChange("notifications", checked)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-red-500">Failed to load profile data</div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;