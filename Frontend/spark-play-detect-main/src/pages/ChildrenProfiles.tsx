import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    console.log('Child ID:', child.id);
    
    try {
      // Store child ID for database operations
      localStorage.setItem("selectedChildId", child.id.toString());
      localStorage.setItem("selectedChild", JSON.stringify(child));
      
      // Verify the data was stored correctly
      const storedChildId = localStorage.getItem("selectedChildId");
      const storedChild = localStorage.getItem("selectedChild");
      console.log('Stored child ID:', storedChildId);
      console.log('Stored child data:', storedChild);
      
      console.log('Navigating to dashboard...');
      
      // Add a small delay to ensure localStorage is set
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      console.error('Error selecting child:', error);
      toast.error("Failed to select child. Please try again.");
    }
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
    <div className="min-h-screen bg-soft font-nunito relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating bubbles */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-300 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-green-300 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-purple-300 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-orange-300 rounded-full animate-pulse opacity-50"></div>
        
        {/* Floating stars */}
        <div className="absolute top-16 left-1/3 text-yellow-400 animate-pulse">⭐</div>
        <div className="absolute top-48 right-1/4 text-pink-400 animate-bounce">✨</div>
        <div className="absolute bottom-40 left-1/5 text-blue-400 animate-pulse">🌟</div>
        <div className="absolute bottom-24 right-1/5 text-green-400 animate-bounce">💫</div>
        
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 animate-pulse"></div>
      </div>

      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Enhanced floating decorative elements */}
      <div className="fixed top-20 left-8 text-4xl bounce-gentle z-10 animate-pulse">🎪</div>
      <div className="fixed top-32 right-12 text-3xl float z-10 animate-bounce">🎨</div>
      <div className="fixed bottom-16 left-16 text-2xl wiggle z-10 animate-pulse">🧸</div>
      <div className="fixed bottom-8 right-8 text-3xl bounce-gentle z-10 animate-bounce">🎮</div>
      
      {/* Additional floating elements */}
      <div className="fixed top-1/4 left-1/6 text-2xl animate-spin z-10">🎯</div>
      <div className="fixed top-3/4 right-1/6 text-2xl animate-pulse z-10">🎪</div>
      <div className="fixed bottom-1/3 left-1/2 text-2xl animate-bounce z-10">🎭</div>

      <div className="max-w-6xl mx-auto pt-8 px-4 relative z-20">
        {/* Enhanced Header with animations */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-comic font-bold text-primary mb-4 bounce-gentle hover:scale-105 transition-transform duration-300">
            Choose Your Little Star! ⭐
          </h1>
          <p className="text-xl text-muted-foreground font-nunito hover:text-primary transition-colors duration-300">
            Click on a child's card to enter their magical learning world!
          </p>
          
          {/* Animated underline */}
          <div className="w-32 h-1 bg-gradient-to-r from-fun-blue to-fun-purple mx-auto mt-4 rounded-full hover:scale-x-150 transition-transform duration-300"></div>
        </div>

        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={handleParentInfoClick}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic font-bold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary/30 transform"
          >
            {parentExists ? "View Parent Info 👨‍👩‍👧‍👦" : "Back to Parent Info 👨‍👩‍👧‍👦"}
          </Button>
        </div>

        {/* Children Grid with enhanced animations */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {children.map((child, index) => {
            const IconComponent = getRandomIcon(index);
            const animationClass = getRandomAnimation(index);
            
            return (
              <Card
                key={child.id}
                className="bg-white rounded-xl p-3 cursor-pointer border-2 border-fun-blue shadow-gentle w-56 h-56 flex-shrink-0 transform-gpu transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-fun-blue/30 group relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleChildSelect(child)}
              >
                {/* Enhanced glowing border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-fun-blue/20 via-fun-purple/20 to-fun-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm animate-pulse"></div>
                
                {/* Multiple sparkle effects */}
                <div className="absolute top-1 right-1 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse">✨</div>
                <div className="absolute bottom-1 left-1 text-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce">🌟</div>
                <div className="absolute top-1 left-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-700 animate-spin">💫</div>
                <div className="absolute bottom-1 right-1 text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-400 animate-ping">🎈</div>
                
                {/* Enhanced floating particles */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-500 delay-100"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-400 delay-200"></div>
                
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-fun-blue/10 to-fun-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChild(child.id, child.name);
                  }}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>

                {/* Floating Icon */}
                <div className={`absolute top-1 left-1 opacity-60 text-fun-blue ${animationClass}`}>
                  <IconComponent className="w-2.5 h-2.5" />
                </div>
                
                <div className="p-2 text-center relative h-full flex flex-col justify-center">
                  {/* Child Avatar */}
                  <div className={`text-4xl mb-2 ${animationClass} group-hover:scale-125 transition-transform duration-300 group-hover:rotate-12`}>
                    {getGenderEmoji(child.gender)}
                  </div>
                  
                  {/* Child Info */}
                  <h3 className="text-lg font-comic font-bold text-primary mb-2 group-hover:text-primary-dark transition-colors group-hover:scale-105">
                    {child.name}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Baby className="w-3 h-3" />
                      <span>{getChildAge(child.dateOfBirth)} years</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1">
                      <Rocket className="w-3 h-3" />
                      <span>{child.height}cm</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{child.weight}kg</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Enhanced Add New Child Card */}
          <Card
            className="bg-white rounded-xl p-3 cursor-pointer border-2 border-dashed border-fun-green shadow-gentle w-56 h-56 flex-shrink-0 transform-gpu transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-fun-green/30 group relative overflow-hidden animate-fade-in"
            style={{ animationDelay: `${children.length * 100}ms` }}
            onClick={() => navigate("/add-child")}
          >
            {/* Enhanced glowing border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-fun-green/20 via-fun-blue/20 to-fun-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm animate-pulse"></div>
            
            {/* Multiple sparkle effects */}
            <div className="absolute top-1 right-1 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse">✨</div>
            <div className="absolute bottom-1 left-1 text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce">🎉</div>
            <div className="absolute top-1 left-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-700 animate-spin">💫</div>
            <div className="absolute bottom-1 right-1 text-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-400 animate-ping">🎊</div>
            
            {/* Enhanced floating particles */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-500 delay-100"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-400 delay-200"></div>
            
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-fun-green/10 to-fun-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            
            <div className="p-2 text-center relative h-full flex flex-col justify-center">
              <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300 group-hover:rotate-12">
                <Plus className="w-12 h-12 mx-auto text-fun-green" />
              </div>
              
              <h3 className="text-lg font-comic font-bold text-fun-green mb-2 group-hover:text-fun-green-dark transition-colors group-hover:scale-105">
                Add New Child
              </h3>
              
              <p className="text-sm text-muted-foreground font-medium">
                Create new profile! ✨
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChildrenProfiles; 