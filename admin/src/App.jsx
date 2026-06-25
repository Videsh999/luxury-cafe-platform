import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardOverview from './pages/DashboardOverview';
import MenuManager from './pages/MenuManager';
import ChatbotTraining from './pages/ChatbotTraining';
import ReservationsManager from './pages/ReservationsManager';
import LiveOrders from './pages/LiveOrders';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Layout
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-luxury-dark flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto custom-scrollbar relative">
        {/* Background ambient lighting */}
        <div className="fixed top-0 left-64 w-[800px] h-[800px] bg-luxury-gold/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none -z-10"></div>
        
        {children}
      </main>
    </div>
  );
};

// Main App component
const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Dashboard Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardOverview />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardOverview />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardOverview />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Placeholders for future phases */}
      <Route path="/orders" element={<ProtectedRoute><AdminLayout><LiveOrders /></AdminLayout></ProtectedRoute>} />
      <Route path="/reservations" element={<ProtectedRoute><AdminLayout><ReservationsManager /></AdminLayout></ProtectedRoute>} />
      <Route path="/kitchen" element={<ProtectedRoute><AdminLayout><div className="text-white">Kitchen Display (Phase 3)</div></AdminLayout></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><AdminLayout><MenuManager /></AdminLayout></ProtectedRoute>} />
      <Route path="/ai-training" element={<ProtectedRoute><AdminLayout><ChatbotTraining /></AdminLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AdminLayout><div className="text-white">Analytics (Future)</div></AdminLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><AdminLayout><div className="text-white">Customers (Future)</div></AdminLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AdminLayout><div className="text-white">Settings (Future)</div></AdminLayout></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
