import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Dashboard } from "@/components/Dashboard";
import { LoginScreen } from "@/components/LoginScreen";
import { useToast } from "@/components/ui/use-toast";

const logAction = (action, userRole, details = {}) => {
  const history = JSON.parse(localStorage.getItem("actionHistory")) || [];
  const newLogEntry = {
    action,
    userRole,
    details: typeof details === 'string' ? details : JSON.stringify(details),
    timestamp: new Date().toISOString(),
    id: Date.now() + Math.random().toString(36) 
  };
  history.unshift(newLogEntry); 
  if (history.length > 100) { 
    history.pop();
  }
  localStorage.setItem("actionHistory", JSON.stringify(history));
  window.dispatchEvent(new CustomEvent('actionHistoryUpdated'));
};

function App() {
  const [userRole, setUserRole] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
    logAction("Login", role, `Usuário ${role.toUpperCase()} acessou o sistema.`);
    toast({
      title: "Login Bem-sucedido!",
      description: `Você acessou como ${role.toUpperCase()}.`,
    });
  };

  const handleLogout = () => {
    logAction("Logout", userRole, `Usuário ${userRole.toUpperCase()} saiu do sistema.`);
    setUserRole(null);
    localStorage.removeItem("userRole");
    toast({
      title: "Logout Realizado",
      description: "Você saiu do sistema.",
    });
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoginScreen onLogin={handleLogin} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Dashboard userRole={userRole} onLogout={handleLogout} logAction={logAction} />
      <Toaster />
    </div>
  );
}

export default App;