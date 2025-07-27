import mascotImage from '@/assets/mascot.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function getUsernameFromJWT() {
  const match = document.cookie.match(/(?:^|; )jwt=([^;]+)/);
  if (!match) return null;
  try {
    const payload = JSON.parse(atob(match[1].split('.')[1]));
    return payload.sub;
  } catch (e) {
    console.error('JWT decode error:', e);
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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
          setAuthChecked(true);
        }
      });
  }, [navigate]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  const handleLogout = async () => {
    await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/auth'; // Full reload ensures session check and clears dashboard state
  };

  const games = [
    {
      title: "Puzzle Adventures",
      description: "Fun puzzles that help develop problem-solving skills",
      icon: "🧩",
      color: "bg-fun-purple",
      progress: 75
    },
    {
      title: "Memory Match",
      description: "Match cards to improve memory and concentration",
      icon: "🎴",
      color: "bg-fun-orange",
      progress: 45
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
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <img 
              src={mascotImage} 
              alt="KidsPlay Mascot" 
              className="w-16 h-16 animate-pulse-fun"
            />
            <div>
              <h1 className="text-4xl font-playful text-primary">
                {username ? `Welcome back, ${username}! 🎉` : 'Welcome Back! 🎉'}
              </h1>
              <p className="text-lg font-comic text-muted-foreground">
                Ready for some fun learning adventures?
              </p>
            </div>
            <button onClick={handleLogout} className="ml-4 btn-fun font-comic">Logout</button>
          </div>
          
          <Button className="btn-fun font-comic">
            Start New Game 🚀
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-playful border-2 border-fun-orange/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-playful text-fun-orange mb-2">🎮</div>
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground font-comic">Games Played</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-fun-purple/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-playful text-fun-purple mb-2">⭐</div>
              <div className="text-2xl font-bold text-foreground">850</div>
              <div className="text-sm text-muted-foreground font-comic">Stars Earned</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-secondary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-playful text-secondary mb-2">🏆</div>
              <div className="text-2xl font-bold text-foreground">2</div>
              <div className="text-sm text-muted-foreground font-comic">Achievements</div>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div>
          <h2 className="text-2xl font-playful text-foreground mb-6">
            Your Learning Games 🎯
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <Card key={index} className="card-playful hover:scale-105 transition-transform cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-2">{game.icon}</div>
                  <CardTitle className="font-playful text-lg">{game.title}</CardTitle>
                  <CardDescription className="font-comic text-sm">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-comic">
                      <span>Progress</span>
                      <span>{game.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${game.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${game.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button className="w-full btn-bounce font-comic">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <Card 
                key={index} 
                className={`card-playful text-center p-4 ${
                  achievement.unlocked 
                    ? 'border-fun-orange border-2 bg-fun-orange/5' 
                    : 'opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="font-comic text-sm">{achievement.title}</div>
                {achievement.unlocked && (
                  <div className="text-xs text-fun-orange font-bold mt-1">UNLOCKED!</div>
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
              <Button className="h-16 bg-gradient-fun text-white font-comic text-lg btn-bounce">
                🧪 New Assessment
              </Button>
              <Button className="h-16 bg-gradient-secondary text-white font-comic text-lg btn-bounce">
                📊 View Progress
              </Button>
              <Button className="h-16 bg-gradient-primary text-white font-comic text-lg btn-bounce">
                👨‍👩‍👧‍👦 Parent Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}