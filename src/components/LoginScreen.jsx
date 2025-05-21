import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Users } from 'lucide-react';

const PASSWORDS = {
  motorista: "123", 
  master: "master123",
  adm: "adm123" 
};

export function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === PASSWORDS.motorista) {
        onLogin('motorista');
      } else if (password === PASSWORDS.master) {
        onLogin('master');
      } else if (password === PASSWORDS.adm) {
        onLogin('adm');
      } else {
        toast({
          variant: "destructive",
          title: "Senha Incorreta",
          description: "A senha digitada não é válida. Tente novamente.",
        });
      }
      setIsLoading(false);
      setPassword('');
    }, 1000); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Users className="mx-auto h-16 w-16 text-[#00a0e4]" />
          </motion.div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Acesso ao Painel
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Insira sua senha de acesso para continuar.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password" className="sr-only">Senha de Acesso</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full h-12 px-4 text-lg border-gray-300 rounded-md shadow-sm focus:ring-[#00a0e4] focus:border-[#00a0e4]"
                placeholder="Senha de Acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#00a0e4] hover:bg-[#007ab3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a0e4] transition-colors duration-150"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrar
                </>
              )}
            </Button>
          </div>
        </form>
        {/* A seção de senhas de demonstração foi removida daqui */}
      </motion.div>
    </div>
  );
}
