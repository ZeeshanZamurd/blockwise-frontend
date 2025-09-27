
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'sonner';

interface RegistrationStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

const RegistrationStep = ({ data, updateData, onNext }: RegistrationStepProps) => {
  const { signup, isLoading, error, clearAuthError } = useAuth();
  const { roles, isLoading: rolesLoading, error: rolesError, fetchRoles, clearRolesError } = useRoles();
  
  const [email, setEmail] = useState(data.email || '');
  const [password, setPassword] = useState(data.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState(data.firstName || '');
  const [lastName, setLastName] = useState(data.lastName || '');
  const [roleId, setRoleId] = useState(data.roleId || '');

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthError();
    }
  }, [error, clearAuthError]);

  useEffect(() => {
    if (rolesError) {
      toast.error(rolesError);
      clearRolesError();
    }
  }, [rolesError, clearRolesError]);

  useEffect(() => {
    // Fetch roles when component mounts
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [fetchRoles, roles.length]);

  const handleNext = async () => {
    if (email && password && password === confirmPassword && firstName && lastName && roleId) {
      const result = await signup(email, password, firstName, lastName, parseInt(roleId));
      if (result.success) {
        toast.success('Account created successfully!');
        updateData({ email, password, firstName, lastName, roleId });
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
        <p className="text-gray-600">Let's start by setting up your director account</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                type="text"
                placeholder="Your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="role">Your role in the building</Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {rolesLoading ? (
                <SelectItem value="loading" disabled>
                  <div className="text-sm text-gray-500">Loading roles...</div>
                </SelectItem>
              ) : (
                roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    <div>
                      <div className="font-medium">{role.roleName}</div>
                      <div className="text-sm text-gray-500">{role.roleDesc}</div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleNext} 
        className="w-full"
        disabled={!email || !password || password !== confirmPassword || !firstName || !lastName || !roleId || isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </div>
  );
};

export default RegistrationStep;
