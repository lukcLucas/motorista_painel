
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, User, Phone, Car, Building, MapPin, KeyRound, Briefcase, CheckCircle, AlertTriangle } from 'lucide-react';

export function DriverRegistrationForm({ onRegistrationSuccess, logAction, userRole }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    phone: '',
    vehiclePlate: '',
    transporter: '',
    destination: '',
    password: '',
    client: '',
    responsibleSeller: '',
    availabilityStatus: 'online',
    serviceStatus: 'disponivel'
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório.';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório.';
    else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Telefone inválido (use 10 ou 11 dígitos).';
    if (!formData.vehiclePlate.trim()) newErrors.vehiclePlate = 'Placa do veículo é obrigatória.';
    if (formData.password && !/^\d{3}$/.test(formData.password)) newErrors.password = 'Senha deve ter 3 dígitos numéricos.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, corrija os campos destacados.",
      });
      return;
    }

    const newDriver = { ...formData, id: formData.id || `driver_${Date.now()}` };
    const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    
    const existingDriverIndex = drivers.findIndex(driver => driver.id === newDriver.id);

    if (existingDriverIndex !== -1) {
      drivers[existingDriverIndex] = newDriver;
    } else {
      drivers.push(newDriver);
    }

    localStorage.setItem('drivers', JSON.stringify(drivers));
    
    logAction("Cadastrar Motorista", userRole, `Novo motorista ${newDriver.fullName} cadastrado.`);

    toast({
      title: "Sucesso!",
      description: `Motorista ${newDriver.fullName} ${existingDriverIndex !== -1 ? 'atualizado' : 'cadastrado'} com sucesso.`,
      action: <CheckCircle className="text-green-500" />,
    });
    
    setFormData({ 
      id: '', 
      fullName: '', 
      phone: '', 
      vehiclePlate: '', 
      transporter: '', 
      destination: '', 
      password: '', 
      client: '', 
      responsibleSeller: '',
      availabilityStatus: 'online',
      serviceStatus: 'disponivel'
    });
    setErrors({});
    if (onRegistrationSuccess) onRegistrationSuccess();
    window.dispatchEvent(new CustomEvent('driversUpdated'));
  };

  const inputFields = [
    { name: "fullName", label: "Nome Completo", placeholder: "Ex: João da Silva", icon: <User className="h-4 w-4 text-gray-400" /> },
    { name: "phone", label: "Telefone", placeholder: "Ex: 11999998888", icon: <Phone className="h-4 w-4 text-gray-400" /> },
    { name: "vehiclePlate", label: "Placa do Veículo", placeholder: "Ex: BRA2E19", icon: <Car className="h-4 w-4 text-gray-400" /> },
    { name: "transporter", label: "Transportadora", placeholder: "Ex: Transportes Rápidos Ltda", icon: <Building className="h-4 w-4 text-gray-400" /> },
    { name: "destination", label: "Destino Principal", placeholder: "Ex: Centro de Distribuição SP", icon: <MapPin className="h-4 w-4 text-gray-400" /> },
    { name: "password", label: "Senha (3 dígitos numéricos)", placeholder: "Ex: 123", icon: <KeyRound className="h-4 w-4 text-gray-400" />, type: "password", maxLength: 3 },
    { name: "client", label: "Cliente Associado", placeholder: "Ex: Empresa XYZ", icon: <Briefcase className="h-4 w-4 text-gray-400" /> },
    { name: "responsibleSeller", label: "Vendedor Responsável", placeholder: "Ex: Maria Souza", icon: <User className="h-4 w-4 text-gray-400" /> },
  ];

  return (
    <motion.div 
      className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <UserPlus className="mx-auto h-12 w-12 text-[#00a0e4]" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Cadastro de Novo Motorista</h2>
        <p className="mt-1 text-sm text-gray-500">Preencha os dados abaixo para registrar um novo motorista.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputFields.map(field => (
            <div key={field.name} className="space-y-1">
              <Label htmlFor={field.name} className="text-sm font-medium text-gray-700 flex items-center">
                {field.icon && React.cloneElement(field.icon, { className: "mr-2 h-4 w-4 text-gray-500"})}
                {field.label}
              </Label>
              <div className="relative">
                <Input
                  type={field.type || "text"}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  className={`w-full ${errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#00a0e4] focus:ring-[#00a0e4]'}`}
                />
              </div>
              {errors[field.name] && <p className="text-xs text-red-600 flex items-center mt-1"><AlertTriangle className="h-3 w-3 mr-1"/>{errors[field.name]}</p>}
            </div>
          ))}

          <div className="space-y-1">
            <Label htmlFor="availabilityStatus" className="text-sm font-medium text-gray-700 flex items-center">
              <User className="mr-2 h-4 w-4 text-gray-500" /> Status de Disponibilidade
            </Label>
            <Select name="availabilityStatus" value={formData.availabilityStatus} onValueChange={(value) => handleSelectChange("availabilityStatus", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="busy">Ocupado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="serviceStatus" className="text-sm font-medium text-gray-700 flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-gray-500" /> Situação de Serviço
            </Label>
            <Select name="serviceStatus" value={formData.serviceStatus} onValueChange={(value) => handleSelectChange("serviceStatus", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a situação" />
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

        <div className="pt-4">
          <Button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
            <CheckCircle className="h-5 w-5" />
            Cadastrar Motorista
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
