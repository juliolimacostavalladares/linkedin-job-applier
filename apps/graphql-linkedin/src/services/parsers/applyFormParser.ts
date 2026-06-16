import type { ApplyForm, FormQuestion } from '@linkedin-job-applier/shared';
import type { LinkedInGraphQLResponse, LinkedInIncludedItem } from '../../types/linkedin';

/**
 * Parses the raw LinkedIn Voyager GraphQL response for an Easy Apply form
 * into a structured ApplyForm object.
 */
export function parseApplyForm(jsonData: LinkedInGraphQLResponse): ApplyForm {
  const included = jsonData.included ?? [];

  // ── Build a map of form elements by URN ────────────────────────────────────
  const formElementsMap = new Map<string, LinkedInIncludedItem>();
  for (const item of included) {
    if (
      item.$type ===
        'com.linkedin.voyager.dash.common.forms.FormElement' ||
      item.$type ===
        'com.linkedin.voyager.dash.jobs.JobApplicationFileUploadFormElement'
    ) {
      const urn = item.formElementUrn ?? item.urn;
      if (urn) formElementsMap.set(urn, item);
    }
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  interface ParsedStep {
    title: string;
    questions: FormQuestion[];
  }

  const steps: ParsedStep[] = [];
  const sections = included.filter(
    (item) =>
      item.$type ===
      'com.linkedin.voyager.dash.jobs.JobApplicationFormSection',
  );

  for (const section of sections) {
    const stepQuestions: FormQuestion[] = [];
    let title = 'Seção';

    if (
      section.questionGroupingType === 'RESUME' ||
      section.questionGroupingType === 'COVER_LETTER'
    ) {
      title =
        section.customizedFormSection?.fileUploadFormSection?.title ??
        section.questionGroupingType;
      const element = section.customizedFormSection?.fileUploadFormSection
        ?.fileUploadFormElement as LinkedInIncludedItem | undefined;
      if (element) stepQuestions.push(parseField(element));
    } else if (section.formSection) {
      title =
        section.formSection.title?.text ?? 'Informações Adicionais';
      const groups = section.formSection.formElementGroups ?? [];
      for (const group of groups) {
        for (const urn of group['*formElements'] ?? []) {
          const el = formElementsMap.get(urn);
          if (el) stepQuestions.push(parseField(el));
        }
      }
    }

    if (stepQuestions.length > 0) {
      steps.push({
        title,
        questions: stepQuestions.filter(
          (q) => q.title && q.title !== 'Unknown Question',
        ),
      });
    }
  }

  // ── Fallback: list all elements if section parsing yielded nothing ─────────
  if (steps.length === 0) {
    const flatQuestions = Array.from(formElementsMap.values())
      .map(parseField)
      .filter((q) => q.title && q.title !== 'Unknown Question');
    if (flatQuestions.length > 0) {
      steps.push({ title: 'Formulário de Candidatura', questions: flatQuestions });
    }
  }

  const validSteps = steps.filter((s) => s.questions.length > 0);

  return {
    success: true,
    steps: validSteps,
    questions: validSteps.flatMap((s) => s.questions),
  };
}

// ─── Private helper ───────────────────────────────────────────────────────────

function parseField(el: LinkedInIncludedItem): FormQuestion {
  // File upload elements are their own $type
  if (
    el.$type ===
    'com.linkedin.voyager.dash.jobs.JobApplicationFileUploadFormElement'
  ) {
    return {
      urn: el.formElementUrn ?? el.urn ?? '',
      required: Boolean(el.required),
      title:
        (typeof el.title === 'string' ? el.title : el.title?.text) ??
        el.uploadFileCtaText ??
        'Upload File',
      type: 'file',
      options: el.mimeTypes ?? [],
    };
  }

  let type = 'unknown';
  let options: string[] = [];

  const component = el.formComponentResolutionResult;
  if (component?.singleLineTextFormComponent) type = 'text';
  if (component?.multilineTextFormComponent) type = 'multiline-text';
  if (component?.checkboxFormComponent) {
    type = 'checkbox';
    options =
      component.checkboxFormComponent.textSelectableOptions
        ?.map((o) => o.optionText?.text)
        .filter((t): t is string => typeof t === 'string') ?? [];
  }
  if (component?.textEntityListFormComponent) {
    type = 'dropdown';
    options =
      component.textEntityListFormComponent.textSelectableOptions
        ?.map((o) => o.optionText?.text)
        .filter((t): t is string => typeof t === 'string') ?? [];
  }
  if (component?.singleTypeaheadEntityFormComponent) type = 'typeahead';
  if (component?.dateRangeFormComponent) type = 'date-range';

  const fallbackTitle =
    component?.textEntityListFormComponent?.placeHolderText?.text ??
    'Unknown Question';
  const questionTitle =
    (typeof el.title === 'object' ? el.title?.text : el.title) ??
    fallbackTitle;

  return {
    urn: el.urn ?? '',
    required: Boolean(el.required),
    title: questionTitle,
    type,
    options,
  };
}
