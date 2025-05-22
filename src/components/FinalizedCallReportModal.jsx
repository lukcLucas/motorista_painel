import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Car, Building, MessageSquare, MapPin, Clock, History, RotateCcw, Anchor } from 'lucide-react';

export function FinalizedCallReportModal({ isOpen, onOpenChange, call, canReopen, onReopen }) {
  if (!isOpen || !call) return null;

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const detailItem = (IconComponent, label, value) => (
    <div className="flex items-start space-x-3 py-2.5 border-b border-gray-100 last:border-b-0">
      <IconComponent className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 font-medium break-words">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-purple-600">
            <History className="h-6 w-6" /> Relatório da Chamada Finalizada
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {detailItem(User, "Motorista", call.fullName)}
          {detailItem(Car, "Placa", call.vehiclePlate)}
          {detailItem(Building, "Transportadora", call.transporter)}
          {detailItem(MapPin, "Destino da Chamada", call.callDestination)}
          {detailItem(Anchor, "Doca da Chamada", call.dock)}
          {detailItem(MessageSquare, "Mensagem/Observações", call.callMessage)}
          {detailItem(Clock, "Horário da Chamada", formatDateTime(call.callTimestamp))}
          {detailItem(History, "Horário da Finalização", formatDateTime(call.finalizedTimestamp))}
        </div>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogClose>
          {canReopen && (
            <Button 
              type="button" 
              onClick={() => onReopen(call)} 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reabrir Chamada
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
