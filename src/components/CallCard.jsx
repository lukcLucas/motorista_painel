import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { User, Car, Building, MessageSquare, MapPin, Clock, PowerOff, CheckCircle, AlertTriangle, History, FileText, Anchor } from 'lucide-react';

export function CallCard({ call, onAction, actionType, userRole }) {
  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const getStatusColor = () => {
    if (call.status === "finalized") return "border-l-4 border-purple-500";
    if (call.availabilityStatus === "online") return "border-l-4 border-green-500";
    if (call.availabilityStatus === "busy") return "border-l-4 border-yellow-500";
    if (call.availabilityStatus === "offline") return "border-l-4 border-red-500";
    return "border-l-4 border-gray-300";
  };

  const ActionButton = () => {
    if (!onAction) return null;

    if (actionType === "finalize" && call.status === "active") {
      return (
        <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-red-600 hover:text-red-800 border-red-500 hover:bg-red-50 flex items-center gap-1"
            onClick={() => onAction(call)}
            disabled={userRole === 'motorista'}
        >
          <PowerOff className="h-4 w-4" /> Finalizar Chamada
        </Button>
      );
    }
    if (actionType === "report" && call.status === "finalized") {
      return (
        <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-blue-600 hover:text-blue-800 border-blue-500 hover:bg-blue-50 flex items-center gap-1"
            onClick={() => onAction(call)}
            disabled={userRole === 'motorista'}
        >
          <FileText className="h-4 w-4" /> Ver Relatório
        </Button>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between transition-all hover:shadow-xl ${getStatusColor()}`}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {call.fullName}
          </h3>
          {call.status === "finalized" && <CheckCircle className="h-5 w-5 text-purple-500" title="Finalizada" />}
          {call.status === "active" && <AlertTriangle className="h-5 w-5 text-orange-500" title="Ativa"/>}

        </div>
        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Car className="h-4 w-4" /> {call.vehiclePlate}</p>
        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Building className="h-4 w-4" /> {call.transporter}</p>
        
        {call.callDestination && call.callDestination !== "Não especificado" && (
           <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {call.callDestination}</p>
        )}
        {call.dock && (
           <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Anchor className="h-4 w-4" /> {call.dock}</p>
        )}

        <div className="my-3 p-2 bg-slate-50 rounded">
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-blue-500" /> Mensagem:</p>
            <p className="text-sm text-gray-700 break-words">{call.callMessage || "Nenhuma mensagem."}</p>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> 
            Chamado em: {formatDateTime(call.callTimestamp)}
        </p>
        {call.finalizedTimestamp && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <History className="h-4 w-4" /> 
                Finalizado em: {formatDateTime(call.finalizedTimestamp)}
            </p>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <ActionButton />
      </div>
    </motion.div>
  );
}