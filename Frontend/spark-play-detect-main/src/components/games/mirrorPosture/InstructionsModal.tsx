import { Camera, Clock, PlayCircle, Trophy } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Import facial expression images
import kissImg from './assets/kiss.png';
import lookingLeftImg from './assets/looking_left.png';
import lookingRightImg from './assets/looking_right.png';
import mouthOpenImg from './assets/mouth_open.png';
import showingTeethImg from './assets/showing_teeth.png';

interface InstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FACIAL_EXPRESSIONS = [
  { id: 'mouth_open', name: 'Open Your Mouth!', image: mouthOpenImg, emoji: '😮' },
  { id: 'showing_teeth', name: 'Show Your Teeth!', image: showingTeethImg, emoji: '😁' },
  { id: 'kiss', name: 'Make a Kiss!', image: kissImg, emoji: '😘' },
  { id: 'looking_left', name: 'Look Left!', image: lookingLeftImg, emoji: '👈' },
  { id: 'looking_right', name: 'Look Right!', image: lookingRightImg, emoji: '👉' },
];

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  open,
  onOpenChange,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-playful bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
            🎮 How to Play Face Mimic Fun! 🎭
          </h2>
          <p className="text-xl text-muted-foreground font-comic">
            Learn to copy facial expressions and have fun!
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Game Overview */}
          <Card className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <h3 className="text-3xl font-playful text-primary mb-6 flex items-center gap-3">
              <PlayCircle className="w-10 h-10" />
              What's This Game About?
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed font-comic">
              Face Mimic Fun helps you practice making different facial expressions! 
              You'll see a big picture showing how to make a face, and then you copy it. 
              It's like playing copycat with your face! 😄
            </p>
          </Card>

          {/* How to Play Steps */}
          <div className="grid md:grid-cols-2 gap-6">
            
            <Card className="card-playful border-2 border-fun-purple/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">1️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Look at the Picture</h4>
              <p className="text-lg text-muted-foreground font-comic">
                We'll show you a big, colorful picture of how to make a face expression
              </p>
            </Card>

            <Card className="card-playful border-2 border-fun-orange/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">2️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Copy the Face</h4>
              <p className="text-lg text-muted-foreground font-comic">
                Look in the camera and make the same face as the picture!
              </p>
            </Card>

            <Card className="card-playful border-2 border-fun-green/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">3️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Get Points!</h4>
              <p className="text-lg text-muted-foreground font-comic">
                When you make the right face, you get a point and hear a happy sound!
              </p>
            </Card>

            <Card className="card-playful border-2 border-fun-yellow/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">4️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Play 5 Rounds</h4>
              <p className="text-lg text-muted-foreground font-comic">
                Try to copy 5 different faces. You have 15 seconds for each one!
              </p>
            </Card>

          </div>

          {/* Game Rules */}
          <Card className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <h3 className="text-3xl font-playful text-primary mb-6 flex items-center gap-3">
              <Trophy className="w-10 h-10" />
              Game Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-playful border-2 border-fun-orange/20 p-6">
                <h4 className="text-xl font-playful text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Time Limit
                </h4>
                <p className="text-lg text-muted-foreground font-comic">
                  You have 15 seconds to copy each facial expression. Don't worry, that's plenty of time!
                </p>
              </div>
              <div className="card-playful border-2 border-fun-purple/20 p-6">
                <h4 className="text-xl font-playful text-primary mb-4 flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  Camera Access
                </h4>
                <p className="text-lg text-muted-foreground font-comic">
                  Make sure to allow camera access so the game can see your face expressions!
                </p>
              </div>
            </div>
          </Card>

          {/* Available Expressions */}
          <Card className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <h3 className="text-3xl font-playful text-primary mb-6 text-center">
              🎭 Available Expressions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {FACIAL_EXPRESSIONS.map((expression, index) => (
                <div key={index} className="card-playful border-2 border-fun-purple/20 p-6 text-center">
                  <img 
                    src={expression.image} 
                    alt={expression.name}
                    className="w-20 h-20 mx-auto mb-4 rounded-lg border-2 border-primary shadow-lg"
                  />
                  <div className="text-lg font-playful text-primary">{expression.name}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Close Button */}
          <div className="text-center">
            <Button 
              onClick={() => onOpenChange(false)}
              className="btn-fun font-comic text-2xl py-6 px-12"
            >
              Got it! Let's Play! 🎮
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructionsModal; 