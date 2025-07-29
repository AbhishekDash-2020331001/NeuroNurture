import mascotImage from '@/assets/mascot.jpg';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);

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
      title: "Gesture Recognizing Game",
      description: "Play and learn by recognizing hand gestures!",
      icon: " 44B", // 👋
      color: "bg-fun-purple",
      progress: 75,
      route: "/games/gesture"
    },
    {
      title: "Mirror Posture Game",
      description: "Mimic facial expressions and postures for fun!",
      icon: " 60E", // 😎
      color: "bg-fun-orange",
      progress: 45,
      route: "/games/mirror-posture"
    },
    {
      title: "Shape Sorter",
      description: "Learn shapes and colors in this interactive game",
      icon: "🔷",
      color: "bg-secondary",
      progress: 90
    },
    {
      title: "Story Builder",
      description: "Create amazing stories and boost creativity",
      icon: "📚",
      color: "bg-fun-yellow",
      progress: 30
    }
  ];

  const achievements = [
    { title: "First Steps", icon: "🌟", unlocked: true },
    { title: "Puzzle Master", icon: "🏆", unlocked: true },
    { title: "Memory Champion", icon: "🧠", unlocked: false },
    { title: "Creative Writer", icon: "✨", unlocked: false }
  ];

  return (
    <div className="min-h-screen bg-soft font-nunito">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8">
        {/* Breadcrumb Navigation */}
        {selectedChild && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground font-comic">
            <span>🏠</span>
            <span>Children Profiles</span>
            <span>→</span>
            <span className="text-primary font-bold">{selectedChild.name}'s Realm</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <img 
              src={mascotImage} 
                              alt="NeuroNurture Mascot" 
              className="w-16 h-16 animate-pulse-fun"
            />
            <div>
              <h1 className="text-4xl font-playful text-primary">
                {selectedChild ? `Welcome, ${selectedChild.name}! 🎉` : username ? `Welcome back, ${username}! 🎉` : 'Welcome Back! 🎉'}
              </h1>
              <p className="text-lg font-comic text-muted-foreground">
                {selectedChild ? `Ready for some fun learning adventures, ${selectedChild.name}?` : 'Ready for some fun learning adventures?'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedChild && (
              <Button 
                onClick={() => {
                  console.log('Switch Child button clicked');
                  localStorage.removeItem("selectedChild");
                  localStorage.removeItem("selectedChildId");
                  setSelectedChild(null);
                  navigate("/children");
                }} 
                className="btn-fun font-comic relative z-10"
              >
                Switch Child 👥
              </Button>
            )}
            <Button className="btn-fun font-comic relative z-10">
              Start New Game 🚀
            </Button>
          </div>
        </div>

        {/* Child Profile Indicator */}
        {selectedChild && (
          <Card className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">
                    {selectedChild.gender === 'boy' ? '👦' : selectedChild.gender === 'girl' ? '👧' : '🧒'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-playful font-bold text-primary">
                      {selectedChild.name}'s Learning Realm
                    </h2>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground font-comic">
                      <span>Age: {getChildAge(selectedChild.dateOfBirth)} years</span>
                      <span>Height: {selectedChild.height}cm</span>
                      <span>Weight: {selectedChild.weight}kg</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground font-comic">Current Profile</div>
                  <div className="text-lg font-bold text-primary">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-playful border-2 border-fun-orange/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-playful text-fun-orange mb-2 bounce-gentle">🎮</div>
              <div className="text-xl font-bold text-foreground group-hover:text-fun-orange transition-colors">12</div>
              <div className="text-xs text-muted-foreground font-comic">Games Played</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-fun-purple/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-playful text-fun-purple mb-2 float">⭐</div>
              <div className="text-xl font-bold text-foreground group-hover:text-fun-purple transition-colors">850</div>
              <div className="text-xs text-muted-foreground font-comic">Stars Earned</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-fun-green/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-playful text-fun-green mb-2 wiggle">🏆</div>
              <div className="text-xl font-bold text-foreground group-hover:text-fun-green transition-colors">2</div>
              <div className="text-xs text-muted-foreground font-comic">Achievements</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-fun-pink/20 hover:scale-105 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-playful text-fun-pink mb-2 pulse-fun">📚</div>
              <div className="text-xl font-bold text-foreground group-hover:text-fun-pink transition-colors">15</div>
              <div className="text-xs text-muted-foreground font-comic">Learning Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div>
          <h2 className="text-2xl font-playful text-foreground mb-6">
            Your Learning Games 🎯
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {games.map((game, index) => (
              <Card key={index} className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardHeader className="text-center pb-3 relative z-10">
                  <div className={`text-3xl mb-2 ${index % 4 === 0 ? 'bounce-gentle' : index % 4 === 1 ? 'float' : index % 4 === 2 ? 'wiggle' : 'pulse-fun'}`}>
                    {game.icon}
                  </div>
                  <CardTitle className="font-playful text-base group-hover:text-primary transition-colors">{game.title}</CardTitle>
                  <CardDescription className="font-comic text-xs">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-comic">
                      <span>Progress</span>
                      <span className="font-bold">{game.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`${game.color} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${game.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button 
                    className="w-full btn-bounce font-comic text-sm py-2 relative z-20"
                    onClick={() => game.route ? navigate(game.route) : console.log(`Playing ${game.title}`)}
                  >
                    Play Now! 🎮
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-playful text-foreground mb-6">
            Your Achievements 🏆
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {achievements.map((achievement, index) => (
              <Card 
                key={index} 
                className={`card-playful text-center p-3 hover:scale-105 transition-all duration-300 group ${
                  achievement.unlocked 
                    ? 'border-fun-orange border-2 bg-fun-orange/5 hover:shadow-lg' 
                    : 'opacity-50 grayscale hover:shadow-md'
                }`}
              >
                <div className={`text-2xl mb-1 ${
                  achievement.unlocked 
                    ? `${index % 4 === 0 ? 'bounce-gentle' : index % 4 === 1 ? 'float' : index % 4 === 2 ? 'wiggle' : 'pulse-fun'}` 
                    : ''
                }`}>
                  {achievement.icon}
                </div>
                <div className="font-comic text-xs">{achievement.title}</div>
                {achievement.unlocked && (
                  <div className="text-xs text-fun-orange font-bold mt-1 group-hover:scale-110 transition-transform">UNLOCKED!</div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="card-playful">
          <CardHeader>
            <CardTitle className="font-playful text-xl">
              Ready for More Fun? 🌟
            </CardTitle>
            <CardDescription className="font-comic">
              Try these exciting activities!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-16 bg-gradient-fun text-white font-comic text-lg btn-bounce relative z-10"
                onClick={() => console.log('New Assessment clicked')}
              >
                🧪 New Assessment
              </Button>
              <Button 
                className="h-16 bg-gradient-secondary text-white font-comic text-lg btn-bounce relative z-10"
                onClick={() => console.log('View Progress clicked')}
              >
                📊 View Progress
              </Button>
              <Button 
                className="h-16 bg-gradient-primary text-white font-comic text-lg btn-bounce relative z-10"
                onClick={() => navigate('/children')}
              >
                👨‍👩‍👧‍👦 Parent Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}