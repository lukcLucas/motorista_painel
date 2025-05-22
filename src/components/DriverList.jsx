import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search, Users as UsersIcon, CheckSquare, Briefcase as BriefcaseIcon, AlertTriangle } from 'lucide-react';
import { DriverTable } from "@/components/DriverTable";
import { CallDriverModal } from "@/components/CallDriverModal";
import { EditDriverModal } from "@/components/EditDriverModal";
import { ViewDriverModal } from "@/components/ViewDriverModal";
import { handleDeleteDriverAction, openCallModalAction, confirmCallDriverAction, openEditModalAction, handleSaveDriverAction, openViewModalAction } from "@/lib/driverListActions";

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
    const events = ['driversUpdated', 'driverCalled', 'serviceStatusUpdated', 'callFinalized', 'callReopened', 'runAssigned'];
    events.forEach(event => window.addEventListener(event, fetchDriversData));
    return () => {
      events.forEach(event => window.removeEventListener(event, fetchDriversData));
    };
  }, [fetchDriversData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.transporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.password && driver.password.includes(searchTerm))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "text-green-500";
      case "offline": return "text-red-500";
      case "busy": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };
  
  const getServiceStatusDisplay = (status, driverId) => {
    const finalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    // Check if any finalized call object has a matching driverId
    const isFinalized = Object.values(finalizedCalls).some(call => call.driverId === driverId);
    
    if (isFinalized) {
        return { text: "Finalizado", color: "text-purple-600", icon: <CheckSquare className="h-4 w-4" /> };
    }

    switch (status) {
      case "disponivel": return { text: "Disponível", color: "text-green-600", icon: <UsersIcon className="h-4 w-4" /> };
      case "em_servico": return { text: "Em Serviço", color: "text-blue-600", icon: <BriefcaseIcon className="h-4 w-4" /> };
      case "em_progresso": return { text: "Em Progresso", color: "text-orange-600", icon: <BriefcaseIcon className="h-4 w-4" /> };
      case "aguardando": return { text: "Aguardando", color: "text-yellow-600", icon: <AlertTriangle className="h-4 w-4" /> };
      default: return { text: "N/A", color: "text-gray-500", icon: <UsersIcon className="h-4 w-4" /> };
    }
  };

  const commonProps = {
    drivers,
    calledDrivers,
    setCalledDrivers,
    fetchDriversData,
    toast,
    logAction,
    userRole,
    setActiveTab,
    setCurrentDriverToCall,
    setCallMessage,
    setIsCallModalOpen,
    setCurrentDriverToEdit,
    setIsEditModalOpen,
    setCurrentDriverToView,
    setIsViewModalOpen,
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
            onCall={(driver) => openCallModalAction(driver, { ...commonProps, canCallDrivers })}
            onDelete={(driverId) => handleDeleteDriverAction(driverId, { ...commonProps, canDeleteDrivers })}
            onEdit={(driver) => openEditModalAction(driver, { ...commonProps, canEditDrivers })}
            onViewDetails={(driver) => openViewModalAction(driver, commonProps)}
            getStatusColor={getStatusColor}
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
          onConfirm={() => confirmCallDriverAction(currentDriverToCall, callMessage, commonProps)}
        />
      )}

      {canEditDrivers && currentDriverToEdit && (
        <EditDriverModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          driver={currentDriverToEdit}
          onSave={(updatedDriver) => handleSaveDriverAction(updatedDriver, commonProps)}
        />
      )}

      <ViewDriverModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        driver={currentDriverToView}
        getServiceStatusDisplay={(status, id) => getServiceStatusDisplay(status, id || currentDriverToView?.id)}
      />
    </>
  );
}