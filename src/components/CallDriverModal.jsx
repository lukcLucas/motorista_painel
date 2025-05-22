import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, MessageSquare, MapPin } from 'lucide-react'; // KeyRound removido

export const CallDriverModal = ({ isOpen, onOpenChange, driver, currentMessage, onMessageChange, onConfirm }) => {
  if (!isOpen || !driver) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-6 w-6 text-[#00a0e4]" />
            Chamar Motorista
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
            <User className="h-5 w-5 text-gray-600" />
            <p className="text-md font-medium text-gray-800">{driver.fullName}</p>
          </div>
          {driver.destination && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <p className="text-gray-700"><strong>Destino:</strong> {driver.destination}</p>
            </div>
          )}
          {/* Senha do motorista removida da exibição aqui */}
          <div>
            <Label htmlFor="callMessage" className="text-sm font-medium text-gray-700">
              Mensagem da Chamada:
            </Label>
            <Textarea
              id="callMessage"
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Digite a mensagem para o motorista..."
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
            Confirmar Chamada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};