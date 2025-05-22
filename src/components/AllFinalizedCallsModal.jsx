import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FinalizedCallReportModal } from '@/components/FinalizedCallReportModal';
import { ListChecks, User, Car, Clock, Search, FileText, Anchor } from 'lucide-react';

export function AllFinalizedCallsModal({ isOpen, onOpenChange, userRole, canReopenCalls, logAction, onCallReopened }) {
  const [finalizedCalls, setFinalizedCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCallForReport, setSelectedCallForReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchFinalizedCalls = useCallback(() => {
    const storedFinalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    const allDrivers = JSON.parse(localStorage.getItem("drivers")) || [];

    const calls = Object.entries(storedFinalizedCalls)
      .map(([driverId, callInfo]) => {
        const driver = allDrivers.find(d => d.id === driverId);
        if (driver) {
          return {
            ...driver, 
            callId: callInfo.callId,
            driverId: driver.id,
            callMessage: callInfo.message,
            callTimestamp: callInfo.timestamp,
            callDestination: callInfo.destination,
            dock: callInfo.dock,
            finalizedTimestamp: callInfo.finalizedTimestamp,
            status: "finalized"
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.finalizedTimestamp) - new Date(a.finalizedTimestamp));
    setFinalizedCalls(calls);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFinalizedCalls();
    }
    window.addEventListener('callFinalized', fetchFinalizedCalls);
    window.addEventListener('callReopened', fetchFinalizedCalls);
    return () => {
      window.removeEventListener('callFinalized', fetchFinalizedCalls);
      window.removeEventListener('callReopened', fetchFinalizedCalls);
    };
  }, [isOpen, fetchFinalizedCalls]);

  const handleReopenCall = (callToReopen) => {
    const storedFinalizedCalls = JSON.parse(localStorage.getItem("finalizedCalls")) || {};
    const callData = storedFinalizedCalls[callToReopen.driverId];

    if (!callData || callData.callId !== callToReopen.callId) {
      console.error("Call to reopen not found in finalized calls or callId mismatch.");
      return;
    }
    
    delete storedFinalizedCalls[callToReopen.driverId];
    localStorage.setItem("finalizedCalls", JSON.stringify(storedFinalizedCalls));

    const storedCalledDrivers = JSON.parse(localStorage.getItem("calledDrivers")) || {};
    storedCalledDrivers[callToReopen.callId] = { ...callData, finalizedTimestamp: null };
    localStorage.setItem("calledDrivers", JSON.stringify(storedCalledDrivers));

    logAction("Reabrir Chamada (Métricas)", userRole, `Chamada ${callToReopen.callId} do motorista ${callToReopen.fullName} reaberta.`);
    
    fetchFinalizedCalls(); 
    setIsReportModalOpen(false);
    if (onCallReopened) onCallReopened(); 
    window.dispatchEvent(new CustomEvent('callReopened', { detail: { callId: callToReopen.callId, driverId: callToReopen.driverId } }));
  };

  const openReport = (call) => {
    setSelectedCallForReport(call);
    setIsReportModalOpen(true);
  };

  const filteredCalls = finalizedCalls.filter(call =>
    call.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.callDestination && call.callDestination.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (call.dock && call.dock.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (call.callId && call.callId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-purple-600">
              <ListChecks className="h-6 w-6" /> Todas as Chamadas Finalizadas ({filteredCalls.length})
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar em chamadas finalizadas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <ScrollArea className="h-[50vh] pr-3">
              {filteredCalls.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhuma chamada finalizada encontrada.</p>
              ) : (
                <ul className="space-y-3">
                  {filteredCalls.map(call => (
                    <li key={call.callId} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800 flex items-center gap-1.5"><User className="h-4 w-4 text-blue-500" /> {call.fullName}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1.5"><Car className="h-4 w-4" /> {call.vehiclePlate}</p>
                          {call.dock && <p className="text-xs text-gray-600 flex items-center gap-1.5"><Anchor className="h-4 w-4" /> Doca: {call.dock}</p>}
                          <p className="text-xs text-gray-500 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Finalizada em: {formatDateTime(call.finalizedTimestamp)}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openReport(call)} className="flex items-center gap-1">
                          <FileText className="h-4 w-4" /> Relatório
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCallForReport && (
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
