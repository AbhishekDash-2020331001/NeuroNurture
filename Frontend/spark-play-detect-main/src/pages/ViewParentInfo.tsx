import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, MapPin, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ParentInfo {
  id: number;
  name: string;
  email: string;
  numberOfChildren: number;
  address: string;
  suspectedAutisticChildCount: number;
}

const ViewParentInfo = () => {
  const navigate = useNavigate();
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    numberOfChildren: 1,
    address: "",
    suspectedAutisticChildCount: 0
  });

  useEffect(() => {
    // Fetch parent info
    fetch('http://localhost:8080/auth/me', { credentials: 'include' })
      .then(res => res.text())
      .then(email => {
        return fetch(`http://localhost:8082/api/parents/by-email/${email}`, {
          credentials: 'include'
        });
      })
      .then(res => res.json())
      .then(parent => {
        setParentInfo(parent);
        setEditData({
          numberOfChildren: parent.numberOfChildren,
          address: parent.address,
          suspectedAutisticChildCount: parent.suspectedAutisticChildCount
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch parent info:', err);
        toast.error("Failed to load parent information");
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (field: 'numberOfChildren' | 'address' | 'suspectedAutisticChildCount', value: string | number) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!parentInfo) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8082/api/parents/${parentInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...parentInfo,
          numberOfChildren: editData.numberOfChildren,
          address: editData.address,
          suspectedAutisticChildCount: editData.suspectedAutisticChildCount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update parent information');
      }

      const updatedParent = await response.json();
      setParentInfo(updatedParent);
      setIsEditing(false);
      toast.success("Parent information updated successfully! 🌟");
    } catch (error) {
      toast.error("Failed to update parent information. Please try again.");
      console.error('Error updating parent info:', error);
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
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Logout failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-2xl font-comic">Loading parent information... 🌟</div>
      </div>
    );
  }

  if (!parentInfo) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-2xl font-comic">Parent information not found. Please contact support.</div>
      </div>
    );
  }

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
            Your Parent Profile 👨‍👩‍👧‍👦
          </h1>
          <p className="text-base text-muted-foreground font-nunito">
            View and manage your family information
          </p>
        </div>

        {/* Main Info Card */}
        <Card className="card-playful shadow-xl border-2 border-fun-green hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center bg-gradient-to-r from-fun-green to-fun-blue rounded-t-2xl p-4">
            <CardTitle className="text-xl font-comic font-bold text-white flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 bounce-gentle" />
              Family Information
              <Heart className="w-5 h-5 bounce-gentle" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {/* Read-only fields */}
            <div className="space-y-3">
              {/* Name - Read Only */}
              <div className="space-y-2 group">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <User className="w-4 h-4 text-fun-purple group-hover:scale-110 transition-transform" />
                  Parent Name
                </Label>
                <div className="text-sm py-3 px-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 hover:shadow-md transition-all duration-300">
                  {parentInfo.name}
                </div>
                <p className="text-xs text-muted-foreground">Name cannot be changed</p>
              </div>

              {/* Email - Read Only */}
              <div className="space-y-2 group">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-fun-blue group-hover:scale-110 transition-transform" />
                  Email Address
                </Label>
                <div className="text-sm py-3 px-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 hover:shadow-md transition-all duration-300">
                  {parentInfo.email}
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Number of Children - Editable */}
              <div className="space-y-2 group">
                <Label htmlFor="numberOfChildren" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Users className="w-4 h-4 text-fun-orange group-hover:scale-110 transition-transform" />
                  Number of Children
                </Label>
                {isEditing ? (
                  <Input
                    id="numberOfChildren"
                    type="number"
                    min="1"
                    value={editData.numberOfChildren}
                    onChange={(e) => handleInputChange("numberOfChildren", parseInt(e.target.value))}
                    className="text-sm py-3 rounded-lg border-2 border-fun-orange focus:border-primary transition-all duration-300 hover:shadow-md"
                  />
                ) : (
                  <div className="text-sm py-3 px-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 hover:shadow-md transition-all duration-300">
                    {parentInfo.numberOfChildren}
                  </div>
                )}
              </div>

              {/* Address - Editable */}
              <div className="space-y-2 group">
                <Label htmlFor="address" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <MapPin className="w-4 h-4 text-fun-green group-hover:scale-110 transition-transform" />
                  Address
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    type="text"
                    value={editData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your address"
                    className="text-sm py-3 rounded-lg border-2 border-fun-green focus:border-primary transition-all duration-300 hover:shadow-md"
                  />
                ) : (
                  <div className="text-sm py-3 px-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 hover:shadow-md transition-all duration-300">
                    {parentInfo.address || "Not provided"}
                  </div>
                )}
              </div>

              {/* Suspected Autistic Child Count - Editable */}
              <div className="space-y-2 group">
                <Label htmlFor="suspectedAutisticChildCount" className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Heart className="w-4 h-4 text-fun-pink group-hover:scale-110 transition-transform" />
                  Suspected Autistic Children
                </Label>
                {isEditing ? (
                  <Input
                    id="suspectedAutisticChildCount"
                    type="number"
                    min="0"
                    value={editData.suspectedAutisticChildCount}
                    onChange={(e) => handleInputChange("suspectedAutisticChildCount", parseInt(e.target.value))}
                    className="text-sm py-3 rounded-lg border-2 border-fun-pink focus:border-primary transition-all duration-300 hover:shadow-md"
                  />
                ) : (
                  <div className="text-sm py-3 px-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 hover:shadow-md transition-all duration-300">
                    {parentInfo.suspectedAutisticChildCount}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-fun bg-gradient-to-r from-primary to-fun-purple hover:from-primary/90 hover:to-fun-purple/90 text-white font-comic text-sm py-2 flex-1 hover:scale-105 transition-all duration-300"
                  >
                    {isLoading ? "Saving..." : "Save Changes 💾"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        numberOfChildren: parentInfo.numberOfChildren,
                        address: parentInfo.address,
                        suspectedAutisticChildCount: parentInfo.suspectedAutisticChildCount
                      });
                    }}
                    className="btn-fun bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic text-sm py-2 hover:scale-105 transition-all duration-300"
                  >
                    Cancel ❌
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="btn-fun bg-gradient-to-r from-primary to-fun-purple hover:from-primary/90 hover:to-fun-purple/90 text-white font-comic text-sm py-2 flex-1 hover:scale-105 transition-all duration-300"
                  >
                    Edit Information ✏️
                  </Button>
                  <Button
                    onClick={() => navigate("/children")}
                    className="btn-fun bg-secondary hover:bg-secondary/90 text-secondary-foreground font-comic text-sm py-2 hover:scale-105 transition-all duration-300"
                  >
                    Back to Children 👶
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewParentInfo; 