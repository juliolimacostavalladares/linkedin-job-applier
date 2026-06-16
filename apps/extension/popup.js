/**
 * JobFinder Sync – popup.js
 *
 * Responsabilidade única: coletar os cookies de sessão do LinkedIn
 * e enviá-los ao servidor backend para persistência.
 * O backend cuida de buscar vagas usando essas credenciais.
 */

function setStatus(el, message, type = '') {
  el.style.display = 'block';
  el.className = type;
  el.innerText = message;
}

document.getElementById('syncBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const syncBtn  = document.getElementById('syncBtn');
  const serverUrl = document.getElementById('serverUrl').value.trim().replace(/\/$/, '');

  if (!serverUrl) {
    setStatus(statusEl, 'Erro: Insira a URL do servidor JobFinder.', 'error');
    return;
  }

  syncBtn.disabled = true;
  setStatus(statusEl, '1/2 Coletando credenciais do LinkedIn...');

  chrome.cookies.getAll({ url: 'https://www.linkedin.com/' }, async (cookies) => {
    // Sort cookies so that more specific domains (www.linkedin.com) and paths (/) overwrite generic/wildcard ones
    const sortedCookies = [...cookies].sort((a, b) => {
      const aDomainSec = a.domain === 'www.linkedin.com' ? 1 : 0;
      const bDomainSec = b.domain === 'www.linkedin.com' ? 1 : 0;
      if (aDomainSec !== bDomainSec) return aDomainSec - bDomainSec;
      
      const aPathSec = a.path === '/' ? 1 : 0;
      const bPathSec = b.path === '/' ? 1 : 0;
      return aPathSec - bPathSec;
    });

    const cookieMap = new Map();
    sortedCookies.forEach(c => {
      cookieMap.set(c.name, c.value);
    });

    const liAtVal = cookieMap.get('li_at');
    const jsessionVal = cookieMap.get('JSESSIONID');

    if (!liAtVal || !jsessionVal) {
      setStatus(
        statusEl,
        'Erro: Você precisa estar logado no LinkedIn no Chrome.\nAbra linkedin.com, faça login e tente novamente.',
        'error'
      );
      syncBtn.disabled = false;
      return;
    }

    const fullCookie = Array.from(cookieMap.entries())
      .map(([name, val]) => `${name}=${val}`)
      .join('; ');

    const csrfToken  = jsessionVal.replace(/"/g, '');

    try {
      setStatus(statusEl, '2/4 Salvando credenciais no servidor...');

      const res = await fetch(`${serverUrl}/api/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie: fullCookie, csrf: csrfToken }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(
          `Servidor retornou ${res.status}. ` +
          (errText ? errText.slice(0, 120) : 'Verifique se o servidor está rodando.')
        );
      }

      setStatus(statusEl, '3/4 Obtendo dados de perfil do LinkedIn...');

      // 1. Fetch voyager/api/me to get basic info and profileId
      const meRes = await fetch('https://www.linkedin.com/voyager/api/me', {
        headers: {
          'accept': 'application/vnd.linkedin.normalized+json+2.1',
          'csrf-token': csrfToken,
          'x-restli-protocol-version': '2.0.0'
        },
        credentials: 'include'
      });

      if (!meRes.ok) {
        throw new Error('Falha ao obter dados básicos do perfil do LinkedIn. Certifique-se de estar logado.');
      }

      const meJson = await meRes.json();
      const miniProfile = meJson.included?.find(
        item => item.$type === 'com.linkedin.voyager.identity.shared.MiniProfile'
      );

      if (!miniProfile) {
        throw new Error('Perfil básico não encontrado na resposta do LinkedIn.');
      }

      const firstName = miniProfile.firstName || '';
      const lastName = miniProfile.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      const defaultHeadline = miniProfile.occupation || '';
      const profileId = miniProfile.entityUrn?.split(':').pop() || '';

      let photoUrl = '';
      if (miniProfile.picture?.rootUrl && miniProfile.picture.artifacts?.length) {
        const artifact = miniProfile.picture.artifacts.find(art => art.width === 200) || miniProfile.picture.artifacts[0];
        photoUrl = miniProfile.picture.rootUrl + artifact.fileIdentifyingUrlPathSegment;
      }

      let headline = defaultHeadline;
      let about = '';
      let experiences = [];
      let education = [];

      // 2. Fetch Profiles (Headline & About) via GraphQL
      try {
        const pUrl = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=false&variables=(memberIdentity:${profileId},profileDecorationId:com.linkedin.voyager.dash.decorations.identity.profile.FullProfileWithEntities)&queryId=voyagerIdentityDashProfiles.b5c27c04968c409fc0ed3546575b9b7a`;
        const pRes = await fetch(pUrl, {
          headers: {
            'accept': 'application/vnd.linkedin.normalized+json+2.1',
            'csrf-token': csrfToken,
            'x-restli-protocol-version': '2.0.0'
          },
          credentials: 'include'
        });
        if (pRes.ok) {
          const pJson = await pRes.json();
          const profileObj = pJson.included?.find(
            item => item.$type === 'com.linkedin.voyager.dash.identity.profile.Profile'
          );
          if (profileObj) {
            if (profileObj.headline) headline = profileObj.headline;
            if (profileObj.summary) about = profileObj.summary;
          }
        }
      } catch (e) {
        console.error('Error fetching profiles:', e);
      }

      // 3. Fetch Positions (Experiences) via GraphQL
      try {
        const posUrl = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=false&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A${profileId})&queryId=voyagerIdentityDashPositions.a3c8cc7db956cf57b98d24b613143522`;
        const posRes = await fetch(posUrl, {
          headers: {
            'accept': 'application/vnd.linkedin.normalized+json+2.1',
            'csrf-token': csrfToken,
            'x-restli-protocol-version': '2.0.0'
          },
          credentials: 'include'
        });
        if (posRes.ok) {
          const posJson = await posRes.json();
          const positions = posJson.included?.filter(
            item => item.$type === 'com.linkedin.voyager.dash.identity.profile.Position'
          ) || [];
          experiences = positions.map(pos => ({
            company: pos.companyName || '',
            role: pos.title || '',
            duration: formatTimePeriod(pos.timePeriod),
            description: pos.description || ''
          }));
        }
      } catch (e) {
        console.error('Error fetching positions:', e);
      }

      // 4. Fetch Education via GraphQL
      try {
        const eduUrl = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=false&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A${profileId})&queryId=voyagerIdentityDashEducation.b12bfa4b03afda37bcfe63d7d41d6132`;
        const eduRes = await fetch(eduUrl, {
          headers: {
            'accept': 'application/vnd.linkedin.normalized+json+2.1',
            'csrf-token': csrfToken,
            'x-restli-protocol-version': '2.0.0'
          },
          credentials: 'include'
        });
        if (eduRes.ok) {
          const eduJson = await eduRes.json();
          const schools = eduJson.included?.filter(
            item => item.$type === 'com.linkedin.voyager.dash.identity.profile.Education'
          ) || [];
          education = schools.map(sch => ({
            institution: sch.schoolName || '',
            degree: formatDegree(sch.degreeName, sch.fieldOfStudy),
            duration: formatEducationTimePeriod(sch.timePeriod)
          }));
        }
      } catch (e) {
        console.error('Error fetching education:', e);
      }

      setStatus(statusEl, '4/4 Salvando dados de perfil no servidor...');

      // 5. Send profile data to backend
      const profileSyncRes = await fetch(`${serverUrl}/api/resume/sync-profile-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          name,
          headline,
          photoUrl,
          about,
          experiences,
          education
        })
      });

      if (!profileSyncRes.ok) {
        throw new Error('Falha ao salvar dados de perfil sincronizados no servidor.');
      }

      setStatus(
        statusEl,
        '✅ Credenciais e perfil sincronizados com sucesso!',
        'success'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus(statusEl, `Erro: ${msg}`, 'error');
    } finally {
      syncBtn.disabled = false;
    }
  });
});

function formatTimePeriod(tp) {
  if (!tp) return '';
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  let startStr = '';
  if (tp.startDate?.year) {
    const monthStr = tp.startDate.month ? `${monthNames[tp.startDate.month - 1]} ` : '';
    startStr = `${monthStr}${tp.startDate.year}`;
  }
  
  let endStr = 'Presente';
  if (tp.endDate?.year) {
    const monthStr = tp.endDate.month ? `${monthNames[tp.endDate.month - 1]} ` : '';
    endStr = `${monthStr}${tp.endDate.year}`;
  } else if (!tp.startDate?.year) {
    return '';
  }
  
  return `${startStr} - ${endStr}`;
}

function formatEducationTimePeriod(tp) {
  if (!tp) return '';
  const start = tp.startDate?.year ? String(tp.startDate.year) : '';
  const end = tp.endDate?.year ? String(tp.endDate.year) : 'Presente';
  if (!start) return '';
  return `${start} - ${end}`;
}

function formatDegree(degreeName, fieldOfStudy) {
  if (degreeName && fieldOfStudy) {
    return `${degreeName}, ${fieldOfStudy}`;
  }
  return degreeName || fieldOfStudy || '';
}
