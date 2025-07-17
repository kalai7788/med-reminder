import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Medication } from '../types/mediication';

export function useMedications(uid?: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'medications'), where('caretakerId', '==', uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const updateMedicationTime = async (medId: string, time: string) => {
    const medRef = doc(db, 'medications', medId);
    await updateDoc(medRef, {
      [`times.${time}.isActive`]: true,
    });
  };

  return { medications, loading, updateMedicationTime };
}