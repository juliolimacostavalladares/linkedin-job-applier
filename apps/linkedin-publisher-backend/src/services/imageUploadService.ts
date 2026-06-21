import { logger } from '../utils/logger';

export interface ImageUploadResult {
  success: boolean;
  mediaUrn?: string;
  error?: string;
}

/**
 * Registers an image upload with LinkedIn and gets the upload URL.
 * This is step 1 of the image upload process.
 */
async function registerUpload(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  fileSize: number,
  filename: string,
  mediaUploadType: 'IMAGE_SHARING' | 'DOCUMENT_SHARING',
): Promise<{ uploadUrl: string; asset: string; mediaArtifact: string } | null> {
  const apiUrl = 'https://www.linkedin.com/voyager/api/voyagerVideoDashMediaUploadMetadata?action=upload';

  const headers: Record<string, string> = {
    'accept': 'application/vnd.linkedin.normalized+json+2.1',
    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json; charset=UTF-8',
    'cookie': cookie,
    'csrf-token': csrf,
    'origin': 'https://www.linkedin.com',
    'referer': 'https://www.linkedin.com/feed/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    'x-restli-protocol-version': '2.0.0',
  };

  // Add optional tracking headers if they exist
  if (dynamicHeaders['x-li-page-instance']) {
    headers['x-li-page-instance'] = dynamicHeaders['x-li-page-instance'];
  }
  if (dynamicHeaders['x-li-pem-metadata']) {
    headers['x-li-pem-metadata'] = dynamicHeaders['x-li-pem-metadata'];
  }
  if (dynamicHeaders['x-li-track']) {
    headers['x-li-track'] = dynamicHeaders['x-li-track'];
  }

  const payload = {
    mediaUploadType: mediaUploadType,
    fileSize: fileSize,
    filename: filename,
  };

  logger.info('Registering media upload', { apiUrl, payload });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    logger.info('Register upload response', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Failed to register media upload', { 
        status: response.status, 
        statusText: response.statusText,
        errorBody: errorText
      });
      return null;
    }

    const data = (await response.json()) as {
      data?: {
        value?: {
          urn?: string;
          mediaArtifactUrn?: string;
          singleUploadUrl?: string;
        };
      };
      value?: {
        urn?: string;
        asset?: string;
        mediaArtifactUrn?: string;
        mediaArtifact?: string;
        singleUploadUrl?: string;
        uploadUrl?: string;
        uploadMechanism?: {
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'?: {
            uploadUrl: string;
          };
          uploadUrl?: string;
        };
        uploadUrl?: string;
      };
      urn?: string;
      asset?: string;
      mediaArtifactUrn?: string;
      mediaArtifact?: string;
      singleUploadUrl?: string;
      uploadUrl?: string;
    };
    
    logger.info('Register upload data received', { 
      fullData: JSON.stringify(data, null, 2)
    });

    // LinkedIn API response structure
    let uploadUrl: string | undefined;
    let asset: string | undefined;
    let mediaArtifact: string | undefined;

    // Extract data from the response
    if (data.data && data.data.value) {
      // API format from curl
      const value = data.data.value;
      asset = value.urn;
      mediaArtifact = value.mediaArtifactUrn;
      uploadUrl = value.singleUploadUrl;
    } else if (data.value) {
      // Alternative format
      asset = data.value.urn || data.value.asset;
      mediaArtifact = data.value.mediaArtifactUrn || data.value.mediaArtifact;
      uploadUrl = data.value.singleUploadUrl || data.value.uploadUrl;
      
      // Check for uploadMechanism if direct URLs not found
      if (!uploadUrl && data.value.uploadMechanism) {
        const uploadMechanism = data.value.uploadMechanism;
        if (uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']) {
          uploadUrl = uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        } else if (uploadMechanism.uploadUrl) {
          uploadUrl = uploadMechanism.uploadUrl;
        }
      }
    } else {
      // Fallback to direct format
      asset = data.urn || data.asset;
      mediaArtifact = data.mediaArtifactUrn || data.mediaArtifact;
      uploadUrl = data.singleUploadUrl || data.uploadUrl;
    }

    if (!uploadUrl || !asset || !mediaArtifact) {
      logger.error('Missing required fields in response', { 
        hasUploadUrl: !!uploadUrl, 
        hasAsset: !!asset, 
        hasMediaArtifact: !!mediaArtifact 
      });
      return null;
    }

    logger.info('Successfully extracted upload data', { asset, mediaArtifact, uploadUrl: uploadUrl.substring(0, 50) + '...' });

    return {
      uploadUrl,
      asset,
      mediaArtifact,
    };
  } catch (error) {
    logger.error('Error registering media upload', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name
    });
    return null;
  }
}

async function registerImageUpload(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  fileSize: number,
  filename: string,
): Promise<{ uploadUrl: string; asset: string; mediaArtifact: string } | null> {
  return registerUpload(cookie, csrf, dynamicHeaders, fileSize, filename, 'IMAGE_SHARING');
}

async function registerDocumentUpload(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  fileSize: number,
  filename: string,
): Promise<{ uploadUrl: string; asset: string; mediaArtifact: string } | null> {
  return registerUpload(cookie, csrf, dynamicHeaders, fileSize, filename, 'DOCUMENT_SHARING');
}

/**
 * Uploads an image to LinkedIn using the upload URL from registration.
 * This is step 2 of the image upload process.
 */
async function uploadImageToUrl(
  uploadUrl: string,
  imageBuffer: Buffer,
  cookie: string,
): Promise<boolean> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'cookie': cookie,
        'content-type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      logger.error('Failed to upload image', { status: response.status });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error uploading image:', {
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Registers the uploaded images and creates a media entity.
 * This is step 3 of the image upload process.
 */
async function registerMediaEntity(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  mediaArtifacts: string[],
): Promise<string | null> {
  const apiUrl = 'https://www.linkedin.com/voyager/api/voyagerMediaUploadMetadata?action=createMediaEntity';

  const headers: Record<string, string> = {
    'accept': 'application/vnd.linkedin.normalized+json+2.1',
    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json; charset=UTF-8',
    'cookie': cookie,
    'csrf-token': csrf,
    'origin': 'https://www.linkedin.com',
    'referer': 'https://www.linkedin.com/feed/',
    'x-restli-protocol-version': '2.0.0',
  };

  // Add optional tracking headers
  if (dynamicHeaders['x-li-page-instance']) {
    headers['x-li-page-instance'] = dynamicHeaders['x-li-page-instance'];
  }

  const payload = {
    mediaCategory: 'IMAGE',
    mediaArtifacts: mediaArtifacts,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('Failed to register media entity', { status: response.status });
      return null;
    }

    const data = (await response.json()) as { value: { entity: string } };

    // Extract the media URN from the response
    // The entity will be something like: "urn:li:digitalmediaAsset:..."
    // We need to convert it to the format used in posts: "urn:li:fsd_multiPhoto:..."

    // For now, return the entity URN
    // The actual conversion might be handled by LinkedIn's API
    return data.value.entity;
  } catch (error) {
    logger.error('Error registering media entity:', {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * Main function to upload multiple images to LinkedIn and get the mediaUrn.
 * This orchestrates the upload process.
 * For single images, returns the asset URN directly.
 * For multiple images, creates a media entity.
 */
export async function uploadImages(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  images: Buffer[],
): Promise<ImageUploadResult> {
  logger.info('Starting image upload process', { imageCount: images.length });

  const assets: string[] = [];
  const mediaArtifacts: string[] = [];

  // Step 1 & 2: Register and upload each image
  for (let i = 0; i < images.length; i++) {
    const imageBuffer = images[i];
    const filename = `image_${i + 1}.png`;
    const fileSize = imageBuffer.length;

    logger.info(`Processing image ${i + 1}`, { filename, fileSize });

    // Register the upload
    const registrationResult = await registerImageUpload(cookie, csrf, dynamicHeaders, fileSize, filename);
    if (!registrationResult) {
      return {
        success: false,
        error: `Failed to register upload for image ${i + 1}`,
      };
    }

    // Upload the image
    const uploadSuccess = await uploadImageToUrl(registrationResult.uploadUrl, imageBuffer, cookie);
    if (!uploadSuccess) {
      return {
        success: false,
        error: `Failed to upload image ${i + 1}`,
      };
    }

    assets.push(registrationResult.asset);
    mediaArtifacts.push(registrationResult.mediaArtifact);
    logger.info(`Image ${i + 1} uploaded successfully`, { 
      asset: registrationResult.asset,
      mediaArtifact: registrationResult.mediaArtifact 
    });
  }

  // For single image, return the asset URN directly
  if (images.length === 1) {
    logger.info('Single image upload completed', { mediaUrn: assets[0] });
    return {
      success: true,
      mediaUrn: assets[0],
    };
  }

  // For multiple images, create a media entity
  const mediaUrn = await registerMediaEntity(cookie, csrf, dynamicHeaders, mediaArtifacts);
  if (!mediaUrn) {
    return {
      success: false,
      error: 'Failed to register media entity',
    };
  }

  logger.info('Multiple image upload completed successfully', { mediaUrn });

  return {
    success: true,
    mediaUrn,
  };
}

/**
 * Main function to upload a PDF document to LinkedIn and get the mediaUrn.
 */
export async function uploadDocument(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  documentBuffer: Buffer,
  filename: string,
): Promise<ImageUploadResult> {
  logger.info('Starting document upload process', { filename, fileSize: documentBuffer.length });

  // Register the upload
  const registrationResult = await registerDocumentUpload(cookie, csrf, dynamicHeaders, documentBuffer.length, filename);
  if (!registrationResult) {
    return {
      success: false,
      error: 'Failed to register document upload',
    };
  }

  // Upload the document
  const uploadSuccess = await uploadImageToUrl(registrationResult.uploadUrl, documentBuffer, cookie);
  if (!uploadSuccess) {
    return {
      success: false,
      error: 'Failed to upload document',
    };
  }

  logger.info('Document upload completed successfully', { mediaUrn: registrationResult.asset });

  return {
    success: true,
    mediaUrn: registrationResult.asset,
  };
}
