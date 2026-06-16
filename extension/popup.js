document.getElementById("syncBtn").addEventListener("click", async () => {
    const statusEl = document.getElementById("status");
    const syncBtn = document.getElementById("syncBtn");
    const serverUrl = document.getElementById("serverUrl").value.replace(/\/$/, "");

    statusEl.style.display = "block";
    statusEl.className = "";
    
    if (!serverUrl) {
        statusEl.innerText = "Erro: Insira a URL do servidor JobFinder.";
        statusEl.className = "error";
        return;
    }

    syncBtn.disabled = true;
    statusEl.innerText = "1/4 Buscando sessão local do LinkedIn...";

    // Obtendo o Cookie diretamente do navegador do usuário
    chrome.cookies.get({ url: "https://www.linkedin.com", name: "JSESSIONID" }, async (cookie) => {
        if (!cookie) {
            statusEl.innerText = "Erro: Você precisa estar logado no LinkedIn no seu navegador!";
            statusEl.className = "error";
            syncBtn.disabled = false;
            return;
        }

        // Tira as aspas que vêm no cookie para usá-lo como CSRF
        const csrfToken = cookie.value.replace(/"/g, "");

        try {
            statusEl.innerText = "2/4 Executando requisição (curl invisível) na API do LinkedIn...";
            
            const apiUrl = "https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(count:24,jobCollectionSlug:easy-apply,query:(origin:GENERIC_JOB_COLLECTIONS_LANDING),start:0)&queryId=voyagerJobsDashJobCards.e5b6b761ede078dabe8ad857aa42c220";
            
            const lnRes = await fetch(apiUrl, {
                headers: {
                    "accept": "application/vnd.linkedin.normalized+json+2.1",
                    "csrf-token": csrfToken,
                    "x-restli-protocol-version": "2.0.0"
                }
            });

            if (!lnRes.ok) throw new Error("A API do LinkedIn rejeitou a requisição. Verifique se está logado.");
            
            const lnData = await lnRes.json();
            statusEl.innerText = "3/4 JSON capturado no cliente. Enviando de forma segura ao servidor...";

            // Envia apenas o JSON mastigado para o seu servidor (que não fará o curl, evitando bloqueio)
            const srvRes = await fetch(`${serverUrl}/api/jobs/import-json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lnData)
            });

            if (!srvRes.ok) throw new Error("Servidor do JobFinder online/acessível? Erro ao receber JSON.");
            
            const srvData = await srvRes.json();

            statusEl.innerText = `4/4 Sincronização 100% concluída! ${srvData.count} vagas enviadas ao seu sistema.`;
            statusEl.className = "success";

        } catch(e) {
            statusEl.innerText = "Erro: " + e.message;
            statusEl.className = "error";
        } finally {
            syncBtn.disabled = false;
        }
    });
});
