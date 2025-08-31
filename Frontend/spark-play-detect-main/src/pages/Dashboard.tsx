import mascotImage from '@/assets/mascot.jpg';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingGeminiButton from '../components/FloatingGeminiButton';
import GeminiChat from '../components/GeminiChat';

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (!authenticated) {
          navigate('/auth');
        } else {
          fetch('http://localhost:8080/auth/me', { credentials: 'include' })
            .then(res => res.text())
            .then(name => setUsername(name));
          
          // Get selected child data
          const childData = getCurrentChild();
          if (childData) {
            setSelectedChild(childData);
          }
          
          setAuthChecked(true);
        }
      });
  }, [navigate]);

  const getChildAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/auth'; // Full reload ensures session check and clears dashboard state
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  const games = [
    {
      title: "Gesture Game",
      description: "Learn hand gestures!",
      icon: "👋",
      color: "from-blue-400 to-purple-500",
      progress: 75,
      route: "/games/gesture/insights"
    },
    {
      title: "Mirror Posture",
      description: "Mimic expressions!",
      icon: "😎",
      color: "from-orange-400 to-pink-500",
      progress: 45,
      route: "/games/posture/insights"
    },
    {
      title: "Eye Gaze Tracking",
      description: "Pop balloons with your eyes!",
      icon: "👁️",
      color: "from-purple-400 to-blue-500",
      progress: 60,
      route: "/games/gaze-tracking/insights"
    },
    {
      title: "Repeat with Me",
      description: "Listen and repeat Bengali sentences!",
      icon: "🎤",
      color: "from-pink-400 to-red-500",
      progress: 40,
      route: "/games/repeat-with-me/insights"
    },
    {
      title: "Dance Doodle",
      description: "Strike amazing poses!",
      icon: "🕺",
      color: "from-purple-400 to-pink-500",
      progress: 65,
      route: "/games/dance-doodle/insights"
    },
    {
      title: "Shape Sorter",
      description: "Learn shapes & colors",
      icon: "🔷",
      color: "from-green-400 to-teal-500",
      progress: 90
    },
    {
      title: "Story Builder",
      description: "Create stories!",
      icon: "📚",
      color: "from-yellow-400 to-orange-500",
      progress: 30
    }
  ];

  const achievements = [
    { title: "First Steps", icon: "🌟", unlocked: true },
    { title: "Puzzle Master", icon: "🏆", unlocked: true },
    { title: "Memory Champ", icon: "🧠", unlocked: false },
    { title: "Creative Writer", icon: "✨", unlocked: false }
  ];

  return (
    <div className="min-h-screen bg-soft font-nunito custom-scrollbar relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating Toys and Objects */}
        <div className="absolute top-10 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🧸</div>
        <div className="absolute top-20 right-20 text-3xl animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}>🎈</div>
        <div className="absolute top-40 left-1/4 text-3xl animate-wiggle" style={{ animationDelay: '2s', animationDuration: '2.5s' }}>🎪</div>
        <div className="absolute top-60 right-1/3 text-4xl animate-pulse-fun" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>🎨</div>
        <div className="absolute top-80 left-1/3 text-3xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}>🎯</div>
        <div className="absolute top-32 right-1/4 text-3xl animate-float" style={{ animationDelay: '0.8s', animationDuration: '4.2s' }}>🎭</div>
        
        {/* More floating elements */}
        <div className="absolute top-96 left-20 text-2xl animate-wiggle" style={{ animationDelay: '2.2s', animationDuration: '3.1s' }}>🎲</div>
        <div className="absolute top-72 right-16 text-3xl animate-pulse-fun" style={{ animationDelay: '1.2s', animationDuration: '2.9s' }}>🎪</div>
        <div className="absolute top-48 left-1/2 text-2xl animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '3.3s' }}>🎨</div>
        
        {/* Bottom floating elements */}
        <div className="absolute bottom-20 left-16 text-3xl animate-float" style={{ animationDelay: '1.8s', animationDuration: '4.5s' }}>🎈</div>
        <div className="absolute bottom-32 right-24 text-2xl animate-wiggle" style={{ animationDelay: '0.7s', animationDuration: '2.7s' }}>🎯</div>
        <div className="absolute bottom-40 left-1/3 text-3xl animate-pulse-fun" style={{ animationDelay: '2.5s', animationDuration: '3.8s' }}>🎭</div>
        <div className="absolute bottom-60 right-1/3 text-2xl animate-bounce" style={{ animationDelay: '1.1s', animationDuration: '3.2s' }}>🎲</div>
        
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-50 via-orange-50 to-red-50 opacity-20"></div>
        
        {/* Floating Bubbles */}
        <div className="absolute top-1/4 left-1/6 w-4 h-4 bg-blue-300 rounded-full animate-float opacity-60" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute top-1/3 right-1/5 w-6 h-6 bg-purple-300 rounded-full animate-float opacity-50" style={{ animationDelay: '2s', animationDuration: '7s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-pink-300 rounded-full animate-float opacity-70" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-5 h-5 bg-yellow-300 rounded-full animate-float opacity-60" style={{ animationDelay: '3s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 left-1/5 w-4 h-4 bg-green-300 rounded-full animate-float opacity-50" style={{ animationDelay: '1.5s', animationDuration: '6.5s' }}></div>
        
        {/* Sparkles */}
        <div className="absolute top-1/6 left-1/8 text-yellow-400 animate-pulse-fun" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>✨</div>
        <div className="absolute top-1/3 right-1/6 text-yellow-400 animate-pulse-fun" style={{ animationDelay: '1.5s', animationDuration: '2.5s' }}>✨</div>
        <div className="absolute top-1/2 left-1/3 text-yellow-400 animate-pulse-fun" style={{ animationDelay: '0.8s', animationDuration: '1.8s' }}>✨</div>
        <div className="absolute top-2/3 right-1/4 text-yellow-400 animate-pulse-fun" style={{ animationDelay: '2.2s', animationDuration: '2.2s' }}>✨</div>
        <div className="absolute bottom-1/3 left-1/6 text-yellow-400 animate-pulse-fun" style={{ animationDelay: '1.2s', animationDuration: '1.9s' }}>✨</div>
        
        {/* Rainbow Trail Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-purple-400 to-pink-400 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 via-green-400 via-yellow-400 to-red-400 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto space-y-6 p-4 lg:p-8 relative z-10">
        {/* Compact Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <img 
              src={mascotImage} 
              alt="NeuroNurture Mascot" 
              className="w-12 h-12 animate-pulse-fun"
            />
            <div>
              <h1 className="text-3xl lg:text-4xl font-playful text-primary">
                {selectedChild ? `Hi ${selectedChild.name}! 🎉` : username ? `Hi ${username}! 🎉` : 'Welcome! 🎉'}
              </h1>
              <p className="text-lg lg:text-xl font-comic text-muted-foreground">
                {selectedChild ? `Ready for fun learning, ${selectedChild.name}?` : 'Ready for fun learning?'}
              </p>
            </div>
          </div>
          
          <Button className="btn-fun font-comic text-base py-2 px-4">
            Start Game 🚀
          </Button>
        </div>

        {/* Compact Child Profile */}
        {selectedChild && (
          <Card className="card-playful border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-4 backdrop-blur-sm bg-white/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">
                  {selectedChild.gender === 'boy' ? '👦' : selectedChild.gender === 'girl' ? '👧' : '🧒'}
                </div>
                <div>
                  <h2 className="text-xl font-playful text-primary">
                    {selectedChild.name}'s Learning
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground font-comic">
                    <span>Age: {getChildAge(selectedChild.dateOfBirth)}</span>
                    <span>Height: {selectedChild.height}cm</span>
                    <span>Weight: {selectedChild.weight}kg</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground font-comic">Active Profile</div>
                <div className="text-sm font-bold text-primary">✅</div>
              </div>
            </div>
          </Card>
        )}

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="card-playful border-2 border-fun-orange/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group p-3 backdrop-blur-sm bg-white/80">
            <div className="text-center">
              <div className="text-xl font-playful text-fun-orange mb-1 bounce-gentle">🎮</div>
              <div className="text-xl text-foreground group-hover:text-fun-orange transition-colors">12</div>
              <div className="text-base text-muted-foreground font-comic">Games</div>
            </div>
          </Card>
          
          <Card className="card-playful border-2 border-fun-purple/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group p-3 backdrop-blur-sm bg-white/80">
            <div className="text-center">
              <div className="text-xl font-playful text-fun-purple mb-1 float">⭐</div>
              <div className="text-xl text-foreground group-hover:text-fun-purple transition-colors">850</div>
              <div className="text-base text-muted-foreground font-comic">Stars</div>
            </div>
          </Card>
          
          <Card className="card-playful border-2 border-fun-green/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group p-3 backdrop-blur-sm bg-white/80">
            <div className="text-center">
              <div className="text-xl font-playful text-fun-green mb-1 wiggle">🏆</div>
              <div className="text-xl text-foreground group-hover:text-fun-green transition-colors">2</div>
              <div className="text-base text-muted-foreground font-comic">Achievements</div>
            </div>
          </Card>
          
          <Card className="card-playful border-2 border-fun-pink/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group p-3 backdrop-blur-sm bg-white/80">
            <div className="text-center">
              <div className="text-xl font-playful text-fun-pink mb-1 pulse-fun">📚</div>
              <div className="text-xl text-foreground group-hover:text-fun-pink transition-colors">15</div>
              <div className="text-base text-muted-foreground font-comic">Learning Days</div>
            </div>
          </Card>
        </div>

        {/* Compact Games Grid */}
        <div>
          <h2 className="text-2xl font-playful text-foreground mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Your Learning Games
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {games.map((game, index) => (
              <Card key={index} className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group overflow-hidden p-3 backdrop-blur-sm bg-white/80">
                <div className="text-center space-y-2">
                  <div className={`text-2xl ${index % 4 === 0 ? 'bounce-gentle' : index % 4 === 1 ? 'float' : index % 4 === 2 ? 'wiggle' : 'pulse-fun'}`}>
                    {game.icon}
                  </div>
                  <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">{game.title}</CardTitle>
                  <CardDescription className="font-comic text-base">
                    {game.description}
                  </CardDescription>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-base font-comic">
                      <span>Progress</span>
                      <span>{game.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${game.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${game.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-bounce font-comic text-sm py-2"
                    onClick={() => game.route ? navigate(game.route) : console.log(`Playing ${game.title}`)}
                  >
                    Play! 🎮
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Compact Achievements */}
        <div>
          <h2 className="text-2xl font-playful text-foreground mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Your Achievements
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {achievements.map((achievement, index) => (
              <Card 
                key={index} 
                className={`card-playful text-center p-3 hover:scale-105 transition-all duration-300 group backdrop-blur-sm bg-white/80 ${
                  achievement.unlocked 
                    ? 'border-fun-orange border-2 bg-fun-orange/5 hover:shadow-lg' 
                    : 'opacity-50 grayscale hover:shadow-md'
                }`}
              >
                <div className={`text-xl mb-1 ${
                  achievement.unlocked 
                    ? `${index % 4 === 0 ? 'bounce-gentle' : index % 4 === 1 ? 'float' : index % 4 === 2 ? 'wiggle' : 'pulse-fun'}` 
                    : ''
                }`}>
                  {achievement.icon}
                </div>
                <div className="font-comic text-base">{achievement.title}</div>
                {achievement.unlocked && (
                  <div className="text-sm text-fun-orange font-bold mt-1 group-hover:scale-110 transition-transform">UNLOCKED!</div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Compact Quick Actions */}
        <Card className="card-playful p-4 backdrop-blur-sm bg-white/80">
          <div className="text-center mb-3">
            <h3 className="font-playful text-xl text-primary">
              Ready for More Fun? 🌟
            </h3>
            <p className="font-comic text-lg text-muted-foreground">
              Try these exciting activities!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              className="h-12 bg-gradient-fun text-white font-comic text-base btn-bounce"
              onClick={() => console.log('New Assessment clicked')}
            >
              🧪 New Assessment
            </Button>
            <Button 
              className="h-12 bg-gradient-secondary text-white font-comic text-base btn-bounce"
              onClick={() => console.log('View Progress clicked')}
            >
              📊 View Progress
            </Button>
            <Button 
              className="h-12 bg-gradient-primary text-white font-comic text-base btn-bounce"
              onClick={() => navigate('/children')}
            >
              👨‍👩‍👧‍👦 Parent Portal
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Gemini Chat Components */}
      <FloatingGeminiButton 
        onClick={() => setIsGeminiOpen(true)}
        isOpen={isGeminiOpen}
      />
      <GeminiChat 
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
      />
    </div>
  );
}