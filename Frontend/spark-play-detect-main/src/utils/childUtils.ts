// Get current child ID from localStorage
export const getCurrentChildId = (): number | null => {
  const childId = localStorage.getItem("selectedChildId");
  return childId ? parseInt(childId) : null;
};

// Get current child data from localStorage
export const getCurrentChild = () => {
  const childData = localStorage.getItem("selectedChild");
  return childData ? JSON.parse(childData) : null;
};

// Clear current child data
export const clearCurrentChild = () => {
  localStorage.removeItem("selectedChildId");
  localStorage.removeItem("selectedChild");
}; 