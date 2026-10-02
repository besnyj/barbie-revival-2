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

## Continuação — 01/10/2026 (Dreamhouse Puzzle Party e My Dreamhouse)

Os dois destinos da home/Games de junho de 2013 foram identificados no HTML/XML original: **Dreamhouse Puzzle Party** (`dreamhouse.barbie.com/en-US/games/puzzle-party/`, anunciado pelo slide Dreamhouse Puzzle Party) e **My Dreamhouse** (`/my-dreamhouse/`, anunciado pelo slide My Dreamhouse). “Life in the Dreamhouse” é o nome da área/franquia; não foi confundido com o jogo comercial Dreamhouse Party lançado depois. Cópias das páginas HTML de 27/06/2013 estão em `research/details/`.

### Dreamhouse Puzzle Party — jogável com quase todo o acervo de imagens

- Recuperei o `dhpuzzlewrapper.swf` de 25/06/2013 e suas dependências de runtime (configuração, preloader, fontes, loader, áudio, título, jogo e textos). As dependências restantes resolvem para capturas de 2014; cada data está no manifesto.
- A configuração original lista 123 imagens no primeiro conjunto e 73 imagens com versão grande no conjunto final. A primeira busca no Wayback trouxe **25 JPEGs válidos**; outras respostas eram páginas de erro/redirecionamento ou bytes que não eram JPEG. Depois encontrei o jogo no [Flashpoint Archive](https://flashpointarchive.org/view?id=ed19bc40-a48f-4c88-8253-bd97a764027f) e recuperei **213 JPEGs adicionais** do seu espelho Legacy: agora há **238 de 269 arquivos** referenciados. `research/flashpoint-puzzle-images.json` lista o resultado e a origem de cada arquivo; `scripts/recover_flashpoint_puzzle.py` reproduz a busca.
- Preservei o `gamesettings.xml` integral em `research/dreamhouse-puzzle-gamesettings-original.xml`. A cópia de runtime filtra referências indisponíveis: **96 de 123** imagens no primeiro conjunto e **71 de 73** pares de imagem/meme final. Esta adaptação evita sorteios de arquivos ausentes; ainda não equivale ao acervo original completo.
- Integrei a rota local `/dreamhouse/puzzle-party/`, o clique do card em Games e a URL externa reescrita pelo slide. Teste visual com Ruffle após a expansão: tela inicial, escolha de dificuldade e primeira fase com imagem e peças originais carregadas. Não completei as cinco fases; a tela final ainda exige teste.

### My Dreamhouse — editor local jogável com artes preservadas

- Recuperei o `barbie.swf` original referenciado pela página de 2013; a captura preservada do SWF é de 22/01/2014, mas os metadados internos indicam modificação em 20/05/2013. Este arquivo foi mantido em `public/my-dreamhouse/barbie.swf`.
- O SWF pede `/en-us/xml/assets.xml` e `/en-us/xml/sitecopy.xml` no antigo `design-my-dreamhouse.barbie.com`. Ambos foram encontrados apenas na captura de 01/08/2015, portanto não comprovam o catálogo de junho de 2013.
- Examinei as cópias dos dois jogos no NuMuKi. Para My Dreamhouse, recuperei também o `game.swf` disponibilizado lá; seus metadados internos indicam **30/06/2014**. Essa versão posterior é a prévia executada na rota `/my-dreamhouse/`, porque o SWF original ficou em branco no teste local, enquanto a versão posterior abre o menu e a tela de construção.
- Encontrei [My Dreamhouse no Flashpoint Archive](https://flashpointarchive.org/view?id=8b1220a2-e543-49e4-8f36-0b349083309d). O SWF desse acervo é idêntico, byte a byte, ao do NuMuKi; o XML de assets é idêntico à cópia Wayback. O espelho Legacy fornece também as artes: recuperei **todos os 473 arquivos distintos PNG/JPEG/SWF/MP3** referenciados pelo XML, inclusive os quatro arquivos de menu verificados, com assinatura válida. `research/flashpoint-my-dreamhouse-assets.json` registra URL e estado por arquivo; `scripts/recover_flashpoint.py` reproduz a recuperação.
- Testei no navegador local: menu, miniaturas de casas, escolha e construção da Chelsea Dreamhouse, interior, catálogo de decorações e arrastar uma palmeira para o cômodo. As artes aparecem e a interação funciona. O aviso da rota agora informa que o jogo está jogável localmente. Salvar e galeria online seguem **não verificados**; o conjunto SWF/XML/artes de 2014/2015 não comprova uma reprodução exata do estado de junho de 2013.

### Estado e próximos passos desses dois jogos

- **Puzzle Party:** rota e primeira fase funcionam com 238/269 JPEGs referenciados; testar as cinco fases, a tela final e controles. As 31 imagens ausentes continuam listadas no relatório.
- **My Dreamhouse:** editor de decoração jogável localmente com as 473 artes referenciadas pelo XML recuperadas; testar salvar e galeria. A versão executada é de 2014 com XML/artes preservadas em 2015 e não deve ser apresentada como equivalente exata à de junho de 2013.
- `scripts/recover.py` agora valida assinaturas reais de SWF/JPEG/PNG/GIF, impedindo que erros do arquivo histórico sejam registrados como assets válidos.
- Nenhum dos dois jogos foi publicado; GitHub/Cloudflare continuam adiados.

**Verificação posterior dos acessos:** cliquei nas duas thumbnails da aba Games e nas chamadas para jogar dos dois slides da home. Cada uma abriu a rota local do jogo correspondente (`/dreamhouse/puzzle-party/` ou `/my-dreamhouse/`). O logo “Life in the Dreamhouse” dentro do slide Puzzle Party é uma área clicável distinta que leva à página de personagens pela tela intermediária externa; a chamada do jogo no mesmo slide leva ao Puzzle Party local.

**Dossiê de continuidade:** os achados técnicos, fontes, caminhos dos arquivos, listas de recursos, testes e lacunas dos dois jogos foram reunidos em `research/dreamhouse-games-restoration.md`, dentro do projeto de restauração.

## Continuação — 01/10/2026 (backup dos slides da homepage)

Criei três arquivos ZIP em `backups/homepage-carousel/`, um por slide: `01-dreamhouse-puzzle-party.zip`, `02-blid-profile.zip` e `03-my-dreamhouse.zip`. Cada um guarda a animação SWF e o plano de fundo correspondente. Para preservar o contexto de restauração, cada ZIP também traz cópias do controlador `HomeCDA.swf`, do XML original com os três slides, de `index.html`, `app.js`, `site.css` e dos arquivos do Ruffle necessários à reprodução; os source maps de depuração ficaram de fora.

Cada arquivo inclui um `README.md` com instruções e um `MANIFEST.json` com hashes SHA-256. Verifiquei a integridade dos ZIPs e comparei os hashes de todos os itens com os arquivos atuais. Para recompor o carrossel completo, são necessários os três backups. Para repor apenas um slide em um carrossel ainda existente, é preciso recolocar seu SWF e JPG e conferir sua entrada no XML. Antes de substituir os arquivos compartilhados da homepage por cópias do backup, é necessário comparar eventuais mudanças posteriores. Nenhum arquivo ativo do carrossel foi removido ou alterado nesta etapa.

## Continuação — 01/10/2026 (cabeçalho e páginas do bottom)

- O cabeçalho recebeu a arte “The pink world is back” no espaço de anúncio; o antigo botão SWF de compras saiu da página. Sua cópia e recorte estão em `backups/header-bag/`, e o backup do cabeçalho em `backups/homepage-header/`.
- Os três promos Flash abaixo do carrossel foram substituídos por seis botões HTML/CSS com capas aprovadas, títulos em texto real e animações de entrada, hover e clique. Blog, Printables, E-book e Wallpapers abrem páginas locais individuais de restauração. Barbie.com e Mattel Creations passam pela tela intermediária antes das lojas indicadas pela usuária.
- Shopping ganhou uma faixa de título feita em CSS, paleta salmão suave e caixa compacta alinhada à direita, separada da primeira linha de botões. As capas usadas estão em `public/images/bottom-pages/` e as prévias em `design-previews/bottom-buttons/`.
- A sintaxe JavaScript e as respostas das rotas locais foram conferidas. A última alteração de cor e posição ainda precisa de inspeção visual, pois o navegador integrado ficou indisponível nessa etapa.
- A pasta `backups/` fica apenas neste computador e está no `.gitignore`. Copie esses arquivos separadamente antes de mover ou substituir esta cópia do projeto; eles não acompanham o repositório.

## Continuação — 01/10/2026 (QA dos jogos: ferramentas e engenharia reversa)

Retomei a reconstrução dos dois jogos (Puzzle Party e My Dreamhouse). O servidor local foi iniciado e confirmado em `http://127.0.0.1:4173/`; a captura de referência continua sendo a de 28/06/2013.

### Tentativa de completar as imagens do Puzzle Party

- Faltavam 31 JPEGs. Reconsultei todas as fontes conhecidas: **Wayback** (CDX do domínio `dreamhouse.barbie.com` inteiro, do host `assets.barbie.com` e do CDN do NuMuKi), **espelhos do Flashpoint** e **CDN do NuMuKi**. Só o `pic56.jpg` tinha captura 200 real (19/08/2014) — recuperado e salvo com assinatura JPEG válida. Os outros 30 realmente não existem: o espelho Legacy do Flashpoint responde 404 (é o espelho oficial do acervo), o Wayback só guardou o SWF do NuMuKi (não as imagens) e o acesso direto ao `media.numuki.com` é bloqueado pelo Cloudflare (HTTP 418). Continuam como lacuna documentada de variedade, não como bloqueio.
- Auditoria do XML de runtime: os **238 arquivos** referenciados existem localmente com assinatura válida (239 imagens agora, com o `pic56`). 0 ausentes, 0 corrompidos.

### Ferramentas de QA criadas

- **Limitação desta sessão**: o modelo agente não enxerga imagens, então toda verificação visual passou a ser feita por análise programática de pixels (Pillow), captura de rede e geometria do DOM — não por screenshots "a olho".
- Instalei Playwright (navegador headless Chromium) e Pillow; criei `scripts/qa_gameplay.py` (cliques/arrastos/screenshots), `scripts/qa_puzzle_trace.py` (captura de trace do Ruffle — abandonado, ver abaixo) e `scripts/qa_puzzle_solve.py` (solucionador cego que joga o jogo real).
- Descobri que o Ruffle 0.6.0 vendido **não tem** a opção `traceOutput`; os `trace()` do AS3 só aparecem com `logLevel:'trace'`, que inunda o console com logs internos do Ruffle e trava a página — o feedback por trace foi abandonado. Deixei um toggle de desenvolvimento `?ruffletrace=1` no `app.js` (só liga o trace quando o parâmetro existe). Uma edição intermediária que ligava trace em todas as páginas foi revertida na mesma sessão.

### Engenharia reversa do Puzzle Party (FFDec + JDK baixados em /tmp)

- Descompilei o `dhpuzzlegame.swf` (102 classes) e o `dhpuzzletitle.swf` e extraí a geometria completa do palco: botão Play do título (828, 474.9); grade 4×4 `h1_1..h4_4` (peças de 95×95) a partir de (45.5, 132.3); bandeja `m1..m16`; botões do HUD (dica, ajuda, mudo); tela final (PLAY AGAIN em 795.95, 410.1).
- Documentei a lógica do jogo: peças ocultas Easy [3,5,6,9,11] / Hard [6,8,10,12,13]; distratores 0 vs 1,2,3,3,3; soltura validada por `hitTestPoint` no buraco da própria peça; erro volta a peça; +25 pontos por peça; dica = prévia de 1 s; transição ~1,5 s; fase 5 termina na tela do meme com PLAY AGAIN.
- Achei atalhos de desenvolvimento no código ("Jump To Level 5" / "Finish Current Puzzle"), mas eles só aparecem no menu de contexto quando a URL do SWF contém `dev.cricketmoon` — inacessível sob o Ruffle (menus de contexto customizados não suportados). Os métodos `skipCurrentLevel()`/`jumpToLevel5()` são públicos.
- Localizei os botões Easy/Hard da tela de dificuldade por análise de pixels do render real: faixas em ~(368,244)-(790,326) e ~(526,432)-(904,502).
- **Bloqueio em aberto**: no jogo real sob Ruffle, cliques nessas coordenadas **não** iniciam a fase (varri 32 pontos em grade, todos sem efeito); o botão Play do título funciona (confirmado por diff de tela). Suspeito de problema de área de clique/roteamento de eventos nos SimpleButtons animados, ou de um overlay por cima. Plano de contingência: gerar uma cópia de QA do `dhpuzzlegame.swf` instrumentada com FFDec (`-importScript`) que inicia o modo Easy sozinha — o jogo real permanece intocado para o fluxo visível à usuária.

### My Dreamhouse — análise dos serviços de salvar/galeria

- Descompilei o `game-numuki.swf` (588 classes) e confirmei o contrato do servidor: `POST /Index/InsertDreamhouse` (salvar), `GET /Index/GetDreamhouse?user=<id>` (retomar), `/Index/InsertGalleryImage`, `/Index/GetGallery(+ByFeatured/ByLikes/ByRoomType)`, `/Index/LikeGalleryImage` e `/Index/PostMail` em `design-my-dreamhouse.barbie.com`; flashvars apenas `environment` e `locale`.
- O SWF consulta `MAT.SESSION.isUserLoggedIn`/`getSessionInfo` via ExternalInterface; o HTML de 2013 define o login Janrain mas **não** define `MAT.SESSION`, então o SWF cai no estado "não logado". O salvamento dispara na barra de preview ("Triggering Save DH …"). Ainda falta rastrear se existe salvamento como visitante; a decisão de persistência local (arquivo via `serve.py` vs localStorage vs Cloudflare Functions posterior) está pendente com a usuária.

### Estado no fim deste registro

- Puzzle Party: 239/269 imagens; o XML de runtime fecha 100% das referências; solucionador cego pronto, esperando resolver o bloqueio dos cliques na tela de dificuldade.
- My Dreamhouse: endpoints de salvar/galeria mapeados; implementação local pendente de decisão.
- Nada foi publicado; nenhum arquivo ativo do site foi alterado além do toggle dev `?ruffletrace=1` em `app.js`.

## Continuação — 01/10/2026 (levantamento do I Can Be contra o snapshot do Wayback)

Enquanto o agente dos dois jogos segue trabalhando, fiz o levantamento completo do que falta no **I Can Be** em relação ao snapshot do Wayback Machine. Evidência primária: o índice CDX completo de `icanbe.barbie.com` (12.952 capturas, 2012–2016) e as páginas HTML arquivadas.

### O que o site original tinha e o que está restaurado

- O site de junho/2013 tinha **43 páginas HTML `en_US`**: home, help e gotacode; **5 de Careers** (index + professional/artsy/nurturing/sporty); **25 de Games** (index + 4 páginas de categoria + 20 páginas de jogo); **8 de Videos** (index + 7 páginas de vídeo); **2 de Dolls** (team_barbie e president).
- Desse total, só **home, help e gotacode** estão restauradas localmente — **faltam 40 páginas**.
- Para cada página escolhi a captura mais próxima da baseline de 28/06/2013: quase tudo resolve para **27/06, 29/06, 01/07 ou 02/07/2013**; só `dolls/president.html` é de 15/05 (−44 dias). Os 43 HTMLs originais estão em `research/sections/icanbe-pages/`, com timestamps em `inventory.json` e o resultado do download em `download-report.json`.

### Assets

- Extraí **174 referências de assets** das 43 páginas e cruzei com o CDX (`assets-report.json`): **126 recuperáveis**, o restante são lacunas reais.
- Recuperáveis: as 7 miniaturas de vídeo (capturas de mai/2013); o herói e os 6 retratos de carreiras professional (mai/2013); os thumbs de jogos professional (mai–jun/2013); o herói e retratos artsy/nurturing/sporty existem apenas como **cópias de outras localidades** (pt_BR — mesma arte, tcm diferente; substituição documentada, como o projeto já aceita); as artes da Team Barbie (`Team_Dolls`, `Team_Stars`, `down_arrow`, `shopping_cart`) só em capturas de **set/2013** (procedência de captura próxima); e os sprites/estilos que faltavam para as páginas internas (`sprite-buttons-xl/l/aggregator.png`, `background-videos.jpg`, `background-title-videos.png`, `background-survey.png`, `btn-back-to-games.png`, `non_flash_vidBg.png`, `jquery.jscrollpane.css`, `arrows-scrollbar.gif`) — todos com captura 200.
- **Não recuperáveis em lugar nenhum** (lacunas documentadas): `ICB_Hero_Sporty` e os retratos `snowboarder`, `swim-instructor`, `art-teacher`, `babysitter` e `pastry-chef`; toda a arte da doll **President** (`ICB_President_BG_New`, `_Doll`, `_PinkBanner`); `Team_landing_BG_tcm107-4342.jpg`; `game_thumb_pastrychef`; e `expressInstall.swf` (instalador genérico da Adobe, inofensivo com Ruffle). Esses espaços ficarão com aviso honesto de restauração.

### Jogos

- **13 dos 20 SWFs de jogos estão no archive**: 7 com conjunto completo (SWF + `data/config.xmlx` + bibliotecas: amazing-architect, data-diva, halfpipe-pixie, pom-pom-squad, potty-race, splashin-bash, super-wedding-stylist) e 6 só com o SWF principal (disco-ballroom, fantastic-concert, good-morning-barbie, little-critter-clinic, presto-pizza, ready-set-check-up).
- **7 jogos nunca foram capturados**: art-teacher, cakery-bakery, kiddie-classroom, race-car-cutie, sugar-bug-blast, tutu-star e years-of-careers → “Under restoration” na área do jogo.

### Vídeos

- **Nenhum arquivo de mídia foi capturado** — os 7 vídeos vinham de serviço externo de streaming (IDs `data-video-id`). A moldura da seção (player, miniaturas, títulos, carrossel) é totalmente restaurável; a área do player fica “Under restoration”.

### Decisões sobre o comportamento original

- O botão Dolls do menu apontava para `/en_US/Dolls/index.html`, que dava **404/500 no próprio original** (link quebrado em junho/2013); a home linkava direto para `dolls/team_barbie.html`. Proposta documentada: apontar o botão Dolls para a página Team Barbie restaurada.
- `/en_US/games.html`, `/careers.html` e `/videos.html` eram redirecionamentos 301 para os index — replicar como redirecionamentos locais.

### Ferramentas novas

- `scripts/icanbe_inventory.py` (inventário de melhor captura a partir de um dump CDX), `scripts/icanbe_download_pages.py` (baixa cada página na captura escolhida) e `scripts/icanbe_assets_report.py` (extrai referências e cruza com o CDX). O `gotacode.html` foi baixado de novo com sucesso após uma falha transitória de rede.

### Próximos passos do I Can Be

1. Construir as 40 páginas fiéis a partir dos HTMLs arquivados (mesma técnica da home: DOM original, caminhos sob `/_original/icanbe.barbie.com/`, anúncios/trackers removidos com espaço preservado, links externos pela tela intermediária).
2. Recuperar os assets disponíveis com procedência por arquivo no manifesto.
3. Montar as páginas de jogo com Ruffle nos 13 SWFs recuperáveis (sem som) e aviso nos 7 ausentes; QA de runtime.
4. Vídeos: moldura completa + “Under restoration” no player.
5. Integrar rotas, links da home e do menu, `_redirects`, e rodar os scripts de QA.

## Continuação — 01/10/2026 (páginas internas do I Can Be)

### Recuperação de assets

- `scripts/icanbe_recover_assets.py`: recuperação guiada pelo CDX com procedência por arquivo em `research/icanbe-assets-manifest.json` (URL de origem, timestamp, SHA-256, flag de substituição, motivo do gap). Resultado: **178 recuperados, 23 lacunas documentadas**. Validação de assinatura binária (SWF/JPEG/PNG/GIF) e execuções idempotentes (reaproveita o manifest anterior e arquivos locais).
- Correções de parsing do CDX no caminho: URLs com `:80` poluíam as chaves do índice (bloqueavam capturas de 2012/2013); prefixos de host (`www.`, `origin.`, `ndcbeta.`) normalizados; arquivos de jogos gravados no caminho em minúsculas que os SWFs pedem em runtime.
- Destaques de procedência: **12 substituições cross-locale do pt_BR** (mesma arte, tcm diferente — heróis Artsy/Nurturing, retratos dancer/pizza-chef/rock-star/kid-doctor/race-car-driver e thumbs ballerina/ballroom/bride/heritage/petdoctor/rockstar); vários itens en_US só em capturas de **set–nov/2013** (Team_Dolls/Team_Stars/down_arrow/shopping_cart, retratos ballerina/cheerleader/rock-star-sm, thumbs ballroom/pizzachef/snowboarder); alguns recursos compartilhados só em capturas de **2012** (background-title-videos.png, background-videos.jpg, background-survey.png, btn-back-to-games.png, non_flash_vidBg.png, sprite-buttons-aggregator.png, arrows-scrollbar.gif e os dois PDFs das páginas de dolls); `video_player.swf` só de nov/2014 (mantido por procedência, sem uso). Datas registradas no manifesto.
- **Lacunas reais** (nunca capturadas em lugar nenhum): ICB_Hero_Sporty, retratos art-teacher/babysitter/pastry-chef/snowboarder/swim-instructor e os ícones `-sm` correspondentes, toda a arte da doll President (3 arquivos), Team_landing_BG, game_thumb_pastrychef, btn-dolls.png/shadow, expressInstall.swf e os 7 SWFs de jogos nunca capturados.
- Normalização de árvore: arquivos de jogos gravados em `resources/Games_data/…` (minúsculas); o `controllerSWF` hardcoded `/Resources/Games_Data/global/swf/gameapi.swf` (caixa original) é espelhado na raiz (`public/Resources/Games_Data/global/swf/gameapi.swf`) e o loader do Ruffle roda com `base` na raiz do site; os config.xmlx permanecem byte a byte iguais aos originais.

### Páginas (40 construídas)

- `scripts/build_icanbe_pages.py` escreve as 40 páginas em `public/_original/icanbe.barbie.com/en_US/` a partir dos HTMLs arquivados: DOM/CSS originais mantidos; caminhos do site repontados sob `/_original/icanbe.barbie.com/`; removidos anúncios (doubleclick) com o espaço preservado, `tracker.mattel.com`, injeção utag/Tealium, blocos `var track`/`utag_data`, `hdnpageId`, scripts/estilos de corporate.mattel.com (header-fixie/gnav/DD_belatedPNG/header-25px.css), Chrome-Frame do IE, o script externo do serviço de vídeo `mediaportal.mirror-image.com/api/script` e o jQuery do CDN do Google (substituído pela cópia local vendored); adicionados o mesmo stub do MATTEL (tracker + no-ops de `modules.analytics`) e o mesmo interceptador de cliques da home (barbie.com → rotas locais, icanbe.barbie.com → `_original` local, Dreamhouse Puzzle Party → jogo local, outros hosts → tela intermediária).
- **Jogos**: as 13 páginas cujo SWF foi recuperado embutem o jogo via Ruffle (760×480, mudo, flashvars absolutos em minúsculas; `config` só quando o arquivo foi recuperado). Os 7 jogos não capturados mantêm o texto de fallback original com painel “Under restoration” na área do jogo. Miniaturas de jogos associados sem arte viram avisos honestos.
- **Vídeos**: index e 7 páginas de detalhe com moldura, miniaturas e títulos restaurados; a área do player leva aviso (os vídeos nunca foram arquivados). As páginas de detalhe não redirecionam mais para o index (o original redirecionava visitantes com JS para o index com deeplink `#!` — sem sentido sem vídeo reproduzível; desvio documentado).
- **Carreiras**: professional completa com a arte de mai/2013; heróis e retratos artsy/nurturing vêm das cópias pt_BR (documentado); herói sporty e os retratos/ícones `-sm` não recuperados são avisos ou botões só com o sprite.
- **Dolls**: team_barbie restaurada com a arte de set/2013 mais aviso onde ficava o cenário de fundo não recuperável; president mostra aviso completo (as três camadas de arte nunca foram arquivadas) enquanto os botões originais de PDF e loja funcionam (PDFs de 2012).
- `script.js` (local, já adaptado) recebeu mais dois patches documentados: o aggregator só carrega a página da aba por AJAX quando existe aba selecionada (o original disparava um `load("undefined .content")` inválido nas páginas de jogo individuais, que reutilizam o id `#games` do body), e o módulo de vídeos foi neutralizado (sem player, sem chamadas externas, sem redirecionamento; as miniaturas linkam para as páginas de detalhe).

### Rotas

- `serve.py`: aliases legados com 302 (`en_US/games.html|careers.html|videos.html` → páginas index) e o link quebrado de Dolls (`en_US/Dolls/index.html` → `dolls/team_barbie.html`, correção documentada). `_redirects` espelha isso para o Cloudflare e inclui variante de caixa `en_US/Videos/*`.

### QA

- Novo `scripts/qa_icanbe.py` cobre as 38 URLs novas/afetadas (status, geometria do DOM, avisos, abas/cards, presença de Ruffle, redirecionamentos). Depois das correções, todas as páginas respondem 200 com 0 erros de console; as únicas requisições falhas restantes são de arquivos de runtime dos jogos nunca arquivados (config/soundBank/fontes dos jogos “só SWF principal”) — coerente com as lacunas documentadas, ainda a triar jogo a jogo.
- Corrigido durante o QA: a checagem de boot do Ruffle **chamava** `newest()` antes do ruffle.js (defer) definir a função — o TypeError matava o polling (agora é checagem com `typeof`); o loader/aviso agora espera o `#flashgame` existir (o script fica antes do div; o swfobject original adiava para o DOM ready); o script mediaportal ainda estava nas páginas de vídeo e era buscado; thumbs de jogos associados sem arte davam 404.
- Pendências: verificação de jogabilidade por jogo (7 conjuntos completos vs 6 só com SWF principal), triagem do status do potty-race no QA, revisão visual (screenshots) e o `<title>` vazio da página Team Barbie (mantido exatamente como no arquivo).

## Header e controles do carrossel — concluído em 02/10/2026

- Criada e integrada `public/assets/fundo-header-v2.png`, mantendo o canvas 2048×768 da imagem fornecida e reorganizando o visual para ter brilhos menores no alto e base rosa clara. O site principal mantém header 990×155 e o I Can Be mantém 990×244.
- O novo fundo contínuo substitui no layout ativo a montagem anterior com laterais da arte antiga, gradiente central e glitter SVG. A arte anterior segue preservada no repositório.
- Restauradas as setas diretamente do controlador Flash `HomeCDA.swf`: 15 quadros de `arrow_back_2`, 15 de `arrow_next_11` e 39 de `sparkleoutlineanim_8`, totalizando 69 PNGs em `public/carousel/original-arrows/`.
- O controlador atual reproduz a sequência original a 30 fps: hover até o quadro 7, glitter até o quadro 39 e rollout até o quadro 15. Os quadros são pré-carregados; foco por teclado continua suportado e movimento reduzido recebe estado estático.
- O fundo Welcome passou de tamanho natural para `cover`, centralizado, preenchendo 1920×1080 e 2560×1080 sem faixas laterais lisas. A imagem original 1672×941 permaneceu intacta.
- Conferidos no navegador: carregamento do header, animação completa de ambas as setas, avanço de slide, fundo Welcome em dois formatos de tela, ausência de erros de JavaScript, requisições falhas e respostas HTTP de erro.
- Backup local anterior às setas: `backups/homepage-carousel/20261002-original-arrow-hover-before.zip`.
