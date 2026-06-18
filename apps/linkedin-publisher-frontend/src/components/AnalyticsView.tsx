import { usePublisherStore } from '../stores';
import { Card } from './ui/Card';
import { BarChart3, Eye, Heart, MessageSquare, Award, TrendingUp, Sparkles } from 'lucide-react';

export function AnalyticsView() {
  const { posts } = usePublisherStore();

  const publishedPosts = posts.filter(p => p.status === 'published');

  // Stats calculations
  const totalViews = publishedPosts.reduce((sum, p) => sum + (p.metrics?.views || 0), 0);
  const totalLikes = publishedPosts.reduce((sum, p) => sum + (p.metrics?.likes || 0), 0);
  const totalComments = publishedPosts.reduce((sum, p) => sum + (p.metrics?.comments || 0), 0);
  const totalShares = publishedPosts.reduce((sum, p) => sum + (p.metrics?.shares || 0), 0);

  const totalEngagements = totalLikes + totalComments + totalShares;
  const avgEngagementRate = totalViews > 0 
    ? ((totalEngagements / totalViews) * 100).toFixed(1) 
    : '0';

  // Find best performing post by views
  const bestPost = publishedPosts.length > 0
    ? [...publishedPosts].sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))[0]
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Métricas & Insights</h1>
        <p className="text-xs text-text-secondary mt-0.5">Acompanhe a performance de engajamento do seu perfil no LinkedIn</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue shrink-0">
            <Eye size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase block">Impressões</span>
            <span className="text-xl font-black text-text-primary">{totalViews.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-4 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
            <Heart size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase block">Reações</span>
            <span className="text-xl font-black text-text-primary">{totalLikes}</span>
          </div>
        </Card>

        <Card className="p-4 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase block">Engajamento</span>
            <span className="text-xl font-black text-text-primary">{totalEngagements}</span>
          </div>
        </Card>

        <Card className="p-4 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase block">Taxa de Engaj.</span>
            <span className="text-xl font-black text-text-primary">{avgEngagementRate}%</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance List */}
        <Card className="lg:col-span-2 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5 border-b border-border-color pb-3">
            <BarChart3 size={16} className="text-brand-blue" />
            Performance Individual por Publicação
          </h2>

          <div className="overflow-x-auto">
            {publishedPosts.length === 0 ? (
              <p className="text-xs text-text-secondary py-6 text-center italic">Nenhuma publicação listada.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-color text-text-secondary font-bold">
                    <th className="py-2.5">Conteúdo</th>
                    <th className="py-2.5 text-center">Visualizações</th>
                    <th className="py-2.5 text-center">Reações</th>
                    <th className="py-2.5 text-center">Comentários</th>
                    <th className="py-2.5 text-center">Compart.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40 font-medium">
                  {publishedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-bg-hover transition-colors">
                      <td className="py-3 pr-4 max-w-[220px] truncate text-text-primary">
                        {post.text}
                      </td>
                      <td className="py-3 text-center text-text-primary font-bold">
                        {post.metrics?.views.toLocaleString()}
                      </td>
                      <td className="py-3 text-center text-text-secondary">
                        {post.metrics?.likes}
                      </td>
                      <td className="py-3 text-center text-text-secondary">
                        {post.metrics?.comments}
                      </td>
                      <td className="py-3 text-center text-text-secondary">
                        {post.metrics?.shares}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Highlights/Award Card */}
        <div className="space-y-4">
          {bestPost && bestPost.metrics && (
            <Card className="p-5 shadow-xs border border-brand-blue/15 bg-brand-blue/5 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-wide">
                  <Award size={18} />
                  <span>Publicação Destaque</span>
                </div>
                <div className="bg-bg-card p-3 rounded-lg border border-border-color text-[11px] leading-relaxed text-text-secondary line-clamp-6">
                  {bestPost.text}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-blue/10">
                <div className="text-center bg-bg-card p-2 rounded-lg border border-border-color">
                  <span className="text-[10px] text-text-secondary block">Views</span>
                  <span className="text-sm font-bold text-text-primary">{bestPost.metrics.views.toLocaleString()}</span>
                </div>
                <div className="text-center bg-bg-card p-2 rounded-lg border border-border-color">
                  <span className="text-[10px] text-text-secondary block">Engajamento</span>
                  <span className="text-sm font-bold text-text-primary">
                    {bestPost.metrics.likes + bestPost.metrics.comments + bestPost.metrics.shares}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {!bestPost && (
            <Card className="p-5 shadow-xs text-center py-12 flex flex-col items-center justify-center">
              <Sparkles size={24} className="text-brand-blue opacity-50 mb-2" />
              <p className="text-xs font-semibold text-text-primary">Ainda sem publicações</p>
              <p className="text-[11px] text-text-secondary mt-1">Publique conteúdo para ver os destaques aqui.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
