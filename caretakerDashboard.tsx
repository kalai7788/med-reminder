// caretaker dashboard



// src/pages/CaretakerDashboard.tsx
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useMedications } from '../hooks/useMedications';
import type { Medication } from '../types/mediication'; // ✅ Fixed: Typo corrected
 // ✅ Fixed: Typo corrected
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const CaretakerDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const { medications, loading } = useMedications(user?.uid);

  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [instructions, setInstructions] = useState('');

  const handleAddTime = () => {
    setTimes([...times, '']);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !name || !dosage || times.some((t) => !t)) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      // Build the times object
      const timesObject = times.reduce((acc, time) => {
        acc[time] = {
          isActive: false,
          doseCount: 1,
        };
        return acc;
      }, {} as { [key: string]: { isActive: boolean; doseCount: number } });

      await addDoc(collection(db, 'medications'), {
        name,
        dosage,
        frequency,
        times: timesObject,
        instructions,
        caretakerId: user.uid,
        isActive: true, // Default to active
        createdAt: serverTimestamp(),
      });

      // Reset form
      setName('');
      setDosage('');
      setFrequency('daily');
      setTimes(['08:00']);
      setInstructions('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Failed to add medication.');
    }
  };

  const handleToggleMedicationStatus = async (med: Medication) => {
    const medRef = doc(db, 'medications', med.id);
    try {
      await updateDoc(medRef, {
        isActive: !med.isActive,
      });
    } catch (error) {
      console.error('Error updating medication status:', error);
    }
  };

  if (loading) return <div>Loading medications...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Caretaker Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage medications and monitor patient adherence</p>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Medication
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddMedication} className="bg-white shadow rounded p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Medication</h3>

          <div className="mb-4">
            <label className="block text-sm mb-1">Medication Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., Metformin"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Dosage *</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., 500mg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Frequency *</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="daily">Daily</option>
              <option value="twice-daily">Twice Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Medication Times</label>
            {times.map((time, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setTimes(times.filter((_, i) => i !== index))}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTime}
              className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
            >
              + Add Time
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Special Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., Take with food"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="mr-2"
            />
            <span>Active medication (will appear in patient's daily schedule)</span>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Medications" value={medications.length} subtext="2 active" />
        <StatCard label="Today's Adherence" value="0%" subtext="0 of 3 doses" />
        <StatCard label="7-Day Average" value="0%" subtext="adherence rate" />
        <StatCard label="Missed Today" value="0" subtext="doses missed" color="text-red-500" />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Medication Management</h2>
      <div className="bg-white shadow rounded p-4">
        {medications.length === 0 ? (
          <p className="text-gray-500">No medications added yet.</p>
        ) : (
          medications.map((med) => (
            <MedicationItem
              key={med.id}
              med={med}
              onToggle={handleToggleMedicationStatus}
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
  onToggle: (med: Medication) => void;
}> = ({ med, onToggle }) => (
  <div key={med.id} className="border-b py-3 flex justify-between items-center">
    <div>
      <p className="font-semibold">{med.name}</p>
      <p className="text-sm text-gray-600">{med.dosage}</p>
    </div>
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={med.isActive}
          onChange={() => onToggle(med)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        <span className="ml-3 text-sm font-medium text-gray-700">
          {med.isActive ? 'Active' : 'Inactive'}
        </span>
      </label>
      <button
        type="button"
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Edit
      </button>
    </div>
  </div>
);

export default CaretakerDashboard;
