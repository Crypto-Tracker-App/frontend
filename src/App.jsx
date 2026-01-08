import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AlertNotification from './components/AlertNotification';
import useTriggeredAlerts from './hooks/useTriggeredAlerts';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Portfolio from './pages/Portfolio';
import Alerts from './pages/Alerts';
import './assets/styles/App.css';

function AppContent() {
  const { authToken } = useContext(AuthContext);
  const { triggeredAlerts } = useTriggeredAlerts(authToken, 10000);
  const [displayedAlerts, setDisplayedAlerts] = useState([]);

  // When new alerts come in, add them to displayed alerts
  React.useEffect(() => {
    triggeredAlerts.forEach(alert => {
      // Check if this alert is already being displayed
      const isDisplayed = displayedAlerts.some(a => a.id === alert.id);
      if (!isDisplayed) {
        setDisplayedAlerts(prev => [...prev, alert]);
      }
    });
  }, [triggeredAlerts]);

  const handleDismissAlert = (alertId) => {
    setDisplayedAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/portfolio" 
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {/* Display all active notifications */}
      {displayedAlerts.map((alert, index) => (
        <AlertNotification
          key={`${alert.id}-${index}`}
          alert={alert}
          onDismiss={() => handleDismissAlert(alert.id)}
        />
      ))}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;