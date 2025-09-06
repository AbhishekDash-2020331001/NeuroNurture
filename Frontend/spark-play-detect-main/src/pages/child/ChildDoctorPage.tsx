import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';

export default function ChildDoctorPage() {
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
          <span className="mr-2">👩‍⚕️</span>
          Doctor Connection
        </h2>
        <p className="text-lg font-comic text-muted-foreground">
          {selectedChild ? `Connect ${selectedChild.name} with their doctor` : 'Connect with your doctor'}
        </p>
      </div>

      {/* Current Doctor Status */}
      <Card className="card-playful border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center">
          <div className="text-4xl mb-4">👩‍⚕️</div>
          <CardTitle className="text-xl font-playful text-primary mb-2">
            No Doctor Connected Yet
          </CardTitle>
          <CardDescription className="text-base font-comic text-muted-foreground mb-4">
            Connect with your child's doctor to share developmental progress, get professional insights, and receive personalized recommendations.
          </CardDescription>
          <Button className="btn-fun font-comic text-base py-2 px-6">
            Connect to Doctor 🚀
          </Button>
        </div>
      </Card>

      {/* Doctor Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-4 backdrop-blur-sm bg-white/80">
          <div className="text-center space-y-3">
            <div className="text-3xl bounce-gentle">📈</div>
            <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
              Progress Reports
            </CardTitle>
            <CardDescription className="font-comic text-sm">
              Share detailed developmental progress with your doctor
            </CardDescription>
          </div>
        </Card>

        <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-4 backdrop-blur-sm bg-white/80">
          <div className="text-center space-y-3">
            <div className="text-3xl float">💬</div>
            <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
              Doctor Consultation
            </CardTitle>
            <CardDescription className="font-comic text-sm">
              Schedule appointments and get professional advice
            </CardDescription>
          </div>
        </Card>

        <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-4 backdrop-blur-sm bg-white/80">
          <div className="text-center space-y-3">
            <div className="text-3xl wiggle">🎯</div>
            <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
              Personalized Goals
            </CardTitle>
            <CardDescription className="font-comic text-sm">
              Get customized developmental goals from your doctor
            </CardDescription>
          </div>
        </Card>
      </div>

      {/* Health Insights */}
      <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center mb-4">
          <h3 className="font-playful text-xl text-primary mb-2">
            Health Insights 📊
          </h3>
          <p className="font-comic text-lg text-muted-foreground">
            Track your child's health and development metrics
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-1">📏</div>
            <div className="font-comic text-sm text-muted-foreground">Height</div>
            <div className="font-playful text-lg">{selectedChild?.height || '--'}cm</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">⚖️</div>
            <div className="font-comic text-sm text-muted-foreground">Weight</div>
            <div className="font-playful text-lg">{selectedChild?.weight || '--'}kg</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-1">🎯</div>
            <div className="font-comic text-sm text-muted-foreground">Focus</div>
            <div className="font-playful text-lg">85%</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-1">🧠</div>
            <div className="font-comic text-sm text-muted-foreground">Memory</div>
            <div className="font-playful text-lg">92%</div>
          </div>
        </div>
      </Card>

      {/* Coming Soon Features */}
      <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center">
          <h3 className="font-playful text-xl text-primary mb-3">
            Coming Soon! 🌟
          </h3>
          <p className="font-comic text-lg text-muted-foreground mb-4">
            We're working on amazing doctor integration features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📋</span>
              <span className="font-comic">Medical History Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔔</span>
              <span className="font-comic">Appointment Reminders</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">💊</span>
              <span className="font-comic">Medication Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">📱</span>
              <span className="font-comic">Video Consultations</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
