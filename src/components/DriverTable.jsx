import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Phone, Car, Building, Edit, Trash2, Power, PhoneCall, MessageSquare as MessageSquareEdit, Search as SearchIcon, Briefcase, AlertTriangle } from 'lucide-react';

export const DriverTable = ({ 
  drivers, 
  calledDrivers, 
  onCall, 
  onDelete, 
  onEdit, 
  onViewDetails, 
  getStatusColor, 
  getServiceStatusDisplay,
  canEditDrivers,
  canDeleteDrivers,
  canCallDrivers
}) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden md:table-cell">Telefone</TableHead>
          <TableHead>Placa</TableHead>
          <TableHead className="hidden lg:table-cell">Transportadora</TableHead>
          <TableHead>Disponibilidade</TableHead>
          <TableHead>Situação Serviço</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.map((driver) => {
          const serviceStatusInfo = getServiceStatusDisplay(driver.serviceStatus);
          return (
            <TableRow key={driver.id} className={calledDrivers[driver.id] ? "bg-blue-50" : ""}>
              <TableCell className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" /> {driver.fullName}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                 <Phone className="h-4 w-4 text-gray-500 inline mr-1" /> {driver.phone}
              </TableCell>
              <TableCell>
                <Car className="h-4 w-4 text-gray-500 inline mr-1" /> {driver.vehiclePlate}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Building className="h-4 w-4 text-gray-500 inline mr-1" /> {driver.transporter}
              </TableCell>
              <TableCell>
                <span className={`flex items-center gap-1 ${getStatusColor(driver.availabilityStatus)}`}>
                  <Power className="h-4 w-4" />
                  {driver.availabilityStatus.charAt(0).toUpperCase() + driver.availabilityStatus.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                <span className={`flex items-center gap-1 ${serviceStatusInfo.color}`}>
                  {serviceStatusInfo.icon}
                  {serviceStatusInfo.text}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-600 hover:text-purple-800" 
                    onClick={() => onViewDetails(driver)}
                    title="Visualizar"
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
                {canEditDrivers && (
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-cyan-600 hover:text-cyan-800" 
                      onClick={() => onEdit(driver)}
                      title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {canCallDrivers && (
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`
                        ${calledDrivers[driver.id] ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'}
                        ${(driver.availabilityStatus !== 'online' && driver.availabilityStatus !== 'busy') ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}
                      `}
                      onClick={() => onCall(driver)}
                      disabled={(driver.availabilityStatus !== 'online' && driver.availabilityStatus !== 'busy') && !calledDrivers[driver.id]}
                      title={calledDrivers[driver.id] ? "Ver no Painel" : ((driver.availabilityStatus !== 'online' && driver.availabilityStatus !== 'busy') ? "Indisponível para chamar" : "Chamar Motorista")}
                  >
                    {calledDrivers[driver.id] ? <PhoneCall className="h-4 w-4" /> : <MessageSquareEdit className="h-4 w-4" />}
                  </Button>
                )}
                {canDeleteDrivers && (
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-800" 
                      onClick={() => onDelete(driver.id)}
                      title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);