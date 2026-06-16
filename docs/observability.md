# Observabilidade do Monorepo

## Sistema de Logs

O backend utiliza **Winston** para logging estruturado com múltiplos transportes:

### Níveis de Log

- `error`: Erros críticos e falhas de requisição
- `warn`: Requisições com status 4xx
- `info`: Operações importantes (importação de vagas, credenciais)
- `http`: Todas as requisições HTTP
- `debug`: Detalhes de operações internas

### Arquivos de Log

Os logs são salvos em `apps/backend/logs/`:

```
logs/
├── error.log       # Apenas erros
└── combined.log    # Todos os logs
```

Cada arquivo tem rotação automática:
- Tamanho máximo: 5MB
- Máximo de arquivos: 5

### Visualização em Tempo Real

```bash
# Backend
cd apps/backend && pnpm dev

# Logs aparecem no console com cores
# 2024-01-15 10:30:45 [info]: Server started {port: 3000, env: "development"}
# 2024-01-15 10:30:50 [http]: HTTP Request {method: "GET", url: "/api/jobs", status: 200, duration: "45ms"}
```

### Estrutura dos Logs

**Desenvolvimento:**
```
2024-01-15 10:30:45 [info]: Server started {port: 3000, env: "development"}
```

**Produção (JSON):**
```json
{
  "timestamp": "2024-01-15T10:30:45.000Z",
  "level": "info",
  "message": "Server started",
  "service": "linkedin-job-applier",
  "port": 3000,
  "environment": "production"
}
```

## Endpoints de Monitoramento

### Health Check
```bash
curl http://localhost:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.000Z"
}
```

### Configuração
```bash
curl http://localhost:3000/api/config
```

Resposta:
```json
{
  "hasCredentials": true,
  "hasImportedJobs": 24
}
```

## Variáveis de Ambiente

```env
# Nível de log (default: info)
LOG_LEVEL=debug

# Ambiente
NODE_ENV=development

# Porta do servidor
PORT=3000
```

## Boas Práticas

1. **Use o logger, não console.log**
   ```typescript
   // ❌ Errado
   console.log('Buscando vagas');
   
   // ✅ Correto
   logger.info('Buscando vagas do LinkedIn', { source: 'api' });
   ```

2. **Inclua contexto relevante**
   ```typescript
   logger.error('Erro ao buscar vaga', {
     jobId: '123',
     error: err.message,
   });
   ```

3. **Use níveis apropriados**
   - `error`: Falhas que precisam de atenção
   - `warn`: Situações que podem ser problemas
   - `info`: Operações importantes do negócio
   - `debug`: Detalhes para desenvolvimento

## Debugging

### Ativar logs detalhados
```bash
LOG_LEVEL=debug pnpm dev
```

### Ver logs de erro
```bash
tail -f apps/backend/logs/error.log
```

### Ver todas as requisições
```bash
tail -f apps/backend/logs/combined.log | grep "HTTP Request"
```
