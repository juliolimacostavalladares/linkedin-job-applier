import { AppError } from './errorHandler';

export const validateRequired = (value: any, fieldName: string) => {
  if (!value || value === '') {
    throw new AppError(`${fieldName} é obrigatório`, 400);
  }
};

export const validateProfileId = (profileId: string) => {
  validateRequired(profileId, 'Profile ID');
  
  if (!/^ACo[A-Za-z0-9_-]+$/.test(profileId)) {
    throw new AppError('Profile ID do LinkedIn inválido', 400);
  }
};

export const validateQuestions = (questions: any[]) => {
  validateRequired(questions, 'questions');
  
  if (!Array.isArray(questions)) {
    throw new AppError('questions deve ser um array', 400);
  }
};

export const validateResume = (resume: string) => {
  validateRequired(resume, 'resume');
  
  if (resume.length < 50) {
    throw new AppError('Currículo muito curto para análise', 400);
  }
};
