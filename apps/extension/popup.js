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
      setStatus(statusEl, '2/2 Salvando credenciais no servidor...');

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

      setStatus(
        statusEl,
        '✅ Credenciais salvas com sucesso!\nO app já pode buscar suas vagas.',
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
