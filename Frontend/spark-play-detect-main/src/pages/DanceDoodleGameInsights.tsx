import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Star, Timer, Target, TrendingUp, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DanceDoodleGameInsights = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (!authenticated) {
          navigate('/auth');
        } else {
          setAuthChecked(true);
        }
      });
  }, [navigate]);

  const handleLogout = async () => {
    console.log('Logout button clicked');
    await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/auth';
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  // Mock data for now - in a real app, this would come from an API
  const gameStats = {
    totalGamesPlayed: 12,
    averageScore: 3.8,
    bestScore: 5,
    totalTimeSpent: 48, // minutes
    favoritePost: "Cool Arms 💪",
    improvementRate: 15, // percentage
    lastPlayed: "2 hours ago"
  };

  const recentGames = [
    { date: "Today", score: 4, maxScore: 5, time: "2m 15s", poses: ["💪", "🦅", "🎯", "🥊"] },
    { date: "Yesterday", score: 3, maxScore: 5, time: "2m 45s", poses: ["💪", "🦅", "🎯"] },
    { date: "2 days ago", score: 5, maxScore: 5, time: "1m 58s", poses: ["💪", "🦅", "🎯", "🥊", "😊"] },
    { date: "3 days ago", score: 2, maxScore: 5, time: "3m 12s", poses: ["💪", "🦅"] },
  ];

  const achievements = [
    { title: "First Steps", description: "Complete your first game", unlocked: true, icon: "🌟" },
    { title: "Perfect Round", description: "Get all 5 poses correct", unlocked: true, icon: "🏆" },
    { title: "Speed Demon", description: "Complete a game in under 2 minutes", unlocked: true, icon: "⚡" },
    { title: "Dance Master", description: "Play 10 games", unlocked: true, icon: "🕺" },
    { title: "Pose Expert", description: "Master all poses", unlocked: false, icon: "🎭" },
    { title: "Consistency King", description: "Play for 7 days straight", unlocked: false, icon: "👑" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 font-nunito">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/dashboard')}
            className="btn-fun font-comic text-sm py-2 px-4 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-playful bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
              🕺 Dance Doodle Insights 💃
            </h1>
            <p className="text-sm font-comic text-gray-600">
              Track your amazing dance progress! ✨
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/games/dance-doodle')}
            className="btn-fun font-comic text-sm py-2 px-4 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white border-2 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Play Again 🎮
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-playful border-2 border-purple-200/50 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎮</div>
              <div className="text-2xl font-bold text-purple-600">{gameStats.totalGamesPlayed}</div>
              <div className="text-sm text-gray-600 font-comic">Games Played</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-pink-200/50 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-pink-600">{gameStats.averageScore}/5</div>
              <div className="text-sm text-gray-600 font-comic">Average Score</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-blue-200/50 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.bestScore}/5</div>
              <div className="text-sm text-gray-600 font-comic">Best Score</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-green-200/50 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">⏰</div>
              <div className="text-2xl font-bold text-green-600">{gameStats.totalTimeSpent}m</div>
              <div className="text-sm text-gray-600 font-comic">Time Played</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Games */}
          <Card className="card-playful border-2 border-purple-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-playful text-xl text-purple-600 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Games
              </CardTitle>
              <CardDescription className="font-comic">
                Your latest dance adventures!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentGames.map((game, index) => (
                <Card key={index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-comic text-gray-600">{game.date}</div>
                      <div className="flex space-x-1">
                        {game.poses.map((pose, poseIndex) => (
                          <span key={poseIndex} className="text-lg">{pose}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        game.score === game.maxScore ? 'bg-green-500' : 
                        game.score >= 3 ? 'bg-blue-500' : 'bg-orange-500'
                      } text-white`}>
                        {game.score}/{game.maxScore}
                      </Badge>
                      <span className="text-xs text-gray-500 font-comic">{game.time}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="card-playful border-2 border-blue-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-playful text-xl text-blue-600 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Insights
              </CardTitle>
              <CardDescription className="font-comic">
                How you're improving!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-comic text-sm">Favorite Pose</span>
                </div>
                <span className="font-bold text-blue-600">{gameStats.favoritePost}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-comic text-sm">Improvement Rate</span>
                </div>
                <span className="font-bold text-green-600">+{gameStats.improvementRate}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Timer className="w-5 h-5 text-purple-500" />
                  <span className="font-comic text-sm">Last Played</span>
                </div>
                <span className="font-bold text-purple-600">{gameStats.lastPlayed}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="card-playful border-2 border-yellow-200/50 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-playful text-xl text-yellow-600 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Achievements
            </CardTitle>
            <CardDescription className="font-comic">
              Your amazing accomplishments!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <Card 
                  key={index} 
                  className={`p-4 text-center transition-all duration-300 hover:scale-105 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 border-2 shadow-lg' 
                      : 'bg-gray-100 border-gray-300 opacity-60'
                  }`}
                >
                  <div className={`text-3xl mb-2 ${achievement.unlocked ? 'animate-bounce' : ''}`}>
                    {achievement.icon}
                  </div>
                  <div className={`font-bold font-comic text-sm ${
                    achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className={`text-xs font-comic mt-1 ${
                    achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </div>
                  {achievement.unlocked && (
                    <Badge className="bg-yellow-500 text-white text-xs mt-2">
                      UNLOCKED!
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="card-playful border-2 border-gradient bg-gradient-to-r from-purple-100 to-pink-100 text-center">
          <CardContent className="p-6">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="font-playful text-2xl text-purple-700 mb-2">
              Ready for More Dancing?
            </h3>
            <p className="font-comic text-purple-600 mb-4">
              Keep practicing your poses and become the ultimate dance master!
            </p>
            <Button
              onClick={() => navigate('/games/dance-doodle')}
              className="btn-fun bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full text-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Start New Game 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DanceDoodleGameInsights;
