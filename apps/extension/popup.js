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

  chrome.cookies.getAll({ domain: '.linkedin.com' }, async (cookies) => {
    const liAt     = cookies.find(c => c.name === 'li_at');
    const jsession = cookies.find(c => c.name === 'JSESSIONID');

    if (!liAt || !jsession) {
      setStatus(
        statusEl,
        'Erro: Você precisa estar logado no LinkedIn no Chrome.\nAbra linkedin.com, faça login e tente novamente.',
        'error'
      );
      syncBtn.disabled = false;
      return;
    }

    // String de cookie completa para headers HTTP
    const fullCookie = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    // CSRF token = JSESSIONID sem aspas duplas
    const csrfToken  = jsession.value.replace(/"/g, '');

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
