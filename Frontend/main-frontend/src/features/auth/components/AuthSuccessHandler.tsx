import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthSuccessHandlerProps {
  onComplete: () => void;
}

export const AuthSuccessHandler = ({ onComplete }: AuthSuccessHandlerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkParentInfo = async () => {
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.error('AuthSuccessHandler timeout - redirecting to dashboard');
        navigate('/dashboard');
        setIsChecking(false);
        onComplete();
      }, 10000); // 10 second timeout

      try {
        console.log('AuthSuccessHandler: Starting parent info check...');
        console.log('AuthSuccessHandler: Current location:', location.pathname);
        
        // If we're already on a valid authenticated page, don't redirect
        const validAuthenticatedPages = ['/dashboard', '/children', '/add-child', '/parent-info', '/view-parent-info', '/games/gesture', '/games/mirror-posture'];
        if (validAuthenticatedPages.includes(location.pathname)) {
          console.log('AuthSuccessHandler: Already on valid authenticated page, not redirecting');
          setIsChecking(false);
          onComplete();
          clearTimeout(timeoutId);
          return;
        }

        // Get user email from JWT
        const emailResponse = await fetch('http://localhost:8080/auth/me', { 
          credentials: 'include' 
        });
        
        if (!emailResponse.ok) {
          throw new Error('Failed to get user info');
        }
        
        const email = await emailResponse.text();
        console.log('AuthSuccessHandler: Got email:', email);
        
        // Check if parent info exists
        console.log('AuthSuccessHandler: Checking parent info...');
        const parentResponse = await fetch(`http://localhost:8082/api/parents/by-email/${email}`, {
          credentials: 'include'
        });
        
        if (parentResponse.ok) {
          // Parent info exists, check if they have children
          const parent = await parentResponse.json();
          console.log('AuthSuccessHandler: Parent found, checking children...');
          const childrenResponse = await fetch(`http://localhost:8082/api/parents/${parent.id}/children`, {
            credentials: 'include'
          });
          
          if (childrenResponse.ok) {
            const children = await childrenResponse.json();
            console.log('AuthSuccessHandler: Children found:', children.length);
            if (children.length > 0) {
              // Parent has children, go to children profiles
              console.log('AuthSuccessHandler: Redirecting to /children');
              navigate('/children');
            } else {
              // Parent exists but no children, go to add child
              console.log('AuthSuccessHandler: Redirecting to /add-child');
              navigate('/add-child');
            }
          } else {
            // Error getting children, go to children page (not add-child)
            console.log('AuthSuccessHandler: Error getting children, redirecting to /children');
            navigate('/children');
          }
        } else {
          // Parent info doesn't exist, go to parent info form
          console.log('AuthSuccessHandler: No parent found, redirecting to /parent-info');
          navigate('/parent-info');
        }
      } catch (error) {
        console.error('Error checking parent info:', error);
        // On error, redirect to dashboard as fallback (not add-child)
        console.log('AuthSuccessHandler: Error occurred, redirecting to /dashboard');
        navigate('/dashboard');
      } finally {
        clearTimeout(timeoutId);
        // Don't call onComplete() here - let the navigation handle it
        // The component will unmount when navigation occurs
      }
    };

    checkParentInfo();
  }, [navigate, onComplete, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-2xl font-comic">Setting up your account... 🌟</div>
      </div>
    );
  }

  return null;
}; 