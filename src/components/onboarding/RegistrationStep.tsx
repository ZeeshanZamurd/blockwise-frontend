
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'sonner';

interface RegistrationStepProps {
  data: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    roleId?: string;
  };
  updateData: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: string;
  }) => void;
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
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (!/[A-Za-z]/.test(password)) {
      setPasswordError('Password must contain at least one letter');
      return false;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setPasswordError('Password must contain at least one special character');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Confirm password validation function
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleNext = async () => {
    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!firstName) {
      toast.error('First name is required');
      return;
    }
    
    if (!lastName) {
      toast.error('Last name is required');
      return;
    }
    
    if (!roleId) {
      toast.error('Please select your role');
      return;
    }
    
    // Only proceed if all validations pass
    if (isEmailValid && isPasswordValid && isConfirmPasswordValid && firstName && lastName && roleId) {
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
            <SelectTrigger className="h-auto min-h-[60px] max-w-full">
              <SelectValue placeholder="Select your role">
                {roleId && roles.find(role => role.id.toString() === roleId) && (
                  <div className="text-left w-full overflow-hidden">
                    <div className="font-semibold text-gray-900 text-sm mb-1 whitespace-normal break-words">
                      {roles.find(role => role.id.toString() === roleId)?.roleDefinition}
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed whitespace-normal break-words">
                      {roles.find(role => role.id.toString() === roleId)?.roleDesc}
                    </div>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-w-[90vw] sm:max-w-[500px] lg:max-w-[600px] overflow-x-auto">
              {rolesLoading ? (
                <SelectItem value="loading" disabled>
                  <div className="text-sm text-gray-500">Loading roles...</div>
                </SelectItem>
              ) : (
                roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()} className="py-3">
                    <div className="w-full min-w-[300px] sm:min-w-[400px] lg:min-w-[500px]">
                      <div className="font-semibold text-gray-900 text-sm mb-1 whitespace-normal break-words">
                        {role.roleDefinition}
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed whitespace-normal break-words">
                        {role.roleDesc}
                      </div>
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              className={`pl-10 ${emailError ? 'border-red-500' : email && !emailError ? 'border-green-500' : ''}`}
            />
            {email && !emailError && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
            {emailError && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
            )}
          </div>
          {emailError && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {emailError}
            </p>
          )}
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
                // Re-validate confirm password if it has a value
                if (confirmPassword) validateConfirmPassword(confirmPassword);
              }}
              onBlur={() => validatePassword(password)}
              className={`pl-10 ${passwordError ? 'border-red-500' : password && !passwordError ? 'border-green-500' : ''}`}
            />
            {password && !passwordError && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
            {passwordError && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
            )}
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {passwordError}
            </p>
          )}
          {password && !passwordError && (
            <div className="text-green-600 text-sm mt-1">
              <p className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Password meets all requirements
              </p>
            </div>
          )}
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
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) validateConfirmPassword(e.target.value);
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              className={`pl-10 ${confirmPasswordError ? 'border-red-500' : confirmPassword && !confirmPasswordError ? 'border-green-500' : ''}`}
            />
            {confirmPassword && !confirmPasswordError && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
            {confirmPasswordError && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
            )}
          </div>
          {confirmPasswordError && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {confirmPasswordError}
            </p>
          )}
        </div>
      </div>

      <Button 
        onClick={handleNext} 
        className="w-full"
        disabled={!email || !password || password !== confirmPassword || !firstName || !lastName || !roleId || isLoading || !!emailError || !!passwordError || !!confirmPasswordError}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </div>
  );
};

export default RegistrationStep;
