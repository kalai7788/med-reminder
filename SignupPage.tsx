// src/pages/SignupPage.tsx
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caretaker' | 'both'>('patient');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name,
        email,
        role,
      });
      navigate('/dashboard'); // or redirect based on role
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError((err as { message: string }).message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 to-indigo-200">
      <div className="card max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Create Account 📝</h2>
        {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-center">{error}</div>}
        
        <input className="input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value as 'patient' | 'caretaker' | 'both')}
        >
          <option value="patient">Patient</option>
          <option value="caretaker">Caretaker</option>
          <option value="both">Both</option>
        </select>

        <button className="btn mt-4" onClick={handleSignup}>Sign Up</button>

        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/" className="text-indigo-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
