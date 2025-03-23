import { useState, useRef } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { cn } from "@/lib/utils";
import { useProfiles } from "@/lib/profile-context";
import { 
  User, 
  ChevronDown, 
  Check, 
  Plus,
  Settings, 
  LogOut,
  UserCog,
  History,
  KeyRound
} from "lucide-react";
import ButtonVariant from "@/components/Button/Button";
import { ThemeToggle } from "./ThemeToggle";

export const ProfileOptions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentProfile } = useProfiles();
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => setIsOpen(false));



  return (
    <div ref={ref} className="relative bg-background/80 backdrop-blur-sm w-full rounded-md"  >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2  rounded-md cursor-pointer",
          "hover:bg-foreground/5 ",
        )}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={16} className="text-primary" />
        </div>
        
        <div className="flex-grow min-w-0 overflow-hidden">
          <p className="font-medium text-sm truncate">{currentProfile?.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {currentProfile?.isDefault ? 'Default Profile' : 'Custom Profile'}
          </p>
        </div>
        
        <ChevronDown size={16} className={cn(
          "transition-transform duration-200",
          isOpen ? "rotate-180" : ""
        )} />
      </div>
      
      {isOpen && (
        <div style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)'
        }} 
        className="absolute bottom-full left-0 right-0 mb-1 bg-background backdrop-blur-sm rounded-md shadow-lg z-50 py-1 w-fit"
        >
        
          {/* Settings Section */}
          <div className="pt-1">
            <div className="px-3 py-1 text-xs text-muted-foreground font-medium uppercase">
              Settings
            </div>
            <ThemeToggle />  
            {/* <ButtonVariant.Ghost
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => setIsOpen(false)}
            >
              <UserCog size={14} className="mr-2" />
              Profile Settings
            </ButtonVariant.Ghost>
            
            <ButtonVariant.Ghost
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => setIsOpen(false)}
            >
              <History size={14} className="mr-2" />
              Recent Activity
            </ButtonVariant.Ghost>
            
            <ButtonVariant.Ghost
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={14} className="mr-2" />
              General Settings
            </ButtonVariant.Ghost> */}
          </div>
          
          {/* Account Section */}
          <div className="pt-1">
            {/* <div className="px-3 py-1 text-xs text-muted-foreground font-medium uppercase">
              Account
            </div>
            
            <ButtonVariant.Ghost
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => setIsOpen(false)}
            >
              <KeyRound size={14} className="mr-2" />
              Security
            </ButtonVariant.Ghost> */}
            
            {/* <ButtonVariant.Ghost
              size="sm"
              className="w-full justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={() => setIsOpen(false)}
            >
              <LogOut size={14} className="mr-2" />
              Logout
            </ButtonVariant.Ghost> */}
          </div>
        </div>
      )}
    </div>
  );
};
