import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AddMedicationForm: React.FC = () => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [times, setTimes] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleAddTime = () => {
    setTimes([...times, '']);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dosage || !frequency || times.some(t => !t)) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const timesObject = times.reduce((acc, time) => {
        acc[time] = {
          isActive: false,
          doseCount: 1
        };
        return acc;
      }, {} as { [key: string]: { isActive: boolean; doseCount: number } });

      const medicationData = {
        name,
        dosage,
        frequency,
        times: timesObject,
        instructions,
        caretakerId: auth.currentUser?.uid || '',
        isActive
      };

      await addDoc(collection(db, 'medications'), medicationData);
      alert('Medication added successfully!');
    } catch (error) {
      console.error("Error adding medication:", error);
      alert('Failed to add medication.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-4">Add New Medication</h2>

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 mb-1">Medication Name *</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="e.g., Aspirin, Metformin"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="dosage" className="block text-gray-700 mb-1">Dosage *</label>
        <input
          type="text"
          id="dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="e.g., 100mg, 2 tablets"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="frequency" className="block text-gray-700 mb-1">Frequency *</label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          required
        >
          <option value="">Select frequency</option>
          <option value="daily">Daily</option>
          <option value="twice-daily">Twice Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Medication Times</label>
        {times.map((time, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => {
                  const newTimes = [...times];
                  newTimes.splice(index, 1);
                  setTimes(newTimes);
                }}
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
        <label className="block text-gray-700 mb-1">Special Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="e.g., Take with food, Avoid dairy products"
        />
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => setIsActive(!isActive)}
          className="mr-2"
        />
        <span>Active medication (will appear in patient's daily schedule)</span>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Medication
        </button>
      </div>
    </form>
  );
};

export default AddMedicationForm;