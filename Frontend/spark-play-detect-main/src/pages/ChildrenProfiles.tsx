import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Crown, Heart, Plus, Rocket, Sparkles, Star, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Child {
  id: number;
  name: string;
  gender: "boy" | "girl" | "other";
  dateOfBirth: string;
  height: number;
  weight: number;
}

const ChildrenProfiles = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentId, setParentId] = useState<number | null>(null);
  const [parentExists, setParentExists] = useState(false);

  useEffect(() => {
    // First get parent info to get parentId
    fetch('http://localhost:8080/auth/me', { credentials: 'include' })
      .then(res => res.text())
      .then(email => {
        return fetch(`http://localhost:8082/api/parents/by-email/${email}`, {
          credentials: 'include'
        });
      })
      .then(res => {
        if (res.ok) {
          setParentExists(true);
          return res.json();
        } else {
          setParentExists(false);
          throw new Error('Parent not found');
        }
      })
      .then(parent => {
        setParentId(parent.id);
        return fetch(`http://localhost:8082/api/parents/${parent.id}/children`, {
          credentials: 'include'
        });
      })
      .then(res => res.json())
      .then(childrenData => {
        setChildren(childrenData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load children:', err);
        if (parentExists) {
          toast.error("Failed to load children profiles");
        }
        setIsLoading(false);
      });
  }, [parentExists]);

  const getChildAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
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

  const getRandomAnimation = (index: number) => {
    const animations = ["bounce-gentle", "float", "wiggle", "pulse-fun"];
    return animations[index % animations.length];
  };

  const getRandomIcon = (index: number) => {
    const icons = [Star, Heart, Zap, Crown, Sparkles];
    return icons[index % icons.length];
  };

  const handleChildSelect = (child: Child) => {
    console.log('Child selected:', child.name);
    // Store child ID for database operations
    localStorage.setItem("selectedChildId", child.id.toString());
    localStorage.setItem("selectedChild", JSON.stringify(child));
    console.log('Navigating to dashboard...');
    navigate("/dashboard");
  };

  const handleDeleteChild = async (childId: number, childName: string) => {
    if (!confirm(`Are you sure you want to delete ${childName}'s profile?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${childId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete child profile');
      }

      setChildren(prev => prev.filter(child => child.id !== childId));
      toast.success(`${childName}'s profile has been removed`);
    } catch (error) {
      toast.error("Failed to delete child profile");
      console.error('Error deleting child:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      window.location.href = '/auth'; // Full reload ensures session check and clears state
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleParentInfoClick = () => {
    if (parentExists) {
      navigate("/view-parent-info");
    } else {
      navigate("/parent-info");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-2xl font-comic">Loading children profiles... 🌟</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft font-nunito">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Floating decorative elements */}
      <div className="fixed top-20 left-8 text-4xl bounce-gentle z-10">🎪</div>
      <div className="fixed top-32 right-12 text-3xl float z-10">🎨</div>
      <div className="fixed bottom-16 left-16 text-2xl wiggle z-10">🧸</div>
      <div className="fixed bottom-8 right-8 text-3xl bounce-gentle z-10">🎮</div>

      <div className="max-w-6xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-comic font-bold text-primary mb-4 bounce-gentle">
            Choose Your Little Star! ⭐
          </h1>
          <p className="text-xl text-muted-foreground font-nunito">
            Click on a child's card to enter their magical learning world!
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={handleParentInfoClick}
            className="btn-fun bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic font-bold"
          >
            {parentExists ? "View Parent Info 👨‍👩‍👧‍👦" : "Back to Parent Info 👨‍👩‍👧‍👦"}
          </Button>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {children.map((child, index) => {
            const IconComponent = getRandomIcon(index);
            return (
              <Card
                key={child.id}
                className={`card-playful cursor-pointer border-2 border-${getRandomColor(index)} hover:scale-105 hover:shadow-xl transition-all duration-300 relative group overflow-hidden`}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${getRandomColor(index)}/10 to-${getRandomColor(index)}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Delete Button - Above everything */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChild(child.id, child.name);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>

                {/* Floating Icon - Above everything */}
                <div className={`absolute top-2 left-2 text-${getRandomColor(index)} opacity-60 ${getRandomAnimation(index)} z-20`}>
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Click overlay - Below buttons but above content */}
                <div 
                  className="absolute inset-0 cursor-pointer z-10 hover:bg-primary/5 transition-colors duration-200"
                  onClick={() => handleChildSelect(child)}
                />
                
                <CardContent className="p-6 text-center relative z-0">
                  {/* Child Avatar */}
                  <div className={`text-5xl mb-3 ${getRandomAnimation(index)}`}>
                    {getGenderEmoji(child.gender)}
                  </div>
                  
                  {/* Child Info */}
                  <h3 className="text-xl font-comic font-bold text-primary mb-2 group-hover:text-primary-dark transition-colors">
                    {child.name}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Baby className="w-3 h-3" />
                      <span>{getChildAge(child.dateOfBirth)} years</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1">
                      <Rocket className="w-3 h-3" />
                      <span>{child.height}cm tall</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{child.weight}kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add New Child Card */}
          <Card
            className="card-playful cursor-pointer border-2 border-dashed border-fun-green hover:border-solid hover:scale-105 hover:shadow-xl transition-all duration-300 group overflow-hidden"
            onClick={() => navigate("/add-child")}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-fun-green/10 to-fun-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <CardContent className="p-6 text-center relative z-10">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-16 h-16 mx-auto text-fun-green" />
              </div>
              
              <h3 className="text-xl font-comic font-bold text-fun-green mb-2 group-hover:text-fun-green-dark transition-colors">
                Add New Child
              </h3>
              
              <p className="text-sm text-muted-foreground">
                Create a new profile for another amazing child! ✨
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChildrenProfiles; 