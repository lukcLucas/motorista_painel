
import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-12 text-center text-gray-500 text-sm py-4">
      <span>© {currentYear} Painel Administrativo. Todos os direitos reservados.</span>
    </footer>
  );
}
