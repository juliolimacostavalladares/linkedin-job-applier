import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Textarea, Input } from './ui/Input';
import { ImageEditorModal } from './ImageEditorModal';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import { usePublisherStore } from '../stores/publisherStore';
import { useToast } from './ui/Toast';
import type { EditedImage } from '../types/imageEditor';
import { Image as ImageIcon, Calendar, Sparkles, Loader2, Globe } from 'lucide-react';
import { convertMarkdownToUnicode } from '../utils/markdownFormatter';

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostCreationModal({ isOpen, onClose }: PostCreationModalProps) {
  const [text, setText] = useState('');
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
  const [showImageEditor, setShowImageEditor] = useState(false);
  
  // Scheduling states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  // AI Assistant states
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('technical');

  const { createPost, generateWithAi, aiGenerating, profile, loading: isPublishing } = usePublisherStore();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const charLimit = 3000;
  const charsLeft = charLimit - text.length;

  const handlePublish = async () => {
    if (!text.trim()) {
      showToastError('Escreva um texto antes de publicar!');
      return;
    }

    if (isScheduled && !scheduledAt) {
      showToastError('Selecione uma data e hora para o agendamento!');
      return;
    }

    try {
      const imageFiles = editedImages.map(
        (img) => new File([img.blob], img.originalName, { type: 'image/jpeg' })
      );

      const formattedText = convertMarkdownToUnicode(text);

      await createPost(
        {
          text: formattedText,
          type: editedImages.length > 0 ? 'image' : 'text',
          status: isScheduled ? 'scheduled' : 'published',
          scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : undefined,
          publishedAt: isScheduled ? undefined : new Date().toISOString()
        },
        imageFiles.length > 0 ? imageFiles : undefined
      );

      showToastSuccess(
        isScheduled
          ? 'Postagem agendada com sucesso!'
          : 'Publicado no LinkedIn com sucesso!'
      );

      // Reset state and close
      handleClose();
    } catch (error) {
      showToastError('Falha ao publicar. Tente novamente.');
      console.error(error);
    }
  };

  const handleClose = () => {
    setText('');
    setEditedImages([]);
    setIsScheduled(false);
    setScheduledAt('');
    setShowAiAssistant(false);
    setAiPrompt('');
    onClose();
  };

  const handleImagesComplete = (images: EditedImage[]) => {
    setEditedImages((prev) => [...prev, ...images].slice(0, 9));
  };

  const handleRemoveImage = (index: number) => {
    setEditedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      showToastError('Digite o que deseja na publicação!');
      return;
    }
    try {
      const result = await generateWithAi(aiPrompt, aiTone);
      setText(result);
      showToastSuccess('Conteúdo gerado com IA e inserido no editor!');
      setShowAiAssistant(false);
      setAiPrompt('');
    } catch (error) {
      showToastError('Falha ao gerar conteúdo.');
      console.error(error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} zIndex={50} title="Criar uma publicação">
        <div className="p-5 space-y-4 flex flex-col max-h-[80vh] overflow-y-auto">
          {/* Header with Profile */}
          <div className="flex items-center space-x-3">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name || 'Avatar'}
                className="w-12 h-12 rounded-full object-cover border border-border-color"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center border border-border-color font-bold text-brand-blue text-sm uppercase">
                {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'JL'}
              </div>
            )}
            <div>
              <p className="font-semibold text-text-primary text-sm">
                {profile?.name || 'Usuário'}
              </p>
              <div className="flex items-center gap-1 text-xs text-text-secondary mt-0.5 border border-border-color px-2 py-0.5 rounded-full bg-bg-hover w-max cursor-pointer">
                <Globe size={12} className="text-text-secondary" />
                <span>Qualquer pessoa</span>
              </div>
            </div>
          </div>

          {/* AI Assistant Section (Toggleable) */}
          {showAiAssistant && (
            <div className="p-3 bg-brand-blue/5 border border-brand-blue/15 rounded-lg space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-brand-blue font-bold text-xs">
                  <Sparkles size={14} className="fill-brand-blue/10" />
                  <span>Gerador de Conteúdo com IA</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiAssistant(false)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Cancelar
                </button>
              </div>
              <div className="space-y-2">
                <Input
                  value={aiPrompt}
                  onChange={setAiPrompt}
                  placeholder="Ex: 3 dicas para entrevistas de engenharia de software"
                  className="text-xs bg-bg-card"
                />
                <div className="flex gap-2">
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="border border-border-color rounded-lg bg-bg-card text-text-primary px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue flex-1 transition-colors"
                  >
                    <option value="technical">Técnico & Analítico</option>
                    <option value="professional">Profissional & Corporativo</option>
                    <option value="persuasive">Persuasivo & Engajador</option>
                    <option value="inspiring">Inspirador & Pessoal</option>
                    <option value="casual">Casual & Amigável</option>
                  </select>
                  <Button
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    variant="primary"
                    size="sm"
                  >
                    {aiGenerating ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      'Gerar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Text Area */}
          <div className="relative flex-1 min-h-[150px]">
            <Textarea
              value={text}
              onChange={setText}
              placeholder="Sobre o que você quer falar?"
              className="w-full h-full min-h-[150px] p-2 text-sm border-0 focus:ring-0 focus:outline-none resize-none bg-transparent"
              maxLength={charLimit}
              autoFocus
            />
          </div>

          {/* Image Previews */}
          <ImagePreviewGrid images={editedImages} onRemove={handleRemoveImage} />

          {/* Scheduling date-picker */}
          {isScheduled && (
            <div className="p-3 bg-brand-blue/5 border border-brand-blue/25 rounded-lg space-y-1.5 animate-fadeIn">
              <label className="text-[10px] font-bold text-text-secondary uppercase">
                Selecione a data e hora
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-border-color rounded-lg bg-bg-card text-text-primary p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
              />
            </div>
          )}

          {/* Action Bar & Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-border-color gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageEditor(true)}
                disabled={editedImages.length >= 9}
              >
                <ImageIcon className="w-5 h-5 text-text-secondary" />
                <span className="sr-only sm:not-sr-only sm:ml-2 text-xs text-text-secondary font-medium">Mídia</span>
              </Button>
              <Button
                variant={isScheduled ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setIsScheduled(!isScheduled)}
              >
                <Calendar className="w-5 h-5 text-text-secondary" />
                <span className="sr-only sm:not-sr-only sm:ml-2 text-xs text-text-secondary font-medium">
                  {isScheduled ? 'Agendado' : 'Agendar'}
                </span>
              </Button>
              <Button
                variant={showAiAssistant ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setShowAiAssistant(!showAiAssistant)}
              >
                <Sparkles className="w-5 h-5 text-text-secondary" />
                <span className="sr-only sm:not-sr-only sm:ml-2 text-xs text-text-secondary font-medium">Escrever com IA</span>
              </Button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
              <span className={`text-xs ${charsLeft < 200 ? 'text-red-500 font-bold' : 'text-text-secondary/70'}`}>
                {charsLeft} caracteres
              </span>
              <Button 
                onClick={handlePublish}
                disabled={isPublishing || !text.trim()}
                variant="primary"
              >
                {isPublishing ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    <span>Publicando...</span>
                  </div>
                ) : isScheduled ? (
                  'Agendar'
                ) : (
                  'Publicar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onComplete={handleImagesComplete}
      />
    </>
  );
}
