import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublisherStore } from '../stores';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  AlignLeft, 
  Calendar, 
  Send, 
  Save, 
  Loader2, 
  Eye,
  Globe,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send as SendIcon,
  HelpCircle,
  Undo2
} from 'lucide-react';
import { useToast } from './ui/Toast';
import type { PostType, PostStatus } from '../types';

export function CreatePostView() {
  const navigate = useNavigate();
  const { createPost, updatePost, generateWithAi, aiGenerating, selectedPost, setSelectedPost, profile } = usePublisherStore();
  const editingPost = selectedPost;
  const { success: showToastSuccess, error: showToastError } = useToast();

  const [text, setText] = useState(editingPost?.text || '');
  const [postType, setPostType] = useState<PostType>(editingPost?.type || 'text');
  const [mediaUrl, setMediaUrl] = useState(editingPost?.mediaUrl || '');
  const [mediaName, setMediaName] = useState(editingPost?.mediaName || '');
  const [isScheduled, setIsScheduled] = useState(editingPost?.status === 'scheduled');
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (editingPost?.scheduledAt) {
      const dateObj = new Date(editingPost.scheduledAt);
      return dateObj.toISOString().slice(0, 16);
    }
    return '';
  });
  
  // AI assist states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('technical');
  const [generatedText, setGeneratedText] = useState('');

  const handleSaveDraft = () => {
    if (!text.trim()) {
      showToastError('Escreva um texto antes de salvar!');
      return;
    }

    const postData = {
      text,
      type: postType,
      mediaUrl: mediaUrl.trim() ? mediaUrl : undefined,
      mediaName: mediaName.trim() ? mediaName : undefined,
      status: 'draft' as const,
      scheduledAt: undefined,
      publishedAt: undefined
    };

    if (editingPost) {
      updatePost(editingPost.id, {
        ...postData,
        status: editingPost.status === 'published' ? 'published' : 'draft'
      });
      showToastSuccess('Rascunho atualizado com sucesso!');
    } else {
      createPost(postData);
      showToastSuccess('Rascunho criado com sucesso!');
    }
    setSelectedPost(null);
    navigate('/dashboard');
  };

  const handlePublishOrSchedule = () => {
    if (!text.trim()) {
      showToastError('Escreva um texto antes de publicar!');
      return;
    }

    if (isScheduled && !scheduledAt) {
      showToastError('Selecione uma data e hora para o agendamento!');
      return;
    }

    const postData = {
      text,
      type: postType,
      mediaUrl: mediaUrl.trim() ? mediaUrl : undefined,
      mediaName: mediaName.trim() ? mediaName : undefined,
      status: (isScheduled ? 'scheduled' : 'published') as PostStatus,
      scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : undefined,
      publishedAt: isScheduled ? undefined : new Date().toISOString()
    };

    if (editingPost) {
      updatePost(editingPost.id, postData);
      showToastSuccess(
        isScheduled 
          ? 'Postagem reagendada com sucesso!' 
          : 'Publicado no LinkedIn com sucesso!'
      );
    } else {
      createPost(postData);
      showToastSuccess(
        isScheduled 
          ? 'Postagem agendada com sucesso!' 
          : 'Publicado no LinkedIn com sucesso!'
      );
    }
    setSelectedPost(null);
    navigate('/dashboard');
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      showToastError('Digite o que deseja na publicação!');
      return;
    }
    try {
      const result = await generateWithAi(aiPrompt, aiTone);
      setGeneratedText(result);
      showToastSuccess('Conteúdo gerado com IA!');
    } catch {
      showToastError('Falha ao gerar conteúdo.');
    }
  };

  const handleApplyAiText = () => {
    setText(generatedText);
    showToastSuccess('Texto aplicado ao editor.');
  };

  const charLimit = 3000;
  const charsLeft = charLimit - text.length;

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row h-full">
      {/* Editor Column */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          {editingPost && (
            <button 
              onClick={() => {
                setSelectedPost(null);
                navigate('/dashboard');
              }}
              className="p-1 rounded-md text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors cursor-pointer"
              title="Cancelar edição"
            >
              <Undo2 size={18} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {editingPost ? 'Editar Publicação' : 'Criar Publicação'}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Configure sua publicação, anexe mídias e otimize o texto
            </p>
          </div>
        </div>

        {/* Text Area Card */}
        <Card className="p-4 space-y-4 shadow-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-primary uppercase tracking-wide">
              Texto da Publicação
            </label>
            <Textarea
              value={text}
              onChange={setText}
              placeholder="Escreva seu post aqui..."
              className="w-full min-h-[180px] p-3 text-sm resize-none"
              maxLength={charLimit}
            />
            <div className="flex justify-between items-center text-[10px] pt-1">
              <span className={charsLeft < 200 ? 'text-red-500 font-bold' : 'text-text-secondary/70'}>
                {charsLeft} caracteres restantes
              </span>
              <span className="text-text-secondary/50">Limite: 3000</span>
            </div>
          </div>

          {/* Media Attachments Select */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => { setPostType('text'); setMediaUrl(''); }}
              className={`py-2 px-3 border rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-150 ${
                postType === 'text'
                  ? 'border-brand-blue bg-brand-blue/5 text-brand-blue shadow-sm'
                  : 'border-border-color bg-transparent text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <AlignLeft size={14} />
              Apenas Texto
            </button>
            <button
              type="button"
              onClick={() => { setPostType('image'); }}
              className={`py-2 px-3 border rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-150 ${
                postType === 'image'
                  ? 'border-brand-blue bg-brand-blue/5 text-brand-blue shadow-sm'
                  : 'border-border-color bg-transparent text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <ImageIcon size={14} />
              Imagem
            </button>
            <button
              type="button"
              onClick={() => { setPostType('link'); }}
              className={`py-2 px-3 border rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-150 ${
                postType === 'link'
                  ? 'border-brand-blue bg-brand-blue/5 text-brand-blue shadow-sm'
                  : 'border-border-color bg-transparent text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <LinkIcon size={14} />
              Link
            </button>
          </div>

          {/* Conditional Media Inputs */}
          {postType !== 'text' && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">
                  {postType === 'image' ? 'URL da Imagem' : 'URL do Link'}
                </label>
                <Input
                  type="url"
                  value={mediaUrl}
                  onChange={setMediaUrl}
                  placeholder={
                    postType === 'image'
                      ? 'https://exemplo.com/imagem.png'
                      : 'https://exemplo.com/artigo-ou-site'
                  }
                  className="p-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">
                  Nome do Anexo (Opcional)
                </label>
                <Input
                  type="text"
                  value={mediaName}
                  onChange={setMediaName}
                  placeholder={
                    postType === 'image' ? 'infografico_final.png' : 'Guia de Engenharia de Software'
                  }
                  className="p-2 text-xs"
                />
              </div>
            </div>
          )}

          {/* Schedule Settings */}
          <div className="border-t border-border-color/55 pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="schedule-toggle"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4 text-brand-blue border-border-color rounded focus:ring-brand-blue/30"
              />
              <label htmlFor="schedule-toggle" className="text-xs font-bold text-text-primary select-none cursor-pointer flex items-center gap-1">
                <Calendar size={14} className="text-brand-blue" />
                Agendar postagem para depois
              </label>
            </div>
            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="border border-border-color rounded-lg bg-bg-card text-text-primary p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
              />
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            icon={<Save size={14} />}
            onClick={handleSaveDraft}
          >
            Salvar Rascunho
          </Button>
          <Button
            variant="primary"
            icon={isScheduled ? <Calendar size={14} /> : <Send size={14} />}
            onClick={handlePublishOrSchedule}
          >
            {isScheduled ? 'Agendar Publicação' : 'Publicar Agora'}
          </Button>
        </div>

        {/* AI Assistant Card */}
        <Card className="p-4 space-y-4 border border-brand-blue/15 bg-brand-blue/5 shadow-xs">
          <div className="flex items-center gap-1.5 text-brand-blue font-bold">
            <Sparkles size={16} className="fill-brand-blue/10" />
            <span className="text-xs uppercase tracking-wider font-extrabold">Assistente de Conteúdo com IA</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase">
                O que você quer publicar? (Prompt)
              </label>
              <Input
                type="text"
                value={aiPrompt}
                onChange={setAiPrompt}
                placeholder="Ex: Crie um post sobre 3 boas práticas em code reviews"
                className="p-2 text-xs bg-bg-card"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Tom da Escrita</label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="border border-border-color rounded-lg bg-bg-card text-text-primary p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue w-full transition-colors"
                >
                  <option value="technical">Técnico & Analítico</option>
                  <option value="professional">Profissional & Corporativo</option>
                  <option value="persuasive">Persuasivo & Engajador</option>
                  <option value="inspiring">Inspirador & Pessoal</option>
                  <option value="casual">Casual & Amigável</option>
                </select>
              </div>
              <Button
                variant="secondary"
                className="self-end w-full sm:w-auto font-bold cursor-pointer"
                disabled={aiGenerating}
                onClick={handleAiGenerate}
                icon={aiGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              >
                {aiGenerating ? 'Gerando...' : 'Gerar Post'}
              </Button>
            </div>
          </div>

          {generatedText && (
            <div className="space-y-3 pt-3 border-t border-brand-blue/10 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Resultado da IA:</span>
                  <button 
                    onClick={() => setGeneratedText('')} 
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
                <pre className="p-3 bg-bg-card border border-border-color rounded-lg font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto text-text-primary">
                  {generatedText}
                </pre>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Sparkles size={12} />}
                  onClick={handleApplyAiText}
                >
                  Inserir no Editor
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>

      {/* Real-time Preview Column */}
      <aside className="w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-border-color bg-bg-app flex flex-col shrink-0 p-6 space-y-4 overflow-y-auto">
        <h4 className="font-bold text-[10px] uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Eye size={12} className="text-brand-blue" />
          Visualização Prévia (LinkedIn Feed)
        </h4>

        {/* LinkedIn Post Card Mockup */}
        <div className="bg-bg-card border border-border-color rounded-xl overflow-hidden shadow-xs flex flex-col transition-colors duration-200">
          {/* Card Header */}
          <div className="p-4 flex gap-3 items-start">
            {profile?.photoUrl ? (
              <img 
                src={profile.photoUrl} 
                alt={profile.name || 'Avatar'} 
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-border-color"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center border border-border-color font-bold text-brand-blue text-sm uppercase shrink-0">
                {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'JL'}
              </div>
            )}
            <div className="min-w-0">
              <h5 className="font-bold text-sm text-text-primary truncate hover:underline hover:text-brand-blue cursor-pointer">
                {profile?.name || 'Julio Lima'}
              </h5>
              <p className="text-[11px] text-text-secondary truncate leading-snug">
                {profile?.headline || 'Engenheiro de Software | Criador do JobFinder'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-text-secondary/70 mt-0.5">
                <span>Agora</span>
                <span>•</span>
                <Globe size={10} />
              </div>
            </div>
          </div>

          {/* Card Text Content */}
          <div className="px-4 pb-3">
            {text.trim() ? (
              <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                {text}
              </p>
            ) : (
              <p className="text-xs text-text-secondary/60 italic">
                O texto digitado no editor aparecerá aqui em tempo real...
              </p>
            )}
          </div>

          {/* Card Media Preview */}
          {postType !== 'text' && mediaUrl.trim() && (
            <div className="border-y border-border-color/65 bg-bg-app overflow-hidden">
              {postType === 'image' ? (
                <img 
                  src={mediaUrl} 
                  alt="Post Attachment" 
                  className="w-full h-auto max-h-[300px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                /* Link Preview Card */
                <a 
                  href={mediaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col border-t border-border-color/45 p-3 hover:bg-bg-hover transition-colors"
                >
                  <span className="text-[10px] font-medium text-brand-blue truncate uppercase tracking-wider">
                    {mediaName || 'link_attachment.com'}
                  </span>
                  <span className="text-xs font-bold text-text-primary truncate mt-1">
                    {mediaName || 'Guia Prático e Artigos recomendados'}
                  </span>
                  <span className="text-[10px] text-text-secondary truncate mt-0.5">
                    {mediaUrl}
                  </span>
                </a>
              )}
            </div>
          )}

          {/* Mock Social Count */}
          <div className="px-4 py-2 border-b border-border-color/45 flex justify-between items-center text-[10px] text-text-secondary/70">
            <span>0 reações</span>
            <span>0 comentários</span>
          </div>

          {/* Mock Feed Actions */}
          <div className="grid grid-cols-4 px-2 py-1">
            <button className="py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-text-secondary hover:bg-bg-hover font-semibold text-xs transition-colors cursor-default">
              <ThumbsUp size={14} />
              <span>Gostei</span>
            </button>
            <button className="py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-text-secondary hover:bg-bg-hover font-semibold text-xs transition-colors cursor-default">
              <MessageSquare size={14} />
              <span>Comentar</span>
            </button>
            <button className="py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-text-secondary hover:bg-bg-hover font-semibold text-xs transition-colors cursor-default">
              <Repeat2 size={14} />
              <span>Compartilhar</span>
            </button>
            <button className="py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-text-secondary hover:bg-bg-hover font-semibold text-xs transition-colors cursor-default">
              <SendIcon size={14} />
              <span>Enviar</span>
            </button>
          </div>
        </div>

        {/* Interactive hint */}
        <div className="bg-bg-card border border-border-color rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-text-secondary">
          <HelpCircle size={18} className="text-brand-blue shrink-0 mt-0.5 animate-bounce" />
          <div>
            <span className="font-bold text-text-primary block mb-0.5">Dica de Conversão</span>
            Posts com menos de 1000 caracteres e que utilizam mídias (como imagens e links) têm um engajamento médio 2.4x maior no LinkedIn.
          </div>
        </div>
      </aside>
    </div>
  );
}
