import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Baby, Calendar, Ruler, Weight, User, Sparkles } from "lucide-react";

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

  const handleInputChange = (field: keyof ChildForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dateOfBirth || !formData.height || !formData.weight) {
      toast.error("Please fill in all fields to create your child's profile! 😊");
      return;
    }

    // Create new child object
    const newChild = {
      id: Date.now().toString(),
      ...formData,
    };

    // Save to localStorage
    const existingChildren = JSON.parse(localStorage.getItem("children") || "[]");
    const updatedChildren = [...existingChildren, newChild];
    localStorage.setItem("children", JSON.stringify(updatedChildren));

    toast.success(`${formData.name}'s profile created! Welcome to our learning family! 🎉`);
    navigate("/children");
  };

  const getGenderEmoji = (gender: string) => {
    switch (gender) {
      case "boy": return "👦";
      case "girl": return "👧";
      default: return "🧒";
    }
  };

  return (
    <div className="min-h-screen bg-soft p-4 font-nunito">
      {/* Floating decorative elements */}
      <div className="fixed top-8 left-8 text-6xl bounce-gentle">🌟</div>
      <div className="fixed top-20 right-12 text-5xl float">🎈</div>
      <div className="fixed bottom-20 left-12 text-4xl wiggle">🎨</div>
      <div className="fixed bottom-8 right-8 text-5xl bounce-gentle">🧸</div>

      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-comic font-bold text-primary mb-4 bounce-gentle">
            Add a New Little Star! ⭐
          </h1>
          <p className="text-xl text-muted-foreground font-nunito">
            Let's create a special profile for your amazing child!
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="card-playful shadow-2xl border-4 border-fun-green">
          <CardHeader className="text-center bg-rainbow rounded-t-3xl">
            <CardTitle className="text-3xl font-comic font-bold text-white flex items-center justify-center gap-3">
              <Baby className="w-8 h-8 bounce-gentle" />
              Child's Profile
              <Baby className="w-8 h-8 bounce-gentle" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Child's Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-fun-purple" />
                  Child's Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="What's their wonderful name? ✨"
                  className="text-lg py-4 rounded-xl border-2 border-fun-purple focus:border-primary transition-all duration-300"
                  required
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fun-pink" />
                  Gender
                </Label>
                <Select onValueChange={(value) => handleInputChange("gender", value as "boy" | "girl" | "other")}>
                  <SelectTrigger className="text-lg py-4 rounded-xl border-2 border-fun-pink focus:border-primary">
                    <SelectValue placeholder="Choose gender">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{getGenderEmoji(formData.gender)}</span>
                        {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : "Choose gender"}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy" className="text-lg">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">👦</span>
                        Boy
                      </span>
                    </SelectItem>
                    <SelectItem value="girl" className="text-lg">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">👧</span>
                        Girl
                      </span>
                    </SelectItem>
                    <SelectItem value="other" className="text-lg">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">🧒</span>
                        Other
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-fun-blue" />
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="text-lg py-4 rounded-xl border-2 border-fun-blue focus:border-primary transition-all duration-300"
                  required
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-fun-green" />
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
                  className="text-lg py-4 rounded-xl border-2 border-fun-green focus:border-primary transition-all duration-300"
                  required
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Weight className="w-5 h-5 text-fun-orange" />
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
                  className="text-lg py-4 rounded-xl border-2 border-fun-orange focus:border-primary transition-all duration-300"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-fun bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6 mt-8 font-comic font-bold"
              >
                Create Profile & Start Playing! 🚀
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            onClick={() => navigate("/children")}
            className="btn-fun bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic font-bold"
          >
            ← Back to Children Profiles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddChild;