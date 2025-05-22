import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, Truck, CheckSquare, ListChecks } from "lucide-react";
import { AllFinalizedCallsModal } from "@/components/AllFinalizedCallsModal";
import { FinalizedCallReportModal } from "@/components/FinalizedCallReportModal";

export function MetricsPanel({ userRole, canReopenCalls, logAction }) {
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [awaitingCall, setAwaitingCall] = useState(0);
  const [inServiceProgress, setInServiceProgress] = useState(0);
  const [finalizedCallsCount, setFinalizedCallsCount] = useState(0);

  const [isAllFinalizedModalOpen, setIsAllFinalizedModalOpen] = useState(false);
  const [isSingleReportModalOpen, setIsSingleReportModalOpen] = useState(false);
  const [selectedCallForSingleReport, setSelectedCallForSingleReport] = useState(null);
  const [allFinalizedCallsData, setAllFinalizedCallsData] = useState([]);

  useEffect(() => {
    const calculateMetrics = () => {
      const storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
      const calledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
      const storedFinalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
      
      setTotalDrivers(storedDrivers.length);
      setFinalizedCallsCount(Object.keys(storedFinalizedCalls).length);

      let awaitingCallCount = 0;
      let inServiceProgressCount = 0;

      storedDrivers.forEach(driver => {
        const isCalled = !!calledDrivers[driver.id];
        const isOnline = driver.availabilityStatus === 'online';
        const serviceStatus = driver.serviceStatus || 'disponivel';

        if (serviceStatus === 'em_servico' || serviceStatus === 'em_progresso') {
          inServiceProgressCount++;
        } else if (isOnline && !isCalled && serviceStatus === 'disponivel' && !storedFinalizedCalls[driver.id]) {
          awaitingCallCount++;
        }
      });
      
      setAwaitingCall(awaitingCallCount);
      setInServiceProgress(inServiceProgressCount);

      const finalizedCallDetails = Object.entries(storedFinalizedCalls).map(([driverId, callInfo]) => {
        const driver = storedDrivers.find(d => d.id === driverId);
        return driver ? { ...driver, ...callInfo, callId: callInfo.callId || driverId } : null;
      }).filter(Boolean).sort((a, b) => new Date(b.finalizedTimestamp) - new Date(a.finalizedTimestamp));
      setAllFinalizedCallsData(finalizedCallDetails);
    };

    calculateMetrics();

    window.addEventListener('driversUpdated', calculateMetrics);
    window.addEventListener('driverCalled', calculateMetrics);
    window.addEventListener('serviceStatusUpdated', calculateMetrics);
    window.addEventListener('callFinalized', calculateMetrics);
    window.addEventListener('callReopened', calculateMetrics);

    return () => {
      window.removeEventListener('driversUpdated', calculateMetrics);
      window.removeEventListener('driverCalled', calculateMetrics);
      window.removeEventListener('serviceStatusUpdated', calculateMetrics);
      window.removeEventListener('callFinalized', calculateMetrics);
      window.removeEventListener('callReopened', calculateMetrics);
    };
  }, []);

  const handleOpenAllFinalizedModal = () => {
    setIsAllFinalizedModalOpen(true);
  };

  const handleOpenSingleReportModal = (call) => {
    setSelectedCallForSingleReport(call);
    setIsAllFinalizedModalOpen(false); 
    setIsSingleReportModalOpen(true);
  };
  
  const handleReopenCallFromReport = (call) => {
    const storedFinalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    const callToReopen = storedFinalizedCalls[call.id];
    delete storedFinalizedCalls[call.id];
    localStorage.setItem("finalizedCalls", JSON.stringify(storedFinalizedCalls));

    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    storedCalledDrivers[call.id] = { ...callToReopen, finalizedTimestamp: null };
    localStorage.setItem("calledDrivers", JSON.stringify(storedCalledDrivers));

    window.dispatchEvent(new CustomEvent('callReopened', { detail: { callId: call.callId } }));
    logAction("Reabrir Chamada", userRole, `Chamada do motorista ${call.fullName} reaberta a partir do relatório.`);
    
    setIsSingleReportModalOpen(false);
  };


  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <>
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span> Métricas Operacionais
          </h2>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="metric-card metric-card-blue">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Total de Motoristas</h3>
              <Users className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{totalDrivers}</p>
          </motion.div>

          <motion.div variants={item} className="metric-card metric-card-orange">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Aguardando Chamada</h3>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{awaitingCall}</p>
          </motion.div>

          <motion.div variants={item} className="metric-card metric-card-purple">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Em Serviço/Progresso</h3>
              <Truck className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{inServiceProgress}</p>
          </motion.div>

          <motion.div 
            variants={item} 
            className="metric-card metric-card-green cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleOpenAllFinalizedModal}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chamadas Finalizadas</h3>
              <ListChecks className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{finalizedCallsCount}</p>
          </motion.div>
        </motion.div>
      </div>
      <AllFinalizedCallsModal
        isOpen={isAllFinalizedModalOpen}
        onOpenChange={setIsAllFinalizedModalOpen}
        finalizedCalls={allFinalizedCallsData}
        onViewReport={handleOpenSingleReportModal}
      />
      {selectedCallForSingleReport && (
        <FinalizedCallReportModal
          isOpen={isSingleReportModalOpen}
          onOpenChange={(isOpen) => {
            setIsSingleReportModalOpen(isOpen);
            if (!isOpen) setSelectedCallForSingleReport(null); 
          }}
          call={selectedCallForSingleReport}
          canReopen={canReopenCalls}
          onReopen={handleReopenCallFromReport}
        />
      )}
    </>
  );
}