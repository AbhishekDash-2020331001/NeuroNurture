import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Medal, Star, Target, Trophy, Users } from 'lucide-react';
import React from 'react';

interface ChildCompetitionPageProps {
  childId: string;
  childName: string;
}

const ChildCompetitionPage: React.FC<ChildCompetitionPageProps> = ({ childId, childName }) => {
  // Mock data for competitions - in real implementation, this would come from backend
  const competitions = [
    {
      id: 1,
      title: "Weekly Learning Challenge",
      description: "Complete 5 games this week to earn points and compete with classmates!",
      startDate: "2024-01-15",
      endDate: "2024-01-21",
      participants: 24,
      status: "active",
      points: 150,
      rank: 3,
      maxPoints: 500
    },
    {
      id: 2,
      title: "Focus Master Tournament",
      description: "Test your concentration skills in the Gaze Game competition!",
      startDate: "2024-01-20",
      endDate: "2024-01-27",
      participants: 18,
      status: "upcoming",
      points: 0,
      rank: null,
      maxPoints: 300
    },
    {
      id: 3,
      title: "Movement Champions",
      description: "Show off your dance and gesture skills in this creative competition!",
      startDate: "2024-01-10",
      endDate: "2024-01-17",
      participants: 32,
      status: "completed",
      points: 280,
      rank: 1,
      maxPoints: 400
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🔥';
      case 'upcoming':
        return '⏰';
      case 'completed':
        return '✅';
      default:
        return '📋';
    }
  };

  const getRankIcon = (rank: number | null) => {
    if (!rank) return null;
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const activeCompetitions = competitions.filter(c => c.status === 'active');
  const upcomingCompetitions = competitions.filter(c => c.status === 'upcoming');
  const completedCompetitions = competitions.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
          Competition Arena
        </h1>
        <p className="text-gray-600">
          Compete with your classmates and show off your skills!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Points</p>
                <p className="text-2xl font-bold">430</p>
              </div>
              <Star className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Competitions Won</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Medal className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Current Rank</p>
                <p className="text-2xl font-bold">#3</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Competitions */}
      {activeCompetitions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            Active Competitions
          </h2>
          <div className="space-y-4">
            {activeCompetitions.map((competition) => (
              <Card key={competition.id} className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 mb-2">
                        {competition.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mb-3">
                        {competition.description}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(competition.status)} border-0`}>
                      <span className="mr-1">{getStatusIcon(competition.status)}</span>
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress and Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Your Points: {competition.points}/{competition.maxPoints}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{competition.participants} participants</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Ends: {formatDate(competition.endDate)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round((competition.points / competition.maxPoints) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(competition.points / competition.maxPoints) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button className="bg-green-600 hover:bg-green-700 w-full">
                        Continue Competing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Competitions */}
      {upcomingCompetitions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            Upcoming Competitions
          </h2>
          <div className="space-y-4">
            {upcomingCompetitions.map((competition) => (
              <Card key={competition.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 mb-2">
                        {competition.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mb-3">
                        {competition.description}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(competition.status)} border-0`}>
                      <span className="mr-1">{getStatusIcon(competition.status)}</span>
                      Upcoming
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Starts: {formatDate(competition.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{competition.participants} participants</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" className="w-full" disabled>
                        Competition Not Started Yet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Competitions */}
      {completedCompetitions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
            Completed Competitions
          </h2>
          <div className="space-y-4">
            {completedCompetitions.map((competition) => (
              <Card key={competition.id} className="border-l-4 border-l-gray-500 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 mb-2">
                        {competition.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mb-3">
                        {competition.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {competition.rank && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <span className="mr-1">{getRankIcon(competition.rank)}</span>
                          Rank #{competition.rank}
                        </Badge>
                      )}
                      <Badge className={`${getStatusColor(competition.status)} border-0`}>
                        <span className="mr-1">{getStatusIcon(competition.status)}</span>
                        Completed
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Final Points: {competition.points}/{competition.maxPoints}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{competition.participants} participants</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Ended: {formatDate(competition.endDate)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Competitions Message */}
      {competitions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Trophy className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No competitions available
            </h3>
            <p className="text-gray-500">
              Check back later for exciting competitions and challenges!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChildCompetitionPage;
