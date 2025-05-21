
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { History, User, Clock, ShieldAlert, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ActionItem = ({ log }) => {
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'Login':
        return <User className="h-5 w-5 text-green-500" />;
      case 'Logout':
        return <User className="h-5 w-5 text-red-500" />;
      case 'Cadastrar Motorista':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'Editar Motorista':
        return <User className="h-5 w-5 text-yellow-500" />;
      case 'Excluir Motorista':
        return <User className="h-5 w-5 text-orange-500" />;
      case 'Chamar Motorista':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'Remover Chamada':
        return <User className="h-5 w-5 text-indigo-500" />;
      default:
        return <ShieldAlert className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
    >
      <div className="mr-3 pt-1">{getActionIcon(log.action)}</div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">{log.action}</span>
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(log.timestamp).toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Usuário: <span className="font-medium">{log.userRole?.toUpperCase()}</span>
        </p>
        <p className="text-sm text-gray-500 mt-0.5 break-all">Detalhes: {log.details}</p>
      </div>
    </motion.div>
  );
};

export function ActionHistory() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');

  const fetchHistory = useCallback(() => {
    const storedHistory = JSON.parse(localStorage.getItem("actionHistory")) || [];
    setHistory(storedHistory);
  }, []);

  useEffect(() => {
    fetchHistory();
    window.addEventListener('actionHistoryUpdated', fetchHistory);
    return () => {
      window.removeEventListener('actionHistoryUpdated', fetchHistory);
    };
  }, [fetchHistory]);

  const filteredHistory = history.filter(log => {
    const termMatch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (log.userRole && log.userRole.toLowerCase().includes(searchTerm.toLowerCase()));
    const roleMatch = filterRole === 'todos' || log.userRole === filterRole;
    return termMatch && roleMatch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      className="bg-white p-6 sm:p-8 rounded-lg shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-[#00a0e4] flex items-center gap-2">
          <History className="h-7 w-7" /> Histórico de Ações
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Buscar no histórico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Perfis</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="adm">ADM</SelectItem>
              <SelectItem value="motorista">Motorista</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          Nenhum registro de ação encontrado ou correspondente aos filtros.
        </p>
      ) : (
        <motion.div 
          className="border border-gray-200 rounded-md overflow-hidden max-h-[600px] overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredHistory.map((log) => (
            <ActionItem key={log.id} log={log} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
