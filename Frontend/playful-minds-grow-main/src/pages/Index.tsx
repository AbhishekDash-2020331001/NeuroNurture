import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Star, Rocket } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-soft font-nunito">
      {/* Floating decorative elements */}
      <div className="fixed top-10 left-10 text-6xl bounce-gentle">🌈</div>
      <div className="fixed top-20 right-16 text-5xl float">🎪</div>
      <div className="fixed bottom-20 left-20 text-4xl wiggle">🎨</div>
      <div className="fixed bottom-10 right-10 text-5xl bounce-gentle">🧸</div>
      <div className="fixed top-1/2 left-8 text-4xl float">⭐</div>
      <div className="fixed top-1/3 right-8 text-4xl bounce-gentle">🎈</div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* Main Title */}
          <h1 className="text-7xl md:text-8xl font-comic font-bold text-primary mb-6 bounce-gentle">
            Fun Learning Zone! 🚀
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-muted-foreground font-nunito mb-8">
            Where Amazing Children Grow Through Play & Learning! ✨
          </p>
          
          {/* Description */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="card-playful border-4 border-fun-blue bg-fun-yellow/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Heart className="w-8 h-8 text-fun-pink bounce-gentle" />
                  <Sparkles className="w-8 h-8 text-fun-purple float" />
                  <Star className="w-8 h-8 text-fun-orange wiggle" />
                </div>
                <p className="text-xl md:text-2xl text-foreground font-nunito leading-relaxed">
                  Welcome to a magical world designed especially for autistic children! 
                  Here, learning becomes an adventure filled with colors, games, and endless possibilities. 
                  Every child is unique, and every journey is special! 🌟
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="card-playful border-4 border-fun-pink">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4 bounce-gentle">🎮</div>
              <h3 className="text-2xl font-comic font-bold text-primary mb-3">Interactive Games</h3>
              <p className="text-lg text-muted-foreground">Fun and engaging games designed to boost cognitive development!</p>
            </CardContent>
          </Card>

          <Card className="card-playful border-4 border-fun-green">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4 float">🧩</div>
              <h3 className="text-2xl font-comic font-bold text-primary mb-3">Skill Building</h3>
              <p className="text-lg text-muted-foreground">Activities that help develop important life and learning skills!</p>
            </CardContent>
          </Card>

          <Card className="card-playful border-4 border-fun-purple">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4 wiggle">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-comic font-bold text-primary mb-3">Family Progress</h3>
              <p className="text-lg text-muted-foreground">Track your child's amazing growth and celebrate achievements!</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="card-playful border-4 border-primary bg-rainbow p-2 inline-block mb-8">
            <CardContent className="bg-card rounded-2xl p-8">
              <h2 className="text-4xl font-comic font-bold text-primary mb-6 flex items-center justify-center gap-3">
                <Rocket className="w-10 h-10 bounce-gentle" />
                Ready to Start the Adventure?
                <Rocket className="w-10 h-10 bounce-gentle" />
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 font-nunito">
                Let's create profiles for your wonderful children and begin this amazing learning journey together!
              </p>
              
              <Button
                onClick={() => navigate("/parent-info")}
                className="btn-fun bg-primary hover:bg-primary/90 text-primary-foreground text-2xl py-8 px-12 font-comic font-bold"
              >
                Let's Begin! 🌟
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
