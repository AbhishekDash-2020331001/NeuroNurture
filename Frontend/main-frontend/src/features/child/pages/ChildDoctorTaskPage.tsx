import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, AlertCircle, Brain, CheckCircle, Clock, Eye, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HealthTask {
  id: number;
  title: string;
  description: string;
  type: 'exercise' | 'medication' | 'assessment' | 'therapy';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  doctor: string;
  instructions: string;
  completedAt?: string;
}

export default function ChildDoctorTaskPage({ childId, childName }: { childId: string; childName: string }) {
  const [tasks, setTasks] = useState<HealthTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    loadHealthTasks();
  }, [childId]);

  const loadHealthTasks = async () => {
    try {
      setIsLoading(true);
      // Simulate API call with dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyTasks: HealthTask[] = [
        {
          id: 1,
          title: 'Daily Physical Exercise',
          description: 'Complete 30 minutes of physical activity as recommended by Dr. Johnson',
          type: 'exercise',
          status: 'completed',
          dueDate: '2024-01-25',
          priority: 'high',
          doctor: 'Dr. Sarah Johnson',
          instructions: 'Walk, run, or play active games for 30 minutes. Monitor heart rate.',
          completedAt: '2024-01-25T10:30:00'
        },
        {
          id: 2,
          title: 'Memory Assessment',
          description: 'Complete the weekly memory and cognitive assessment',
          type: 'assessment',
          status: 'in_progress',
          dueDate: '2024-01-28',
          priority: 'medium',
          doctor: 'Dr. Sarah Johnson',
          instructions: 'Use the NeuroNurture memory games and record your scores.'
        },
        {
          id: 3,
          title: 'Eye Tracking Exercise',
          description: 'Practice eye coordination exercises for 15 minutes',
          type: 'therapy',
          status: 'pending',
          dueDate: '2024-01-30',
          priority: 'medium',
          doctor: 'Dr. Sarah Johnson',
          instructions: 'Follow the visual tracking exercises in the therapy section.'
        },
        {
          id: 4,
          title: 'Medication Reminder',
          description: 'Take prescribed vitamin supplements',
          type: 'medication',
          status: 'pending',
          dueDate: '2024-01-26',
          priority: 'high',
          doctor: 'Dr. Sarah Johnson',
          instructions: 'Take 1 tablet with breakfast as prescribed.'
        },
        {
          id: 5,
          title: 'Focus Training Session',
          description: 'Complete concentration exercises for 20 minutes',
          type: 'therapy',
          status: 'overdue',
          dueDate: '2024-01-24',
          priority: 'high',
          doctor: 'Dr. Sarah Johnson',
          instructions: 'Use the focus training games and maintain attention for the full duration.'
        }
      ];
      
      setTasks(dummyTasks);
    } catch (error) {
      console.error('Error loading health tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'exercise': return <Activity className="h-5 w-5" />;
      case 'medication': return <Heart className="h-5 w-5" />;
      case 'assessment': return <Brain className="h-5 w-5" />;
      case 'therapy': return <Eye className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📝</div>
          <h2 className="text-2xl font-playful text-primary mb-2">Loading Health Tasks...</h2>
          <p className="text-lg font-comic text-muted-foreground">Please wait while we fetch your tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playful text-primary mb-2 flex items-center justify-center">
          <span className="mr-2">📝</span>
          Health Tasks
        </h2>
        <p className="text-lg font-comic text-muted-foreground">
          {childName}'s health and wellness tasks from Dr. Johnson
        </p>
      </div>

       {/* Task Statistics */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
           <CardContent className="p-4 text-center">
             <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
             <div className="text-sm text-blue-700">Total Tasks</div>
           </CardContent>
         </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
            <div className="text-sm text-red-700">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="font-comic"
        >
          All Tasks ({taskStats.total})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className="font-comic"
        >
          Pending ({taskStats.pending})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          className="font-comic"
        >
          Completed ({taskStats.completed})
        </Button>
        <Button
          variant={filter === 'overdue' ? 'default' : 'outline'}
          onClick={() => setFilter('overdue')}
          className="font-comic"
        >
          Overdue ({taskStats.overdue})
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="card-playful p-8 backdrop-blur-sm bg-white/80">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-playful text-xl text-primary mb-2">
                No Tasks Found
              </h3>
              <p className="font-comic text-lg text-muted-foreground">
                {filter === 'all' 
                  ? 'No health tasks assigned yet.' 
                  : `No ${filter} tasks at the moment.`
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className={`card-playful hover:shadow-lg transition-all duration-300 group p-6 backdrop-blur-sm bg-white/80 ${
                task.status === 'overdue' ? 'border-red-200 bg-red-50/50' : ''
              }`}
            >
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      task.type === 'exercise' ? 'bg-green-100 text-green-600' :
                      task.type === 'medication' ? 'bg-red-100 text-red-600' :
                      task.type === 'assessment' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getTaskIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-playful text-lg group-hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                        {getStatusIcon(task.status)}
                      </div>
                      <p className="font-comic text-muted-foreground mb-3">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`${getStatusColor(task.status)} border`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={`${getPriorityColor(task.priority)} border`}>
                          {task.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Doctor's Instructions:</h4>
                  <p className="font-comic text-sm text-gray-600">{task.instructions}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">👩‍⚕️</span>
                      <span>{task.doctor}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {task.status === 'completed' && task.completedAt && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Completed: {new Date(task.completedAt).toLocaleDateString()}
                      </Badge>
                    )}
                    {task.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        className="font-comic"
                        onClick={() => {
                          // Simulate task completion
                          setTasks(prev => prev.map(t => 
                            t.id === task.id 
                              ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
                              : t
                          ));
                        }}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center">
          <h3 className="font-playful text-xl text-primary mb-3">
            Quick Actions 🚀
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="font-comic">
              📊 View Progress Report
            </Button>
            <Button variant="outline" className="font-comic">
              💬 Message Doctor
            </Button>
            <Button variant="outline" className="font-comic">
              📅 Schedule Appointment
            </Button>
            <Button variant="outline" className="font-comic">
              📋 View Medical History
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
