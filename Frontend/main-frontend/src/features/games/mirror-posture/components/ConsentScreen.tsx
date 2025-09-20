import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, Shield, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ConsentData {
  childName: string;
  childAge: string;
  suspectedASD: boolean;
  dataConsent: boolean;
  consentType: 'yes' | 'no' | null;
}

interface ConsentScreenProps {
  onConsentSubmit: (data: ConsentData) => void;
  onBack: () => void;
}

const ConsentScreen: React.FC<ConsentScreenProps> = ({ onConsentSubmit, onBack }) => {
  const [formData, setFormData] = useState<ConsentData>({
    childName: '',
    childAge: '',
    suspectedASD: false,
    dataConsent: false,
    consentType: null,
  });

  const [errors, setErrors] = useState<Partial<ConsentData>>({});

  // Load child data from localStorage on component mount
  useEffect(() => {
    try {
      const selectedChildStr = localStorage.getItem('selectedChild');
      if (selectedChildStr) {
        const selectedChild = JSON.parse(selectedChildStr);
        
        // Calculate age from dateOfBirth
        let age = '';
        if (selectedChild.dateOfBirth) {
          const birthDate = new Date(selectedChild.dateOfBirth);
          const today = new Date();
          const ageInYears = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age = (ageInYears - 1).toString();
          } else {
            age = ageInYears.toString();
          }
        }

        setFormData(prev => ({
          ...prev,
          childName: selectedChild.name || '',
          childAge: age,
        }));
      }
    } catch (error) {
      console.error('Error loading child data from localStorage:', error);
    }
  }, []);

  const handleInputChange = (field: keyof ConsentData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ConsentData> = {};

    if (!formData.childName.trim()) {
      newErrors.childName = 'Child\'s name is required';
    }

    if (!formData.childAge.trim()) {
      newErrors.childAge = 'Child\'s age is required';
    } else {
      const age = parseInt(formData.childAge);
      if (isNaN(age) || age < 1 || age > 18) {
        newErrors.childAge = 'Please enter a valid age (1-18)';
      }
    }

    if (formData.consentType === null) {
      newErrors.consentType = 'Please select a consent option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('Consent form submitted with data:', formData);
    console.log('Form validation result:', validateForm());
    if (validateForm()) {
      console.log('Validation passed, calling onConsentSubmit');
      onConsentSubmit(formData);
    } else {
      console.log('Validation failed, errors:', errors);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">🛡️</div>
            <h1 className="text-5xl font-playful bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-4">
              Parental Consent
            </h1>
            <p className="text-2xl font-comic text-muted-foreground">
              We need your permission to help improve our games! ✨
            </p>
          </div>

          {/* Information Card */}
          <Card className="mb-8 border-4 border-primary bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-3xl font-playful text-primary flex items-center gap-2">
                <Info className="w-8 h-8" />
                Why We Need Your Consent
              </CardTitle>
              <CardDescription className="text-lg font-comic">
                We're working to make our games better for all children, including those with special needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-playful text-lg text-primary mb-1">Data Protection</h4>
                    <p className="text-sm text-muted-foreground font-comic">
                      All data is anonymized and stored securely. We never share personal information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-playful text-lg text-primary mb-1">Research Purpose</h4>
                    <p className="text-sm text-muted-foreground font-comic">
                      Data helps us improve games for children with different abilities and needs.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent Form */}
          <Card className="mb-8 border-4 border-primary">
            <CardHeader>
              <CardTitle className="text-3xl font-playful text-primary flex items-center gap-2">
                <User className="w-8 h-8" />
                Child Information
              </CardTitle>
              <CardDescription className="text-lg font-comic">
                Please provide some basic information about your child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Child Name */}
              <div className="space-y-2">
                <Label htmlFor="childName" className="text-lg font-playful text-primary">
                  Child's Name *
                </Label>
                <Input
                  id="childName"
                  type="text"
                  placeholder="Enter your child's name"
                  value={formData.childName}
                  onChange={(e) => handleInputChange('childName', e.target.value)}
                  className={`text-lg font-comic ${errors.childName ? 'border-red-500' : ''}`}
                />
                {errors.childName && (
                  <p className="text-red-500 text-sm font-comic">{errors.childName}</p>
                )}
              </div>

              {/* Child Age */}
              <div className="space-y-2">
                <Label htmlFor="childAge" className="text-lg font-playful text-primary">
                  Child's Age *
                </Label>
                <Input
                  id="childAge"
                  type="number"
                  min="1"
                  max="18"
                  placeholder="Enter age (1-18)"
                  value={formData.childAge}
                  onChange={(e) => handleInputChange('childAge', e.target.value)}
                  className={`text-lg font-comic ${errors.childAge ? 'border-red-500' : ''}`}
                />
                {errors.childAge && (
                  <p className="text-red-500 text-sm font-comic">{errors.childAge}</p>
                )}
              </div>

              {/* ASD Question */}
              <div className="space-y-4">
                <Label className="text-lg font-playful text-primary">
                  Do you suspect your child might have Autism Spectrum Disorder (ASD)?
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="suspectedASD"
                      checked={formData.suspectedASD === true}
                      onChange={() => handleInputChange('suspectedASD', true)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="font-comic text-lg">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="suspectedASD"
                      checked={formData.suspectedASD === false}
                      onChange={() => handleInputChange('suspectedASD', false)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="font-comic text-lg">No</span>
                  </label>
                </div>
              </div>

              {/* Data Consent Options */}
              <div className="space-y-4">
                <Label className="text-lg font-playful text-primary">
                  Would you like to help improve our games by sharing anonymous data? *
                </Label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="consentType"
                      checked={formData.consentType === 'yes'}
                      onChange={() => {
                        handleInputChange('consentType', 'yes');
                        handleInputChange('dataConsent', true);
                      }}
                      className="w-4 h-4 text-primary mt-1"
                    />
                    <div className="space-y-1">
                      <span className="font-comic text-lg text-primary">Yes, I agree to share data for training</span>
                      <p className="text-sm text-muted-foreground font-comic">
                        Your child's game data will be used anonymously to improve our games for all children, 
                        including those with special needs. No personal information will be shared.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="consentType"
                      checked={formData.consentType === 'no'}
                      onChange={() => {
                        handleInputChange('consentType', 'no');
                        handleInputChange('dataConsent', false);
                      }}
                      className="w-4 h-4 text-primary mt-1"
                    />
                    <div className="space-y-1">
                      <span className="font-comic text-lg text-primary">No, I prefer not to share data</span>
                      <p className="text-sm text-muted-foreground font-comic">
                        Your child can still play the game, but no data will be collected for training purposes. 
                        The game experience remains the same.
                      </p>
                    </div>
                  </label>
                </div>
                {errors.consentType && (
                  <p className="text-red-500 text-sm font-comic">{errors.consentType}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="btn-fun font-comic text-xl py-3 px-6 border-2 border-primary hover:bg-primary/10"
            >
              ← Back to Instructions
            </Button>
            <Button
              onClick={handleSubmit}
              className="btn-fun font-comic text-xl py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {formData.consentType === 'yes' ? '✅ I Consent - Start Game' : '🎮 Start Game'}
            </Button>
          </div>

          {/* Privacy Notice */}
          <Alert className="mt-6">
            <Shield className="h-4 w-4" />
            <AlertDescription className="font-comic">
              <strong>Privacy Notice:</strong> All data is anonymized and used only for improving our games. 
              We never share personal information with third parties. You can withdraw consent at any time.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ConsentScreen; 