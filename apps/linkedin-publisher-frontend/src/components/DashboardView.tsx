import { useState } from 'react';
import { usePublisherStore } from '../stores';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Eye, Heart, MessageSquare, Share2, Calendar, FileText, Send, Trash2, Edit3, Plus } from 'lucide-react';
import type { LinkedInPost, PostStatus } from '../types';

interface DashboardViewProps {
  onEditPost: (post: LinkedInPost) => void;
  onNavigateToCreate: () => void;
}

export function DashboardView({ onEditPost, onNavigateToCreate }: DashboardViewProps) {
  const { posts, deletePost, publishPostNow } = usePublisherStore();
  const [activeTab, setActiveTab] = useState<PostStatus>('published');

  // Stats calculations
  const publishedPosts = posts.filter(p => p.status === 'published');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const draftPosts = posts.filter(p => p.status === 'draft');

  const totalViews = publishedPosts.reduce((sum, p) => sum + (p.metrics?.views || 0), 0);
  const totalLikes = publishedPosts.reduce((sum, p) => sum + (p.metrics?.likes || 0), 0);

  const filteredPosts = posts.filter(p => p.status === activeTab);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Painel de Publicações</h1>
          <p className="text-xs text-text-secondary mt-0.5">Gerencie seu conteúdo orgânico para o LinkedIn</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={16} />}
          onClick={onNavigateToCreate}
        >
          Nova Publicação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between p-4 shadow-xs">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Total de Posts</span>
          <span className="text-2xl font-black text-text-primary mt-1">{publishedPosts.length}</span>
        </Card>
        <Card className="flex flex-col justify-between p-4 shadow-xs border-l-4 border-l-brand-blue">
          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Visualizações</span>
          <span className="text-2xl font-black text-text-primary mt-1">
            {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
          </span>
        </Card>
        <Card className="flex flex-col justify-between p-4 shadow-xs border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Reações</span>
          <span className="text-2xl font-black text-text-primary mt-1">{totalLikes}</span>
        </Card>
        <Card className="flex flex-col justify-between p-4 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Agendados</span>
          <span className="text-2xl font-black text-text-primary mt-1">{scheduledPosts.length}</span>
        </Card>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border-color shrink-0">
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'published'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Publicados ({publishedPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'scheduled'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Agendados ({scheduledPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'draft'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Rascunhos ({draftPosts.length})
        </button>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-color rounded-xl bg-bg-card">
            <FileText className="mx-auto text-text-secondary opacity-40 mb-3" size={32} />
            <p className="text-sm font-semibold text-text-primary">Nenhuma publicação encontrada</p>
            <p className="text-xs text-text-secondary mt-1">Crie uma nova postagem para começar a engajar seu público!</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between">
              <div className="flex-1 space-y-3 min-w-0">
                {/* Status indicator / Date details */}
                <div className="flex items-center gap-2 text-[10px] text-text-secondary font-medium">
                  {post.status === 'published' && post.publishedAt && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">
                      Publicado em {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                  {post.status === 'scheduled' && post.scheduledAt && (
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase flex items-center gap-1">
                      <Calendar size={10} />
                      Agendado para {new Date(post.scheduledAt).toLocaleString()}
                    </span>
                  )}
                  {post.status === 'draft' && (
                    <span className="bg-gray-500/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-500/20 font-bold uppercase">
                      Rascunho
                    </span>
                  )}
                  <span>• Atualizado em {new Date(post.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Text preview */}
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
                  {post.text}
                </p>

                {/* Media details */}
                {post.mediaUrl && (
                  <div className="flex items-center gap-2 bg-bg-app border border-border-color rounded-lg p-2 max-w-sm">
                    {post.type === 'image' ? (
                      <img src={post.mediaUrl} alt="Media" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center rounded">
                        <FileText size={16} className="text-brand-blue" />
                      </div>
                    )}
                    <span className="text-[10px] text-text-secondary truncate font-medium">
                      {post.mediaName || 'media_attachment.jpg'}
                    </span>
                  </div>
                )}

                {/* Published Metrics */}
                {post.status === 'published' && post.metrics && (
                  <div className="flex items-center gap-4 pt-1 text-[11px] text-text-secondary font-medium">
                    <span className="flex items-center gap-1">
                      <Eye size={12} className="text-brand-blue" />
                      {post.metrics.views} visualizações
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} className="text-rose-500 fill-rose-500/10" />
                      {post.metrics.likes} reações
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} className="text-emerald-500" />
                      {post.metrics.comments} comentários
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 size={12} className="text-purple-500" />
                      {post.metrics.shares} compartilhamentos
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 shrink-0 self-end md:self-start">
                {post.status === 'scheduled' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Send size={12} />}
                    onClick={() => publishPostNow(post.id)}
                  >
                    Publicar Agora
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Edit3 size={12} />}
                  onClick={() => onEditPost(post)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/5 border-transparent"
                  icon={<Trash2 size={12} />}
                  onClick={() => deletePost(post.id)}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
