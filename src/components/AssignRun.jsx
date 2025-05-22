import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, Users as UsersIcon, Truck, Power, Anchor } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssignRunModal } from "@/components/AssignRunModal";

export function AssignRun({ setActiveTab, userRole, canAssignRuns, logAction }) {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentDriverToAssign, setCurrentDriverToAssign] = useState(null);
  const [runMessage, setRunMessage] = useState("");
  const [runDestination, setRunDestination] = useState("");
  const [runDock, setRunDock] = useState("");

  const fetchDriversData = useCallback(() => {
    const storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    setDrivers(storedDrivers);
  }, []);

  useEffect(() => {
    fetchDriversData();
    window.addEventListener('driversUpdated', fetchDriversData);
    window.addEventListener('runAssigned', fetchDriversData); 
    return () => {
      window.removeEventListener('driversUpdated', fetchDriversData);
      window.removeEventListener('runAssigned', fetchDriversData);
    };
  }, [fetchDriversData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.transporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.dock && driver.dock.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAssignModal = (driver) => {
    if (!canAssignRuns) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para atribuir corridas." });
      return;
    }
    if (driver.availabilityStatus === 'offline') {
      toast({
        variant: "destructive",
        title: "Motorista Offline",
        description: `${driver.fullName} está offline e não pode receber corridas.`,
      });
      return;
    }
    setCurrentDriverToAssign(driver);
    setRunMessage(`Corrida para ${driver.fullName}. Detalhes: `);
    setRunDestination(driver.destination || ""); 
    setRunDock(driver.dock || "");
    setIsAssignModalOpen(true);
  };

  const confirmAssignRun = () => {
    if (!currentDriverToAssign || !runDestination.trim()) {
        toast({
            variant: "destructive",
            title: "Erro na Atribuição",
            description: "Motorista ou destino inválido.",
        });
        return;
    }

    const callId = `call_${Date.now()}_${currentDriverToAssign.id}_${Math.random().toString(36).substring(2, 7)}`;
    const calledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    
    calledDrivers[callId] = { 
      driverId: currentDriverToAssign.id, 
      callId: callId,
      message: runMessage, 
      timestamp: new Date().toISOString(),
      destination: runDestination,
      dock: runDock, 
      password: currentDriverToAssign.password || "" 
    };
    localStorage.setItem("calledDrivers", JSON.stringify(calledDrivers));
    
    logAction("Atribuir Corrida", userRole, `Corrida atribuída ao motorista ${currentDriverToAssign.fullName}. Destino: ${runDestination}, Doca: ${runDock}`);
    toast({
      title: "Corrida Atribuída!",
      description: `Nova corrida para ${currentDriverToAssign.fullName} (Destino: ${runDestination}, Doca: ${runDock}) enviada para o painel.`,
    });
    
    window.dispatchEvent(new CustomEvent('runAssigned', { detail: { driverId: currentDriverToAssign.id, callId: callId, message: runMessage, destination: runDestination, dock: runDock } }));
    
    setIsAssignModalOpen(false);
    setCurrentDriverToAssign(null);
    setRunMessage("");
    setRunDestination("");
    setRunDock("");
    fetchDriversData(); 
    if (setActiveTab) {
        setActiveTab("painel_motorista");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "text-green-500";
      case "offline": return "text-red-500";
      case "busy": return "text-yellow-500";
      default: return "text-gray-500";
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
            <Truck className="h-7 w-7" /> Atribuir Novas Corridas
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
            {drivers.length === 0 ? "Nenhum motorista cadastrado para atribuir corridas." : "Nenhum motorista encontrado com os critérios de busca."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Placa</TableHead>
                  <TableHead className="hidden lg:table-cell">Doca</TableHead>
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-gray-500" /> {driver.fullName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Truck className="h-4 w-4 text-gray-500 inline mr-1" /> {driver.vehiclePlate}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Anchor className="h-4 w-4 text-gray-500 inline mr-1" /> {driver.dock || "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 ${getStatusColor(driver.availabilityStatus)}`}>
                        <Power className="h-4 w-4" />
                        {driver.availabilityStatus.charAt(0).toUpperCase() + driver.availabilityStatus.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {canAssignRuns && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-800 border-blue-500 hover:bg-blue-50"
                            onClick={() => openAssignModal(driver)}
                            disabled={driver.availabilityStatus === 'offline'}
                            title={driver.availabilityStatus === 'offline' ? "Motorista Offline" : "Atribuir Corrida"}
                        >
                          <Truck className="h-4 w-4 mr-1" /> Atribuir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {canAssignRuns && currentDriverToAssign && (
        <AssignRunModal
          isOpen={isAssignModalOpen}
          onOpenChange={setIsAssignModalOpen}
          driver={currentDriverToAssign}
          currentMessage={runMessage}
          onMessageChange={setRunMessage}
          currentDestination={runDestination}
          onDestinationChange={setRunDestination}
          currentDock={runDock}
          onDockChange={setRunDock}
          onConfirm={confirmAssignRun}
        />
      )}
    </>
  );
}
