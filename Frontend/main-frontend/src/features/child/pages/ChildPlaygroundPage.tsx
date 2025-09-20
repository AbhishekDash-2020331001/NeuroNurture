import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ALIScoreModal from '@/features/parent/components/ALIScoreModal';
import PerformanceOverview from '@/features/parent/components/PerformanceOverview';
import { gameDataService, GameStats, HeatmapData } from '@/shared/services/game/gameDataService';
import { getCurrentChild } from '@/shared/utils/childUtils';
import { Brain, Trophy } from 'lucide-react';
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
  const [isALIModalOpen, setIsALIModalOpen] = useState(false);
  const [aliScore, setAliScore] = useState<number | null>(null);
  const [hasPlayedAllGames, setHasPlayedAllGames] = useState(false);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      // Load heatmap data if child is available
      if (childData.id) {
        loadHeatmapData(childData.id);
        checkGameCompletion(childData.id);
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

  // Check if child has played all games at least once
  const checkGameCompletion = async (childId: string) => {
    try {
      // For now, simulate checking if all games have been played
      // In the future, this would call an API to check game completion status
      const gameCompletionStatus = {
        gestureGame: Math.random() > 0.3,
        mirrorPosture: Math.random() > 0.3,
        eyeGazeTracking: Math.random() > 0.3,
        repeatWithMe: Math.random() > 0.3,
        danceDoodle: Math.random() > 0.3
      };
      
      const allGamesPlayed = Object.values(gameCompletionStatus).every(played => played);
      setHasPlayedAllGames(allGamesPlayed);
      
      if (allGamesPlayed) {
        // Simulate getting ALI score (would be from API)
        const score = Math.floor(Math.random() * 100) + 1;
        setAliScore(score);
      } else {
        setAliScore(null);
      }
    } catch (error) {
      console.error('Error checking game completion:', error);
      setHasPlayedAllGames(false);
      setAliScore(null);
    }
  };

  const games = [
    {
      title: "Gesture Game",
      description: "Learn hand gestures!",
      icon: "👋",
      color: "from-blue-400 to-purple-500",
      route: "/games/gesture/insights"
    },
    {
      title: "Mirror Posture",
      description: "Mimic expressions!",
      icon: "😎",
      color: "from-orange-400 to-pink-500",
      route: "/games/posture/insights"
    },
    {
      title: "Eye Gaze Tracking",
      description: "Pop balloons with your eyes!",
      icon: "👁️",
      color: "from-purple-400 to-blue-500",
      route: "/games/gaze-tracking/insights"
    },
    {
      title: "Repeat with Me",
      description: "Listen and repeat sentences!",
      icon: "🎤",
      color: "from-pink-400 to-red-500",
      route: "/games/repeat-with-me/insights"
    },
    {
      title: "Dance Doodle",
      description: "Strike amazing poses!",
      icon: "🕺",
      color: "from-purple-400 to-pink-500",
      route: "/games/dance-doodle/insights"
    }
  ];


  return (
    <div className="space-y-4 px-1 py-2">
      {/* Greeting Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">

            <div>
              <h1 className="text-3xl lg:text-4xl font-playful text-primary">
                {selectedChild ? `Hi ${selectedChild.name}! ` : username ? `Hi ${username}! ` : 'Welcome! '}
              </h1>
              <p className="text-lg lg:text-xl font-comic text-muted-foreground">
                {selectedChild ? `Ready for fun learning, ${selectedChild.name}?` : 'Ready for fun learning?'}
              </p>
            </div>
          </div>
          
          {/* ALI Score Section */}
          <div className="flex items-center gap-8">
            {/* <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">ALI Score:</span>
              {hasPlayedAllGames || aliScore !== null || true ? (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                  13.7%
                </div>
              ) : (
                <div className="relative group">
                  <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold cursor-help flex items-center gap-1">

                    ?
                  </div>

                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    The child must play all games at least once to get this
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              )}
            </div> */}
            
            <Button
              onClick={() => setIsALIModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200"
            >
              <Brain className="w-4 h-4 mr-2" />
              Get ALI Score
              <Trophy className="w-4 h-4 ml-2" />
            </Button>
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
                    Play
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
            <p className="text-sm text-muted-foreground font-comic mb-4">
              <strong>Each circle = 1 day</strong> • <strong>Darker circle = More practice time</strong>
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

      {/* AI Performance Insights */}
      {selectedChild && (
        <div className="mb-8">
          <PerformanceOverview 
            childId={selectedChild.id.toString()} 
            childName={selectedChild.name} 
          />
        </div>
      )}

      {/* ALI Score Modal */}
      <ALIScoreModal
        isOpen={isALIModalOpen}
        onClose={() => setIsALIModalOpen(false)}
      />

    </div>
  );
}
