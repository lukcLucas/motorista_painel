import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User, Phone, Car, Building, MapPin, Briefcase, Power, Search as SearchIcon } from 'lucide-react'; // KeyRound removido

const DetailItem = ({ icon, label, value, fullWidth = false, valueClassName = "" }) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
      {React.cloneElement(icon, { className: "h-3 w-3" })}
      {label}
    </Label>
    <p className={`text-sm text-gray-800 break-words ${valueClassName}`}>{value || "Não informado"}</p>
  </div>
);

export const ViewDriverModal = ({ isOpen, onOpenChange, driver, getServiceStatusDisplay }) => {
  if (!isOpen || !driver) return null;

  const getAvailabilityStatusDisplay = (status) => {
    switch (status) {
      case "online": return { text: "Online", color: "text-green-600", icon: <Power className="h-4 w-4 text-green-500" /> };
      case "offline": return { text: "Offline", color: "text-red-600", icon: <Power className="h-4 w-4 text-red-500" /> };
      case "busy": return { text: "Ocupado", color: "text-yellow-600", icon: <Power className="h-4 w-4 text-yellow-500" /> };
      default: return { text: "Desconhecido", color: "text-gray-500", icon: <Power className="h-4 w-4 text-gray-500" /> };
    }
  };

  const availabilityStatusDisplay = getAvailabilityStatusDisplay(driver.availabilityStatus);
  const serviceStatusDisplayInfo = getServiceStatusDisplay(driver.serviceStatus || "disponivel");


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SearchIcon className="h-6 w-6 text-[#00a0e4]" />
            Detalhes do Motorista
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="bg-gray-100 p-3 rounded-full">
              <User className="h-8 w-8 text-[#00a0e4]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{driver.fullName}</h3>
              <div className="flex space-x-3">
                <p className={`text-sm font-medium flex items-center gap-1 ${availabilityStatusDisplay.color}`}>
                  {availabilityStatusDisplay.icon} {availabilityStatusDisplay.text}
                </p>
                <p className={`text-sm font-medium flex items-center gap-1 ${serviceStatusDisplayInfo.color}`}>
                  {serviceStatusDisplayInfo.icon} {serviceStatusDisplayInfo.text}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            <DetailItem icon={<Phone />} label="Contato" value={driver.phone} />
            <DetailItem icon={<Car />} label="Placa Principal" value={driver.vehiclePlate} />
            <DetailItem icon={<Building />} label="Transportadora" value={driver.transporter} />
            <DetailItem icon={<Briefcase />} label="Cliente" value={driver.client} />
            <DetailItem icon={<MapPin />} label="Destino" value={driver.destination} />
            <DetailItem icon={<Briefcase />} label="Vendedor Responsável" value={driver.responsibleSeller} />
            {/* O campo de senha foi removido daqui */}
          </div>
        </div>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};