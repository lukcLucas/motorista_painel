import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Phone, Car, Building, MapPin, KeyRound, Briefcase, Power, CheckSquare, AlertTriangle, Anchor } from 'lucide-react';

export const ViewDriverModal = ({ isOpen, onOpenChange, driver, getServiceStatusDisplay }) => {
  if (!isOpen || !driver) return null;

  const serviceStatusInfo = getServiceStatusDisplay(driver.serviceStatus, driver.id);

  const detailItem = (IconComponent, label, value) => (
    <div className="flex items-start space-x-2 py-2 border-b border-gray-100 last:border-b-0">
      <IconComponent className="h-5 w-5 text-gray-500 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#00a0e4]">
            <User className="h-6 w-6" /> Detalhes do Motorista
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {detailItem(User, "Nome Completo", driver.fullName)}
          {detailItem(Phone, "Telefone", driver.phone)}
          {detailItem(Car, "Placa do Veículo", driver.vehiclePlate)}
          {detailItem(Building, "Transportadora", driver.transporter)}
          {detailItem(MapPin, "Destino Principal", driver.destination)}
          {detailItem(Anchor, "Doca", driver.dock)}
          {detailItem(Briefcase, "Cliente Associado", driver.client)}
          {detailItem(User, "Vendedor Responsável", driver.responsibleSeller)}
          
          <div className="flex items-start space-x-2 py-2 border-b border-gray-100">
            <Power className={`h-5 w-5 mt-0.5 ${driver.availabilityStatus === 'online' ? 'text-green-500' : driver.availabilityStatus === 'busy' ? 'text-yellow-500' : 'text-red-500'}`} />
            <div>
              <p className="text-xs text-gray-500">Status de Disponibilidade</p>
              <p className="text-sm text-gray-800 font-medium capitalize">{driver.availabilityStatus}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2 py-2">
            {serviceStatusInfo.icon && React.cloneElement(serviceStatusInfo.icon, { className: `h-5 w-5 mt-0.5 ${serviceStatusInfo.color}` })}
            <div>
              <p className="text-xs text-gray-500">Situação de Serviço</p>
              <p className={`text-sm font-medium ${serviceStatusInfo.color}`}>{serviceStatusInfo.text}</p>
            </div>
          </div>
        </div>
        <DialogClose asChild>
          <Button type="button" variant="outline" className="w-full">
            Fechar
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
