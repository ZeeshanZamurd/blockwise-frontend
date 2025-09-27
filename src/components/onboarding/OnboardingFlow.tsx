
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import RegistrationStep from './RegistrationStep';
import BuildingDetailsStep from './BuildingDetailsStep';
import InviteDirectorsStep from './InviteDirectorsStep';
import UniqueEmailStep from './UniqueEmailStep';
import CompletionStep from './CompletionStep';

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    email: '',
    password: '',
    buildingName: '',
    buildingAddress: '',
    numberOfFlats: '',
    directorEmails: [] as string[],
    uniqueEmail: ''
  });

  const totalSteps = 5;

  const updateData = (stepData: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RegistrationStep data={onboardingData} updateData={updateData} onNext={nextStep} />;
      case 2:
        return <BuildingDetailsStep data={onboardingData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <InviteDirectorsStep data={onboardingData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <UniqueEmailStep data={onboardingData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <CompletionStep data={onboardingData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">BlocWise</h1>
          </div>
          <p className="text-gray-600">Welcome to your residential building management platform</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Getting Started</CardTitle>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
