
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PanelTopOpen, User, Car, Building, MessageSquare, Clock, MapPin, Trash2, Search } from "lucide-react";

export function DriverCallPanel({ userRole, canRemoveCalls, logAction }) {
  const { toast } = useToast();
  const [calledDriversDetails, setCalledDriversDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState([]);

  const fetchCalledDrivers = useCallback(() => {
    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    const allDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    setDrivers(allDrivers);

    const details = Object.entries(storedCalledDrivers)
      .map(([driverId, callInfo]) => {
        const driver = allDrivers.find(d => d.id === driverId);
        if (driver) {
          return {
            ...driver,
            callMessage: callInfo.message,
            callTimestamp: callInfo.timestamp,
            callDestination: callInfo.destination,
          };
        }
        return null;
      })
      .filter(Boolean); 
    setCalledDriversDetails(details);
  }, []);

  useEffect(() => {
    fetchCalledDrivers();
    const interval = setInterval(fetchCalledDrivers, 5000); 
    window.addEventListener('driverCalled', fetchCalledDrivers);
    window.addEventListener('driversUpdated', fetchCalledDrivers);
    return () => {
      clearInterval(interval);
      window.removeEventListener('driverCalled', fetchCalledDrivers);
      window.removeEventListener('driversUpdated', fetchCalledDrivers);
    };
  }, [fetchCalledDrivers]);

  const handleRemoveFromPanel = (driverId) => {
    if (!canRemoveCalls) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para remover chamadas." });
      return;
    }
    const driverToRemove = calledDriversDetails.find(d => d.id === driverId);
    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    delete storedCalledDrivers[driverId];
    localStorage.setItem("calledDrivers", JSON.stringify(storedCalledDrivers));
    
    fetchCalledDrivers();
    window.dispatchEvent(new CustomEvent('driverCalled')); 
    logAction("Remover Chamada", userRole, `Chamada do motorista ${driverToRemove?.fullName || driverId} removida do painel.`);
    toast({
      title: "Motorista Removido",
      description: "O motorista foi removido do painel de chamadas.",
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCalledDrivers = calledDriversDetails.filter(driver =>
    driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.callDestination && driver.callDestination.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (driver.callMessage && driver.callMessage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="bg-white p-6 sm:p-8 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-[#00a0e4] flex items-center gap-2">
          <PanelTopOpen className="h-7 w-7" /> Painel de Chamadas Ativas
        </h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar chamada..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {filteredCalledDrivers.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          Nenhum motorista chamado no momento ou correspondente à busca.
        </p>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCalledDrivers.map((driver) => (
            <motion.div
              key={driver.id}
              variants={itemVariants}
              className="bg-gradient-to-br from-sky-50 to-cyan-50 p-5 rounded-lg shadow-md border border-sky-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-sky-700 flex items-center gap-2">
                  <User className="h-5 w-5" /> {driver.fullName}
                </h3>
                {canRemoveCalls && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1"
                    onClick={() => handleRemoveFromPanel(driver.id)}
                    title="Remover do Painel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><Car className="h-4 w-4 text-sky-600" /> <strong>Placa:</strong> {driver.vehiclePlate}</p>
                <p className="flex items-center gap-2"><Building className="h-4 w-4 text-sky-600" /> <strong>Transportadora:</strong> {driver.transporter}</p>
                {driver.callDestination && driver.callDestination !== "Não especificado" && (
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-600" /> <strong>Destino:</strong> {driver.callDestination}</p>
                )}
                <p className="flex items-start gap-2 pt-1">
                  <MessageSquare className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" /> 
                  <span className="flex-1"><strong>Mensagem:</strong> {driver.callMessage}</span>
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                  <Clock className="h-3 w-3" /> Chamado às: {driver.callTimestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
