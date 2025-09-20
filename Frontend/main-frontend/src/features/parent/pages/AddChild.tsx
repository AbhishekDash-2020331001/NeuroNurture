import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clearCurrentChild } from "@/shared/utils/childUtils";
import { performLogout } from "@/shared/utils/logoutUtils";
import { Calendar, Ruler, Sparkles, User, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ChildForm {
  name: string;
  gender: "male" | "female";
  dateOfBirth: string;
  height: number;
  weight: number;
}

const AddChild = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ChildForm>({
    name: "",
    gender: "male",
    dateOfBirth: "",
    height: 0,
    weight: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    // Clear any previously selected child since we're adding a new one
    clearCurrentChild();
    
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
      toast.error("Please fill in all fields to create your child's profile!");
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

      toast.success(`${formData.name}'s profile created! Welcome to our learning family!`);
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
      await performLogout();
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Logout failed. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-soft font-nunito">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Back Button - Top Left */}
      <div className="absolute top-24 left-4 z-20">
        <Button
          onClick={() => navigate("/children")}
          className="btn-fun bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic text-sm px-4 py-2"
        >
          ← Back
        </Button>
      </div>

      <div className="max-w-lg mx-auto pt-8 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-comic font-bold text-primary mb-3 bounce-gentle">
            Add a New Little Star!
          </h1>
          {/* <p className="text-base text-muted-foreground font-nunito">
            Let's create a special profile for your amazing child!
          </p> */}
        </div>

        {/* Main Form Card */}
        <Card className="card-playful shadow-xl border-2 border-fun-green hover:scale-[1.005] transition-all duration-700 ease-in-out transform-gpu will-change-transform">

          
          <CardContent className="p-1 space-y-4">
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
                  placeholder="Enter child's name"
                  className="text-sm py-3 rounded-lg border-2 border-fun-purple focus:border-primary transition-all duration-500 ease-in-out hover:shadow-md transform-gpu"
                  required
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-2 group">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Sparkles className="w-4 h-4 text-fun-pink group-hover:scale-110 transition-transform" />
                  Gender
                </Label>
                <Select onValueChange={(value) => handleInputChange("gender", value as "male" | "female")}>
                  <SelectTrigger className="text-sm py-3 rounded-lg border-2 border-fun-pink focus:border-primary transition-all duration-500 ease-in-out hover:shadow-md transform-gpu">
                    <SelectValue placeholder="Select gender">
                      {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : "Select gender"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" className="text-sm">
                      Male
                    </SelectItem>
                    <SelectItem value="female" className="text-sm">
                      Female
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
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="text-sm py-3 pl-4 pr-12 rounded-lg border-2 border-fun-blue focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-500 ease-in-out hover:shadow-md transform-gpu bg-white font-medium text-gray-700"
                    min="2010-01-01"
                    max="2024-12-31"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Select your child's date of birth</p>
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
                  min="30"
                  max="200"
                  value={formData.height || ""}
                  onChange={(e) => handleInputChange("height", parseInt(e.target.value) || 0)}
                  placeholder="Enter height in cm"
                  className="text-sm py-3 rounded-lg border-2 border-fun-green focus:border-primary transition-all duration-500 ease-in-out hover:shadow-md transform-gpu"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Height range: 30cm - 200cm</p>
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
                  placeholder="Enter weight in kg"
                  className="text-sm py-3 rounded-lg border-2 border-fun-orange focus:border-primary transition-all duration-500 ease-in-out hover:shadow-md transform-gpu"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-fun bg-gradient-to-r from-fun-green to-fun-blue hover:from-fun-green/90 hover:to-fun-blue/90 text-white text-base py-3 mt-4 font-comic font-bold hover:scale-[1.02] transition-all duration-500 ease-in-out transform-gpu will-change-transform"
              >
                {isLoading ? "Creating Profile..." : "Create Profile & Start Playing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddChild; 