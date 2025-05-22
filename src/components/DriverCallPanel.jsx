import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { PanelTopOpen, Search, ListChecks } from "lucide-react";
import { FinalizedCallReportModal } from "@/components/FinalizedCallReportModal";
import { CallCard } from "@/components/CallCard";

export function DriverCallPanel({ userRole, canFinalizeCalls, canReopenCalls, logAction }) {
  const { toast } = useToast();
  const [activeCalls, setActiveCalls] = useState([]);
  const [finalizedCallsData, setFinalizedCallsData] = useState([]);
  const [searchTermActive, setSearchTermActive] = useState("");
  const [searchTermFinalized, setSearchTermFinalized] = useState("");
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedCallForReport, setSelectedCallForReport] = useState(null);

  const fetchCalls = useCallback(() => {
    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    const storedFinalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    const allDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
    const loggedInDriver = allDrivers.find(d => d.password === localStorage.getItem("loggedInUserPassword"));


    const mapCallData = (callStorage, isFinalizedStorage) => {
      return Object.entries(callStorage)
        .map(([callId, callInfo]) => {
          const driverIdToFind = isFinalizedStorage ? callInfo.driverId : callInfo.driverId;
          const driver = allDrivers.find(d => d.id === driverIdToFind);
          
          if (driver) {
            if (userRole === 'motorista' && loggedInDriver && driver.id !== loggedInDriver.id) {
              return null; 
            }
            return {
              ...driver,
              callId: callInfo.callId || callId,
              driverId: driver.id,
              callMessage: callInfo.message,
              callTimestamp: callInfo.timestamp,
              callDestination: callInfo.destination,
              dock: callInfo.dock, 
              finalizedTimestamp: callInfo.finalizedTimestamp,
              status: isFinalizedStorage ? "finalized" : "active"
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.callTimestamp) - new Date(a.callTimestamp));
    };
    
    setActiveCalls(mapCallData(storedCalledDrivers, false));
    if (userRole !== 'motorista') {
      setFinalizedCallsData(mapCallData(storedFinalizedCalls, true));
    } else {
      setFinalizedCallsData([]); 
    }
  }, [userRole]);


  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 3000); 
    const events = ['driverCalled', 'callFinalized', 'callReopened', 'driversUpdated', 'runAssigned'];
    events.forEach(event => window.addEventListener(event, fetchCalls));
    return () => {
      clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, fetchCalls));
    };
  }, [fetchCalls]);

  const handleFinalizeCall = (call) => {
    if (!canFinalizeCalls) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para finalizar chamadas." });
      return;
    }

    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    const callToFinalize = storedCalledDrivers[call.callId];
    
    if (!callToFinalize) {
      toast({ variant: "destructive", title: "Erro", description: "Chamada não encontrada para finalizar." });
      return;
    }

    delete storedCalledDrivers[call.callId];
    localStorage.setItem("calledDrivers", JSON.stringify(storedCalledDrivers));

    const storedFinalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    storedFinalizedCalls[call.callId] = { 
      ...callToFinalize, 
      driverId: call.driverId, 
      finalizedTimestamp: new Date().toISOString() 
    };
    localStorage.setItem("finalizedCalls", JSON.stringify(storedFinalizedCalls));
    
    fetchCalls();
    window.dispatchEvent(new CustomEvent('callFinalized', { detail: { callId: call.callId, driverId: call.driverId } }));
    logAction("Finalizar Chamada", userRole, `Chamada ${call.callId} do motorista ${call.fullName} finalizada.`);
    toast({
      title: "Chamada Finalizada",
      description: `A chamada ${call.callId} do motorista ${call.fullName} foi finalizada.`,
    });
  };

  const handleReopenCall = (call) => {
    if (!canReopenCalls) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para reabrir chamadas."});
      return;
    }
    
    const storedFinalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    const callToReopen = storedFinalizedCalls[call.callId]; 
    
    if (!callToReopen) {
        toast({ variant: "destructive", title: "Erro", description: "Chamada finalizada não encontrada para reabrir." });
        return;
    }

    delete storedFinalizedCalls[call.callId];
    localStorage.setItem("finalizedCalls", JSON.stringify(storedFinalizedCalls));

    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    storedCalledDrivers[call.callId] = { ...callToReopen, finalizedTimestamp: null }; 
    localStorage.setItem("calledDrivers", JSON.stringify(storedCalledDrivers));

    fetchCalls();
    window.dispatchEvent(new CustomEvent('callReopened', { detail: { callId: call.callId, driverId: call.driverId } }));
    logAction("Reabrir Chamada", userRole, `Chamada ${call.callId} do motorista ${call.fullName} reaberta.`);
    toast({
      title: "Chamada Reaberta",
      description: `A chamada ${call.callId} do motorista ${call.fullName} foi movida para ativas.`,
    });
    setIsReportModalOpen(false);
  };


  const openReportModal = (call) => {
    if (userRole === 'motorista') return; 
    setSelectedCallForReport(call);
    setIsReportModalOpen(true);
  };

  const filterCalls = (calls, term) => {
    if (!term) return calls;
    return calls.filter(call =>
      call.fullName.toLowerCase().includes(term.toLowerCase()) ||
      call.vehiclePlate.toLowerCase().includes(term.toLowerCase()) ||
      (call.callDestination && call.callDestination.toLowerCase().includes(term.toLowerCase())) ||
      (call.dock && call.dock.toLowerCase().includes(term.toLowerCase())) ||
      (call.callMessage && call.callMessage.toLowerCase().includes(term.toLowerCase())) ||
      (call.callId && call.callId.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const filteredActiveCalls = filterCalls(activeCalls, searchTermActive);
  const filteredFinalizedCalls = userRole !== 'motorista' ? filterCalls(finalizedCallsData, searchTermFinalized) : [];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <>
      <motion.div
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-[#00a0e4] flex items-center gap-2">
              <PanelTopOpen className="h-6 w-6" /> Chamadas Ativas ({filteredActiveCalls.length})
            </h2>
            {userRole !== 'motorista' && (
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar em ativas..."
                  value={searchTermActive}
                  onChange={(e) => setSearchTermActive(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            )}
          </div>
          {filteredActiveCalls.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              {userRole === 'motorista' ? 'Nenhuma chamada ativa para você no momento.' : 'Nenhuma chamada ativa no momento ou correspondente à busca.'}
            </p>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
              {filteredActiveCalls.map((call) => (
                <CallCard 
                  key={call.callId}
                  call={call}
                  onAction={canFinalizeCalls && userRole !== 'motorista' ? handleFinalizeCall : null}
                  actionType="finalize"
                  userRole={userRole}
                />
              ))}
            </motion.div>
          )}
        </div>

        {userRole !== 'motorista' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <ListChecks className="h-6 w-6" /> Chamadas Finalizadas ({filteredFinalizedCalls.length})
              </h2>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar em finalizadas..."
                  value={searchTermFinalized}
                  onChange={(e) => setSearchTermFinalized(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
            {filteredFinalizedCalls.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Nenhuma chamada finalizada ainda ou correspondente à busca.</p>
            ) : (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
                {filteredFinalizedCalls.map((call) => (
                   <CallCard 
                    key={call.callId}
                    call={call}
                    onAction={openReportModal}
                    actionType="report"
                    userRole={userRole}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {selectedCallForReport && userRole !== 'motorista' && (
        <FinalizedCallReportModal
          isOpen={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          call={selectedCallForReport}
          canReopen={canReopenCalls}
          onReopen={handleReopenCall}
        />
      )}
    </>
  );
}