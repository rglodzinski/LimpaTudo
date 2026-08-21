# Fluxo funcional: Scan → Seleção → Remoção

## 1. Onboarding (primeira vez)

1. Detecta SO (macOS/Linux) e ajusta catálogo relevante automaticamente.
2. Pergunta raízes de busca de projetos de dev (sugere `~/apps`, `~/projects`,
   `~/dev`, `~/Documents`, `~/Desktop` com base no que existe).
3. Explica princípio: "nada é apagado sem sua confirmação; tudo vai pra Lixeira
   por padrão".

## 2. Scan

1. Usuário clica **"Escanear"**.
2. Main process dispara em paralelo:
   - Scan de catálogo de apps instalados (checa quais apps da lista existem no
     disco antes de medir).
   - Scan de dados de sistema (logs, caches, temp, lixeira).
   - Scan de projetos de dev nas raízes configuradas.
3. UI atualiza incrementalmente (streaming) — cada categoria aparece assim que
   termina, com spinner nas que ainda processam. Não bloqueia a tela inteira.
4. Ao final, mostra **resumo total** ("12.4 GB podem ser liberados") e lista
   agrupada por categoria, ordenada por tamanho.

## 3. Seleção

1. Itens 🟢 vêm **pré-marcados**.
2. Itens 🟡 vêm **desmarcados**, com badge visível; ao marcar manualmente,
   mostra tooltip/modal curto explicando a consequência específica.
3. Itens 🔴 (ex: backups de iPhone, Downloads) aparecem apenas em modo
   "avançado" (toggle explícito nas Settings), nunca no scan padrão.
4. Usuário pode expandir cada item para ver o path completo e, para pastas de
   projeto, a data do último uso (mtime) — ajuda a decidir em "projetos mortos".
5. Busca/filtro por palavra-chave: casa com o nome exibido **e com o caminho**,
   porque é o caminho que carrega o nome do projeto ou do cliente
   ("rhnumbers", "LuxB") — buscar só pelo nome exibido não encontraria nada
   disso.
6. Botão "marcar tudo seguro" (apenas 🟢) como atalho.
7. Ordenação por **tamanho** (maior primeiro, padrão) ou por **nome**. Ordenar
   por tamanho também reordena os grupos pelo total que cada um contém — é o
   que faz o agrupamento por projeto responder "onde está meu espaço?".

### Modos de agrupamento

| Modo | Chave | Exemplo |
|---|---|---|
| Categoria | `category` | dev, sistema, apps |
| App | `entryId` | Chrome, Docker |
| Projeto | `projectDir` | `~/apps/RhNumbers/rhnumbers-api` |
| Pasta de projetos | `workspaceDir` | `~/apps/RhNumbers`, `~/apps/LuxB` |
| Diretório | pai do item | `~/apps/RhNumbers/rhnumbers-api` |

`projectDir` e `workspaceDir` são preenchidos pelo `projectScanner` (o
scanner sabe qual raiz configurada casou); `workspaceDir` é o **primeiro nível
abaixo da raiz configurada** — em `~/apps`, isso dá `~/apps/RhNumbers`,
`~/apps/Rookau`, `~/apps/LuxB`. Um projeto direto na raiz é a própria
workspace, já que não há nível intermediário para agrupar.

Itens do catálogo (caches de sistema e de apps) não pertencem a projeto nenhum
e caem num grupo "Fora de projetos" nesses dois modos.

Projetos aninhados que têm marcador próprio (ex.: `LuxBApp` e
`LuxBApp/android/app`, ambos com `build.gradle`) aparecem como projetos
separados. É o comportamento correto: cada um tem o seu `node_modules`/`build`
e some ou fica de forma independente.

## 4. Confirmação

1. Barra inferior fixa mostra: N itens selecionados, X GB total.
2. Clique em **"Limpar selecionados"** abre modal de confirmação final:
   - Lista compacta dos itens (agrupados por categoria).
   - Aviso se algum app selecionado está **aberto no momento** — oferece
     "fechar automaticamente" ou "pular este item".
   - Se algum item requer privilégios elevados (`sudo`/`pkexec`), avisa
     explicitamente e mostra exatamente quais paths serão afetados antes do
     prompt do sistema aparecer.
3. Usuário confirma.

## 5. Remoção

1. Executa remoção item a item (não é uma operação atômica única) — permite
   mostrar progresso e continuar mesmo se um item falhar (ex: permissão negada).
2. Cada item vai para a Lixeira por padrão; modo permanente só se configurado
   explicitamente nas Settings.
3. Erros por item são coletados e mostrados no relatório final (não abortam o
   processo inteiro).

## 6. Relatório final

1. "Você liberou X GB" com quebra por categoria (gráfico simples de barras).
2. Lista de itens que falharam (com motivo: permissão, app em uso, etc.) e
   sugestão de ação.
3. Botão **"Desfazer"** — restaura da Lixeira os itens desta sessão (enquanto
   não esvaziada manualmente pelo usuário).
4. Opção de agendar lembrete (ex: "escanear novamente em 30 dias") — feature
   v2, usando notificação local do SO.

## Casos de borda importantes

- **Item já removido por fora** (usuário limpou manualmente entre scan e
  remoção) → trata como sucesso silencioso, não erro.
- **Symlinks** dentro de `node_modules`/caches → nunca seguir symlink para fora
  do diretório de origem ao calcular tamanho ou remover (evita apagar algo
  fora do escopo pretendido).
- **Disco de rede / iCloud Drive** → paths dentro de volumes remotos ou pastas
  com "evict"/offload do iCloud são excluídos do scan por padrão (evita
  disparar downloads ou apagar algo que não está fisicamente ali).
- **Permissão negada silenciosa no macOS (TCC)** → se o app não tem "Full Disk
  Access" concedido, alguns paths (Mail, Messages, etc.) falham silenciosamente;
  o app detecta isso e orienta o usuário a conceder permissão em
  Preferências do Sistema, com deep link direto para o painel correto.
