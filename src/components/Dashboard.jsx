
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MetricsPanel } from "@/components/MetricsPanel";
import { WelcomeCard } from "@/components/WelcomeCard";
import { Footer } from "@/components/Footer";
import { DriverRegistrationForm } from "@/components/DriverRegistrationForm";
import { DriverList } from "@/components/DriverList";
import { DriverCallPanel } from "@/components/DriverCallPanel";
import { ActionHistory } from "@/components/ActionHistory"; 
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  UserPlus,
  History,
  PanelTopOpen,
  LogOut
} from "lucide-react";

export function Dashboard({ userRole, onLogout, logAction }) {
  const [activeTab, setActiveTab] = useState("painel");
  const [drivers, setDrivers] = useState([]);
  const [metricsKey, setMetricsKey] = useState(0); 

  const refreshData = useCallback(() => {
    const storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    setDrivers(storedDrivers);
    setMetricsKey(prevKey => prevKey + 1); 
  }, []);

  useEffect(() => {
    refreshData();
    window.addEventListener('driversUpdated', refreshData);
    window.addEventListener('driverCalled', refreshData); 
    window.addEventListener('serviceStatusUpdated', refreshData);

    if (userRole === 'motorista') {
      setActiveTab('painel_motorista');
    } else if (userRole === 'adm') {
      setActiveTab('motoristas'); 
    } else if (userRole === 'master') {
      setActiveTab('painel');
    }

    return () => {
      window.removeEventListener('driversUpdated', refreshData);
      window.removeEventListener('driverCalled', refreshData);
      window.removeEventListener('serviceStatusUpdated', refreshData);
    };
  }, [refreshData, userRole]);

  const permissions = {
    master: {
      canViewPainel: true,
      canViewMotoristas: true,
      canViewPainelMotorista: true,
      canViewCadastro: true,
      canViewHistorico: true, 
      canEditDrivers: true,
      canDeleteDrivers: true,
      canCallDrivers: true,
      canRemoveCalls: true,
    },
    adm: {
      canViewPainel: false, 
      canViewMotoristas: true,
      canViewPainelMotorista: true, 
      canViewCadastro: true,
      canViewHistorico: false,
      canEditDrivers: true,
      canDeleteDrivers: true,
      canCallDrivers: true,
      canRemoveCalls: true,
    },
    motorista: {
      canViewPainel: false,
      canViewMotoristas: false, 
      canViewPainelMotorista: true,
      canViewCadastro: false,
      canViewHistorico: false,
      canEditDrivers: false,
      canDeleteDrivers: false,
      canCallDrivers: false,
      canRemoveCalls: false,
    }
  };

  const currentPermissions = permissions[userRole] || permissions.motorista; 

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex justify-between items-center">
          <div></div> 
          <h1 className="text-4xl font-bold text-[#00a0e4] flex items-center justify-center gap-2">
            <Users className="h-10 w-10" /> Painel Administrativo
          </h1>
          <Button onClick={onLogout} variant="outline" size="sm" className="flex items-center gap-1">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          Gerencie seus motoristas com eficiência. (Logado como: {userRole.toUpperCase()})
        </p>
      </motion.div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
          {currentPermissions.canViewPainel && (
            <TabsTrigger 
              value="painel" 
              className={`flex items-center justify-center gap-2 py-3 ${activeTab === "painel" ? "tab-active" : ""}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden sm:inline">Painel</span>
            </TabsTrigger>
          )}
          {currentPermissions.canViewMotoristas && (
            <TabsTrigger 
              value="motoristas" 
              className={`flex items-center justify-center gap-2 py-3 ${activeTab === "motoristas" ? "tab-active" : ""}`}
            >
              <Users className="h-5 w-5" />
              <span className="hidden sm:inline">Motoristas</span>
            </TabsTrigger>
          )}
          {currentPermissions.canViewPainelMotorista && (
            <TabsTrigger 
              value="painel_motorista" 
              className={`flex items-center justify-center gap-2 py-3 ${activeTab === "painel_motorista" ? "tab-active" : ""}`}
            >
              <PanelTopOpen className="h-5 w-5" />
              <span className="hidden sm:inline">Painel do Motorista</span>
            </TabsTrigger>
          )}
          {currentPermissions.canViewCadastro && (
            <TabsTrigger 
              value="cadastro" 
              className={`flex items-center justify-center gap-2 py-3 ${activeTab === "cadastro" ? "tab-active" : ""}`}
            >
              <UserPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Cadastro</span>
            </TabsTrigger>
          )}
          {currentPermissions.canViewHistorico && (
             <TabsTrigger 
              value="historico"
              className={`flex items-center justify-center gap-2 py-3 ${activeTab === "historico" ? "tab-active" : ""}`}
            >
              <History className="h-5 w-5" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          )}
        </TabsList>

        {currentPermissions.canViewPainel && (
          <TabsContent value="painel" className="space-y-6">
            <MetricsPanel key={metricsKey} />
            <WelcomeCard />
          </TabsContent>
        )}

        {currentPermissions.canViewMotoristas && (
          <TabsContent value="motoristas">
            <DriverList 
              setActiveTab={setActiveTab} 
              userRole={userRole}
              canEditDrivers={currentPermissions.canEditDrivers}
              canDeleteDrivers={currentPermissions.canDeleteDrivers}
              canCallDrivers={currentPermissions.canCallDrivers}
              logAction={logAction}
            />
          </TabsContent>
        )}

        {currentPermissions.canViewPainelMotorista && (
          <TabsContent value="painel_motorista">
            <DriverCallPanel 
              userRole={userRole} 
              canRemoveCalls={currentPermissions.canRemoveCalls}
              logAction={logAction}
            />
          </TabsContent>
        )}

        {currentPermissions.canViewCadastro && (
          <TabsContent value="cadastro">
            <DriverRegistrationForm onRegistrationSuccess={refreshData} logAction={logAction} userRole={userRole} />
          </TabsContent>
        )}
        
        {currentPermissions.canViewHistorico && (
          <TabsContent value="historico">
            <ActionHistory />
          </TabsContent>
        )}
      </Tabs>

      <Footer />
    </div>
  );
}
