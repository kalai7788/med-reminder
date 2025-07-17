import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 const handleLogin = async () => {
  setError('');
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
    const userData = userDoc.data();

    if (!userDoc.exists() || !userData?.role) {
      setError('User role not found. Please contact support.');
      return;
    }

    localStorage.setItem('userRole', userData.role);
    navigate('/dashboard');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    setError(errorMessage || 'Login failed. Try again.');
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-full" onClick={handleLogin}>Login</button>
        <p className="mt-4 text-center text-sm">
          Don’t have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;