import { useState } from "react";
import {
  User,
  Building,
  GraduationCap,
  RefreshCw,
  FileText,
  Globe,
} from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import type { WorkExperience, Education } from "../types";

export interface ProfileData {
  profileId?: string | null;
  name?: string | null;
  headline?: string | null;
  photoUrl?: string | null;
  about?: string | null;
  experiences?: WorkExperience[];
  education?: Education[];
}

export interface SharedProfileViewProps {
  profile: ProfileData | null;
  onRefresh: () => Promise<void> | void;
  isRefreshing: boolean;
  emptyStateText?: string;
  syncSourceText?: string;
  children?: React.ReactNode;
  topChildren?: React.ReactNode;
}

export function ProfileView({
  profile,
  onRefresh,
  isRefreshing,
  emptyStateText = "Para ver o seu perfil aqui, utilize a extensão para sincronizar suas credenciais e perfil do LinkedIn.",
  syncSourceText = "Sincronizado via Extensão",
  children,
  topChildren,
}: SharedProfileViewProps) {
  const [imageError, setImageError] = useState(false);

  const handleRefresh = async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <Card className="max-w-md w-full text-center py-12 p-8 shadow-xs border border-border-color bg-bg-card">
          <User
            className="mx-auto text-text-secondary opacity-30 mb-4"
            size={48}
          />
          <h2 className="text-lg font-bold text-text-primary">
            Nenhum perfil sincronizado
          </h2>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {emptyStateText}
          </p>
          <Button
            variant="primary"
            className="mt-6 mx-auto font-bold"
            icon={
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin" : ""}
              />
            }
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Verificando..." : "Verificar Conexão"}
          </Button>
        </Card>
      </div>
    );
  }

  const { name, headline, photoUrl, about, experiences, education } = profile;

  return (
    <div className="flex-1 overflow-y-auto bg-bg-app p-4 md:p-6 relative scrollbar-hide transition-colors duration-200">
      <div className="max-w-3xl mx-auto w-full space-y-5 pb-12 animate-fadeIn">
        {/* Profile Card Mockup */}
        <div className="bg-bg-card border border-border-color rounded-lg overflow-hidden shadow-subtle relative transition-colors duration-200">
          {/* Cover Banner */}
          <div className="h-28 md:h-36 bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-700 dark:to-slate-800 relative">
            {isRefreshing && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                <RefreshCw className="animate-spin text-white" size={20} />
              </div>
            )}
          </div>

          {/* Profile Avatar Overlay */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-bg-card absolute left-6 top-[72px] md:top-24 bg-bg-hover flex items-center justify-center overflow-hidden shadow-sm z-10 transition-colors duration-200">
            {photoUrl && !imageError ? (
              <img
                src={photoUrl}
                alt={name || "Usuário"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : (
              <User size={36} className="text-text-secondary/50" />
            )}
          </div>

          {/* Profile Header Details */}
          <div className="pt-14 md:pt-16 px-6 pb-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-extrabold text-text-primary truncate">
                  {name || "Nome do Usuário"}
                </h2>
                <p className="text-xs md:text-sm text-text-primary/90 mt-1 leading-relaxed max-w-xl font-medium">
                  {headline || "Nenhuma descrição do perfil."}
                </p>
                {profile.profileId && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-text-secondary/70">
                    <span className="font-mono bg-bg-hover px-1.5 py-0.5 rounded border border-border-color">
                      ID: {profile.profileId}
                    </span>
                    <span>•</span>
                    <Globe size={11} className="text-text-secondary/65" />
                    <span>{syncSourceText}</span>
                  </div>
                )}
              </div>

              <div className="flex shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  icon={
                    <RefreshCw
                      size={13}
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                  }
                >
                  {isRefreshing ? "Sincronizando..." : "Sincronizar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="grid grid-cols-1 gap-5">
          {topChildren}

          {/* About Section */}
          <Card className="p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border-color/45 pb-3">
              <FileText size={18} className="text-brand-blue" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Sobre
              </h3>
            </div>
            <p className="text-xs md:text-sm text-text-primary/80 leading-relaxed whitespace-pre-wrap">
              {about || 'Nenhuma informação de resumo ("Sobre") cadastrada.'}
            </p>
          </Card>

          {/* Experience Section */}
          <Card className="p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border-color/45 pb-3">
              <Building size={18} className="text-brand-blue" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Experiência
              </h3>
            </div>
            {experiences && experiences.length > 0 ? (
              <div className="space-y-6">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-bg-hover border border-border-color rounded-lg flex items-center justify-center shrink-0 text-brand-blue shadow-xs">
                      <Building size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-text-primary">
                        {exp.role}
                      </h4>
                      <p className="text-[11px] font-semibold text-text-primary/80 mt-0.5">
                        {exp.company}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-0.5">
                        {exp.duration}
                      </p>
                      {exp.description && (
                        <p className="text-[11px] text-text-secondary leading-relaxed mt-2 whitespace-pre-wrap border-l-2 border-border-color/85 pl-3">
                          {exp.description}
                        </p>
                      )}
                      {idx < experiences.length - 1 && (
                        <div className="border-b border-border-color/45 pt-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">
                Nenhuma experiência profissional cadastrada.
              </p>
            )}
          </Card>

          {/* Education Section */}
          <Card className="p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border-color/45 pb-3">
              <GraduationCap size={18} className="text-brand-blue" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Formação Acadêmica
              </h3>
            </div>
            {education && education.length > 0 ? (
              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-bg-hover border border-border-color rounded-lg flex items-center justify-center shrink-0 text-brand-blue shadow-xs">
                      <GraduationCap size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-text-primary">
                        {edu.institution}
                      </h4>
                      <p className="text-[11px] font-semibold text-text-primary/80 mt-0.5">
                        {edu.degree}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-0.5">
                        {edu.duration}
                      </p>
                      {idx < education.length - 1 && (
                        <div className="border-b border-border-color/45 pt-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">
                Nenhuma formação acadêmica cadastrada.
              </p>
            )}
          </Card>

          {children}
        </div>
      </div>
    </div>
  );
}
