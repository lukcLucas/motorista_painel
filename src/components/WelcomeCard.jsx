
import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

export function WelcomeCard() {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-[#00a0e4]" />
        Bem-vindo ao Painel Administrativo
      </h2>
      <p className="text-gray-600 mb-4">
        Utilize as abas acima para navegar entre as funcionalidades do sistema. No painel principal, você encontra um resumo das métricas operacionais e alertas de motoristas chamados. Gerencie motoristas, cadastre novos, e configure escalas e disponibilidade nas respectivas seções.
      </p>
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Dica:</span> Para começar, adicione motoristas na aba de cadastro e depois configure suas escalas de trabalho.
        </p>
      </div>
    </motion.div>
  );
}
