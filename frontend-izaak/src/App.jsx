import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Overview from './components/Overview';
import AccountDetail from './components/AccountDetail';
import AccountsList from './components/AccountsList';
import MoneyMoves from './components/MoneyMoves';
import Transfer from './components/Transfer';
import Profile from './components/Profile';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Overview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <AccountsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/:accountId"
        element={
          <ProtectedRoute>
            <AccountDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/money-moves"
        element={
          <ProtectedRoute>
            <MoneyMoves />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfer"
        element={
          <ProtectedRoute>
            <Transfer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
