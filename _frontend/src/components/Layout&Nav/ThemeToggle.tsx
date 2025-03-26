import { useTheme } from "@/lib/preferences-context";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import {Button} from "@/components/ui/button";

export const ThemeToggle = () => {
  const { toggleTheme, text, icon, label } = useTheme();

  // Add a one-time effect to ensure theme is properly applied after component mounts
  useEffect(() => {
    // Force the CSS variables to update by triggering a reflow
    document.body.style.backgroundColor = 'var(--background)';
    document.body.style.color = 'var(--foreground)';
  }, []);
  
  const handleToggle = () => {
    // Toggle the theme
    toggleTheme();
    
    // Force a body style update to ensure CSS variables take effect
    setTimeout(() => {
      document.body.style.backgroundColor = 'var(--background)';
      document.body.style.color = 'var(--foreground)';
    }, 0);
  };
  
  return (
    <div className="w-full">
      <Button variant={'ghost'}
        onClick={handleToggle}
        aria-label={label}
        className={cn(
          "w-full justify-start"
        )}
      >
        {icon === 'sun' ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )}
        <span className="ml-2">{text}</span>
      </Button>
    </div>
  );
};
