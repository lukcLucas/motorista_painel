import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users as UsersIcon, Truck, MapPin, Anchor } from 'lucide-react';

export const AssignRunModal = ({ 
  isOpen, 
  onOpenChange, 
  driver, 
  currentMessage, 
  onMessageChange, 
  onConfirm, 
  currentDestination, 
  onDestinationChange,
  currentDock,
  onDockChange
}) => {
  if (!isOpen || !driver) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Truck className="h-6 w-6 text-[#00a0e4]" />
            Atribuir Corrida para {driver.fullName}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
            <UsersIcon className="h-5 w-5 text-gray-600" />
            <p className="text-md font-medium text-gray-800">{driver.fullName}</p>
          </div>
          <div>
            <Label htmlFor="runDestination" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Destino da Corrida:
            </Label>
            <Input
              id="runDestination"
              value={currentDestination}
              onChange={(e) => onDestinationChange(e.target.value)}
              placeholder="Ex: Cliente XPTO, Rua ABC, 123"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="runDock" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Anchor className="h-4 w-4" /> Doca (Opcional):
            </Label>
            <Input
              id="runDock"
              value={currentDock}
              onChange={(e) => onDockChange(e.target.value)}
              placeholder="Ex: Doca 7B"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="runMessage" className="text-sm font-medium text-gray-700">
              Mensagem/Observações:
            </Label>
            <Textarea
              id="runMessage"
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Digite detalhes ou observações para a corrida..."
              className="mt-1 min-h-[100px]"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={onConfirm}
            className="bg-[#00a0e4] hover:bg-[#007ab3]"
          >
            Confirmar Atribuição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
