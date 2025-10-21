import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const formVariants = {
  registerInitial: { opacity: 0, x: 50 },
  loginInitial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  registerExit: { opacity: 0, x: -50 },
  loginExit: { opacity: 0, x: 50 },
};

// --- Formulário de Cadastro ---
const RegisterForm = ({ handleRegisterSubmit, setIsLoginMode }) => {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      setErroSenha('As senhas não coincidem.');
      return;
    }

    setErroSenha('');
    handleRegisterSubmit(e);
  };

  return (
    <motion.form
      key="register-form"
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="registerInitial"
      animate="animate"
      exit="registerExit"
      transition={{ duration: 0.4 }}
    >
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome completo
        </label>
        <input
          type="text"
          id="nome"
          required
          className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
          placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm 
          transition duration-150"
          placeholder="Nome completo do funcionário"
        />
      </div>

      <div>
        <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
          Cargo
        </label>
        <input
          type="text"
          id="cargo"
          required
          className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
          placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm 
          transition duration-150"
          placeholder="Ex: Gerente, Técnico, Auxiliar..."
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email corporativo
        </label>
        <input
          type="email"
          id="email"
          required
          className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
          placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm 
          transition duration-150"
          placeholder="seu.email@smh.com"
        />
      </div>

      <div>
        <label htmlFor="setor" className="block text-sm font-medium text-gray-700 mb-1">
          Setor
        </label>
        <select
          id="setor"
          required
          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
          bg-white focus:outline-none focus:ring-accent focus:border-accent sm:text-sm 
          transition duration-150"
        >
          <option value="">Selecione o setor</option>
          <option value="administrativo">Administrativo</option>
          <option value="vendas">Vendas</option>
          <option value="suporte">Suporte Técnico</option>
          <option value="estoque">Estoque</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input
          type="password"
          id="password"
          required
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={`appearance-none block w-full px-4 py-2 border rounded-lg shadow-sm 
          placeholder-gray-400 focus:outline-none sm:text-sm transition duration-150 ${
            erroSenha ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-accent focus:border-accent'
          }`}
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar senha
        </label>
        <input
          type="password"
          id="confirm-password"
          required
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className={`appearance-none block w-full px-4 py-2 border rounded-lg shadow-sm 
          placeholder-gray-400 focus:outline-none sm:text-sm transition duration-150 ${
            erroSenha ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-accent focus:border-accent'
          }`}
          placeholder="••••••••"
        />
        {erroSenha && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-1 text-sm text-red-500"
          >
            {erroSenha}
          </motion.p>
        )}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm 
        text-lg font-semibold text-white bg-accent hover:bg-accent/90 focus:outline-none 
        focus:ring-2 focus:ring-offset-2 focus:ring-accent transition duration-150"
      >
        Cadastrar Funcionário
      </button>

      <div className="mt-4 text-center">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsLoginMode(true);
          }}
          className="text-sm font-medium text-accent hover:text-primary transition duration-150"
        >
          Já possui uma conta? Faça login
        </a>
      </div>
    </motion.form>
  );
};

// --- Formulário de Login Simples (retorno) ---
const LoginRedirectForm = ({ handleLoginRedirect, setIsLoginMode }) => (
  <motion.form
    key="login-form"
    onSubmit={handleLoginRedirect}
    className="space-y-6"
    variants={formVariants}
    initial="loginInitial"
    animate="animate"
    exit="loginExit"
    transition={{ duration: 0.4 }}
  >
    <p className="text-sm text-gray-600 text-center">
      Retorne à tela de login dos funcionários.
    </p>

    <button
      type="submit"
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm 
      text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none 
      focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150"
    >
      Voltar ao Login
    </button>

    <div className="mt-4 text-center">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setIsLoginMode(false);
        }}
        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition duration-150"
      >
        Voltar ao cadastro
      </a>
    </div>
  </motion.form>
);

const CadastroFuncionarios = () => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setMessage('Cadastro de funcionário realizado com sucesso! (Lógica real deve ser implementada)');
    setTimeout(() => {
      setMessage('');
      setIsLoginMode(true);
    }, 2500);
  };

  const handleLoginRedirect = (e) => {
    e.preventDefault();
    navigate('/login-funcionarios');
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary">
            {isLoginMode ? 'Voltar ao Login' : 'Cadastrar Funcionário'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isLoginMode
              ? 'Entre novamente com suas credenciais de funcionário.'
              : 'Preencha os dados abaixo para cadastrar um novo funcionário.'}
          </p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg"
          >
            {message}
          </motion.div>
        )}

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLoginMode ? (
              <LoginRedirectForm
                handleLoginRedirect={handleLoginRedirect}
                setIsLoginMode={setIsLoginMode}
              />
            ) : (
              <RegisterForm
                handleRegisterSubmit={handleRegisterSubmit}
                setIsLoginMode={setIsLoginMode}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
};

export default CadastroFuncionarios;
