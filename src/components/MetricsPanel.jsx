import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, Truck, AlertTriangle as AlertTriangleIcon } from "lucide-react";

export function MetricsPanel() {
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [awaitingCall, setAwaitingCall] = useState(0);
  const [inServiceProgress, setInServiceProgress] = useState(0);
  const [driversAwaitingStatus, setDriversAwaitingStatus] = useState(0);

  useEffect(() => {
    const calculateMetrics = () => {
      const storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
      const calledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
      
      setTotalDrivers(storedDrivers.length);

      let awaitingCallCount = 0;
      let inServiceProgressCount = 0;
      let awaitingStatusCount = 0;

      storedDrivers.forEach(driver => {
        const isCalled = !!calledDrivers[driver.id];
        const isOnline = driver.availabilityStatus === 'online';
        const serviceStatus = driver.serviceStatus || 'disponivel';

        if (serviceStatus === 'aguardando') {
          awaitingStatusCount++;
        } else if (serviceStatus === 'em_servico' || serviceStatus === 'em_progresso') {
          inServiceProgressCount++;
        } else if (isOnline && !isCalled && serviceStatus === 'disponivel') {
          awaitingCallCount++;
        }
      });
      
      setAwaitingCall(awaitingCallCount);
      setInServiceProgress(inServiceProgressCount);
      setDriversAwaitingStatus(awaitingStatusCount);
    };

    calculateMetrics();

    window.addEventListener('driversUpdated', calculateMetrics);
    window.addEventListener('driverCalled', calculateMetrics);
    window.addEventListener('serviceStatusUpdated', calculateMetrics);

    return () => {
      window.removeEventListener('driversUpdated', calculateMetrics);
      window.removeEventListener('driverCalled', calculateMetrics);
      window.removeEventListener('serviceStatusUpdated', calculateMetrics);
    };
  }, []);


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📊</span> Métricas Operacionais
        </h2>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
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

        <motion.div variants={item} className="metric-card metric-card-yellow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Motoristas Aguardando</h3>
            <AlertTriangleIcon className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{driversAwaitingStatus}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}