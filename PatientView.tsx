// src/pages/PatientView.tsx
import React, {  } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { useMedications } from '../hooks/useMedications';
import type { Medication } from '../types/mediication';
import { updateDoc, doc } from 'firebase/firestore';

const PatientView: React.FC = () => {
  const [user] = useAuthState(auth);
  const { medications, loading } = useMedications(user?.uid);

  if (loading) return <div>Loading your medication schedule...</div>;

  const handleMarkTaken = async (medId: string, time: string) => {
    try {
      const medRef = doc(db, 'medications', medId);
      await updateDoc(medRef, {
        [`times.${time}.isActive`]: true,
      });

      alert('Medication marked as taken!');
    } catch (error) {
      console.error("Error marking medication as taken:", error);
      alert('Failed to mark medication as taken. Please try again.');
    }
  };

  // Filter only active medications
  const activeMedications = medications.filter(med => med.isActive);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Medications</h1>
      <p className="text-gray-600 mb-6">Wednesday, July 16, 2025</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's Progress" value="20%" subtext="1 of 5 doses taken" />
        <StatCard label="Completed" value="1" subtext="doses taken today" color="text-green-500" />
        <StatCard label="Pending" value="4" subtext="doses remaining" color="text-orange-500" />
        <StatCard label="Active Medications" value="3" subtext="medications tracked" />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h2>
      <div className="bg-white shadow rounded p-4">
        {activeMedications.length === 0 ? (
          <p className="text-gray-500">No active medications scheduled today.</p>
        ) : (
          activeMedications.map((med) => (
            <MedicationItem
              key={med.id}
              med={med}
              onMarkTaken={handleMarkTaken}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ label: string; value: string | number; subtext: string; color?: string }> = ({
  label,
  value,
  subtext,
  color = "text-gray-800"
}) => (
  <div className="bg-white shadow rounded p-4 text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-400 mt-1">{subtext}</p>
  </div>
);

// Medication Item Component
const MedicationItem: React.FC<{
  med: Medication;
  onMarkTaken: (medId: string, time: string) => void;
}> = ({ med, onMarkTaken }) => {
  return (
    <div key={med.id} className="border-b py-3 flex justify-between items-center">
      <div>
        <p className="font-semibold">{med.name}</p>
        <p className="text-sm text-gray-600">{med.dosage}</p>
      </div>
      <div>
        {Object.entries(med.times || {}).map(([time, details]) => {
          const timeDetails = details as { isActive: boolean };
          return (
            <div key={time} className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => onMarkTaken(med.id, time)}
                className={`px-3 py-1 rounded ${
                  timeDetails.isActive
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}
              >
                {timeDetails.isActive ? 'Completed' : 'Mark Taken'}
              </button>
              <span>{time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientView;