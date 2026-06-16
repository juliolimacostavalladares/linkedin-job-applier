import { Briefcase, AlertCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onRefresh: () => void;
}

export function WelcomeScreen({ onRefresh }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Abordagem Segura (Anti-Bloqueio)</h1>
        <p className="text-slate-500">
          Você não precisa expor seus Cookies / CSRF para o servidor. Utilize nossa extensão para extrair o JSON localmente e enviá-lo ao sistema.
        </p>
        <div className="bg-slate-50 text-left p-4 rounded-lg text-sm font-sans text-slate-700 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-500" />
            Como configurar a Extensão do Chrome:
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Na raiz do projeto, procure a pasta <code className="bg-white border border-slate-200 px-1 rounded text-xs select-all">apps/extension</code>.</li>
            <li>Acesse <code className="bg-white border border-slate-200 px-1 rounded text-xs select-all">chrome://extensions/</code> no seu navegador.</li>
            <li>Ative o <strong>Modo do desenvolvedor</strong> no canto superior direito.</li>
            <li>Clique em <strong>Carregar sem compactação</strong> e selecione a pasta <code>apps/extension</code>.</li>
            <li>Fixe a extensão na barra e clique em <strong>Buscar Vagas Invisível</strong>.</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Aguardando dados da extensão...</span>
            <button
              onClick={onRefresh}
              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded font-medium transition-colors"
            >
              Verificar Recebimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
