
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, Users as UsersIcon, AlertTriangle } from 'lucide-react';
import { DriverTable } from "@/components/DriverTable";
import { CallDriverModal } from "@/components/CallDriverModal";
import { EditDriverModal } from "@/components/EditDriverModal";
import { ViewDriverModal } from "@/components/ViewDriverModal";

export function DriverList({ setActiveTab, userRole, canEditDrivers, canDeleteDrivers, canCallDrivers, logAction }) {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [calledDrivers, setCalledDrivers] = useState({});
  
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [currentDriverToCall, setCurrentDriverToCall] = useState(null);
  const [callMessage, setCallMessage] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDriverToEdit, setCurrentDriverToEdit] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentDriverToView, setCurrentDriverToView] = useState(null);

  const fetchDriversData = useCallback(() => {
    const storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    setDrivers(storedDrivers.map(d => ({ ...d, serviceStatus: d.serviceStatus || "disponivel" })));
    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    setCalledDrivers(storedCalledDrivers);
  }, []);

  useEffect(() => {
    fetchDriversData();
    window.addEventListener('driversUpdated', fetchDriversData);
    window.addEventListener('driverCalled', fetchDriversData); 
    window.addEventListener('serviceStatusUpdated', fetchDriversData);
    return () => {
      window.removeEventListener('driversUpdated', fetchDriversData);
      window.removeEventListener('driverCalled', fetchDriversData);
      window.removeEventListener('serviceStatusUpdated', fetchDriversData);
    };
  }, [fetchDriversData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.transporter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDriver = (driverId) => {
    if (!canDeleteDrivers) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para excluir motoristas." });
      return;
    }
    const driverToDelete = drivers.find(d => d.id === driverId);
    if (window.confirm("Tem certeza que deseja excluir este motorista?")) {
      const updatedDrivers = drivers.filter(driver => driver.id !== driverId);
      localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
      
      const updatedCalledDrivers = { ...calledDrivers };
      delete updatedCalledDrivers[driverId];
      localStorage.setItem("calledDrivers", JSON.stringify(updatedCalledDrivers));

      fetchDriversData(); 
      window.dispatchEvent(new CustomEvent('driversUpdated'));
      logAction("Excluir Motorista", userRole, `Motorista ${driverToDelete?.fullName || driverId} excluído.`);
      toast({
        title: "Motorista Excluído",
        description: "O motorista foi removido com sucesso.",
      });
    }
  };
  
  const openCallModal = (driver) => {
    if (!canCallDrivers) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para chamar motoristas." });
      return;
    }
    if (driver.availabilityStatus !== 'online' && driver.availabilityStatus !== 'busy') {
      toast({
        variant: "destructive",
        title: "Motorista Indisponível",
        description: `${driver.fullName} não está online ou ocupado para ser chamado.`,
      });
      return;
    }

    if (calledDrivers[driver.id]) {
        toast({
            variant: "default",
            title: "Motorista Já Chamado",
            description: `${driver.fullName} já está no painel de chamadas. Clique para ver no painel.`,
        });
        if (setActiveTab) {
            setActiveTab("painel_motorista");
        }
        return;
    }
    setCurrentDriverToCall(driver);
    setCallMessage(`Motorista ${driver.fullName}, por favor, dirija-se ao local designado.`);
    setIsCallModalOpen(true);
  };

  const confirmCallDriver = () => {
    if (!currentDriverToCall || !callMessage.trim()) {
        toast({
            variant: "destructive",
            title: "Erro na Chamada",
            description: "Motorista ou mensagem inválida.",
        });
        return;
    }
    const newCalledDrivers = {
      ...calledDrivers,
      [currentDriverToCall.id]: { 
        message: callMessage, 
        timestamp: new Date().toLocaleTimeString(),
        destination: currentDriverToCall.destination || "Não especificado",
        password: currentDriverToCall.password || "" 
      }
    };
    localStorage.setItem("calledDrivers", JSON.stringify(newCalledDrivers));
    
    logAction("Chamar Motorista", userRole, `Motorista ${currentDriverToCall.fullName} chamado. Destino: ${currentDriverToCall.destination || "Não especificado"}`);
    toast({
      title: "Motorista Chamado!",
      description: `${currentDriverToCall.fullName} foi chamado para o painel. Destino: ${currentDriverToCall.destination || "Não especificado"}.`,
    });
    window.dispatchEvent(new CustomEvent('driverCalled', { detail: { driverId: currentDriverToCall.id, message: callMessage, destination: currentDriverToCall.destination, password: currentDriverToCall.password } }));
    setIsCallModalOpen(false);
    setCurrentDriverToCall(null);
    setCallMessage("");
    fetchDriversData();
    if (setActiveTab) {
        setActiveTab("painel_motorista");
    }
  };

  const openEditModal = (driver) => {
    if (!canEditDrivers) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para editar motoristas." });
      return;
    }
    setCurrentDriverToEdit(driver);
    setIsEditModalOpen(true);
  };

  const handleSaveDriver = (updatedDriver) => {
    const updatedDrivers = drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d);
    localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
    fetchDriversData();
    window.dispatchEvent(new CustomEvent('driversUpdated'));
    window.dispatchEvent(new CustomEvent('serviceStatusUpdated'));
    logAction("Editar Motorista", userRole, `Dados do motorista ${updatedDriver.fullName} atualizados.`);
    toast({
      title: "Motorista Atualizado",
      description: `${updatedDriver.fullName} foi atualizado com sucesso.`,
    });
    setIsEditModalOpen(false);
  };

  const openViewModal = (driver) => {
    setCurrentDriverToView(driver);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "text-green-500";
      case "offline": return "text-red-500";
      case "busy": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };
  
  const getServiceStatusDisplay = (status) => {
    switch (status) {
      case "disponivel": return { text: "Disponível", color: "text-green-600", icon: <UsersIcon className="h-4 w-4" /> };
      case "em_servico": return { text: "Em Serviço", color: "text-blue-600", icon: <UsersIcon className="h-4 w-4" /> };
      case "em_progresso": return { text: "Em Progresso", color: "text-orange-600", icon: <UsersIcon className="h-4 w-4" /> };
      case "aguardando": return { text: "Aguardando", color: "text-yellow-500", icon: <AlertTriangle className="h-4 w-4" /> };
      default: return { text: "N/A", color: "text-gray-500", icon: <UsersIcon className="h-4 w-4" /> };
    }
  };


  return (
    <>
      <motion.div
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-[#00a0e4] flex items-center gap-2">
            <UsersIcon className="h-7 w-7" /> Lista de Motoristas Cadastrados
          </h2>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar motorista..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {filteredDrivers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {drivers.length === 0 ? "Nenhum motorista cadastrado ainda." : "Nenhum motorista encontrado com os critérios de busca."}
          </p>
        ) : (
          <DriverTable 
            drivers={filteredDrivers}
            calledDrivers={calledDrivers}
            onCall={openCallModal}
            onDelete={handleDeleteDriver}
            onEdit={openEditModal}
            onViewDetails={openViewModal}
            getStatusColor={getStatusColor}
            getServiceStatusDisplay={getServiceStatusDisplay}
            canEditDrivers={canEditDrivers}
            canDeleteDrivers={canDeleteDrivers}
            canCallDrivers={canCallDrivers}
          />
        )}
      </motion.div>

      {canCallDrivers && currentDriverToCall && (
        <CallDriverModal
          isOpen={isCallModalOpen}
          onOpenChange={setIsCallModalOpen}
          driver={currentDriverToCall}
          currentMessage={callMessage}
          onMessageChange={setCallMessage}
          onConfirm={confirmCallDriver}
        />
      )}

      {canEditDrivers && currentDriverToEdit && (
        <EditDriverModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          driver={currentDriverToEdit}
          onSave={handleSaveDriver}
        />
      )}

      <ViewDriverModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        driver={currentDriverToView}
        getServiceStatusDisplay={getServiceStatusDisplay}
      />
    </>
  );
}
