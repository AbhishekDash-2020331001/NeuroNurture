import mascotImage from '@/assets/mascot.jpg';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { gameDataService, GameStats, HeatmapData } from '@/services/gameDataService';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChildPlaygroundPageProps {
  username: string | null;
}

export default function ChildPlaygroundPage({ username }: ChildPlaygroundPageProps) {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalDaysPracticed: 0,
    currentStreak: 0,
    totalTimeMinutes: 0,
    averageSessionTime: 0
  });
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(true);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      // Load heatmap data if child is available
      if (childData.id) {
        loadHeatmapData(childData.id);
      }
    }
  }, []);

  const loadHeatmapData = async (childId: string) => {
    try {
      setIsLoadingHeatmap(true);
      const data = await gameDataService.getHeatmapData(childId);
      setHeatmapData(data.heatmapData);
      setGameStats(data.stats);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
      // Fallback to dummy data if API fails
      generateDummyHeatmapData();
    } finally {
      setIsLoadingHeatmap(false);
    }
  };

  const generateDummyHeatmapData = () => {
    const dummyData: HeatmapData[] = [];
    for (let i = 0; i < 84; i++) {
      const intensity = Math.random();
      dummyData.push({
        date: new Date(Date.now() - (84 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        intensity,
        totalMinutes: Math.round(intensity * 60),
        gameCount: Math.round(intensity * 3),
        games: intensity > 0.5 ? ['Gesture Game', 'Gaze Game'] : intensity > 0.2 ? ['Dance Doodle'] : []
      });
    }
    setHeatmapData(dummyData);
    setGameStats({
      totalDaysPracticed: 47,
      currentStreak: 12,
      totalTimeMinutes: 1380,
      averageSessionTime: 29
    });
  };

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


  return (
    <div className="space-y-4 px-1 py-2">
      {/* Greeting Header */}
      <div className="relative">
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
        
        {/* Flying Bird Animation */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-2 right-0 text-2xl animate-pulse" style={{ animationDuration: '3s' }}>
            🐦
          </div>
          <div className="absolute top-4 right-8 text-xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
            ✨
          </div>
          <div className="absolute top-1 right-16 text-lg animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}>
            🌟
          </div>
          <div className="absolute top-3 right-24 text-xl animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '1.5s' }}>
            🦋
          </div>
          <div className="absolute top-0 right-32 text-lg animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '2s' }}>
            🍃
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="h-8"></div>

      {/* Enhanced Games Grid */}
      <div>
        <div className="mb-8">
          <div className="text-center">
            <h2 className="text-5xl font-black mb-2" style={{ 
              fontFamily: 'Comic Sans MS, cursive, sans-serif',
              textShadow: '3px 3px 0px #ff6b6b, 6px 6px 0px #4ecdc4, 9px 9px 0px #45b7d1, 12px 12px 0px #96ceb4',
              letterSpacing: '2px'
            }}>
              <span className="inline-block animate-bounce text-yellow-400" style={{ animationDelay: '0s', transform: 'rotate(-5deg)' }}>A</span>
              <span className="inline-block animate-bounce text-orange-500" style={{ animationDelay: '0.1s', transform: 'rotate(3deg)' }}>d</span>
              <span className="inline-block animate-bounce text-red-500" style={{ animationDelay: '0.2s', transform: 'rotate(-2deg)' }}>v</span>
              <span className="inline-block animate-bounce text-pink-500" style={{ animationDelay: '0.3s', transform: 'rotate(4deg)' }}>e</span>
              <span className="inline-block animate-bounce text-purple-500" style={{ animationDelay: '0.4s', transform: 'rotate(-3deg)' }}>n</span>
              <span className="inline-block animate-bounce text-indigo-500" style={{ animationDelay: '0.5s', transform: 'rotate(2deg)' }}>t</span>
              <span className="inline-block animate-bounce text-blue-500" style={{ animationDelay: '0.6s', transform: 'rotate(-4deg)' }}>u</span>
              <span className="inline-block animate-bounce text-teal-500" style={{ animationDelay: '0.7s', transform: 'rotate(3deg)' }}>r</span>
              <span className="inline-block animate-bounce text-green-500" style={{ animationDelay: '0.8s', transform: 'rotate(-2deg)' }}>e</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.9s' }}> </span>
              <span className="inline-block animate-bounce text-yellow-400" style={{ animationDelay: '1.0s', transform: 'rotate(5deg)' }}>A</span>
              <span className="inline-block animate-bounce text-orange-500" style={{ animationDelay: '1.1s', transform: 'rotate(-3deg)' }}>c</span>
              <span className="inline-block animate-bounce text-red-500" style={{ animationDelay: '1.2s', transform: 'rotate(2deg)' }}>a</span>
              <span className="inline-block animate-bounce text-pink-500" style={{ animationDelay: '1.3s', transform: 'rotate(-4deg)' }}>d</span>
              <span className="inline-block animate-bounce text-purple-500" style={{ animationDelay: '1.4s', transform: 'rotate(3deg)' }}>e</span>
              <span className="inline-block animate-bounce text-indigo-500" style={{ animationDelay: '1.5s', transform: 'rotate(-2deg)' }}>m</span>
              <span className="inline-block animate-bounce text-blue-500" style={{ animationDelay: '1.6s', transform: 'rotate(4deg)' }}>y</span>
            </h2>
            <p className="text-xl text-gray-600 font-bold" style={{ 
              fontFamily: 'Comic Sans MS, cursive, sans-serif',
              textShadow: '1px 1px 0px #96ceb4',
              letterSpacing: '0.5px'
            }}>
              Your magical learning playground awaits!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {games.map((game, index) => {
            const focusAreas = [
              ['Memory', 'Focus'],
              ['Creativity', 'Art'],
              ['Logic', 'Strategy'],
              ['Coordination', 'Timing'],
              ['Language', 'Vocabulary'],
              ['Math', 'Numbers'],
              ['Science', 'Discovery'],
              ['Social', 'Teamwork']
            ];
            
            const colors = [
              'from-blue-400 to-purple-500',
              'from-green-400 to-teal-500', 
              'from-orange-400 to-red-500',
              'from-pink-400 to-rose-500',
              'from-indigo-400 to-blue-500',
              'from-emerald-400 to-green-500',
              'from-amber-400 to-orange-500',
              'from-violet-400 to-purple-500'
            ];
            
            return (
              <Card key={index} className={`card-playful hover:scale-105 hover:shadow-xl transition-all duration-300 group overflow-hidden p-4 backdrop-blur-sm bg-gradient-to-br ${colors[index % colors.length]} text-white border-0 shadow-lg`}>
                <div className="text-center space-y-3">
                  {/* Game Icon */}
                  <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  
                  {/* Game Title */}
                  <h3 className="font-black text-lg group-hover:text-yellow-200 transition-colors duration-300" style={{ 
                    fontFamily: 'Comic Sans MS, cursive, sans-serif',
                    textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
                    letterSpacing: '0.5px'
                  }}>
                    {game.title}
                  </h3>
                  
                  {/* Game Description */}
                  <p className="text-white/90 text-sm leading-relaxed font-bold" style={{ 
                    fontFamily: 'Comic Sans MS, cursive, sans-serif',
                    letterSpacing: '0.3px'
                  }}>
                    {game.description}
                  </p>
                  
                  {/* Focus Areas */}
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white/80" style={{ 
                      fontFamily: 'Comic Sans MS, cursive, sans-serif',
                      letterSpacing: '0.3px'
                    }}>Focus:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {focusAreas[index % focusAreas.length].map((area, areaIndex) => (
                        <span key={areaIndex} className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold text-white/90" style={{ 
                          fontFamily: 'Comic Sans MS, cursive, sans-serif',
                          letterSpacing: '0.2px'
                        }}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-black" style={{ 
                      fontFamily: 'Comic Sans MS, cursive, sans-serif',
                      letterSpacing: '0.3px'
                    }}>
                      <span>Progress</span>
                      <span>{game.progress}%</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-300 to-orange-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${game.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-black py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-white/30 hover:border-white/50 text-sm"
                    style={{ 
                      fontFamily: 'Comic Sans MS, cursive, sans-serif',
                      textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
                      letterSpacing: '0.5px'
                    }}
                    onClick={() => game.route ? navigate(game.route) : console.log(`Playing ${game.title}`)}
                  >
                    🚀 Play
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Spacing from games section */}
      <div className="h-8"></div>

      {/* Learning Activity Calendar */}
      <div>
        <h2 className="text-2xl font-playful text-foreground mb-4 flex items-center">
          <span className="mr-2">📅</span>
          Your Learning Activity Calendar
        </h2>
        <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-primary mb-2">See Your Daily Learning Progress!</h3>
            <p className="text-sm text-muted-foreground font-comic mb-4">
              This calendar shows how much you practiced each day for the last 12 weeks. 
              <br />
              <strong>Each square = 1 day</strong> • <strong>Darker green = More practice time</strong>
            </p>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 max-w-lg mx-auto mb-6">
            {/* Day labels */}
            <div className="text-xs text-center font-bold text-muted-foreground py-2">Mon</div>
            <div className="text-xs text-center font-bold text-muted-foreground py-2">Tue</div>
            <div className="text-xs text-center font-bold text-muted-foreground py-2">Wed</div>
            <div className="text-xs text-center font-bold text-muted-foreground py-2">Thu</div>
            <div className="text-xs text-center font-bold text-muted-foreground py-2">Fri</div>
            <div className="text-xs text-center font-bold text-muted-foreground py-2">Sat</div>
            <div className="text-xs text-center font-bold text-muted-foreground py-2">Sun</div>
            
            {/* Calendar squares */}
            {isLoadingHeatmap ? (
              // Loading state
              Array.from({ length: 84 }, (_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm bg-gray-200 animate-pulse border border-gray-300"
                />
              ))
            ) : (
              // Real data
              heatmapData.map((dayData, i) => {
                const getIntensityClass = (intensity: number) => {
                  if (intensity < 0.2) return 'bg-gray-200';
                  if (intensity < 0.4) return 'bg-green-200';
                  if (intensity < 0.6) return 'bg-green-400';
                  if (intensity < 0.8) return 'bg-green-600';
                  return 'bg-green-800';
                };
                
                const getActivityText = (dayData: HeatmapData) => {
                  if (dayData.gameCount === 0) return 'No practice';
                  return `${dayData.games.join(', ')}`;
                };
                
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${getIntensityClass(dayData.intensity)} hover:scale-125 transition-transform cursor-pointer border border-gray-300`}
                    title={`Week ${Math.floor(i/7) + 1}, Day ${(i % 7) + 1}: ${getActivityText(dayData)}`}
                  />
                );
              })
            )}
          </div>
          
          {/* Legend and Stats */}
          <div className="space-y-4">
            <div className="flex justify-center items-center space-x-4 text-xs text-muted-foreground">
              <span className="font-bold">Practice Time:</span>
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-gray-200 rounded-sm border"></div>
                <span>None</span>
                <div className="w-4 h-4 bg-green-200 rounded-sm border"></div>
                <span>Little</span>
                <div className="w-4 h-4 bg-green-400 rounded-sm border"></div>
                <span>Some</span>
                <div className="w-4 h-4 bg-green-600 rounded-sm border"></div>
                <span>Lots</span>
                <div className="w-4 h-4 bg-green-800 rounded-sm border"></div>
                <span>Maximum!</span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoadingHeatmap ? '...' : gameStats.totalDaysPracticed}
                </div>
                <div className="text-xs text-muted-foreground font-comic">Days Practiced</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingHeatmap ? '...' : gameStats.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground font-comic">Day Streak</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Spacing from calendar section */}
      <div className="h-8"></div>

      {/* Message from Ella */}
      <div>
        <h2 className="text-2xl font-playful text-foreground mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          Message from Ella
        </h2>
        <Card className="card-playful p-6 backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-start space-x-4">
            {/* Ella's Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            
            {/* Message Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="text-lg font-bold text-purple-700">Ella - Your AI Learning Assistant</h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  Online
                </span>
              </div>
              
              <div className="bg-white/80 p-4 rounded-lg shadow-sm border border-purple-100">
                <p className="text-gray-700 leading-relaxed mb-3">
                  Hi there! I'm Ella, your personal learning assistant! 🌟 I've been watching your amazing progress, and I'm so proud of how hard you've been working!
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-3">
                  I noticed you've been doing really well with the <strong className="text-purple-600">Gesture Game</strong> and <strong className="text-blue-600">Eye Gaze Tracking</strong>! Your focus and concentration have improved so much! 🎯
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-3">
                  Here's a special tip for you: Try to practice for at least 15 minutes every day. Even if you feel tired, just 5 minutes can make a big difference! Remember, every small step counts! 💪
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  Keep up the fantastic work! I believe in you, and I know you can achieve anything you set your mind to! 🌈✨
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 mt-4">
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => console.log('Chat with Ella clicked')}
                >
                  💬 Chat with Ella
                </Button>
                <Button 
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 font-bold px-4 py-2 rounded-lg transition-all duration-300"
                  onClick={() => console.log('View progress clicked')}
                >
                  📊 View My Progress
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
