import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Baby, Sparkles, Crown, Rocket } from "lucide-react";

interface Child {
  id: string;
  name: string;
  gender: "boy" | "girl" | "other";
  dateOfBirth: string;
  height: number;
  weight: number;
}

const ChildrenProfiles = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    // Load children from localStorage
    const savedChildren = localStorage.getItem("children");
    if (savedChildren) {
      setChildren(JSON.parse(savedChildren));
    }
  }, []);

  const getChildAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  const getGenderEmoji = (gender: string) => {
    switch (gender) {
      case "boy": return "👦";
      case "girl": return "👧";
      default: return "🧒";
    }
  };

  const getRandomColor = (index: number) => {
    const colors = ["fun-pink", "fun-blue", "fun-green", "fun-orange", "fun-purple", "fun-yellow"];
    return colors[index % colors.length];
  };

  const handleChildSelect = (child: Child) => {
    localStorage.setItem("selectedChild", JSON.stringify(child));
    // Navigate to child's game area (placeholder for now)
    navigate(`/games/${child.id}`);
  };

  return (
    <div className="min-h-screen bg-soft p-4 font-nunito">
      {/* Floating decorative elements */}
      <div className="fixed top-8 left-8 text-6xl bounce-gentle">🎪</div>
      <div className="fixed top-16 right-12 text-5xl float">🎨</div>
      <div className="fixed bottom-16 left-16 text-4xl wiggle">🧸</div>
      <div className="fixed bottom-8 right-8 text-5xl bounce-gentle">🎮</div>

      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-comic font-bold text-primary mb-4 bounce-gentle">
            Choose Your Little Star! ⭐
          </h1>
          <p className="text-2xl text-muted-foreground font-nunito">
            Click on a child's card to enter their magical learning world!
          </p>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {children.map((child, index) => (
            <Card
              key={child.id}
              className={`card-playful cursor-pointer border-4 border-${getRandomColor(index)} hover:scale-105 transition-all duration-300`}
              onClick={() => handleChildSelect(child)}
            >
              <CardContent className="p-8 text-center">
                {/* Child Avatar */}
                <div className="text-8xl mb-4 bounce-gentle">
                  {getGenderEmoji(child.gender)}
                </div>
                
                {/* Crown for decoration */}
                <div className="flex justify-center mb-4">
                  <Crown className={`w-12 h-12 text-${getRandomColor(index)} wiggle`} />
                </div>

                {/* Child Info */}
                <h3 className="text-3xl font-comic font-bold text-primary mb-2">
                  {child.name}
                </h3>
                
                <div className="space-y-2 text-lg text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Baby className="w-5 h-5" />
                    <span>{getChildAge(child.dateOfBirth)} years old</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>{child.height}cm tall</span>
                  </div>
                </div>

                {/* Fun Action Text */}
                <div className="mt-6 p-4 bg-fun-yellow rounded-2xl">
                  <div className="flex items-center justify-center gap-2 text-lg font-bold text-foreground">
                    <Rocket className="w-6 h-6 bounce-gentle" />
                    Let's Play & Learn!
                    <Rocket className="w-6 h-6 bounce-gentle" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Child Card */}
          <Card
            className="card-playful cursor-pointer border-4 border-dashed border-primary hover:scale-105 transition-all duration-300 bg-primary/5"
            onClick={() => navigate("/add-child")}
          >
            <CardContent className="p-8 text-center h-full flex flex-col justify-center">
              <div className="text-8xl mb-6 bounce-gentle">➕</div>
              
              <h3 className="text-3xl font-comic font-bold text-primary mb-4">
                Add New Child
              </h3>
              
              <p className="text-lg text-muted-foreground mb-6">
                Create a profile for another wonderful child!
              </p>

              <Button className="btn-fun bg-primary hover:bg-primary/90 text-primary-foreground font-comic font-bold">
                <Plus className="w-6 h-6 mr-2" />
                Add Child Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate("/parent-info")}
            className="btn-fun bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic font-bold"
          >
            ← Back to Parent Info
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChildrenProfiles;