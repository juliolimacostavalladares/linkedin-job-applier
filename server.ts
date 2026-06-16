import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import pdfParse from "pdf-parse";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies with increased limit for large LinkedIn responses
  app.use(express.json({ limit: '50mb' }));

  // Armazenamento em memória (temporário) para vagas importadas via Extensão
  let importedJobs: any[] = [];
  let hasImportedJobs = false;

  // Check connection status / credentials
  app.get("/api/config", (req, res) => {
    const cookie = process.env.LINKEDIN_COOKIE;
    const csrf = process.env.LINKEDIN_CSRF;

    return res.json({ 
      hasCredentials: !!(cookie && csrf),
      hasImportedJobs: hasImportedJobs
    });
  });

  // Receive data from Chrome Extension (The "Invisible Curl" approach)
  app.post("/api/jobs/import-json", (req, res) => {
    try {
      const data = req.body;
      const included = data.included || [];
      const jobsMap = new Map<string, any>();

      // Extract Job Titles
      included.forEach((item: any) => {
        if (item.$type === "com.linkedin.voyager.dash.jobs.JobPosting") {
          const idParts = item.entityUrn?.split(':') || [];
          const id = idParts[idParts.length - 1];
          if (id) {
            if (!jobsMap.has(id)) jobsMap.set(id, { id });
            jobsMap.get(id).title = item.title;
          }
        }
      });

      const includedMap = new Map();
      included.forEach((item: any) => {
         const urn = item.entityUrn || item.urn;
         if (urn) includedMap.set(urn, item);
      });

      // Extract Company and Location
      included.forEach((item: any) => {
        if (item.$type === "com.linkedin.voyager.dash.jobs.JobPostingCard") {
          const match = item.entityUrn?.match(/\((\d+),/);
          if (match && match[1]) {
            const id = match[1];
            if (!jobsMap.has(id)) jobsMap.set(id, { id });
            jobsMap.get(id).companyInfo = item.primaryDescription?.text || "Empresa não informada";

            let vectorImage = null;
            const detailData = item.logo?.attributes?.[0]?.detailData;
            
            if (detailData) {
               for (const key of Object.keys(detailData)) {
                  const val = detailData[key];
                  if (typeof val === 'string' && val.startsWith('urn:li:')) {
                     const resolved = includedMap.get(val);
                     if (resolved && resolved.logoResolutionResult?.vectorImage) vectorImage = resolved.logoResolutionResult.vectorImage;
                     else if (resolved && resolved.vectorImage) vectorImage = resolved.vectorImage;
                     else if (resolved && resolved.profilePicture?.displayImageReferenceResolutionResult?.vectorImage) vectorImage = resolved.profilePicture.displayImageReferenceResolutionResult.vectorImage;
                  } else if (val && typeof val === 'object') {
                     if (val.logoResolutionResult?.vectorImage) vectorImage = val.logoResolutionResult.vectorImage;
                     else if (val.vectorImage) vectorImage = val.vectorImage;
                  }
               }
            }
            
            if (!vectorImage && item.companyDetails?.["*company"]) {
               const company = includedMap.get(item.companyDetails["*company"]);
               if (company && company.logoResolutionResult?.vectorImage) {
                  vectorImage = company.logoResolutionResult.vectorImage;
               }
            }

            if (vectorImage && vectorImage.rootUrl && vectorImage.artifacts && vectorImage.artifacts.length > 0) {
               const artifact = vectorImage.artifacts.find((a: any) => a.width === 100) || vectorImage.artifacts[0];
               jobsMap.get(id).companyLogo = vectorImage.rootUrl + artifact.fileIdentifyingUrlPathSegment;
            }
          }
        }
      });

      importedJobs = Array.from(jobsMap.values()).filter(j => j.title);
      hasImportedJobs = importedJobs.length > 0;

      res.json({ success: true, count: importedJobs.length });
    } catch (err: any) {
      console.error("Erro na importação:", err);
      res.status(500).json({ error: "Erro interno ao processar o JSON" });
    }
  });

  // Fetch Recommended Jobs List
  app.get("/api/jobs", async (req, res) => {
    try {
      // Se tivermos vagas injetadas pela extensão, damos prioridade! (Abordagem Antirrisco)
      if (hasImportedJobs && importedJobs.length > 0) {
        return res.json({ jobs: importedJobs, source: 'extension' });
      }

      const cookie = process.env.LINKEDIN_COOKIE;
      const csrf = process.env.LINKEDIN_CSRF;

      if (!cookie || !csrf) {
        return res.status(401).json({ error: "Credenciais ausentes: Configure LINKEDIN_COOKIE e LINKEDIN_CSRF." });
      }

      const apiUrl = "https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(count:24,jobCollectionSlug:easy-apply,query:(origin:GENERIC_JOB_COLLECTIONS_LANDING),start:0)&queryId=voyagerJobsDashJobCards.e5b6b761ede078dabe8ad857aa42c220";

      const response = await fetch(apiUrl, {
        headers: {
          "accept": "application/vnd.linkedin.normalized+json+2.1",
          "csrf-token": csrf,
          "cookie": cookie,
          "x-restli-protocol-version": "2.0.0",
        },
        redirect: 'manual'
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || (response.status >= 300 && response.status < 400)) {
           return res.status(response.status >= 300 && response.status < 400 ? 401 : response.status).json({ error: "Acesso negado: O cookie ou token expirou (redirecionado para login)." });
        }
        return res.status(response.status).json({ error: `Erro na API do LinkedIn: ${response.statusText}` });
      }

      const data = await response.json();
      const included = data.included || [];
      const jobsMap = new Map<string, any>();

      // Extract Job Titles
      included.forEach((item: any) => {
        if (item.$type === "com.linkedin.voyager.dash.jobs.JobPosting") {
          const idParts = item.entityUrn?.split(':') || [];
          const id = idParts[idParts.length - 1]; // "4426333069"
          if (id) {
            if (!jobsMap.has(id)) jobsMap.set(id, { id });
            jobsMap.get(id).title = item.title;
          }
        }
      });

      const includedMap = new Map();
      included.forEach((item: any) => {
         const urn = item.entityUrn || item.urn;
         if (urn) includedMap.set(urn, item);
      });

      // Extract Company and Location
      included.forEach((item: any) => {
        if (item.$type === "com.linkedin.voyager.dash.jobs.JobPostingCard") {
          // entityUrn => "urn:li:fsd_jobPostingCard:(4422143190,JOB_DETAILS)"
          const match = item.entityUrn?.match(/\((\d+),/);
          if (match && match[1]) {
            const id = match[1];
            if (!jobsMap.has(id)) jobsMap.set(id, { id });
            jobsMap.get(id).companyInfo = item.primaryDescription?.text || "Empresa não informada";

            let vectorImage = null;
            const detailData = item.logo?.attributes?.[0]?.detailData;
            
            if (detailData) {
               for (const key of Object.keys(detailData)) {
                  const val = detailData[key];
                  if (typeof val === 'string' && val.startsWith('urn:li:')) {
                     const resolved = includedMap.get(val);
                     if (resolved && resolved.logoResolutionResult?.vectorImage) vectorImage = resolved.logoResolutionResult.vectorImage;
                     else if (resolved && resolved.vectorImage) vectorImage = resolved.vectorImage;
                     else if (resolved && resolved.profilePicture?.displayImageReferenceResolutionResult?.vectorImage) vectorImage = resolved.profilePicture.displayImageReferenceResolutionResult.vectorImage;
                  } else if (val && typeof val === 'object') {
                     if (val.logoResolutionResult?.vectorImage) vectorImage = val.logoResolutionResult.vectorImage;
                     else if (val.vectorImage) vectorImage = val.vectorImage;
                  }
               }
            }
            
            if (!vectorImage && item.companyDetails?.["*company"]) {
               const company = includedMap.get(item.companyDetails["*company"]);
               if (company && company.logoResolutionResult?.vectorImage) {
                  vectorImage = company.logoResolutionResult.vectorImage;
               }
            }

            if (vectorImage && vectorImage.rootUrl && vectorImage.artifacts && vectorImage.artifacts.length > 0) {
               const artifact = vectorImage.artifacts.find((a: any) => a.width === 100) || vectorImage.artifacts[0];
               jobsMap.get(id).companyLogo = vectorImage.rootUrl + artifact.fileIdentifyingUrlPathSegment;
            }
          }
        }
      });

      const jobsList = Array.from(jobsMap.values()).filter(j => j.title);
      res.json({ jobs: jobsList });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Erro interno no servidor ao buscar as vagas." });
    }
  });

  // Fetch Specific Job Details
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cookie = process.env.LINKEDIN_COOKIE;
      const csrf = process.env.LINKEDIN_CSRF;

      if (!cookie || !csrf) {
        return res.status(401).json({ error: "Credenciais ausentes." });
      }

      const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${id}`;
      const response = await fetch(apiUrl, {
        headers: {
          "accept": "application/vnd.linkedin.normalized+json+2.1",
          "csrf-token": csrf,
          "cookie": cookie,
          "x-restli-protocol-version": "2.0.0",
        },
        redirect: 'manual'
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || (response.status >= 300 && response.status < 400)) {
           return res.status(response.status >= 300 && response.status < 400 ? 401 : response.status).json({ error: "Acesso negado: O cookie ou token expirou (redirecionado para login)." });
        }
        return res.status(response.status).json({ error: `Erro na API: ${response.statusText}` });
      }

      const jsonData = await response.json();
      const data = jsonData.data || jsonData;
      
      const details = {
        id,
        title: data.title || "Vaga desconhecida",
        description: data.description?.text || "<em>Sem descrição detalhada.</em>",
        location: data.formattedLocation || "",
        url: data.applyMethod?.companyApplyUrl || data.jobPostingUrl || `https://www.linkedin.com/jobs/view/${id}`,
        employmentStatus: data.employmentStatus?.split(':').pop() || "FULL_TIME",
        companyName: data.companyDetails?.company?.split(':').pop() || "" // We may need to get company from included, but let's see. Wait, we can also extract company from the list previously
      };

      res.json(details);

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Erro interno ao buscar destalhes da vaga." });
    }
  });

  // Fetch Resume from LinkedIn PDF endpoint
  app.post("/api/resume/from-linkedin", async (req, res) => {
    try {
      const { profileId } = req.body;
      const cookie = process.env.LINKEDIN_COOKIE;
      const csrf = process.env.LINKEDIN_CSRF;

      if (!cookie || !csrf) {
        return res.status(401).json({ error: "Credenciais do LinkedIn ausentes no servidor." });
      }

      if (!profileId) {
        return res.status(400).json({ error: "Profile ID é obrigatório. Ex: ACoAACl_iLsBUIs0ZwKzUBTxTMYr7FEp4K8_m_o" });
      }

      const apiUrl = "https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=com.linkedin.sdui.requests.profile.saveProfileToPdf";
      
      const payload = {
         requestId: "com.linkedin.sdui.requests.profile.saveProfileToPdf",
         serverRequest: {
            requestId: "com.linkedin.sdui.requests.profile.saveProfileToPdf",
            requestedArguments: {
               $type: "proto.sdui.actions.requests.RequestedArguments",
               payload: { profileId }
            },
            requestedStateKeys: [],
            requestMetadata: { $type: "proto.sdui.common.RequestMetadata" }
         },
         isApfcEnabled: false,
         isStreaming: false,
         rumPageKey: "",
         states: [],
         requestedArguments: {
            $type: "proto.sdui.actions.requests.RequestedArguments",
            payload: { profileId },
            requestedStateKeys: [],
            requestMetadata: { $type: "proto.sdui.common.RequestMetadata" },
            states: [],
            screenId: "com.linkedin.sdui.flagshipnav.profile.Profile"
         }
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "application/json",
          "csrf-token": csrf,
          "cookie": cookie,
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Erro ao baixar PDF do LinkedIn: " + response.statusText });
      }

      const textResponse = await response.text();
      const urlMatch = textResponse.match(/"url":"(https:\/\/www\.linkedin\.com\/ambry\/[^"]+)"/);
      
      if (!urlMatch || !urlMatch[1]) {
         return res.status(500).json({ error: "URL do PDF não encontrada na resposta. Verifique as credenciais e o ID." });
      }

      const pdfUrl = urlMatch[1];
      
      const pdfResponse = await fetch(pdfUrl, {
         headers: {
            "cookie": cookie,
            "accept": "*/*",
         }
      });

      if (!pdfResponse.ok) {
         return res.status(pdfResponse.status).json({ error: "Erro ao baixar arquivo do LinkedIn Ambry: " + pdfResponse.statusText });
      }

      const buffer = await pdfResponse.arrayBuffer();
      
      const parsedData = await pdfParse(Buffer.from(buffer));
      const pdfBase64 = Buffer.from(buffer).toString('base64');
      
      res.json({ success: true, text: parsedData.text, pdfBase64 });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Erro interno ao processar o PDF do currículo.", details: err.message });
    }
  });

  // Generate Answers using Gemini
  app.post("/api/generate-answers", async (req, res) => {
    try {
      const { questions, resume } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(401).json({ error: "GEMINI_API_KEY não configurada no servidor." });
      }
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
Você é um assistente especialista em recrutamento. Dado o currículo do usuário e um formulário de candidatura a uma vaga, sugira a melhor resposta para cada pergunta baseada no currículo.

Currículo do Usuário:
${resume || "Não informado"}

Perguntas do Formulário:
${JSON.stringify(questions, null, 2)}

Retorne um JSON contendo as respostas sugeridas. Formato exato:
{
  "answers": [
    { "urn": "urn_do_campo", "answer": "resposta sugerida" }
  ]
}
Regras:
1. Para campos de seleção (dropdown/checkbox/typeahead), escolha a melhor opção baseada nos "options" passados. Se não houver exata, escolha a mais próxima.
2. Para campos de texto livre, responda de forma profissional e concisa.
3. Se for do tipo 'file', apenas diga "Fazer upload do currículo".
4. Retorne APENAS o JSON válido.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      const result = JSON.parse(text);
      res.json(result);
    } catch (err: any) {
      console.error("Erro no Gemini:", err);
      res.status(500).json({ error: "Erro ao gerar respostas com IA." });
    }
  });

  // Fetch Easy Apply Form
  app.get("/api/jobs/:id/apply-form", async (req, res) => {
    try {
      const { id } = req.params;
      const cookie = process.env.LINKEDIN_COOKIE;
      const csrf = process.env.LINKEDIN_CSRF;

      if (!cookie || !csrf) {
        return res.status(401).json({ error: "Credenciais ausentes." });
      }

      const apiUrl = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(jobPostingUrn:urn%3Ali%3Afsd_jobPosting%3A${id})&queryId=voyagerJobsDashOnsiteApplyApplication.96a2a30d12bccaec2b5ba9acbcbbf97c`;
      const response = await fetch(apiUrl, {
        headers: {
          "accept": "application/vnd.linkedin.normalized+json+2.1",
          "csrf-token": csrf,
          "cookie": cookie,
          "x-restli-protocol-version": "2.0.0",
        },
        redirect: 'manual'
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Erro na API de Aplicação: ${response.statusText}` });
      }

      const jsonData = await response.json();
      
      const errors = jsonData.data?.errors || jsonData.errors;
      if (errors && errors.length > 0) {
         return res.json({ success: false, message: errors[0].message || "Erro retornado pelo GraphQL" });
      }

      const included = jsonData.included || [];
      const formElementsMap = new Map();
      included.forEach((item: any) => {
         if (item.$type === "com.linkedin.voyager.dash.common.forms.FormElement" || item.$type === "com.linkedin.voyager.dash.jobs.JobApplicationFileUploadFormElement") {
            const urn = item.formElementUrn || item.urn;
            formElementsMap.set(urn, item);
         }
      });

      const parseField = (el: any) => {
        let type = 'unknown';
        let options = [];
        
        if (el.$type === "com.linkedin.voyager.dash.jobs.JobApplicationFileUploadFormElement") {
           return {
              urn: el.formElementUrn || el.urn,
              required: el.required,
              title: el.title || el.uploadFileCtaText || "Upload File",
              type: "file",
              options: el.mimeTypes || []
           };
        }

        const component = el.formComponentResolutionResult;
        if (component?.singleLineTextFormComponent) type = 'text';
        if (component?.multilineTextFormComponent) type = 'multiline-text';
        if (component?.checkboxFormComponent) {
           type = 'checkbox';
           options = component.checkboxFormComponent.textSelectableOptions?.map((o: any) => o.optionText?.text);
        }
        if (component?.textEntityListFormComponent) {
           type = 'dropdown';
           options = component.textEntityListFormComponent.textSelectableOptions?.map((o: any) => o.optionText?.text);
        }
        if (component?.singleTypeaheadEntityFormComponent) type = 'typeahead';
        if (component?.dateRangeFormComponent) type = 'date-range';
        
        const fallbackTitle = component?.textEntityListFormComponent?.placeHolderText?.text || "Unknown Question";

        return {
          urn: el.urn,
          required: !!el.required,
          title: el.title?.text || fallbackTitle,
          type,
          options
        };
      };

      const steps: any[] = [];
      const sections = included.filter((item: any) => item.$type === "com.linkedin.voyager.dash.jobs.JobApplicationFormSection");
      
      sections.forEach((section: any) => {
         const stepQuestions: any[] = [];
         let title = "Seção";
         
         if (section.questionGroupingType === "RESUME" || section.questionGroupingType === "COVER_LETTER") {
            title = section.customizedFormSection?.fileUploadFormSection?.title || section.questionGroupingType;
            const element = section.customizedFormSection?.fileUploadFormSection?.fileUploadFormElement;
            if (element) {
               stepQuestions.push(parseField(element));
            }
         } else if (section.formSection) {
            title = section.formSection.title?.text || "Informações Adicionais";
            const groups = section.formSection.formElementGroups || [];
            groups.forEach((group: any) => {
               const elements = group["*formElements"] || [];
               elements.forEach((urn: string) => {
                  const el = formElementsMap.get(urn);
                  if (el) stepQuestions.push(parseField(el));
               });
            });
         }

         if (stepQuestions.length > 0) {
            steps.push({ title, questions: stepQuestions.filter((q: any) => q.title && q.title !== "Unknown Question") });
         }
      });

      // Se por algum motivo as seções falharam, fazemos fallback listando todas
      if (steps.length === 0) {
         const flatQuestions = Array.from(formElementsMap.values()).map(parseField).filter((q: any) => q.title && q.title !== "Unknown Question");
         if (flatQuestions.length > 0) {
            steps.push({ title: "Formulário de Candidatura", questions: flatQuestions });
         }
      }

      // Filtrar steps vazios
      const validSteps = steps.filter(s => s.questions.length > 0);

      res.json({ success: true, steps: validSteps, questions: validSteps.flatMap(s => s.questions) });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Erro interno ao buscar o formulário de candidatura." });
    }
  });

  // Vite Integration (Keep API routes above this block!)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
