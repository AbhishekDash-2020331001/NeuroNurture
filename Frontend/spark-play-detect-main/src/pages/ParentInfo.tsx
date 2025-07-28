import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, MapPin, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ParentInfoForm {
  name: string;
  email: string;
  numberOfChildren: number;
  address: string;
  suspectedAutisticChildCount: number;
}

const ParentInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ParentInfoForm>({
    name: "",
    email: "",
    numberOfChildren: 1,
    address: "",
    suspectedAutisticChildCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Fetch user email from JWT token
    fetch('http://localhost:8080/auth/me', { credentials: 'include' })
      .then(res => res.text())
      .then(email => {
        setUserEmail(email);
        setFormData(prev => ({ ...prev, email }));
      })
      .catch(err => {
        console.error('Failed to fetch user email:', err);
        toast.error("Failed to load user information");
      });
  }, []);

  const handleInputChange = (field: keyof ParentInfoForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields! 😊");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8082/api/parents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save parent information');
      }

      toast.success("Welcome! Let's meet your wonderful children! 🌟");
      navigate("/children");
    } catch (error) {
      toast.error("Failed to save parent information. Please try again.");
      console.error('Error saving parent info:', error);
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

  return (
    <div className="min-h-screen bg-soft font-nunito">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 text-6xl bounce-gentle z-10">🌈</div>
      <div className="fixed top-32 right-16 text-5xl float z-10">⭐</div>
      <div className="fixed bottom-20 left-20 text-4xl wiggle z-10">🎈</div>
      <div className="fixed bottom-10 right-10 text-5xl bounce-gentle z-10">🎉</div>

      <div className="max-w-lg mx-auto pt-8 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-comic font-bold text-primary mb-3 bounce-gentle">
            Welcome, Super Parent! 🦸‍♀️
          </h1>
          <p className="text-base text-muted-foreground font-nunito">
            Let's get to know you better! ✨
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="card-playful shadow-xl border-2 border-fun-pink hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center bg-gradient-to-r from-fun-pink to-fun-purple rounded-t-2xl p-4">
            <CardTitle className="text-xl font-comic font-bold text-white flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 bounce-gentle" />
              Tell Us About You!
              <Heart className="w-5 h-5 bounce-gentle" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2 group">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <User className="w-4 h-4 text-fun-purple group-hover:scale-110 transition-transform" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your wonderful name here! ✨"
                  className="text-sm py-3 rounded-lg border-2 border-fun-blue focus:border-primary transition-all duration-300 hover:shadow-md"
                  required
                />
              </div>

              {/* Email - Auto-filled and read-only */}
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-fun-green group-hover:scale-110 transition-transform" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="text-sm py-3 rounded-lg border-2 border-fun-green bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email is automatically filled from your account</p>
              </div>

              {/* Number of Children */}
              <div className="space-y-2 group">
                <Label htmlFor="numberOfChildren" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Users className="w-4 h-4 text-fun-orange group-hover:scale-110 transition-transform" />
                  Number of Children
                </Label>
                <Input
                  id="numberOfChildren"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfChildren}
                  onChange={(e) => handleInputChange("numberOfChildren", parseInt(e.target.value) || 1)}
                  className="text-sm py-3 rounded-lg border-2 border-fun-orange focus:border-primary transition-all duration-300 hover:shadow-md"
                />
              </div>

              {/* Suspected Autistic Child Count */}
              <div className="space-y-2 group">
                <Label htmlFor="suspectedAutisticChildCount" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Heart className="w-4 h-4 text-fun-pink group-hover:scale-110 transition-transform" />
                  Number of Children with Autism Spectrum
                </Label>
                <Input
                  id="suspectedAutisticChildCount"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.suspectedAutisticChildCount}
                  onChange={(e) => handleInputChange("suspectedAutisticChildCount", parseInt(e.target.value) || 0)}
                  className="text-sm py-3 rounded-lg border-2 border-fun-pink focus:border-primary transition-all duration-300 hover:shadow-md"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 group">
                <Label htmlFor="address" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <MapPin className="w-4 h-4 text-fun-pink group-hover:scale-110 transition-transform" />
                  Address (Optional)
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Where do you live? 🏠"
                  className="text-sm py-3 rounded-lg border-2 border-fun-pink focus:border-primary transition-all duration-300 hover:shadow-md"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-fun bg-gradient-to-r from-primary to-fun-purple hover:from-primary/90 hover:to-fun-purple/90 text-white text-base py-3 mt-4 font-comic font-bold hover:scale-105 transition-all duration-300"
              >
                {isLoading ? "Saving..." : "Let's Meet Your Children! 🌟"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentInfo; 