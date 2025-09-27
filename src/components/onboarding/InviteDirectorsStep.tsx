
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Plus, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InviteDirectorsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const InviteDirectorsStep = ({ data, updateData, onNext, onPrev }: InviteDirectorsStepProps) => {
  const { inviteDirectors, isLoading, error, clearAuthError } = useAuth();
  
  const [directorEmails, setDirectorEmails] = useState<string[]>(data.directorEmails || []);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthError();
    }
  }, [error, clearAuthError]);

  const addEmail = () => {
    if (newEmail && !directorEmails.includes(newEmail)) {
      const updatedEmails = [...directorEmails, newEmail];
      setDirectorEmails(updatedEmails);
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    const updatedEmails = directorEmails.filter(e => e !== email);
    setDirectorEmails(updatedEmails);
  };

  const handleNext = async () => {
    updateData({ directorEmails });
    
    // Send invites if there are emails to invite
    if (directorEmails.length > 0) {
      const result = await inviteDirectors(directorEmails);
      if (result.success) {
        toast.success('Invitations sent successfully!');
      } else {
        // Error is already handled by useEffect
        return; // Don't proceed to next step if invite fails
      }
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your set-up by inviting other directors from your building</h2>
      </div>

      {/* Invite Other Directors Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Invite Other Directors</h3>
        <p className="text-gray-600 text-sm">Add email addresses of other directors you'd like to invite</p>
        <p className="text-sm text-gray-500">Don't worry, you can always do this later</p>
        
        <div>
          <Label htmlFor="directorEmail">Director Email Address</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="directorEmail"
                type="email"
                placeholder="director@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
              />
            </div>
            <Button onClick={addEmail} disabled={!newEmail}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {directorEmails.length > 0 && (
          <div className="space-y-2">
            <Label>Invited Directors</Label>
            <div className="space-y-2">
              {directorEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">{email}</span>
                  <Button 
                    onClick={() => removeEmail(email)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1" disabled={isLoading}>
          {isLoading ? 'Sending Invites...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default InviteDirectorsStep;
