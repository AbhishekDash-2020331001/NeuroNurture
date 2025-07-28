import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, Users, MapPin, Mail, User } from "lucide-react";

interface ParentInfoForm {
  fullName: string;
  email: string;
  numberOfChildren: number;
  address: string;
}

const ParentInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ParentInfoForm>({
    fullName: "",
    email: "",
    numberOfChildren: 1,
    address: "",
  });

  const handleInputChange = (field: keyof ParentInfoForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email) {
      toast.error("Please fill in all required fields! 😊");
      return;
    }

    // Save to localStorage for demo purposes
    localStorage.setItem("parentInfo", JSON.stringify(formData));
    toast.success("Welcome! Let's meet your wonderful children! 🌟");
    navigate("/children");
  };

  return (
    <div className="min-h-screen bg-soft p-4 font-nunito">
      {/* Floating decorative elements */}
      <div className="fixed top-10 left-10 text-6xl bounce-gentle">🌈</div>
      <div className="fixed top-20 right-16 text-5xl float">⭐</div>
      <div className="fixed bottom-20 left-20 text-4xl wiggle">🎈</div>
      <div className="fixed bottom-10 right-10 text-5xl bounce-gentle">🎉</div>

      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-comic font-bold text-primary mb-4 bounce-gentle">
            Welcome, Super Parent! 🦸‍♀️
          </h1>
          <p className="text-xl text-muted-foreground font-nunito">
            Let's get to know you better so we can create the perfect learning adventure for your amazing children!
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="card-playful shadow-2xl border-4 border-fun-pink">
          <CardHeader className="text-center bg-rainbow rounded-t-3xl">
            <CardTitle className="text-3xl font-comic font-bold text-white flex items-center justify-center gap-3">
              <Heart className="w-8 h-8 bounce-gentle" />
              Tell Us About You!
              <Heart className="w-8 h-8 bounce-gentle" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-fun-purple" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Your wonderful name here! ✨"
                  className="text-lg py-4 rounded-xl border-2 border-fun-blue focus:border-primary transition-all duration-300"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-fun-green" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com 📧"
                  className="text-lg py-4 rounded-xl border-2 border-fun-green focus:border-primary transition-all duration-300"
                  required
                />
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label htmlFor="numberOfChildren" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-fun-orange" />
                  Number of Children
                </Label>
                <Input
                  id="numberOfChildren"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfChildren}
                  onChange={(e) => handleInputChange("numberOfChildren", parseInt(e.target.value) || 1)}
                  className="text-lg py-4 rounded-xl border-2 border-fun-orange focus:border-primary transition-all duration-300"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-fun-pink" />
                  Address (Optional)
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Where do you live? 🏠"
                  className="text-lg py-4 rounded-xl border-2 border-fun-pink focus:border-primary transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-fun bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6 mt-8 font-comic font-bold"
              >
                Let's Meet Your Children! 🌟
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentInfo;