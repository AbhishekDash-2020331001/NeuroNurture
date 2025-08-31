import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DanceDoodleGameInsights() {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      checkForData(childData.id);
    }
  }, []);

  const checkForData = async (childId: string) => {
    try {
      const response = await fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/statistics`);
      if (response.ok) {
        const data = await response.json();
        setHasData(data.totalGames > 0);
      } else {
        setHasData(false);
      }
    } catch (error) {
      console.error('Error checking for data:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-playful text-primary">Loading insights... 🕺</div>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-playful text-primary">No child selected</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-nunito relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🕺</div>
        <div className="absolute top-40 right-20 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-wiggle" style={{ animationDelay: '2s' }}>🎯</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-pulse-fun" style={{ animationDelay: '0.5s' }}>🏆</div>
        <div className="absolute top-1/2 left-1/4 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>
        <div className="absolute top-1/3 right-1/3 text-3xl animate-bounce" style={{ animationDelay: '0.8s' }}>💃</div>
        
        {/* Floating bubbles */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-blue-200 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-purple-200 rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-pink-200 rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="mb-8">
            <h1 className="text-5xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4">
              Dance Game Hub 🕺
            </h1>
            <p className="text-xl font-comic text-gray-600 max-w-2xl mx-auto">
              Master dance poses with fun challenges! Track your progress and see your improvements.
            </p>
          </div>
        </div>

        {/* No Data Message */}
        {!hasData && (
          <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">🕺</div>
              <h2 className="text-3xl font-playful text-primary mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg font-comic text-muted-foreground mb-8 max-w-md mx-auto">
                {selectedChild.name} hasn't played the Dance Game yet. 
                Start playing to unlock amazing insights and track your progress!
              </p>
              <Button 
                onClick={() => navigate('/games/dance-doodle')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-xl px-12 py-4 hover:scale-105 transition-all shadow-xl rounded-full"
              >
                🚀 Begin Your Adventure!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Data Available Message */}
        {hasData && (
          <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-green-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">📊</div>
              <h2 className="text-3xl font-playful text-primary mb-4">
                Data Available!
              </h2>
              <p className="text-lg font-comic text-muted-foreground mb-8 max-w-md mx-auto">
                {selectedChild.name} has played the Dance Game! 
                Backend integration is working. Full insights page will be implemented next.
              </p>
              <Button 
                onClick={() => navigate('/games/dance-doodle')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-xl px-12 py-4 hover:scale-105 transition-all shadow-xl rounded-full"
              >
                🎮 Play Again!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Play Again Button */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/games/dance-doodle')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-xl px-12 py-4 hover:scale-105 transition-all shadow-xl rounded-full"
          >
            🎮 Play Again!
          </Button>
        </div>
      </div>
    </div>
  );
}

