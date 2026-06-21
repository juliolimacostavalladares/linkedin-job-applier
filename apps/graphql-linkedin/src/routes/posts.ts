import { Router } from 'express';
import * as postsController from '../controllers/postsController';

export const postsRouter = Router();

/**
 * @openapi
 * /api/posts:
 *   post:
 *     tags:
 *       - Posts
 *     operationId: createPost
 *     summary: Create a post on LinkedIn
 *     description: |
 *       Publishes a text post to your LinkedIn feed. Supports optional attachments such as images, articles, or PDF documents.
 *
 *       > [!IMPORTANT]
 *       > For posts containing images or document files, you must first upload the media to LinkedIn and obtain its URN using the standard LinkedIn media upload endpoints, then pass the URN in `mediaUrn`.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Main text content of the post
 *               mediaUrn:
 *                 type: string
 *                 description: URN of image or article media (optional)
 *               mediaCategory:
 *                 type: string
 *                 enum: [IMAGE, DOCUMENT, ARTICLE]
 *                 description: Category type of the media (optional)
 *               documentSharingTitle:
 *                 type: string
 *                 description: Title of shared document (optional)
 *     responses:
 *       200:
 *         description: Post published successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
postsRouter.post('/', postsController.createPost);

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     tags:
 *       - Posts
 *     operationId: deletePost
 *     summary: Delete a post
 *     description: |
 *       Deletes a specific post by its LinkedIn sharing ID.
 *
 *       ### Path Parameters
 *       - `id` (string, required): The unique sharing URN identifier of the post.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LinkedIn post sharing ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
postsRouter.delete('/:id', postsController.deletePost);
