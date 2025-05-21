import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, Power, Briefcase, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const EditDriverModal = ({ isOpen, onOpenChange, driver, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (driver) {
      setFormData({ ...driver, serviceStatus: driver.serviceStatus || "disponivel" });
    } else {
      setFormData(null);
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData) return;

    const requiredFields = ["fullName", "phone", "vehiclePlate", "transporter", "responsibleSeller"];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Campos Obrigatórios",
        description: `Por favor, preencha os seguintes campos: ${missingFields.join(", ")}.`,
      });
      return;
    }
    onSave(formData);
  };

  if (!isOpen || !formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-6 w-6 text-[#00a0e4]" />
            Editar Motorista: {driver.fullName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="edit-fullName">Nome Completo <span className="text-red-500">*</span></Label>
              <Input type="text" name="fullName" id="edit-fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-phone">Contato <span className="text-red-500">*</span></Label>
              <Input type="tel" name="phone" id="edit-phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-vehiclePlate">Placa <span className="text-red-500">*</span></Label>
              <Input type="text" name="vehiclePlate" id="edit-vehiclePlate" value={formData.vehiclePlate} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-transporter">Transportadora <span className="text-red-500">*</span></Label>
              <Input type="text" name="transporter" id="edit-transporter" value={formData.transporter} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-client">Cliente</Label>
              <Input type="text" name="client" id="edit-client" value={formData.client} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-destination">Destino</Label>
              <Input type="text" name="destination" id="edit-destination" value={formData.destination} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-password">Senha (3 dígitos)</Label>
              <Input type="password" name="password" id="edit-password" maxLength="3" value={formData.password} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-responsibleSeller">Vendedor Responsável <span className="text-red-500">*</span></Label>
              <Input type="text" name="responsibleSeller" id="edit-responsibleSeller" value={formData.responsibleSeller} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-availabilityStatus">Status de Disponibilidade</Label>
              <Select name="availabilityStatus" value={formData.availabilityStatus} onValueChange={(value) => handleSelectChange("availabilityStatus", value)}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Power className="h-4 w-4" />
                    <SelectValue placeholder="Selecione o status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="busy">Ocupado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-serviceStatus">Situação de Serviço</Label>
              <Select name="serviceStatus" value={formData.serviceStatus} onValueChange={(value) => handleSelectChange("serviceStatus", value)}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    {formData.serviceStatus === 'aguardando' ? <AlertTriangle className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                    <SelectValue placeholder="Selecione a situação" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em_servico">Em Serviço</SelectItem>
                  <SelectItem value="em_progresso">Em Progresso</SelectItem>
                  <SelectItem value="aguardando">Aguardando</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-[#00a0e4] hover:bg-[#007ab3]">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};