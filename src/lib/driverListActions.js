export const handleDeleteDriverAction = (driverId, { drivers, calledDrivers, fetchDriversData, toast, logAction, userRole, canDeleteDrivers }) => {
  if (!canDeleteDrivers) {
    toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para excluir motoristas." });
    return;
  }
  const driverToDelete = drivers.find(d => d.id === driverId);
  if (window.confirm("Tem certeza que deseja excluir este motorista?")) {
    const updatedDrivers = drivers.filter(driver => driver.id !== driverId);
    localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
    
    const updatedCalledDrivers = { ...calledDrivers };
    // If calledDrivers stores by driverId, this is fine. If by callId, needs adjustment.
    // For multiple calls per driver, this needs to iterate and remove all calls for this driverId.
    // Assuming calledDrivers keys are unique call IDs and each object has a driverId property:
    const activeCalls = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    const filteredActiveCalls = Object.entries(activeCalls)
      .filter(([_, callInfo]) => callInfo.driverId !== driverId)
      .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {});
    localStorage.setItem("calledDrivers", JSON.stringify(filteredActiveCalls));
    
    const finalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    // Finalized calls are keyed by driverId in current logic, so this is simpler
    delete finalizedCalls[driverId]; 
    localStorage.setItem("finalizedCalls", JSON.stringify(finalizedCalls));

    fetchDriversData(); 
    window.dispatchEvent(new CustomEvent('driversUpdated'));
    logAction("Excluir Motorista", userRole, `Motorista ${driverToDelete?.fullName || driverId} excluído.`);
    toast({
      title: "Motorista Excluído",
      description: "O motorista foi removido com sucesso.",
    });
  }
};

export const openCallModalAction = (driver, { toast, setActiveTab, setCurrentDriverToCall, setCallMessage, setIsCallModalOpen, canCallDrivers }) => {
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

  // This logic might need adjustment if a driver can have multiple active calls.
  // The current `calledDrivers[driver.id]` check assumes one active call per driver.
  // For the "Corridas" tab, this check is bypassed. For "Motoristas" tab, it might still be relevant.
  // For now, let's assume this function is for the "Motoristas" tab where one active call is the norm.
  const calledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
  const activeDriverCalls = Object.values(calledDrivers).filter(call => call.driverId === driver.id);

  const finalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
  if (finalizedCalls[driver.id]) { // Check if there's ANY finalized call for this driver
    toast({
      variant: "default",
      title: "Chamada Finalizada",
      description: `Este motorista tem uma chamada finalizada. Verifique o painel para detalhes.`,
    });
    if (setActiveTab) setActiveTab("painel_motorista");
    return;
  }
  
  if (activeDriverCalls.length > 0) { // Check if there's ANY active call for this driver
      toast({
          variant: "default",
          title: "Motorista Já Chamado",
          description: `${driver.fullName} já está no painel de chamadas.`,
      });
      if (setActiveTab) setActiveTab("painel_motorista");
      return;
  }

  setCurrentDriverToCall(driver);
  setCallMessage(`Motorista ${driver.fullName}, por favor, dirija-se ao local designado.`);
  setIsCallModalOpen(true);
};

export const confirmCallDriverAction = (currentDriverToCall, callMessage, { calledDrivers, fetchDriversData, toast, logAction, userRole, setActiveTab, setIsCallModalOpen, setCurrentDriverToCall, setCallMessage: resetCallMsgInput }) => {
  if (!currentDriverToCall || !callMessage.trim()) {
      toast({
          variant: "destructive",
          title: "Erro na Chamada",
          description: "Motorista ou mensagem inválida.",
      });
      return;
  }
  const callId = `call_${Date.now()}_${currentDriverToCall.id}_${Math.random().toString(36).substring(2, 7)}`;
  const newCalledDrivers = { ...calledDrivers }; // This should be the full `calledDrivers` object from localStorage
  
  const allCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
  allCalledDrivers[callId] = { 
    driverId: currentDriverToCall.id,
    callId: callId,
    message: callMessage, 
    timestamp: new Date().toISOString(),
    destination: currentDriverToCall.destination || "Não especificado",
    password: currentDriverToCall.password || "" 
  };
  localStorage.setItem("calledDrivers", JSON.stringify(allCalledDrivers));
  
  logAction("Chamar Motorista", userRole, `Motorista ${currentDriverToCall.fullName} chamado. Destino: ${currentDriverToCall.destination || "Não especificado"}`);
  toast({
    title: "Motorista Chamado!",
    description: `${currentDriverToCall.fullName} foi chamado para o painel. Destino: ${currentDriverToCall.destination || "Não especificado"}.`,
  });
  window.dispatchEvent(new CustomEvent('driverCalled', { detail: { driverId: currentDriverToCall.id, callId: callId, message: callMessage, destination: currentDriverToCall.destination, password: currentDriverToCall.password } }));
  setIsCallModalOpen(false);
  setCurrentDriverToCall(null);
  resetCallMsgInput("");
  fetchDriversData();
  if (setActiveTab) {
      setActiveTab("painel_motorista");
  }
};

export const openEditModalAction = (driver, { toast, setCurrentDriverToEdit, setIsEditModalOpen, canEditDrivers }) => {
  if (!canEditDrivers) {
    toast({ variant: "destructive", title: "Acesso Negado", description: "Você não tem permissão para editar motoristas." });
    return;
  }
  setCurrentDriverToEdit(driver);
  setIsEditModalOpen(true);
};

export const handleSaveDriverAction = (updatedDriver, { drivers, fetchDriversData, toast, logAction, userRole, setIsEditModalOpen }) => {
  const storedDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
  const updatedDriversList = storedDrivers.map(d => d.id === updatedDriver.id ? updatedDriver : d);
  localStorage.setItem("drivers", JSON.stringify(updatedDriversList));
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

export const openViewModalAction = (driver, { setCurrentDriverToView, setIsViewModalOpen }) => {
  setCurrentDriverToView(driver);
  setIsViewModalOpen(true);
};