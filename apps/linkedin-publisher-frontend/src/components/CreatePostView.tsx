import { useState } from 'react';
import { PostCreationModal } from './PostCreationModal';
import { Button } from './ui/Button';
import { Sparkles, Image as ImageIcon, Calendar, FileText } from 'lucide-react';

export function CreatePostView() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-8 animate-fadeIn">
      {/* Visual CTA Card */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-8 shadow-subtle text-center relative overflow-hidden transition-all duration-300 hover:shadow-md">
        
        {/* Decorative subtle background gradients */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto space-y-6">
          {/* Header Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner border border-brand-blue/20">
            <FileText size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              O que você quer compartilhar hoje?
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Escreva posts, adicione imagens com filtros avançados e agende suas publicações para alcançar mais pessoas no LinkedIn.
            </p>
          </div>

          {/* Features Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-xs text-text-secondary/80">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-hover rounded-full border border-border-color">
              <ImageIcon size={14} className="text-green-500" />
              <span>Editor de Imagens</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-hover rounded-full border border-border-color">
              <Calendar size={14} className="text-blue-500" />
              <span>Agendamento Inteligente</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-hover rounded-full border border-border-color">
              <Sparkles size={14} className="text-purple-500" />
              <span>Escrita com IA</span>
            </div>
          </div>

          {/* Call to action */}
          <div className="pt-2">
            <Button 
              onClick={() => setShowModal(true)} 
              variant="primary" 
              size="lg"
              className="w-full sm:w-auto px-8 font-bold shadow-lg shadow-brand-blue/20 transition-all duration-300 hover:scale-[1.02]"
            >
              Criar publicação
            </Button>
          </div>
        </div>
      </div>

      <PostCreationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
