import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PlayCircle, Camera, Trophy, Clock } from 'lucide-react';

interface InstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-center bg-gradient-rainbow bg-clip-text text-transparent font-playful">
            🎮 How to Play Face Mimic Fun! 🎭
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          
          {/* Game Overview */}
          <Card className="game-card">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <PlayCircle className="w-8 h-8" />
              What's This Game About?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Face Mimic Fun helps you practice making different facial expressions! 
              You'll see a picture showing how to make a face, and then you copy it. 
              It's like playing copycat with your face! 😄
            </p>
          </Card>

          {/* How to Play Steps */}
          <div className="grid md:grid-cols-2 gap-4">
            
            <Card className="game-card">
              <div className="text-center">
                <div className="text-4xl mb-4">1️⃣</div>
                <h3 className="text-xl font-bold text-primary mb-2">Look at the Picture</h3>
                <p className="text-muted-foreground">
                  We'll show you a colorful picture of how to make a face expression
                </p>
              </div>
            </Card>

            <Card className="game-card">
              <div className="text-center">
                <div className="text-4xl mb-4">2️⃣</div>
                <h3 className="text-xl font-bold text-primary mb-2">Copy the Face</h3>
                <p className="text-muted-foreground">
                  Look in the camera and make the same face as the picture!
                </p>
              </div>
            </Card>

            <Card className="game-card">
              <div className="text-center">
                <div className="text-4xl mb-4">3️⃣</div>
                <h3 className="text-xl font-bold text-primary mb-2">Get Points!</h3>
                <p className="text-muted-foreground">
                  When you make the right face, you get a point and hear a happy sound!
                </p>
              </div>
            </Card>

            <Card className="game-card">
              <div className="text-center">
                <div className="text-4xl mb-4">4️⃣</div>
                <h3 className="text-xl font-bold text-primary mb-2">Play 5 Rounds</h3>
                <p className="text-muted-foreground">
                  Try to copy 5 different faces. You have 15 seconds for each one!
                </p>
              </div>
            </Card>

          </div>

          {/* Game Rules */}
          <Card className="game-card">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Game Rules
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-secondary mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Limit
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Each round lasts 15 seconds</li>
                  <li>• If you don't make the face in time, that's okay!</li>
                  <li>• The game will move to the next face automatically</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary mb-2 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Tips
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Make sure your whole face is visible</li>
                  <li>• Sit in a bright place</li>
                  <li>• Look directly at the camera</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Facial Expressions Preview */}
          <Card className="game-card">
            <h2 className="text-2xl font-bold text-primary mb-4 text-center">
              🎭 Faces You'll Practice
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {[
                { emoji: '😮', name: 'Open Mouth' },
                { emoji: '😁', name: 'Show Teeth' },
                { emoji: '😘', name: 'Kiss Face' },
                { emoji: '👈', name: 'Look Left' },
                { emoji: '👉', name: 'Look Right' },
              ].map((face, index) => (
                <div key={index} className="text-center animate-bounce-gentle" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-4xl mb-2">{face.emoji}</div>
                  <div className="text-sm font-medium text-muted-foreground">{face.name}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ready to Play */}
          <div className="text-center">
            <Button
              onClick={() => onOpenChange(false)}
              className="fun-button"
            >
              🎮 I'm Ready to Play! 🎮
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionsModal;