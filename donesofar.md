# Estado da restauração Barbie.com — 30/09/2026

Este documento registra o estado **neste momento do trabalho**, a pedido da usuária, antes de continuar a implementação. Não significa que a primeira fase esteja concluída. O histórico técnico complementar está em `checkpoint.md`.

## Objetivo e decisões já acordadas

- Restaurar o site americano, em inglês, tomando junho de 2013 como referência.
- Referência inicial: https://web.archive.org/web/20130628161553/http://www.barbie.com/.
- Buscar a maior fidelidade visual possível, recuperando arquivos originais, animações, ícones, transições, fundos, estados de hover e navegação.
- Incluir home, páginas dos menus e páginas individuais de apresentação dos conteúdos.
- Preservar dimensões e posições originais no desktop; sem adaptação para celular nesta fase.
- Remover anúncios e suas molduras, preservando o espaço e preenchendo com o fundo.
- Sem música ou efeitos sonoros nesta fase.
- Usar “Under restoration” nos conteúdos ainda indisponíveis e destinos externos não restaurados.
- GitHub e Cloudflare serão a infraestrutura. Blogger foi descartado. Integração e publicação serão abordadas posteriormente.
- Publicar quando a fase estiver completa, priorizando fidelidade. Nenhum prazo fechado foi prometido.

## Pesquisa e recuperação realizadas

1. Inspecionei a captura originalmente enviada, de 2010, e descartei essa referência após a correção da usuária para junho de 2013.
2. Abri a captura de 28/06/2013 no navegador e examinei seu HTML, seus estilos e as referências aos arquivos Flash.
3. Confirmei que a home arquivada ficava carregando e que seus desenhos e interações dependem de arquivos SWF e configurações XML externas.
4. Identifiquei dimensões originais: cabeçalho 990×210, navegação 820×100, botão da loja 131×140, carrossel 910×520, promos inferiores 725×180.
5. Recuperei HTML/CSS de referência e arquivos das seções Games, Videos, Fashion, Friends, Fantasy e I Can Be, preservados em `research/sections/`.
6. Recuperei os fundos originais da home e do cabeçalho, a navegação Flash, o botão da loja, o controlador do carrossel e seu XML.
7. Recuperei os três slides completos: Dreamhouse Puzzle Party, BLID Profile e My Dreamhouse.
8. Identifiquei diferença entre os nomes na configuração de fundos JavaScript e os slides efetivos do XML. O XML é a evidência usada para o conteúdo.
9. Registrei capturas próximas utilizadas: XML de 13/06, slides de 04/06 e controlador recuperado da captura mais próxima em 04/07. Não afirmo que todos os arquivos sejam da mesma captura de 28/06.
10. Recuperei o controlador de promos inferiores, sua configuração e os três arquivos de promo.
11. Recuperei as artes originais do seletor de países: título, globo, botão GO e fundo com estados.
12. Recuperei o cenário Flash de vídeos, seu fundo e os elementos gráficos do catálogo.
13. Recuperei os arquivos dos ambientes Fashion e Friends, os arquivos separados de animação da Barbie e a moldura compartilhada das atividades.
14. Confirmei em HTML primário que páginas individuais como Snip ’n Style Salon e Jigsaw Puzzle usam a moldura compartilhada, com área de conteúdo de 641×326.
15. Iniciei inventário automatizado das páginas individuais acessíveis pelos cards e por links dos ambientes. Esse processo ainda não foi concluído e revisado.
16. Tentei recuperar a playlist JSON do serviço antigo de vídeos. Ela não estava disponível na URL arquivada testada. A busca complementar também encontrou falhas de conexão.

## Código implementado

### Estrutura principal

- `public/index.html`: estrutura da página, cabeçalho, navegação, seletor de países, conteúdo, rodapé e diálogo “Under restoration”.
- `public/site.css`: dimensões fixas e estilos da estrutura, fundo, seletor e componentes provisórios de restauração.
- `public/app.js`: carregamento dos SWFs com Ruffle, navegação local, mudança de fundos, ponte para algumas chamadas JavaScript originais e integração inicial de seções.
- `public/_redirects`: rascunho das regras de rotas para Cloudflare Pages. Ainda precisa ser conferido contra todos os destinos e arquivos estáticos.
- `public/vendor/ruffle/`: distribuição oficial do Ruffle 0.6.0, incluída localmente com suas licenças MIT/Apache.

### Home

- Navegação e botão da loja originais carregados por Ruffle.
- Carrossel original e seus três SWFs carregados localmente.
- Mudança do fundo da página conectada à chamada original do carrossel.
- Promos inferiores conectadas ao controlador original; os arquivos dependentes foram recuperados após a primeira verificação e ainda precisam de revisão visual final.
- Reprodução configurada sem som.
- Área superior de anúncio removida. A região do bitmap que já continha um retângulo publicitário está coberta por um gradiente reconstruído; esse preenchimento ainda não deve ser considerado visualmente final.

### Páginas internas

- `public/sections/classic.js` e `classic.css`: integração dos ambientes Fashion e Friends, em suas dimensões e posições originais.
- `public/sections/videos.js` e `videos.css`: cenário original de Videos e posição original do player, com “Under restoration” na área de vídeo. Moldura do catálogo recuperada, mas lista histórica de vídeos ainda indisponível.
- `public/sections/catalog-data.js`: dados extraídos das listagens iniciais arquivadas de Games e Fairytale, com 29 cards no total, incluindo títulos, textos de hover, imagens e destinos.
- `public/sections/catalog.js` e `catalog.css`: módulo em elaboração pelo subagente; ainda precisa de integração em `app.js`, revisão dos assets e testes.
- `public/sections/icanbe.js` e `icanbe.css`: módulo inicial elaborado pelo subagente; a recuperação dos assets e a fidelidade visual ainda estão em revisão. **Não está integrado nem aprovado como restauração fiel.** A versão inicial continha substitutos visuais e foi solicitado ao agente que priorizasse as artes e os estilos originais.
- Páginas individuais ainda usam fallback genérico quando não há implementação específica. Isso **não conclui** o compromisso de restaurar suas molduras e controles.

### Ferramentas e documentação

- `scripts/recover.py`: recuperação de caminhos explícitos do Wayback, verificação básica de arquivos e registro de origem, URL final, tamanho e SHA-256.
- `research/asset-manifest.json`: resultado das tentativas de recuperação. Alguns downloads falhos foram recuperados posteriormente por outros caminhos; o manifesto precisa ser reconciliado com os arquivos presentes antes da entrega.
- `scripts/inspect_swf.py`: descompactação e inspeção de strings dos SWFs para encontrar dependências sem executá-los.
- `scripts/serve.py`: servidor de prévia local com suporte a rotas antigas e tipos de arquivo SWF/WASM.
- `scripts/build_catalog.py`: extração de cards e assets das listagens arquivadas; pertence ao trabalho do subagente de catálogo.
- `scripts/build_icanbe.py`: apoio à recuperação da seção I Can Be; pertence ao respectivo subagente.
- `scripts/build_details.py`: recuperação e inventário das dimensões/molduras das páginas individuais; execução iniciada, resultados ainda pendentes de revisão.
- `checkpoint.md`: log de pesquisa, decisões técnicas, progresso, fontes e lacunas.

## O que já foi verificado

- O servidor local iniciou em `http://127.0.0.1:4173/`.
- Abrir diretamente por `file://` não é a forma correta de testar esta implementação; os arquivos precisam do servidor local.
- A primeira execução revelou uma regra que reescrevia indevidamente URLs locais. Corrigi a regra e confirmei que os SWFs passaram a carregar.
- Vi no navegador o slide Dreamhouse Puzzle Party e o slide BLID Profile com artes originais e animações.
- Confirmei visualmente estados animados do menu, brilho e mudanças de fundo do carrossel.
- Conferi via DOM as dimensões dos players: 820×100, 131×140, 910×520 e 725×180.
- O JavaScript principal passou pela verificação de sintaxe com Node.
- A navegação até Fashion foi aberta para inspeção. A tentativa subsequente de screenshot completo falhou por timeout do navegador; portanto, ainda não considero essa página visualmente validada.
- **Não** foi feita verificação completa de cada botão, de todas as páginas ou de todos os estados de animação.

## Uso de subagentes

- `archive_routes` — contexto isolado, modelo menor, pesquisa de rotas e arquivos das seções. Recuperou fontes primárias. A implementação posterior foi interrompida pelo limite de uso daquele modelo; assumi os ambientes clássicos.
- `catalog_sections` — contexto isolado, responsável somente pelos catálogos Games/Fairytale e seus assets. Trabalho em andamento, aguardando integração e revisão.
- `icanbe` — contexto isolado, responsável somente pela home I Can Be, imagens e estilos. Solicitada continuação da recuperação após falhas transitórias de rede; trabalho ainda precisa de revisão.
- A primeira pesquisa de terceiros misturava elementos de outras épocas. Ela não foi aceita como referência exata de 2013; priorizamos HTML e SWFs arquivados.

## O que falta fazer

1. Finalizar e revisar a recuperação de assets dos catálogos e de I Can Be; não confundir módulos escritos com páginas visualmente restauradas.
2. Integrar Games/Fairytale e I Can Be à navegação principal, respeitando a estrutura independente de I Can Be.
3. Conferir as cenas completas do closet e do quarto, incluindo animações carregadas separadamente, hover e links.
4. Revisar os três slides, as setas, os indicadores, os tempos e as promos inferiores da home.
5. Refinar o preenchimento da área publicitária superior mantendo geometria e continuidade do fundo.
6. Concluir o inventário das páginas individuais e implementar suas molduras, dimensões e controles recuperáveis, com “Under restoration” somente onde o conteúdo ainda não está disponível.
7. Recuperar as listagens das demais categorias de Games/Fairytale, quando possível. As respostas HTML iniciais não contêm todos os resultados do antigo servidor ASP.NET; não há garantia de que os filtros completos estejam preservados.
8. Continuar a busca pela playlist histórica de vídeos. O cenário está recuperado, mas o catálogo completo ainda não está.
9. Conferir links externos e chamadas internas dos SWFs para manter a navegação na restauração ou mostrar o estado acordado.
10. Verificar silenciamento de todos os players, ausência de trackers originais e dependências externas de runtime.
11. Testar todas as rotas, recursos estáticos e regras de fallback; evitar servir HTML indevidamente quando faltar um SWF/imagem.
12. Fazer revisão visual desktop por página e por estado interativo, comparando com referências recuperadas e registrando diferenças.
13. Reconciliar manifestos, documentar datas de captura e listar exatamente quais partes são originais, reconstruídas ou não recuperadas.
14. Preparar instruções de execução/manutenção e organização final para GitHub/Cloudflare. Publicação continua adiada conforme combinado.

## Limitações conhecidas e conclusão de estado

- O Internet Archive apresenta falhas intermitentes de conexão. Alguns downloads funcionam após nova tentativa; outros conteúdos podem realmente não estar preservados.
- Ruffle permite aproveitar animações originais, mas a compatibilidade precisa ser validada por arquivo e por interação.
- A existência de uma página ou placeholder não significa que sua restauração visual esteja pronta.
- A primeira fase **ainda está em implementação**. A home possui um resultado original funcional já observado; a cobertura das páginas internas e a validação completa permanecem pendentes.
- Não publiquei o site, não alterei a integração remota com GitHub/Cloudflare e não implementei o conjunto completo de jogos.

## Atualização recebida ao terminar este registro

O subagente de catálogos entregou seu módulo e informou 22 cards em Games e 14 em Fairytale (36 no total, atualizando a contagem intermediária de 29). Informou também 35 assets recuperados e 21 ainda indisponíveis, listados em `research/sections/catalog-assets.json`. O módulo ainda precisa de integração e revisão pelo agente principal. As outras categorias têm botões interativos, mas seus resultados históricos completos não foram recuperados: o comportamento atual mantém a listagem inicial com aviso. Isso é uma pendência de funcionalidade/fidelidade, não uma categoria restaurada.

## Continuação — 30/09/2026 (integração dos catálogos e do I Can Be)

Retomei exatamente do ponto em que a sessão anterior parou (integração dos catálogos, revisão dos módulos dos subagentes e validação das páginas). O que foi feito nesta continuação:

### Recuperação de assets

- Recuperei os 21 assets de catálogo que faltavam: 9 na captura de 28/06, 9 em capturas de 2013 mais próximas (janeiro–março) e 2 (`PF_mariposa_dressup_game.jpg`, `PF_sparklechain_game.jpg`) em capturas de fev/2012 — os únicos exemplares preservados dos mesmos arquivos referenciados pela página de junho/2013. Datas registradas no manifesto.
- Recuperei as artes de cabeçalho/rodapé das seções: `cord_top.png` (990×102) e `footer.png` (990×198) de Games; `fairytale_header.jpg` (990×203) e `fairytale_footer.jpg` (989×303) de Fairytale; os `agg_center.png` específicos de cada seção; e as imagens `_dn` (hover) das abas de Games.
- Recuperei as dependências de runtime dos heróis Flash: `data/config.xml` dos dois, e os SWFs listados neles (overlays, fonts, `promo_main.swf`, `gamesiconbox.swf`, `popup.swf`, 6 promos de `promo.xml`, 4 heróis do Fairytale). `Promo_DOW_China.swf` veio de captura de dez/2012 (registrado). `data/popup.xml` nunca foi arquivado — lacuna documentada.
- Recuperei os assets que faltavam do I Can Be: `background-nav.jpg`, `sprite-buttons.png`, `sprite-icons.gif`, `background-message.gif`, `background-promo.gif`, `promo/background.jpg`, `parallax/background.jpg`, os 3 sprites de botão, `sprite-holders.png`, `blank.png`, `background-modal.png`, `btn-close.gif`, `favicon.ico`, `blit/sparkle.png` e `sparkle.json`. `btn-dolls.png`/shadow nunca foram arquivados e nunca são carregados pelo JS original (registrado). jQuery 1.6.2 vendored do CDN oficial (MIT), pois não há captura no archive.
- Novo script `scripts/recover_cdx.py`: busca a captura de 2013 (fallback 2012) mais próxima de 28/06 para caminhos ausentes na captura principal, com retries e registro de procedência.

### Catálogos Games/Fairytale (reescrita fiel)

- Reescrevi `public/sections/catalog.js` e `catalog.css` reproduzindo o DOM e as classes originais das páginas arquivadas e do `BarbieRefresh.css`: herói 990×390, arte de cabeçalho, aba selecionada flutuante, botões de categoria com z-index e hover `_up`/`_dn` originais, `containerTop`/`itemslistContainer`/`containerBottom`, cards 152×135 cujo título troca para o texto de hover, margens negativas originais (−89/−170px no listado e −177/−214px no rodapé), rodapé com links brancos sobre a arte original, fundo `barbiebg.jpg`. Aproximações visuais do módulo anterior foram descartadas.
- Apenas a categoria inicialmente arquivada é exibida; clicar em outra aba mantém a listagem e mostra um aviso honesto (os resultados de postback do servidor nunca foram arquivados).
- Links externos dos cards (dreamhouse.barbie.com, icanbe games, barbievideogame.com) abrem o diálogo “Under restoration”.
- `scripts/build_catalog.py` atualizado para emitir hovers das abas e as artes por seção, e para recuperar todos os assets referenciados.
- Integração em `app.js` para as rotas `/activities/fun_games/` e `/activities/fantasy/`.

### I Can Be (página fiel, autônoma)

- Substituí o módulo provisório (com substitutos visuais) por uma página fiel em `public/_original/icanbe.barbie.com/en_US/index.html`: DOM original, `style.css`, fontes e imagens originais, e toda a pilha JS original (jQuery 1.6.2, modernizr, swfobject, SimpleAnimation, `plugins.js`, `script.js`).
- O carrossel parallax de promos, os brilhos (twinkle) da navegação, o carrossel 3D de carreiras e o overlay de help/gotacode rodam o código original de 2013.
- Adaptações documentadas: anúncios e trackers removidos (espaço preservado); links externos mostram um overlay local “Under restoration”; links barbie.com/icanbe redirecionam para as rotas locais; caminhos absolutos apontam para `/_original/icanbe.barbie.com/` (base tag não funciona para URLs absolutas); help/gotacode servem fragmentos locais com a mensagem de restauração.
- Os módulos antigos `public/sections/icanbe.js` e `icanbe.css` foram removidos.

### Verificação

- Novos scripts de QA: `scripts/qa_pages.py` (erros de console e requisições falhas) e `scripts/qa_geometry.py` (geometria comparada aos valores do CSS original).
- Resultado: 0 erros de console e 0 requisições falhas em home, Games, Fairytale e I Can Be. Geometria confere (aba selecionada em x=25/70, cards 152×135 com margens 40/20, containerTop em x=95, margens −89/−170/−177/−214, rodapé com links brancos, etc.).
- Interações verificadas: troca de título no hover dos cards, hover das abas `_up`→`_dn`, aviso ao clicar em outra categoria, diálogo em link externo, setas do carrossel do I Can Be, título da carreira no hover, overlay de help abrindo e fechando, links do rodapé redirecionando para as rotas locais.
- Screenshots para revisão visual: `/tmp/qa-games-full.png`, `/tmp/qa-fantasy-full.png`, `/tmp/qa-icanbe-full.png`; prévia ao vivo em `http://127.0.0.1:4173/` (servidor iniciado com `python3 scripts/serve.py`).

### Correção reportada pela usuária (roteamento dos menus)

- A usuária reportou que clicar em qualquer botão do menu (Games, I Can Be, etc.) mostrava “Under restoration”. Causa: o menu Flash navega para URLs **sem a barra final** (`/activities/fun_games`), e o roteador comparava caminhos exatos (`/activities/fun_games/`) — tudo caía no fallback “Under restoration”. Meus testes anteriores usavam URLs diretas com a barra, por isso não pegaram o problema.
- Correção: `app.js` normaliza os caminhos (remove barras finais) antes de comparar com as rotas das seções; verificado novamente Games, Videos, Fashion, Friends e Fairytale sem barra — todos renderizam o conteúdo.
- O botão “I Can Be” do menu Flash aponta para a raiz do subdomínio (`icanbe.barbie.com/`), que não tinha rota: `serve.py` agora redireciona (302) `/_original/icanbe.barbie.com` e `.../` para a home restaurada, com regra equivalente em `_redirects` para o Cloudflare.
- Também recuperei `friendsbedroom_PetAnim1_1.swf` e `friendsbedroom_PetAnim1_2.swf`, dependências dinâmicas do quarto que davam 404 (outras variantes PetAnim existem no archive, mas a recuperação foi adiada a pedido da usuária).
- Varredura final de logs e páginas: sem 404/500 restantes (exceto lacunas já documentadas), 0 erros de console e 0 requisições falhas em todas as páginas — nada do que já está restaurado apresenta erro.
- `serve.py` agora escuta em todas as interfaces (0.0.0.0): o site pode ser aberto de outra máquina no mesmo Wi-Fi em `http://192.168.10.37:4173/`.

**Resumo do comportamento atual:** a home, as seções dos menus (Games, Fairytale, Videos, Fashion, Friends) e a home do I Can Be mostram conteúdo restaurado. O que continua mostrando “Under restoration” **de propósito**, conforme o escopo combinado: jogos individuais e suas páginas, mundos externos (dreamhouse.barbie.com), loja, e a playlist/catálogo de vídeos (serviço antigo não preservado).

## Continuação — 30/09/2026 (rodapé e tela intermediária de links externos)

A pedido da usuária:

1. **Rodapé**: os links originais foram substituídos por `Site Map | Privacy | Credit | About` (texto simples, ainda sem links), em rosa mais escuro (`#d60986`, o rosa escuro usado pelo CSS do próprio site original). Abaixo, em duas linhas: o aviso de que Barbie Revival é um projeto de preservação não afiliado à Mattel e a linha `Barbie Revival 2026`. Aplicado ao rodapé principal e ao rodapé do catálogo (que mantém texto branco por ficar sobre a arte rosa original).
2. **Tela intermediária de links externos**: recuperei do Wayback Machine a tela original que aparecia ao sair do site — `partner-interstitial.aspx` (captura de 27/06/2013, um dia antes da referência) com a imagem `interstitial_Barbie.jpg` (600×310; o replay resolveu a imagem para a captura mais próxima preservada, de 02/03/2013 — registrado no manifesto). Ela agora aparece sempre que um link leva a um site externo, na rota local `/includes/partner-interstitial.aspx?redirect=…`: página branca com a imagem centralizada e as duas áreas clicáveis originais — **Keep Going** abre o destino em nova aba e volta o site para onde estava; **Back** volta para a página anterior. Os links externos do catálogo, da página I Can Be e os URLs reescritos de dentro dos Flash (inclusive os do carrossel da home, que já apontavam para essa tela no original) passam todos por ela. O overlay provisório “Under restoration” do I Can Be para links externos foi removido.
3. **Verificação**: 0 erros de console e 0 requisições falhas em home, Games, Fairytale e I Can Be; testados no navegador o clique em card externo, o Back, o Keep Going (destino em nova aba, site permanece aberto), o parâmetro `redirect` cru como o Ruffle produz e os links de loja do I Can Be.
4. **Correção reportada pela usuária**: a URL reescrita de um Flash aberta diretamente (`/_external/shop.mattel.com/shop/index.jsp?…`) mostrava página vazia — o `serve.py` só servia `index.html` para caminhos com `/`, `.aspx`, `.html` ou sem extensão, então URLs `.jsp` davam 404 antes de chegar à aplicação. Agora `/_external/*` sempre serve a aplicação (o `_redirects` do Cloudflare já cobria isso). Também troquei o `history.back()` da tela pelo retorno ao referer de mesma origem quando existe, porque em visita direta a entrada anterior do histórico é `about:blank` (ficava em branco); visita direta sem referer volta para a home.
5. **Correção reportada pela usuária (grade fora do painel rosa)**: os grids de miniaturas de Games e Fairytale estavam deslocados para a esquerda, saindo do painel rosa (`agg_center.png`), em várias páginas. Causei a página original arquivada localmente e comparei os pixels: no original o conteúdo ficava dentro de um `<td align="center">`/`<center>`, que vira `text-align: -webkit-center` no Chrome — um valor legado que também centraliza caixas de bloco que cabem no contêiner. Por isso o `#itemslist` original (800px) ficava centralizado (+95px) dentro do contêiner de 990px, com as miniaturas dentro do painel rosa; o `text-align: center` comum não centraliza blocos. Corrigido em `catalog.css` com `#itemslist{margin-left:auto;margin-right:auto}` (mesma posição visual em qualquer navegador). Verificado: os cards agora começam em x=135 (página 152), igualzinho ao render da página arquivada, com margem rosa visível dos dois lados da grade, em Games e Fairytale; 0 erros de console e 0 requisições falhas em todas as páginas.

## Continuação — 30/09/2026 (troca do logo no Flash de navegação)

A pedido da usuária, o logo da Barbie no canto superior esquerdo foi trocado **dentro do próprio Flash** (`barbie_nav_new.swf`), para que as animações de hover/seleção continuem funcionando:

1. **Localização do logo no SWF**: o logo é o bitmap interno 219 (`DefineBitsLossless2`, 151×75) do `public/global/barbie_nav_new.swf`, usado pela forma 220 (retângulo com preenchimento de bitmap) e pelo botão 224 (`barbieLogo`) do menu. O botão tem quatro estados: up = sprite 222 (o logo), over/down = sprite 222 + filtro de brilho amarelo + sprite 221 (animação de 50 quadros de faíscas brancas), hit = forma 223. Por isso, trocando apenas o bitmap, todas as animações e a área clicável continuam intactas.
2. **Substituição**: recortei as margens transparentes da imagem fornecida (`1000629137.png`), redimensionei preservando a proporção para caber em 151×75 e substituí a imagem 219 dentro do SWF usando a ferramenta JPEXS Free Flash Decompiler 26.3.0 (CLI, `ffdec-cli.jar`), mantendo o mesmo formato `lossless2`. Cópia de segurança do SWF original em `/tmp/barbie_nav_new.swf.bak`. Verifiquei reexportando o SWF editado: os estados up/over/down mostram o logo novo, a animação de 50 quadros do hover e a área de clique permanecem iguais.
3. **Problema de cache encontrado**: a troca não aparecia no navegador da usuária — o `app.js` e o SWF eram servidos do cache do navegador (o servidor local não enviava `Cache-Control`). Adicionei `?v=2` na URL do SWF de navegação em `app.js` e fiz o `serve.py` enviar `Cache-Control: no-cache, no-store, must-revalidate` em todas as respostas; reiniciei o servidor local.
4. **Desvio documentado**: esta troca substitui intencionalmente a arte original recuperada por uma arte fornecida pela usuária, a pedido dela. A arte original continua disponível no backup e no histórico do Git.

### Pendências que continuam

- Páginas individuais (molduras/controles) ainda não restauradas — fallback “Under restoration” permanece como provisório.
- Cenas completas do closet/quarto, revisão final dos slides/promos da home e do preenchimento da área de anúncio.
- Playlist histórica de vídeos (BTV) e catálogo completo de vídeos.
- Categorias alternativas dos catálogos e `data/popup.xml` do herói de Games não existem no archive (lacunas documentadas).
- Páginas internas do I Can Be (games, videos, careers, dolls) ainda não restauradas.
- Revisão visual desktop completa por página e estado interativo, reconciliação final dos manifestos e preparação para GitHub/Cloudflare (publicação segue adiada conforme combinado).
