export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: {
    [key: string]: {
      isActive: boolean;
      doseCount: number;
    };
  };
  instructions?: string;
  caretakerId: string;
  isActive: boolean;
}