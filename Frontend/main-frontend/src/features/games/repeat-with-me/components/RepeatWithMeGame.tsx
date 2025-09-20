import React, { useState } from 'react';
import ConsentScreen from './ConsentScreen';

interface ConsentData {
  childName: string;
  childAge: string;
  suspectedASD: boolean;
  dataConsent: boolean;
  consentType: 'yes' | 'no' | null;
}

type GameScreen = 'instructions' | 'consent';

const RepeatWithMeGame: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('instructions');
  const [consentData, setConsentData] = useState<ConsentData | null>(null);

  const handleConsentSubmit = (data: ConsentData) => {
    setConsentData(data);
    // Redirect to gameplay page
    window.location.href = '/games/repeat-with-me/gameplay';
  };

  const handleConsentBack = () => {
    setCurrentScreen('instructions');
  };

  // Consent Screen - Early return like Mirror Posture game
  if (currentScreen === 'consent') {
    return (
      <ConsentScreen
        onConsentSubmit={handleConsentSubmit}
        onBack={handleConsentBack}
      />
    );
  }

  // Instructions Screen - Full page like Mirror Posture game
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">🎤</div>
            <h1 className="text-5xl font-playful bg-gradient-to-r from-pink-600 via-red-500 to-orange-600 bg-clip-text text-transparent mb-4">
              Repeat with Me!
            </h1>
            <p className="text-2xl font-comic text-muted-foreground">
              Learn to repeat Bengali sentences and have fun! ✨
            </p>
          </div>

          {/* Game Overview */}
          <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
            <h2 className="text-4xl font-playful text-primary mb-6 text-center">
              🎯 What's This Game About?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-comic text-center">
              Repeat with Me helps you practice speaking Bengali! 
              You'll hear a sentence in Bengali, and then you repeat it back into your microphone. 
              It's like playing copycat with your voice! 🗣️
            </p>
          </div>

          {/* How to Play Steps */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card-playful border-2 border-fun-purple/20 p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-4 animate-bounce">1️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-3">Listen Carefully</h4>
              <p className="text-lg text-muted-foreground font-comic">
                We'll play a Bengali sentence for you to hear clearly
              </p>
            </div>

            <div className="card-playful border-2 border-fun-orange/20 p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-4 animate-bounce">2️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-3">Repeat the Sentence</h4>
              <p className="text-lg text-muted-foreground font-comic">
                Speak the same sentence back into your microphone
              </p>
            </div>

            <div className="card-playful border-2 border-fun-green/20 p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-4 animate-bounce">3️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-3">Get Your Score</h4>
              <p className="text-lg text-muted-foreground font-comic">
                When you repeat well, you get a high score and hear a happy sound!
              </p>
            </div>

            <div className="card-playful border-2 border-fun-yellow/20 p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-4 animate-bounce">4️⃣</div>
              <h4 className="text-2xl font-playful text-primary mb-3">Play 12 Rounds</h4>
                              <p className="text-lg text-muted-foreground font-comic">
                  Try to repeat 12 different sentences. You have 10 seconds to record each one!
                </p>
            </div>
          </div>

          {/* Game Rules */}
          <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
            <h3 className="text-3xl font-playful text-primary mb-6 text-center">
              🎮 Game Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-playful border-2 border-fun-orange/20 p-6">
                <h4 className="text-xl font-playful text-primary mb-4 text-center">⏱️ Time Limit</h4>
                <p className="text-lg text-muted-foreground font-comic text-center">
                  You have 10 seconds to record each sentence. Don't worry, that's plenty of time!
                </p>
              </div>
              <div className="card-playful border-2 border-fun-purple/20 p-6">
                <h4 className="text-xl font-playful text-primary mb-4 text-center">🎤 Microphone Access</h4>
                <p className="text-lg text-muted-foreground font-comic text-center">
                  Make sure to allow microphone access so the game can hear your voice!
                </p>
              </div>
            </div>
          </div>

          {/* Available Sentences */}
          <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
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
          </div>

          {/* Language Information */}
          <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
            <h3 className="text-3xl font-playful text-primary mb-6 text-center">
              🌍 About Bengali Language
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-playful border-2 border-fun-blue/20 p-6">
                <div className="text-xl font-playful text-primary mb-4 text-center">🎧 Beautiful Language</div>
                <p className="text-lg text-muted-foreground font-comic text-center">
                  Bengali is a rich language spoken by millions in Bangladesh and India, 
                  known for its beautiful poetry and literature.
                </p>
              </div>
              <div className="card-playful border-2 border-fun-purple/20 p-6">
                <div className="text-xl font-playful text-primary mb-4 text-center">🏆 Learning Benefits</div>
                <p className="text-lg text-muted-foreground font-comic text-center">
                  Practice helps improve pronunciation, listening skills, and cultural understanding.
                </p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setCurrentScreen('consent');
              }}
              className="btn-fun font-comic text-2xl py-4 px-8 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-4 border-pink-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
            >
              🚀 Start the Magic! 🚀
            </button>
            <p className="text-sm text-muted-foreground mt-2 font-comic">
              Microphone will be activated when you start the game 🎤
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepeatWithMeGame;
