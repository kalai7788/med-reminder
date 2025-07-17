import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CaretakerDashboard from './pages/CaretakerDashboard';
import PatientView from './pages/PatientView';
import AddMedicationForm from './pages/AddMedicationForm';
import SignupPage from './pages/SignupPage';
// Protected route wrapper
const ProtectedRoute = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;

  return user ? (
    <>
      <Navbar />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path ="/Signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/caretaker" element={<CaretakerDashboard />} />
          <Route path="/patient" element={<PatientView />} />
          <Route path="/add-medication" element={<AddMedicationForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/caretaker" replace />} />
      </Routes>
    </Router>
  );
};

export default App;