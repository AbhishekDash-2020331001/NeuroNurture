import heroImage from '@/assets/hero-children.jpg';
import mascotImage from '@/assets/mascot.jpg';
import { AuthSuccessHandler } from '@/components/auth/AuthSuccessHandler';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [showAuthHandler, setShowAuthHandler] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (authenticated) {
          setShowAuthHandler(true);
        }
      })
      .catch(error => {
        console.error('Error checking authentication:', error);
        // If there's an error checking auth, just show the landing page
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-2xl font-comic">Loading... 🌟</div>
      </div>
    );
  }

  if (showAuthHandler) {
    return <AuthSuccessHandler onComplete={() => setShowAuthHandler(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <img 
              src={mascotImage} 
                              alt="NeuroNurture Mascot" 
              className="w-20 h-20 animate-wiggle"
            />
            <h1 className="text-6xl lg:text-7xl font-playful text-primary">
              NeuroNurture
            </h1>
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-comic text-foreground max-w-4xl mx-auto">
            Where Fun Meets Learning! 🌟 🌟 🌟 
          </h2>
          
          <p className="text-lg lg:text-xl text-muted-foreground font-comic max-w-3xl mx-auto">
            Join thousands of children on an amazing journey of discovery through interactive games 
            that help identify learning patterns and support growth. Every game is designed with love, 
            care, and endless fun! 🎮✨
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative max-w-4xl mx-auto">
          <img 
            src={heroImage} 
            alt="Happy children playing and learning" 
            className="rounded-3xl shadow-playful card-float w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-3xl"></div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card-playful text-center space-y-4">
            <div className="text-5xl">🎯</div>
            <h3 className="text-xl font-playful text-foreground">Smart Assessment</h3>
            <p className="font-comic text-muted-foreground">
              Fun games that gently assess learning patterns while kids play
            </p>
          </div>
          
          <div className="card-playful text-center space-y-4">
            <div className="text-5xl">🌱</div>
            <h3 className="text-xl font-playful text-foreground">Growth Games</h3>
            <p className="font-comic text-muted-foreground">
              Personalized activities that support each child's unique development
            </p>
          </div>
          
          <div className="card-playful text-center space-y-4">
            <div className="text-5xl">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-playful text-foreground">Family Journey</h3>
            <p className="font-comic text-muted-foreground">
              Tools and insights to support families every step of the way
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-6">
          <Button 
            onClick={() => navigate('/auth')}
            className="btn-fun text-xl px-12 py-4 font-comic btn-bounce text-lg"
          >
            Start Playing Now! 🚀
          </Button>
          
          <p className="text-sm text-muted-foreground font-comic">
            Free to play • Safe & secure • Built with love for kids
          </p>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-2xl font-playful text-fun-orange">10,000+</div>
            <p className="text-sm font-comic text-foreground">Happy Kids</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-2xl font-playful text-fun-purple">50+</div>
            <p className="text-sm font-comic text-foreground">Fun Games</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-2xl font-playful text-secondary">99%</div>
            <p className="text-sm font-comic text-foreground">Kids Love It</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-2xl font-playful text-primary">24/7</div>
            <p className="text-sm font-comic text-foreground">Safe & Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
