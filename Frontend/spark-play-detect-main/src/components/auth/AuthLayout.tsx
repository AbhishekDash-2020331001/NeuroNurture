import heroImage from '@/assets/hero-children.jpg';
import mascotImage from '@/assets/mascot.jpg';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero Content */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <img 
                src={mascotImage} 
                alt="NeuroNurture Mascot" 
                className="w-16 h-16 animate-wiggle"
              />
              <h1 className="text-4xl lg:text-5xl font-playful text-primary">
                NeuroNurture
              </h1>
            </div>
            <p className="text-xl text-muted-foreground font-comic">
              Nurturing Brains, Brightening Futures! 🌟
            </p>
          </div>
          
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Happy children playing" 
              className="rounded-3xl shadow-playful card-float"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-3xl"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-playful text-fun-orange">🎮</div>
              <p className="text-sm font-comic text-foreground">Interactive Games</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-playful text-fun-purple">🧩</div>
              <p className="text-sm font-comic text-foreground">Learning Fun</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="card-playful space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-playful text-foreground">
                  {title}
                </h2>
                <p className="text-muted-foreground font-comic">
                  {subtitle}
                </p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};