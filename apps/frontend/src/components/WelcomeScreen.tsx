import { Briefcase, AlertCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onRefresh: () => void;
}

export function WelcomeScreen({ onRefresh }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-app p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-bg-card rounded-lg shadow-subtle border border-border-color p-6 text-center space-y-5 transition-colors duration-200">
        <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-2">
          <Briefcase size={24} />
        </div>
        <h1 className="text-lg font-bold text-text-primary tracking-tight">Abordagem Segura (Anti-Bloqueio)</h1>
        <p className="text-text-secondary text-xs leading-relaxed">
          Você não precisa expor seus Cookies / CSRF para o servidor. Utilize nossa extensão para extrair o JSON localmente e enviá-lo ao sistema.
        </p>
        
        <div className="bg-bg-hover text-left p-4 rounded-lg text-xs leading-relaxed text-text-primary border border-border-color transition-colors">
          <h3 className="font-bold text-text-primary mb-2 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-brand-blue" />
            Como configurar a Extensão do Chrome:
          </h3>
          <ol className="list-decimal pl-4 space-y-1.5 text-text-secondary font-medium">
            <li>Na raiz do projeto, procure a pasta <code className="bg-bg-card border border-border-color px-1 py-0.5 rounded text-[10px] select-all font-mono">apps/extension</code>.</li>
            <li>Acesse <code className="bg-bg-card border border-border-color px-1 py-0.5 rounded text-[10px] select-all font-mono">chrome://extensions/</code> no navegador.</li>
            <li>Ative o <strong>Modo do desenvolvedor</strong> no canto superior direito.</li>
            <li>Clique em <strong>Carregar sem compactação</strong> e selecione a pasta <code>apps/extension</code>.</li>
            <li>Fixe a extensão na barra e clique em <strong>Buscar Vagas Invisível</strong>.</li>
          </ol>
          <div className="mt-4 pt-3 border-t border-border-color flex items-center justify-between">
            <span className="text-[10px] text-text-secondary/70">Aguardando dados...</span>
            <button
              onClick={onRefresh}
              className="text-[10px] bg-bg-card border border-border-color hover:bg-bg-hover text-text-primary px-2.5 py-1 rounded font-bold transition-all shadow-sm"
            >
              Verificar Recebimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
