import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChildTask, childTaskService } from '@/shared/services/child/childTaskService';
import { Calendar, Clock, Gamepad2, Loader2, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChildTaskPageProps {
  childId: string;
  childName: string;
}

const ChildTaskPage: React.FC<ChildTaskPageProps> = ({ childId, childName }) => {
  const [tasks, setTasks] = useState<ChildTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'running' | 'ended'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, [childId]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await childTaskService.getTasksByChild(childId);
      setTasks(response.tasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleCompleteTask = async (task: ChildTask) => {
    try {
      await childTaskService.updateTaskStatus(task.taskId, childId, 'COMPLETED');
      // Refresh tasks after status update
      await loadTasks();
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const getGameIcon = (gameName: string) => {
    const gameIcons: { [key: string]: string } = {
      'Dance Doodle': '💃',
      'Gaze Game': '👁️',
      'Gesture Game': '✋',
      'Mirror Posture Game': '🪞',
      'Repeat With Me Game': '🔄'
    };
    return gameIcons[gameName] || '🎮';
  };

  const handleGameClick = (gameName: string, taskId: number) => {
    // Map game names to their respective routes based on App.tsx
    const gameRoutes: { [key: string]: string } = {
      'Dance Doodle': '/games/dance-doodle',
      'Gaze Game': '/games/gaze-tracking',
      'Gesture Game': '/games/gesture',
      'Mirror Posture Game': '/games/mirror-posture',
      'Repeat With Me Game': '/games/repeat-with-me'
    };

    const gameRoute = gameRoutes[gameName];
    if (gameRoute) {
      // Navigate to the game with task ID as a query parameter
      navigate(`${gameRoute}?taskId=${taskId}&childId=${childId}`);
    } else {
      console.error(`Unknown game: ${gameName}`);
    }
  };

  const getFilteredTasks = () => {
    if (!tasks) return [];
    if (filter === 'all') return tasks;
    return tasks.filter(task => {
      const now = new Date();
      const endTime = new Date(task.endTime);
      const isEnded = now > endTime;
      
      if (filter === 'running') {
        return !isEnded;
      } else if (filter === 'ended') {
        return isEnded;
      }
      return true;
    });
  };

  const getTaskStats = () => {
    if (!tasks) return { total: 0, running: 0, ended: 0 };
    
    const now = new Date();
    const total = tasks.length;
    const running = tasks.filter(t => {
      const endTime = new Date(t.endTime);
      return now <= endTime;
    }).length;
    const ended = tasks.filter(t => {
      const endTime = new Date(t.endTime);
      return now > endTime;
    }).length;
    
    return { total, running, ended };
  };

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTasks} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 space-y-6 pb-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Learning Tasks
          </h1>
          <p className="text-gray-600">
            Complete your assigned tasks to improve your skills!
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { key: 'all', label: 'All Tasks', count: stats.total },
            { key: 'running', label: 'Running', count: stats.running },
            { key: 'ended', label: 'Ended', count: stats.ended }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
            className={`relative ${
              filter === key 
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0 shadow-md' 
                : 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300'
            }`}
            >
              {label}
              {count > 0 && (
                <Badge variant="secondary" className={`ml-2 ${
                  filter === key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Scrollable Tasks List */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <Gamepad2 className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {filter === 'all' ? 'No tasks assigned yet' : `No ${filter} tasks`}
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'Your teacher will assign tasks for you to complete.' 
                    : `No tasks found in the ${filter} category.`
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const selectedGames = childTaskService.parseSelectedGames(task.gameId);
            const now = new Date();
            const endTime = new Date(task.endTime);
            const isEnded = now > endTime;
            const displayStatus = isEnded ? 'Ended' : 'Running';
            const statusColor = isEnded ? 'text-gray-600 bg-gray-100' : 'text-green-600 bg-green-100';
            const statusIcon = isEnded ? '🏁' : '🔄';

            return (
              <Card key={task.taskId} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-200 relative overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 relative p-4 flex-shrink-0">
                  {/* Gamepad background pattern */}
                  <div className="absolute top-1 right-1 opacity-10">
                    <Gamepad2 className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 mb-1 font-bold line-clamp-2">
                        {task.taskTitle}
                      </CardTitle>
                      <CardDescription className="text-gray-700 text-sm line-clamp-2">
                        {task.taskDescription}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusColor} border-0 shadow-sm text-xs`}>
                      <span className="mr-1">{statusIcon}</span>
                      {displayStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {/* Games - Compact Buttons */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                        <Gamepad2 className="h-4 w-4 mr-1 text-blue-600" />
                        Games:
                      </h4>
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                        {selectedGames.slice(0, 3).map((game, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className={`group relative overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                              isEnded 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-500 hover:from-blue-600 hover:to-blue-800 hover:shadow-lg'
                            }`}
                            onClick={() => !isEnded && handleGameClick(game, task.taskId)}
                            disabled={isEnded}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{getGameIcon(game)}</span>
                              <span className="text-xs font-bold">
                                {game.split(' ')[0]}
                              </span>
                              {!isEnded && (
                                <Play className="h-3 w-3 opacity-80" />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time Information - Compact */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-700">
                          <Calendar className="h-3 w-3 mr-2 text-blue-600" />
                          <span className="font-medium">Start: {childTaskService.formatDate(task.startTime)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <Clock className="h-3 w-3 mr-2 text-blue-600" />
                          <span className={`font-medium ${isEnded ? 'text-gray-500' : 'text-gray-700'}`}>
                            End: {childTaskService.formatDate(task.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="flex gap-2 pt-3 mt-auto">
                    {!isEnded && task.status === 'IN_PROGRESS' && (
                      <Button 
                        onClick={() => handleCompleteTask(task)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md text-xs"
                      >
                        Mark Complete
                      </Button>
                    )}
                    {!isEnded && task.status === 'COMPLETED' && (
                      <Button variant="outline" disabled size="sm" className="border-green-300 text-green-600 bg-green-50 text-xs">
                        Completed
                      </Button>
                    )}
                    {isEnded && (
                      <Button variant="outline" disabled size="sm" className="text-gray-500 border-gray-300 bg-gray-50 text-xs">
                        Ended
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};

export default ChildTaskPage;
