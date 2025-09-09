import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChildTask, childTaskService } from '@/services/childTaskService';
import { Calendar, CheckCircle, Clock, Gamepad2, Loader2, Target } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Learning Tasks
        </h1>
        <p className="text-gray-600">
          Complete your assigned tasks to improve your skills!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Running</p>
                <p className="text-2xl font-bold">{stats.running}</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Ended</p>
                <p className="text-2xl font-bold">{stats.ended}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
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
            className="relative"
          >
            {label}
            {count > 0 && (
              <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                {count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
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
              <Card key={task.taskId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 mb-2">
                        {task.taskTitle}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mb-3">
                        {task.taskDescription}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusColor} border-0`}>
                      <span className="mr-1">{statusIcon}</span>
                      {displayStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Games */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        Games to Play:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedGames.map((game, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                            onClick={() => handleGameClick(game, task.taskId)}
                            disabled={isEnded}
                          >
                            {game}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Start: {childTaskService.formatDate(task.startTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className={isEnded ? 'text-gray-500' : 'text-gray-600'}>
                          End: {childTaskService.formatDate(task.endTime)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {!isEnded && task.status === 'IN_PROGRESS' && (
                        <Button 
                          onClick={() => handleCompleteTask(task)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Complete
                        </Button>
                      )}
                      {!isEnded && task.status === 'COMPLETED' && (
                        <Button variant="outline" disabled>
                          Task Completed
                        </Button>
                      )}
                      {isEnded && (
                        <Button variant="outline" disabled className="text-gray-500">
                          Task Ended
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChildTaskPage;
