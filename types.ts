export interface Medication {
  takenToday: unknown;
  id: string;
  name: string;
  dosage: string;
  schedule: {
    time: string; // e.g., "08:00"
    days: number[]; // [0,1,2,3,4,5,6] for daily
  };
  lastTaken?: string; // ISO date string
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'caretaker';
  caretakerEmail?: string; // for patient
  patientEmail?: string; // for caretaker
}