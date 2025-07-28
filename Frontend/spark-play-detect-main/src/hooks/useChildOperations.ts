import { useChildContext } from '@/contexts/ChildContext';
import { toast } from 'sonner';

export const useChildOperations = () => {
  const { currentChild, currentParent } = useChildContext();

  // Save child progress data
  const saveChildProgress = async (progressData: any) => {
    if (!currentChild) {
      toast.error("No child selected");
      return false;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${currentChild.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          childId: currentChild.id,
          parentId: currentParent?.id,
          ...progressData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      toast.success("Progress saved successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to save progress");
      console.error('Error saving progress:', error);
      return false;
    }
  };

  // Get child progress data
  const getChildProgress = async () => {
    if (!currentChild) {
      toast.error("No child selected");
      return null;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${currentChild.id}/progress`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  };

  // Save child assessment results
  const saveChildAssessment = async (assessmentData: any) => {
    if (!currentChild) {
      toast.error("No child selected");
      return false;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${currentChild.id}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          childId: currentChild.id,
          parentId: currentParent?.id,
          ...assessmentData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      toast.success("Assessment saved successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to save assessment");
      console.error('Error saving assessment:', error);
      return false;
    }
  };

  // Get child assessment history
  const getChildAssessments = async () => {
    if (!currentChild) {
      toast.error("No child selected");
      return null;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${currentChild.id}/assessments`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get assessments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting assessments:', error);
      return null;
    }
  };

  // Update child profile
  const updateChildProfile = async (updatedData: any) => {
    if (!currentChild) {
      toast.error("No child selected");
      return false;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${currentChild.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update child profile');
      }

      toast.success("Child profile updated successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to update child profile");
      console.error('Error updating child profile:', error);
      return false;
    }
  };

  return {
    currentChild,
    currentParent,
    saveChildProgress,
    getChildProgress,
    saveChildAssessment,
    getChildAssessments,
    updateChildProfile,
    hasSelectedChild: !!currentChild,
    hasSelectedParent: !!currentParent,
  };
}; 