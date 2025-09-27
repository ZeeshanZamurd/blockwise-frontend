
import React from 'react';
import { Building2, Bell, Settings, LogOut, UserPlus, Eye, Database, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  emptyDataMode?: boolean;
  onToggleEmptyMode?: () => void;
}

const Header = ({ emptyDataMode = false, onToggleEmptyMode }: HeaderProps) => {
  const navigate = useNavigate();

  const handleViewOnboarding = () => {
    navigate('/onboarding');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">BlocWise</h1>
              <span className="text-sm text-gray-600">Residential Building Platform</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">Alto Apartments</h2>
            <p className="text-sm text-gray-600">Last updated Today 14:23</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {onToggleEmptyMode && (
              <Button 
                variant={emptyDataMode ? "default" : "outline"} 
                size="sm" 
                onClick={onToggleEmptyMode}
              >
                {emptyDataMode ? (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    With Data
                  </>
                ) : (
                  <>
                    <FileX className="h-4 w-4 mr-2" />
                    Empty Demo
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleViewOnboarding}>
              <UserPlus className="h-4 w-4 mr-2" />
              View Onboarding
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/website')}>
              <Eye className="h-4 w-4 mr-2" />
              View Website
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarFallback>RD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
