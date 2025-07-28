import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, Calendar, Ruler, Sparkles, User, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ChildForm {
  name: string;
  gender: "boy" | "girl" | "other";
  dateOfBirth: string;
  height: number;
  weight: number;
}

const AddChild = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ChildForm>({
    name: "",
    gender: "boy",
    dateOfBirth: "",
    height: 0,
    weight: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    // Get parent info to get parentId
    fetch('http://localhost:8080/auth/me', { credentials: 'include' })
      .then(res => res.text())
      .then(email => {
        return fetch(`http://localhost:8082/api/parents/by-email/${email}`, {
          credentials: 'include'
        });
      })
      .then(res => res.json())
      .then(parent => {
        setParentId(parent.id);
      })
      .catch(err => {
        console.error('Failed to get parent info:', err);
        toast.error("Failed to load parent information");
      });
  }, []);

  const handleInputChange = (field: keyof ChildForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dateOfBirth || !formData.height || !formData.weight) {
      toast.error("Please fill in all fields to create your child's profile! 😊");
      return;
    }

    if (!parentId) {
      toast.error("Parent information not loaded. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8082/api/parents/${parentId}/children`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create child profile');
      }

      toast.success(`${formData.name}'s profile created! Welcome to our learning family! 🎉`);
      navigate("/children");
    } catch (error) {
      toast.error("Failed to create child profile. Please try again.");
      console.error('Error creating child:', error);
    } finally {
      setIsLoading(false);
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

  const getGenderEmoji = (gender: string) => {
    switch (gender) {
      case "boy": return "👦";
      case "girl": return "👧";
      default: return "🧒";
    }
  };

  return (
    <div className="min-h-screen bg-soft font-nunito">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Floating decorative elements */}
      <div className="fixed top-20 left-8 text-6xl bounce-gentle z-10">🌟</div>
      <div className="fixed top-32 right-12 text-5xl float z-10">🎈</div>
      <div className="fixed bottom-20 left-12 text-4xl wiggle z-10">🎨</div>
      <div className="fixed bottom-8 right-8 text-5xl bounce-gentle z-10">🧸</div>

      <div className="max-w-lg mx-auto pt-8 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-comic font-bold text-primary mb-3 bounce-gentle">
            Add a New Little Star! ⭐
          </h1>
          <p className="text-base text-muted-foreground font-nunito">
            Let's create a special profile for your amazing child!
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="card-playful shadow-xl border-2 border-fun-green hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center bg-gradient-to-r from-fun-green to-fun-blue rounded-t-2xl p-4">
            <CardTitle className="text-xl font-comic font-bold text-white flex items-center justify-center gap-2">
              <Baby className="w-5 h-5 bounce-gentle" />
              Child's Profile
              <Baby className="w-5 h-5 bounce-gentle" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Child's Name */}
              <div className="space-y-2 group">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <User className="w-4 h-4 text-fun-purple group-hover:scale-110 transition-transform" />
                  Child's Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="What's their wonderful name? ✨"
                  className="text-sm py-3 rounded-lg border-2 border-fun-purple focus:border-primary transition-all duration-300 hover:shadow-md"
                  required
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-2 group">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Sparkles className="w-4 h-4 text-fun-pink group-hover:scale-110 transition-transform" />
                  Gender
                </Label>
                <Select onValueChange={(value) => handleInputChange("gender", value as "boy" | "girl" | "other")}>
                  <SelectTrigger className="text-sm py-3 rounded-lg border-2 border-fun-pink focus:border-primary hover:shadow-md">
                    <SelectValue placeholder="Choose gender">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{getGenderEmoji(formData.gender)}</span>
                        {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : "Choose gender"}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy" className="text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">👦</span>
                        Boy
                      </span>
                    </SelectItem>
                    <SelectItem value="girl" className="text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">👧</span>
                        Girl
                      </span>
                    </SelectItem>
                    <SelectItem value="other" className="text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">🧒</span>
                        Other
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2 group">
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Calendar className="w-4 h-4 text-fun-blue group-hover:scale-110 transition-transform" />
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="text-sm py-3 rounded-lg border-2 border-fun-blue focus:border-primary transition-all duration-300 hover:shadow-md"
                  required
                />
              </div>

              {/* Height */}
              <div className="space-y-2 group">
                <Label htmlFor="height" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Ruler className="w-4 h-4 text-fun-green group-hover:scale-110 transition-transform" />
                  Height (cm) *
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="50"
                  max="200"
                  value={formData.height || ""}
                  onChange={(e) => handleInputChange("height", parseInt(e.target.value) || 0)}
                  placeholder="How tall are they? 📏"
                  className="text-sm py-3 rounded-lg border-2 border-fun-green focus:border-primary transition-all duration-300 hover:shadow-md"
                  required
                />
              </div>

              {/* Weight */}
              <div className="space-y-2 group">
                <Label htmlFor="weight" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Weight className="w-4 h-4 text-fun-orange group-hover:scale-110 transition-transform" />
                  Weight (kg) *
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="5"
                  max="100"
                  step="0.1"
                  value={formData.weight || ""}
                  onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                  placeholder="What's their weight? ⚖️"
                  className="text-sm py-3 rounded-lg border-2 border-fun-orange focus:border-primary transition-all duration-300 hover:shadow-md"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-fun bg-gradient-to-r from-fun-green to-fun-blue hover:from-fun-green/90 hover:to-fun-blue/90 text-white text-base py-3 mt-4 font-comic font-bold hover:scale-105 transition-all duration-300"
              >
                {isLoading ? "Creating Profile..." : "Create Profile & Start Playing! 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-4">
          <Button
            onClick={() => navigate("/children")}
            className="btn-fun bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic text-sm px-4 py-2"
          >
            ← Back to Children Profiles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddChild; 