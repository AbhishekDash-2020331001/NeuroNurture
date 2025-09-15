// Service for fetching child's doctor information

export interface DoctorEnrollmentStatus {
  childId: number;
  childName: string;
  doctorId: number | null;
  problem: string | null;
  enrolled: boolean;
}

export interface DoctorInfo {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  hospital: string;
  email: string;
  phone: string;
  address: string;
  yearsOfExperience: number;
  licenseNumber: string;
}

class ChildDoctorService {
  private baseUrl = 'http://localhost:8082/api/parents'; // Parent service URL

  // Get child's doctor enrollment status
  async getChildDoctorStatus(childId: number): Promise<DoctorEnrollmentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/children/${childId}/doctor-status`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Response is not JSON:', responseText);
        throw new Error('Response is not JSON');
      }
      
      const status = await response.json();
      console.log('Doctor enrollment status:', status);
      return status;
    } catch (error) {
      console.error('Error fetching child doctor status:', error);
      throw error;
    }
  }

  // Get doctor information by doctor ID
  async getDoctorInfo(doctorId: number): Promise<DoctorInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/doctors/${doctorId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Response is not JSON:', responseText);
        throw new Error('Response is not JSON');
      }
      
      const doctorInfo = await response.json();
      console.log('Doctor info:', doctorInfo);
      return doctorInfo;
    } catch (error) {
      console.error('Error fetching doctor info:', error);
      throw error;
    }
  }

  // Get complete doctor information for a child (status + doctor details)
  async getChildDoctorInfo(childId: number): Promise<{
    status: DoctorEnrollmentStatus;
    doctorInfo: DoctorInfo | null;
  }> {
    try {
      const status = await this.getChildDoctorStatus(childId);
      
      if (status.enrolled && status.doctorId) {
        const doctorInfo = await this.getDoctorInfo(status.doctorId);
        return { status, doctorInfo };
      }
      
      return { status, doctorInfo: null };
    } catch (error) {
      console.error('Error fetching child doctor info:', error);
      throw error;
    }
  }
}

export const childDoctorService = new ChildDoctorService();
