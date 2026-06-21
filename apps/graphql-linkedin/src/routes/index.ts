import { Router } from 'express';
import { jobsRouter } from './jobs';
import { postsRouter } from './posts';
import { profileRouter } from './profile';

export const apiRouter = Router();

apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/profile', profileRouter);
