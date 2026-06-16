/**
 * Fetches the authenticated user's LinkedIn profile as a PDF (ArrayBuffer).
 *
 * Two-step process:
 *  1. POST to the RSC server-request endpoint to obtain the Ambry CDN URL.
 *  2. GET the PDF bytes from that CDN URL.
 */
export async function fetchResumePdf(
  profileId: string,
  cookie: string,
  csrf: string,
): Promise<ArrayBuffer> {
  const apiUrl =
    'https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=com.linkedin.sdui.requests.profile.saveProfileToPdf';

  const payload = {
    requestId: 'com.linkedin.sdui.requests.profile.saveProfileToPdf',
    serverRequest: {
      requestId: 'com.linkedin.sdui.requests.profile.saveProfileToPdf',
      requestedArguments: {
        $type: 'proto.sdui.actions.requests.RequestedArguments',
        payload: { profileId },
      },
      requestedStateKeys: [],
      requestMetadata: { $type: 'proto.sdui.common.RequestMetadata' },
    },
    isApfcEnabled: false,
    isStreaming: false,
    rumPageKey: '',
    states: [],
    requestedArguments: {
      $type: 'proto.sdui.actions.requests.RequestedArguments',
      payload: { profileId },
      requestedStateKeys: [],
      requestMetadata: { $type: 'proto.sdui.common.RequestMetadata' },
      states: [],
      screenId: 'com.linkedin.sdui.flagshipnav.profile.Profile',
    },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: buildPdfRequestHeaders(profileId, cookie, csrf),
    body: JSON.stringify(payload),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Erro ao baixar PDF do LinkedIn: ${response.statusText}`);
  }

  const textResponse = await response.text();
  const urlMatch = textResponse.match(
    /"url":"(https:\/\/www\.linkedin\.com\/ambry\/[^"]+)"/,
  );

  if (!urlMatch?.[1]) {
    throw new Error('URL do PDF não encontrada na resposta');
  }

  const pdfUrl = urlMatch[1];
  const pdfResponse = await fetch(pdfUrl, {
    headers: buildAmbryFetchHeaders(cookie),
  });

  if (!pdfResponse.ok) {
    throw new Error(
      `Erro ao baixar arquivo do LinkedIn Ambry: ${pdfResponse.statusText}`,
    );
  }

  return pdfResponse.arrayBuffer();
}

// ─── Header builders (kept private to this module) ────────────────────────────

function buildPdfRequestHeaders(
  profileId: string,
  cookie: string,
  csrf: string,
): Record<string, string> {
  return {
    accept: '*/*',
    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'csrf-token': csrf,
    dnt: '1',
    origin: 'https://www.linkedin.com',
    pragma: 'no-cache',
    priority: 'u=1, i',
    referer: `https://www.linkedin.com/in/${profileId}/`,
    'sec-ch-prefers-color-scheme': 'dark',
    'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    'x-li-anchor-page-key': 'd_flagship3_profile_view_base',
    'x-li-application-instance': 'undefined',
    'x-li-application-version': '0.2.6025',
    'x-li-page-instance':
      'urn:li:page:d_flagship3_profile_view_base;JYk6JxbeTUqXjkNpUgFnZg==',
    'x-li-page-instance-tracking-id': 'JYk6JxbeTUqXjkNpUgFnZg==',
    'x-li-pageforestid': '00065461c408e6a4004a1d771b24b000',
    'x-li-rsc-stream': 'true',
    'x-li-traceparent':
      '00-00065461c408e6a4004a1d771b24b000-3fd4c6e732a05d5c-00',
    'x-li-tracestate': 'LinkedIn=3fd4c6e732a05d5c',
    'x-li-track':
      '{"clientVersion":"0.2.6025","mpVersion":"0.2.6025","osName":"web","timezoneOffset":-3,"timezone":"America/Sao_Paulo","deviceFormFactor":"DESKTOP","mpName":"web","displayDensity":2,"displayWidth":2560,"displayHeight":1600}',
    cookie,
  };
}

function buildAmbryFetchHeaders(cookie: string): Record<string, string> {
  return {
    cookie,
    accept: '*/*',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
  };
}
