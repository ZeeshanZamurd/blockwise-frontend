import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, AtSign } from 'lucide-react';

interface Director {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleName: string;
}

interface MentionPopupProps {
  directors: Director[];
  onSelectDirector: (director: Director) => void;
  onClose: () => void;
  position: { top: number; left: number };
  searchTerm: string;
}

const MentionPopup: React.FC<MentionPopupProps> = ({
  directors,
  onSelectDirector,
  onClose,
  position,
  searchTerm
}) => {
  const filteredDirectors = directors.filter(director =>
    director.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    director.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    director.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Card className="w-64 shadow-lg border">
        <CardContent className="p-2">
          <div className="text-xs text-gray-500 mb-2 flex items-center">
            <AtSign className="h-3 w-3 mr-1" />
            Mention a director
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredDirectors.length > 0 ? (
              filteredDirectors.map((director) => (
                <Button
                  key={director.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-2 text-left"
                  onClick={() => onSelectDirector(director)}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {director.firstName} {director.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        @{director.username}
                      </span>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500 text-center">
                No directors found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentionPopup;
