import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';

export default function ChildSchoolPage() {
  const [selectedChild, setSelectedChild] = useState<any>(null);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
    }
  }, []);

  return (
    <div className="space-y-4 px-1 py-2">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playful text-primary mb-2 flex items-center justify-center">
          <span className="mr-2">🏫</span>
          School Connection
        </h2>
        <p className="text-lg font-comic text-muted-foreground">
          {selectedChild ? `Connect ${selectedChild.name} with their school` : 'Connect with your school'}
        </p>
      </div>

      {/* Current School Status */}
      <Card className="card-playful border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center">
          <div className="text-4xl mb-4">🏫</div>
          <CardTitle className="text-xl font-playful text-primary mb-2">
            No School Connected Yet
          </CardTitle>
          <CardDescription className="text-base font-comic text-muted-foreground mb-4">
            Connect with your child's school to access educational resources, track academic progress, and participate in school activities.
          </CardDescription>
          <Button className="btn-fun font-comic text-base py-2 px-6">
            Connect to School 🚀
          </Button>
        </div>
      </Card>

      {/* School Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-4 backdrop-blur-sm bg-white/80">
          <div className="text-center space-y-3">
            <div className="text-3xl bounce-gentle">📚</div>
            <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
              Academic Progress
            </CardTitle>
            <CardDescription className="font-comic text-sm">
              Track learning milestones and academic achievements
            </CardDescription>
          </div>
        </Card>

        <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-4 backdrop-blur-sm bg-white/80">
          <div className="text-center space-y-3">
            <div className="text-3xl float">🎯</div>
            <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
              School Activities
            </CardTitle>
            <CardDescription className="font-comic text-sm">
              Participate in school events and competitions
            </CardDescription>
          </div>
        </Card>

        <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-4 backdrop-blur-sm bg-white/80">
          <div className="text-center space-y-3">
            <div className="text-3xl wiggle">👥</div>
            <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
              Teacher Communication
            </CardTitle>
            <CardDescription className="font-comic text-sm">
              Stay connected with teachers and school staff
            </CardDescription>
          </div>
        </Card>
      </div>

      {/* Coming Soon Features */}
      <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center">
          <h3 className="font-playful text-xl text-primary mb-3">
            Coming Soon! 🌟
          </h3>
          <p className="font-comic text-lg text-muted-foreground mb-4">
            We're working on amazing school integration features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📊</span>
              <span className="font-comic">Detailed Progress Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏆</span>
              <span className="font-comic">School Competitions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">📝</span>
              <span className="font-comic">Assignment Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">📅</span>
              <span className="font-comic">School Calendar</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
