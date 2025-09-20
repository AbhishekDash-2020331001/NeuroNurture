import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Headphones, Mic, PlayCircle, Trophy } from 'lucide-react';
import React from 'react';

interface InstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  open,
  onOpenChange,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-playful bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            🎮 How to Play Repeat with Me! 🎤
          </h2>
          <p className="text-xl text-muted-foreground font-comic">
            Learn to repeat Bengali sentences and have fun!
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
              Repeat with Me helps you practice speaking Bengali! 
              You'll hear a sentence in Bengali, and then you repeat it back into your microphone. 
              It's like playing copycat with your voice! 🗣️
            </p>
          </Card>

          {/* How to Play Steps */}
          <div className="grid md:grid-cols-2 gap-6">
            
            <Card className="card-playful border-2 border-fun-purple/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">1️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Listen Carefully</h4>
              <p className="text-lg text-muted-foreground font-comic">
                We'll play a Bengali sentence for you to hear clearly
              </p>
            </Card>

            <Card className="card-playful border-2 border-fun-orange/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">2️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Repeat the Sentence</h4>
              <p className="text-lg text-muted-foreground font-comic">
                Speak the same sentence back into your microphone
              </p>
            </Card>

            <Card className="card-playful border-2 border-fun-green/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">3️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Get Your Score</h4>
              <p className="text-lg text-muted-foreground font-comic">
                When you repeat well, you get a high score and hear a happy sound!
              </p>
            </Card>

            <Card className="card-playful border-2 border-fun-yellow/20 p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">4️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-4">Play 12 Rounds</h4>
              <p className="text-lg text-muted-foreground font-comic">
                Try to repeat 12 different sentences. You have 10 seconds to record each one!
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
                  You have 5 seconds to record each sentence. Don't worry, that's plenty of time!
                </p>
              </div>
              <div className="card-playful border-2 border-fun-purple/20 p-6">
                <h4 className="text-xl font-playful text-primary mb-4 flex items-center gap-2">
                  <Mic className="w-6 h-6" />
                  Microphone Access
                </h4>
                <p className="text-lg text-muted-foreground font-comic">
                  Make sure to allow microphone access so the game can hear your voice!
                </p>
              </div>
            </div>
          </Card>

          {/* Available Sentences */}
          <Card className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <h3 className="text-3xl font-playful text-primary mb-6 text-center">
              🇧🇩 Available Bengali Sentences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-playful border-2 border-fun-purple/20 p-6 text-center">
                <div className="text-4xl mb-4">🎤</div>
                <div className="text-lg font-playful text-primary mb-2">Basic Greetings</div>
                <p className="text-sm text-muted-foreground font-comic">
                  Learn common phrases like "How are you?" and "What's your name?"
                </p>
              </div>
              <div className="card-playful border-2 border-fun-orange/20 p-6 text-center">
                <div className="text-4xl mb-4">🗣️</div>
                <div className="text-lg font-playful text-primary mb-2">Daily Expressions</div>
                <p className="text-sm text-muted-foreground font-comic">
                  Practice everyday sentences about weather, food, and activities
                </p>
              </div>
              <div className="card-playful border-2 border-fun-green/20 p-6 text-center">
                <div className="text-4xl mb-4">📚</div>
                <div className="text-lg font-playful text-primary mb-2">Learning Benefits</div>
                <p className="text-sm text-muted-foreground font-comic">
                  Improve pronunciation and build confidence in speaking Bengali
                </p>
              </div>
              <div className="card-playful border-2 border-fun-yellow/20 p-6 text-center">
                <div className="text-4xl mb-4">🌟</div>
                <div className="text-lg font-playful text-primary mb-2">Fun & Engaging</div>
                <p className="text-sm text-muted-foreground font-comic">
                  Enjoyable way to practice language skills with immediate feedback
                </p>
              </div>
            </div>
          </Card>

          {/* Language Information */}
          <Card className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <h3 className="text-3xl font-playful text-primary mb-6 text-center">
              🌍 About Bengali Language
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-playful border-2 border-fun-blue/20 p-6">
                <h4 className="text-xl font-playful text-primary mb-4 flex items-center gap-2">
                  <Headphones className="w-6 h-6" />
                  Beautiful Language
                </h4>
                <p className="text-lg text-muted-foreground font-comic">
                  Bengali is a rich language spoken by millions in Bangladesh and India, 
                  known for its beautiful poetry and literature.
                </p>
              </div>
              <div className="card-playful border-2 border-fun-purple/20 p-6">
                <h4 className="text-xl font-playful text-primary mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Learning Benefits
                </h4>
                <p className="text-lg text-muted-foreground font-comic">
                  Practice helps improve pronunciation, listening skills, and cultural understanding.
                </p>
              </div>
            </div>
          </Card>

          {/* Close Button */}
          <div className="text-center">
            <Button 
              onClick={() => onOpenChange(false)}
              className="btn-fun font-comic text-2xl py-6 px-12 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-4 border-pink-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
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
