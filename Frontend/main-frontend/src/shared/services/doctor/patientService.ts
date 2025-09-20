import { makeAuthenticatedDoctorRequest } from '@/shared/utils/apiUtils';

export interface Patient {
  id: number;
  name: string;
  age: number;
  height: number;
  weight: number;
  grade: string;
  gender: string;
  schoolId: number | null;
  enrolledInSchool: boolean;
  parentName: string;
  parentEmail: string;
  parentAddress: string;
  problem: string; // Medical condition or problem
}

class PatientService {
  private baseUrl = 'http://localhost:8093/api/doctor'; // Doctor service URL

  // Get all patients for a specific doctor
  async getPatientsByDoctor(doctorId: number): Promise<Patient[]> {
    try {
      const response = await makeAuthenticatedDoctorRequest(`${this.baseUrl}/patients/${doctorId}`);
      
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
      
      const patients = await response.json();
      
      // Transform the data to match our frontend interface
      return patients.map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        age: patient.age || 0,
        height: patient.height || 0,
        weight: patient.weight || 0,
        grade: patient.grade || 'Not Assigned',
        gender: patient.gender || 'Unknown',
        schoolId: patient.schoolId,
        enrolledInSchool: patient.enrolledInSchool || false,
        parentName: patient.parentName || 'Unknown',
        parentEmail: patient.parentEmail || 'Unknown',
        parentAddress: patient.parentAddress || 'Unknown',
        problem: patient.problem || 'Condition not specified'
      }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Calculate age from date of birth
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Format date for display
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export const patientService = new PatientService();
