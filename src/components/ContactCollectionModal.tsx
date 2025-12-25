import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { CheckCircle, User, Phone, Mail, AlertCircle } from 'lucide-react';

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
}

interface ContactCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contactInfo: ContactInfo) => void;
  orderType?: 'dine_in' | 'to_go';
  isLoading?: boolean;
}

export function ContactCollectionModal({
  open,
  onOpenChange,
  onSubmit,
  orderType = 'dine_in',
  isLoading = false
}: ContactCollectionModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<ContactInfo>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const phoneValue = watch('phone');

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone) || 'Please enter a valid phone number';
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2 || 'Name must be at least 2 characters';
  };

  const handleFormSubmit = (data: ContactInfo) => {
    const contactInfo: ContactInfo = {
      name: data.name.trim(),
      phone: data.phone.replace(/\D/g, ''), // Store clean phone number
      email: data.email?.trim()
    };

    onSubmit(contactInfo);
    setIsSubmitted(true);
  };

  const handleDialogClose = () => {
    if (!isSubmitted) {
      // Show error message or alert here if needed
      return;
    }
    
    setIsSubmitted(false);
    reset();
    onOpenChange(false);
  };

  const isToGo = orderType === 'to_go';

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-gray-50">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-2">
            <User className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            {isToGo ? 'Guest Information' : 'Welcome!'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {isToGo 
              ? 'We need your contact info for pickup notifications and order updates.'
              : 'Please provide your contact info for this visit. This helps us serve you better!'
            }
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...register('name', {
                    required: 'Name is required',
                    validate: validateName
                  })}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </div>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...register('phone', {
                    required: 'Phone number is required',
                    validate: validatePhone
                  })}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  maxLength={15}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone.message}
                </p>
              )}
              {phoneValue && !errors.phone && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Phone number looks good!
                </p>
              )}
            </div>

            {/* Email Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address (Optional)
                </div>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Order Type Info */}
            {isToGo && (
              <Card className="bg-blue-50 border-blue-200 p-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-blue-800">
                    <strong>For To-Go Orders:</strong> We'll send you updates when your order is ready and notify you when it's time to pick up.
                  </div>
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Continue to {isToGo ? 'Order' : 'Table'}
                  </div>
                )}
              </Button>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center">
              Your information is secure and only used for order updates. 
              {isToGo ? 'We respect your privacy and never share your data.' : 'We may use this info to improve your dining experience.'}
            </p>
          </form>
        ) : (
          // Success State
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">All Set!</h3>
            <p className="text-gray-600">
              Thank you! Your contact information has been saved.
            </p>
            <Button
              onClick={handleDialogClose}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
