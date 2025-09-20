import React from 'react';
import { 
  Eye, 
  Hand, 
  User, 
  Repeat, 
  Music,
  Target,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface GameProgress {
  gameId: string;
  gameName: string;
  icon: string;
  isCompleted: boolean;
  bestScore?: number;
  playCount: number;
  lastPlayed?: string;
  therapyGoal?: string;
  targetScore?: number;
}

interface GameProgressIndicatorProps {
  games: GameProgress[];
  showScores?: boolean;
  showTargets?: boolean;
  compact?: boolean;
  onGameClick?: (game: GameProgress) => void;
}

const GameProgressIndicator: React.FC<GameProgressIndicatorProps> = ({
  games,
  showScores = true,
  showTargets = true,
  compact = false,
  onGameClick
}) => {
  const getGameIcon = (gameId: string) => {
    const gameIcons: { [key: string]: any } = {
      'gaze-tracking': Eye,
      'gesture-control': Hand,
      'mirror-posture': User,
      'repeat-with-me': Repeat,
      'dance-doodle': Music
    };
    return gameIcons[gameId] || Target;
  };

  const getScoreColor = (score: number, targetScore: number = 80) => {
    if (score >= targetScore) return 'text-green-600';
    if (score >= targetScore * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <Clock className="h-4 w-4 text-gray-400" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {games.map((game) => {
          const Icon = getGameIcon(game.gameId);
          return (
            <div
              key={game.gameId}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border transition-colors ${
                game.isCompleted 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              } ${onGameClick ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
              onClick={() => onGameClick?.(game)}
              title={`${game.gameName} - ${game.isCompleted ? 'Completed' : 'In Progress'}`}
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs font-medium">{game.gameName}</span>
              {showScores && game.bestScore && (
                <span className={`text-xs font-bold ${getScoreColor(game.bestScore, game.targetScore)}`}>
                  {game.bestScore}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.map((game) => {
        const Icon = getGameIcon(game.gameId);
        const scoreColor = game.bestScore ? getScoreColor(game.bestScore, game.targetScore) : 'text-gray-400';
        
        return (
          <div
            key={game.gameId}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              game.isCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            } ${onGameClick ? 'cursor-pointer hover:shadow-sm' : ''}`}
            onClick={() => onGameClick?.(game)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  game.isCompleted ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    game.isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{game.gameName}</h4>
                  {game.therapyGoal && (
                    <p className="text-xs text-gray-500">{game.therapyGoal}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {showScores && game.bestScore && (
                  <div className="text-right">
                    <p className={`text-sm font-bold ${scoreColor}`}>
                      {game.bestScore}%
                    </p>
                    {showTargets && game.targetScore && (
                      <p className="text-xs text-gray-400">
                        Target: {game.targetScore}%
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {getCompletionIcon(game.isCompleted)}
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {game.playCount} sessions
                    </p>
                    {game.lastPlayed && (
                      <p className="text-xs text-gray-400">
                        {formatDate(game.lastPlayed)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            {game.bestScore && game.targetScore && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs text-gray-500">
                    {game.bestScore}/{game.targetScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      game.bestScore >= game.targetScore ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ 
                      width: `${Math.min((game.bestScore / game.targetScore) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameProgressIndicator;
