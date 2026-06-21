import { useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Input";
import { usePublisherStore } from "../stores";
import { apiService } from "../services/apiService";
import { useToast } from "./ui/Toast";
import {
  Sparkles,
  Download,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
} from "lucide-react";

interface SlideData {
  type: "cover" | "content" | "cta" | "code" | "text";
  title: string;
  subtitle?: string;
  content?: string;
  footer?: string;
  authorName?: string;
  code?: string;
  language?: string;
}

const THEME_OPTIONS = [
  {
    id: "dark-premium",
    name: "Dark Premium",
    bg: "bg-gradient-to-br from-slate-800 to-slate-950",
    text: "text-white",
    accent: "#38bdf8",
    desc: "Fundo escuro profissional com detalhes em azul",
  },
  {
    id: "gradient-purple",
    name: "Gradient Purple",
    bg: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500",
    text: "text-white",
    accent: "#f472b6",
    desc: "Gradients modernos vibrantes em roxo e rosa",
  },
  {
    id: "startup-clean",
    name: "Startup Clean",
    bg: "bg-white border border-border-color",
    text: "text-slate-900",
    accent: "#0284c7",
    desc: "Fundo branco limpo com detalhes em azul",
  },
  {
    id: "bold-yellow",
    name: "Bold Yellow",
    bg: "bg-yellow-400",
    text: "text-black",
    accent: "#000000",
    desc: "Amarelo com fontes pretas em caixa alta",
  },
  {
    id: "warm-creative",
    name: "Warm Creative",
    bg: "bg-[#fcf8f2]",
    text: "text-[#292524]",
    accent: "#ea580c",
    desc: "Tons pasteis quentes com fonte serifada nos títulos",
  },
] as const;

type ThemeType = (typeof THEME_OPTIONS)[number]["id"];

interface CarouselCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (pdfBlob: Blob, filename: string, captionText: string) => void;
}

export function CarouselCreatorModal({
  isOpen,
  onClose,
  onComplete,
}: CarouselCreatorModalProps) {
  const { profile } = usePublisherStore();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const [theme, setTheme] = useState<ThemeType>("dark-premium");
  const [carouselTitle, setCarouselTitle] = useState(
    "Meu Carrossel do LinkedIn",
  );
  const [author, setAuthor] = useState(profile?.name || "Julio Lima");
  const [slides, setSlides] = useState<SlideData[]>([
    {
      type: "cover",
      title: "Como Criar Carrosséis que Convertem no LinkedIn",
      subtitle: "Arraste para o lado para aprender o passo a passo ➔",
    },
    {
      type: "content",
      title: "Por que o formato de Carrossel?",
      content:
        "● Geram 3x mais engajamento que posts comuns\n● Aumentam o tempo de permanência no seu post\n● Facilitam a explicação de conceitos complexos",
    },
    {
      type: "cta",
      title: "Curtiu o Conteúdo?",
      subtitle: "Siga meu perfil para dicas diárias de tecnologia e liderança!",
    },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  // AI & Export states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const activeSlide = slides[activeIndex] || null;

  const handleUpdateSlide = (fields: Partial<SlideData>) => {
    setSlides((prev) =>
      prev.map((slide, idx) =>
        idx === activeIndex ? { ...slide, ...fields } : slide,
      ),
    );
  };

  const handleAddSlide = (type: "content" | "cta" | "code" | "text") => {
    const newSlide: SlideData = {
      type,
      title:
        type === "cta"
          ? "Gostou do Post?"
          : type === "code"
            ? "Exemplo de Código"
            : type === "text"
              ? "Explicação de Conteúdo"
              : "Novo Slide de Conteúdo",
      content:
        type === "content"
          ? "● Ponto 1\n● Ponto 2"
          : type === "text"
            ? "Digite parágrafos ou tabelas aqui"
            : undefined,
      subtitle: type === "cta" ? "Siga para acompanhar mais dicas!" : undefined,
      code:
        type === "code"
          ? '// Adicione seu código aqui\nconsole.log("Olá Mundo!");'
          : undefined,
      language: type === "code" ? "javascript" : undefined,
    };
    const ctaIdx = slides.findIndex((s) => s.type === "cta");
    if (ctaIdx !== -1 && type !== "cta") {
      const updated = [...slides];
      updated.splice(ctaIdx, 0, newSlide);
      setSlides(updated);
      setActiveIndex(ctaIdx);
    } else {
      setSlides((prev) => [...prev, newSlide]);
      setActiveIndex(slides.length);
    }
    showToastSuccess("Novo slide adicionado!");
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) {
      showToastError("Seu carrossel precisa de pelo menos 1 slide!");
      return;
    }
    setSlides((prev) => prev.filter((_, idx) => idx !== index));
    setActiveIndex((prev) => Math.max(0, prev - 1));
    showToastSuccess("Slide removido.");
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) {
      showToastError("Digite o tema que deseja para o carrossel!");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await apiService.generateCarousel(aiPrompt, aiTone);
      if (data.slides && Array.isArray(data.slides)) {
        setSlides(data.slides);
        setCarouselTitle(data.title || "Carrossel Gerado com IA");
        setActiveIndex(0);
        showToastSuccess("Carrossel gerado com sucesso pela IA!");
      } else {
        showToastError("Falha ao estruturar slides.");
      }
    } catch (err) {
      console.error(err);
      showToastError("Erro ao se comunicar com a IA.");
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = async () => {
    setExporting(true);
    try {
      const response = await apiService.exportCarouselPdf({
        theme,
        title: carouselTitle,
        authorName: author,
        slides,
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const filename = "carrossel.pdf";

      // Auto-generate caption
      const captionText = `Acabei de criar esse carrossel sobre **${carouselTitle}** utilizando nosso assistente com Inteligência Artificial! 🚀\n\nConfira o arquivo PDF em anexo abaixo e arraste para o lado para ler os slides.`;

      onComplete(pdfBlob, filename, captionText);
      showToastSuccess("Carrossel PDF gerado e anexado à publicação!");
      onClose();
    } catch (err) {
      console.error(err);
      showToastError(
        "Falha ao exportar PDF. Verifique se o backend está rodando.",
      );
    } finally {
      setExporting(false);
    }
  };

  const activeTheme =
    THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  const renderTextMarkdown = (text: string) => {
    if (!text) return null;

    // Check if it contains markdown table
    if (
      text.includes("|") &&
      text.split("\n").some((line) => line.trim().startsWith("|"))
    ) {
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const rows = lines
        .map((line) => {
          return line
            .split("|")
            .map((c) => c.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        })
        .filter((row) => row.length > 0);

      if (rows.length > 1) {
        const hasSeparator = rows[1].every((cell) =>
          cell.split("").every((ch) => ch === "-" || ch === ":" || ch === "|"),
        );
        const headers = rows[0];
        const dataRows = hasSeparator ? rows.slice(2) : rows.slice(1);

        return (
          <div className="overflow-x-auto my-2 w-full">
            <table
              className="w-full border-collapse text-[10px] text-left"
              style={{
                background:
                  theme === "startup-clean"
                    ? "rgba(0, 0, 0, 0.02)"
                    : "rgba(255, 255, 255, 0.05)",
                color: theme === "startup-clean" ? "#0f172a" : "inherit",
                borderRadius: "6px",
              }}
            >
              <thead>
                <tr
                  className="border-b border-current/10"
                  style={{
                    background:
                      theme === "startup-clean"
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-2 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="border-b border-current/10 last:border-b-0"
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Otherwise render as paragraphs
    return text.split("\n").map((p, idx) => (
      <p key={idx} className="text-[11px] leading-relaxed mb-2 last:mb-0">
        {p}
      </p>
    ));
  };

  const renderPreviewContent = () => {
    if (!activeSlide) return null;

    const authorAbbrev = author
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    if (activeSlide.type === "cover") {
      return (
        <div className="flex flex-col justify-center items-start h-full px-6 text-left">
          <h3
            className={`text-2xl font-black leading-tight tracking-tight mb-2 ${theme === "warm-creative" ? "font-serif" : ""}`}
          >
            {activeSlide.title}
          </h3>
          <p className="text-xs opacity-80 mb-6 font-medium leading-relaxed">
            {activeSlide.subtitle}
          </p>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                theme === "startup-clean"
                  ? "bg-slate-900 text-white"
                  : "bg-white/20 text-white"
              } ${theme === "bold-yellow" ? "bg-black text-yellow-400" : ""}`}
            >
              {authorAbbrev}
            </div>
            <span className="text-xs font-semibold">{author}</span>
          </div>
        </div>
      );
    }

    if (activeSlide.type === "cta") {
      return (
        <div className="flex flex-col justify-center items-center h-full px-6 text-center">
          <h3
            className={`text-2xl font-black leading-tight mb-2 ${theme === "warm-creative" ? "font-serif" : ""}`}
          >
            {activeSlide.title}
          </h3>
          <p className="text-xs opacity-80 mb-6 leading-relaxed">
            {activeSlide.subtitle}
          </p>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                theme === "startup-clean"
                  ? "bg-slate-900 text-white"
                  : "bg-white/20 text-white"
              } ${theme === "bold-yellow" ? "bg-black text-yellow-400" : ""}`}
            >
              {authorAbbrev}
            </div>
            <span className="text-xs font-semibold">{author}</span>
          </div>
        </div>
      );
    }

    if (activeSlide.type === "code") {
      const lang = activeSlide.language || "javascript";
      const getHighlightedCode = () => {
        try {
          if (hljs.getLanguage(lang)) {
            return hljs.highlight(activeSlide.code || "", {
              language: lang,
            }).value;
          } else {
            return hljs.highlightAuto(activeSlide.code || "").value;
          }
        } catch {
          return activeSlide.code || "";
        }
      };
      const highlightedCode = getHighlightedCode();

      return (
        <div className="flex flex-col justify-between h-full px-6 text-left py-4">
          <h4
            className={`text-lg font-extrabold mb-2 leading-snug ${theme === "warm-creative" ? "font-serif text-[#431407]" : ""}`}
          >
            {activeSlide.title}
          </h4>
          <div className="flex-1 flex flex-col justify-center my-2">
            <div className="w-full bg-[#1e1e2e] border border-slate-700/50 rounded-lg overflow-hidden shadow-md font-mono text-[9px] text-left">
              <pre className="p-3 m-0 overflow-x-auto text-[#cdd6f4] whitespace-pre-wrap break-all leading-normal">
                <code
                  className="hljs"
                  style={{ background: "transparent" }}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
            </div>
          </div>
        </div>
      );
    }

    if (activeSlide.type === "text") {
      return (
        <div className="flex flex-col justify-between h-full px-6 text-left py-4">
          <h4
            className={`text-lg font-extrabold mb-2 leading-snug ${theme === "warm-creative" ? "font-serif text-[#431407]" : ""}`}
          >
            {activeSlide.title}
          </h4>
          <div className="flex-1 flex flex-col justify-center my-2">
            <div className="opacity-90 leading-relaxed font-medium">
              {renderTextMarkdown(activeSlide.content || "")}
            </div>
          </div>
        </div>
      );
    }

    const lines = (activeSlide.content || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return (
      <div className="flex flex-col justify-between h-full px-6 text-left py-4">
        <h4
          className={`text-lg font-extrabold mb-2 leading-snug ${theme === "warm-creative" ? "font-serif text-[#431407]" : ""}`}
        >
          {activeSlide.title}
        </h4>
        <div className="flex-1 flex flex-col justify-center my-2">
          <ul className="space-y-2.5 text-xs opacity-90 leading-relaxed font-medium">
            {lines.map((line, i) => {
              const cleaned = line.replace(/^[-*•■]\s*/, "");
              return (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: activeTheme.accent }}
                  >
                    {theme === "bold-yellow"
                      ? "■"
                      : theme === "warm-creative"
                        ? "•"
                        : "➔"}
                  </span>
                  <span>{cleaned}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex={60}
      title="Criador de Carrossel de Slides (PDF)"
      className="max-w-5xl h-[85vh] max-h-[90vh]"
    >
      <div className="flex flex-col h-full overflow-hidden bg-bg-app">
        {/* Main Editor Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left panel - Inputs and Themes */}
          <div className="w-[50%] border-r border-border-color p-5 space-y-5 overflow-y-auto h-full bg-bg-card">
            {/* AI Prompter */}
            <div className="p-3 bg-brand-blue/5 border border-brand-blue/15 rounded-lg space-y-2.5">
              <div className="flex items-center gap-1.5 text-brand-blue font-bold text-xs">
                <Sparkles size={14} className="fill-brand-blue/10" />
                <span>Gerar Carrossel com IA</span>
              </div>
              <Input
                value={aiPrompt}
                onChange={setAiPrompt}
                placeholder="Ex: 5 erros comuns em Javascript..."
                className="text-xs bg-bg-card"
              />
              <div className="flex gap-2 items-center">
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="border border-border-color rounded-lg bg-bg-card text-text-primary px-3 py-1.5 text-[10px] focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue flex-1 transition-colors h-8"
                >
                  <option value="professional">Profissional & Técnico</option>
                  <option value="inspirational">Inspirador & Pessoal</option>
                  <option value="casual">Casual</option>
                  <option value="persuasive">Persuasivo</option>
                </select>
                <Button
                  onClick={handleGenerateWithAi}
                  disabled={generating}
                  variant="primary"
                  size="sm"
                  className="h-8 text-xs px-4"
                >
                  {generating ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Gerar"
                  )}
                </Button>
              </div>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Título do Carrossel
                </label>
                <Input
                  value={carouselTitle}
                  onChange={setCarouselTitle}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Assinatura
                </label>
                <Input
                  value={author}
                  onChange={setAuthor}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Theme selection grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Tema Visual (Carrossel)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`p-2.5 rounded-lg text-left border flex flex-col justify-between h-16 transition-all cursor-pointer ${
                      theme === opt.id
                        ? "border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue shadow-sm"
                        : "border-border-color bg-bg-card hover:bg-bg-hover"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] font-bold text-text-primary">
                        {opt.name}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${opt.bg}`} />
                    </div>
                    <span className="text-[8px] text-text-secondary leading-tight line-clamp-1">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Slide text fields */}
            {activeSlide && (
              <div className="border border-border-color rounded-xl p-4 bg-bg-card space-y-3.5 animate-fadeIn shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-text-primary">
                    Slide {activeIndex + 1} ({activeSlide.type.toUpperCase()})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/5 py-0.5 px-2 h-auto text-[10px]"
                    icon={<Trash2 size={10} />}
                    onClick={() => handleRemoveSlide(activeIndex)}
                  >
                    Excluir
                  </Button>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Título do Slide
                    </label>
                    <Input
                      value={activeSlide.title}
                      onChange={(val) => handleUpdateSlide({ title: val })}
                      className="text-xs"
                    />
                  </div>

                  {(activeSlide.type === "cover" ||
                    activeSlide.type === "cta") && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Subtítulo
                      </label>
                      <Input
                        value={activeSlide.subtitle || ""}
                        onChange={(val) => handleUpdateSlide({ subtitle: val })}
                        className="text-xs"
                      />
                    </div>
                  )}

                  {activeSlide.type === "content" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Tópicos (um por linha)
                      </label>
                      <Textarea
                        value={activeSlide.content || ""}
                        onChange={(val) => handleUpdateSlide({ content: val })}
                        className="text-xs font-mono"
                        rows={4}
                      />
                    </div>
                  )}

                  {activeSlide.type === "text" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Conteúdo (Parágrafos ou tabela markdown)
                      </label>
                      <Textarea
                        value={activeSlide.content || ""}
                        onChange={(val) => handleUpdateSlide({ content: val })}
                        placeholder={`Adicione parágrafos ou uma tabela no formato markdown, por exemplo:\n| Coluna 1 | Coluna 2 |\n| Conteúdo | Detalhe |`}
                        className="text-xs font-mono"
                        rows={6}
                      />
                    </div>
                  )}

                  {activeSlide.type === "code" && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                          Linguagem
                        </label>
                        <Input
                          value={activeSlide.language || ""}
                          onChange={(val) =>
                            handleUpdateSlide({ language: val })
                          }
                          placeholder="javascript, typescript, python, etc."
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                          Código
                        </label>
                        <Textarea
                          value={activeSlide.code || ""}
                          onChange={(val) => handleUpdateSlide({ code: val })}
                          className="text-xs font-mono"
                          rows={6}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Slide Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-color w-full">
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() => handleAddSlide("content")}
                className="text-[10px] py-1 justify-center"
              >
                + Lista/Bullets
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() => handleAddSlide("text")}
                className="text-[10px] py-1 justify-center"
              >
                + Texto/Tabela
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() => handleAddSlide("code")}
                className="text-[10px] py-1 justify-center"
              >
                + Código
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() => handleAddSlide("cta")}
                className="text-[10px] py-1 justify-center"
              >
                + CTA final
              </Button>
            </div>
          </div>

          {/* Right panel - Live Preview & Slide nav */}
          <div className="w-[50%] flex flex-col items-center justify-center p-8 space-y-5 bg-bg-hover">
            {/* Live Card (4:5 Aspect Ratio) */}
            <div className="w-full max-w-[340px] aspect-[4/5] relative rounded-xl overflow-hidden shadow-lg border border-border-color/20 flex flex-col shrink-0">
              {activeSlide ? (
                <div
                  className={`w-full h-full flex flex-col justify-between p-6 text-left relative ${activeTheme.bg} ${activeTheme.text}`}
                >
                  <div className="flex-1 flex flex-col justify-between">
                    {renderPreviewContent()}
                  </div>

                  {/* Foot block */}
                  <div className="flex justify-between items-center w-full border-t border-current/10 pt-3 text-[9px] font-semibold opacity-90">
                    <span className="truncate max-w-[90px]">{author}</span>
                    {activeIndex < slides.length - 1 ? (
                      <span>{activeSlide.footer || "Deslize"} ➔</span>
                    ) : (
                      <span></span>
                    )}
                    <span>
                      {activeIndex + 1} / {slides.length}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-bg-card flex flex-col items-center justify-center text-text-secondary text-[10px]">
                  <FileText size={24} className="opacity-40 mb-1" />
                  <span>Sem slides</span>
                </div>
              )}
            </div>

            {/* Slider Navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                className="p-1.5 border border-border-color rounded-full bg-bg-card hover:bg-bg-hover disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-bold text-text-primary">
                Slide {activeIndex + 1} de {slides.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    Math.min(slides.length - 1, prev + 1),
                  )
                }
                disabled={activeIndex === slides.length - 1}
                className="p-1.5 border border-border-color rounded-full bg-bg-card hover:bg-bg-hover disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Mini thumbnails */}
            <div className="flex gap-1.5 max-w-full overflow-x-auto select-none pt-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-8 h-10 rounded border text-[8px] font-bold flex flex-col justify-between p-1 shrink-0 ${
                    activeIndex === idx
                      ? "border-brand-blue bg-brand-blue/5"
                      : "border-border-color bg-bg-card"
                  }`}
                >
                  <span className="text-text-secondary">{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-border-color bg-bg-card shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={exporting}>
            Cancelar
          </Button>
          <Button
            onClick={handleComplete}
            disabled={exporting || generating}
            variant="primary"
            icon={
              exporting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )
            }
          >
            {exporting ? "Gerando PDF..." : "Anexar e Gerar PDF"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
