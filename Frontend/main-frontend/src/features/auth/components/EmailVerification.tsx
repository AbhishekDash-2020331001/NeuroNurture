import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface EmailVerificationProps {
  onVerificationSuccess: () => void;
  onBackToSignIn: () => void;
}

export const EmailVerification = ({ onVerificationSuccess, onBackToSignIn }: EmailVerificationProps) => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/auth/verify-email?token=${token}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        toast({
          title: "Email Verified! 🎉",
          description: "Your email has been verified successfully. You can now sign in!",
        });
        onVerificationSuccess();
      } else {
        const errorText = await res.text();
        toast({
          title: "Verification Failed",
          description: errorText || "Invalid or expired verification link",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Verification Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch("http://localhost:8080/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast({
          title: "Email Sent! 📧",
          description: "Verification email has been sent to your inbox.",
        });
      } else {
        const errorText = await res.text();
        toast({
          title: "Failed to Send Email",
          description: errorText || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to Send Email",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-2xl font-playful text-primary mb-2">Verify Your Email</h2>
        <p className="text-muted-foreground font-comic">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="font-comic text-muted-foreground">Verifying your email...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resend-email" className="font-comic text-foreground">
                Didn't receive the email? Enter your email to resend:
              </Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-fun"
                disabled={isResending}
              />
            </div>

            <Button
              onClick={resendVerificationEmail}
              disabled={isResending}
              className="btn-fun w-full font-comic"
            >
              {isResending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground font-comic">
              Already verified?{' '}
              <button
                onClick={onBackToSignIn}
                className="text-primary hover:text-primary-dark font-bold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
}; 