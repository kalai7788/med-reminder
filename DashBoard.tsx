//dashboard.tsx



// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import type { Medication } from '../types';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const todayDate = new Date().toISOString().split('T')[0];

const Dashboard = () => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'patient' | 'caretaker' | 'both' | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
      } else {
        setUserId(user.uid);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const userRole = userData?.role || 'patient';
        setRole(userRole);

        fetchMedications(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchMedications = async (uid: string) => {
    const medsQuery = query(
      collection(db, 'medications'),
      where('userId', '==', uid),
      where('date', '==', todayDate)
    );
    const snapshot = await getDocs(medsQuery);
    const meds = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        dosage: data.dosage,
        userId: data.userId,
        takenToday: data.takenToday,
        date: data.date,
      } as unknown as Medication;
    });
    setMedications(meds);
  };

  const handleAddMedication = async () => {
    if (!name || !dosage || !userId) return;

    const newMed = {
      name,
      dosage,
      userId,
      takenToday: false,
      date: todayDate,
    };

    await addDoc(collection(db, 'medications'), newMed);
    setName('');
    setDosage('');
    fetchMedications(userId);
  };

  const markAsTaken = async (id: string) => {
    const docRef = doc(db, 'medications', id);
    await updateDoc(docRef, { takenToday: true });
    fetchMedications(userId);
  };

  if (!role) return <p className="text-center mt-10 text-lg font-medium">Loading dashboard...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {role} 👋</h1>

      {(role === 'caretaker' || role === 'both') && (
        <div className="mb-6 bg-white p-4 shadow rounded">
          <h2 className="font-semibold text-lg mb-3">Add Medication</h2>
          <input
            className="input mb-2"
            placeholder="Medication Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input mb-2"
            placeholder="Dosage (e.g. 500mg)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
          <button className="btn" onClick={handleAddMedication}>Add Medication</button>
        </div>
      )}

      {(role === 'patient' || role === 'both') && (
        <div>
          <h2 className="font-semibold text-lg mb-2">Today's Medications</h2>
          {medications.length === 0 ? (
            <p className="text-gray-500">No medications scheduled for today.</p>
          ) : (
            <ul>
              {medications.map((med) => (
                <li key={med.id} className="mb-3 p-3 border rounded bg-white shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{med.name}</strong> - {med.dosage}
                      <p className="text-sm text-gray-500">
                        {med.takenToday ? "✅ Taken" : "❌ Not Taken"}
                      </p>
                    </div>
                    {!med.takenToday && (
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => markAsTaken(med.id)}
                      >
                        Mark as Taken
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
