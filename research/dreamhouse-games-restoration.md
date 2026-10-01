# Dreamhouse Puzzle Party e My Dreamhouse — dossiê de restauração

Este arquivo reúne as evidências e os caminhos úteis para continuar a restauração dos dois jogos mostrados na home e na aba Games do site Barbie de junho de 2013. Estado verificado em 01/10/2026. O registro cronológico do trabalho está em `../checkpoint.md`; o resumo geral do projeto, em `../donesofar.md`.

## Identificação na versão de junho de 2013

- `home-carousel.xml` e `../public/global/homepageCDARotation/HomeCDA.xml`: slide **Dreamhouse Puzzle Party** com `clickURL` `http://dreamhouse.barbie.com/en-US/games/puzzle-party/`; slide **My Dreamhouse** com `clickURL` `/my-dreamhouse/`.
- `sections/games.html`: cards originais com miniaturas `MyDreamhouse_Thumb.jpg` e `DreamhousePuzzleParty.jpg` e esses mesmos destinos. O catálogo local está em `../public/sections/catalog-data.js`.
- Páginas HTML preservadas de 27/06/2013: `details/dreamhouse-puzzle-party-20130627.html` e `details/my-dreamhouse-20130627.html`.
- A primeira página incorpora `dhpuzzlewrapper.swf?assetPath=/Content/games/en-US/dreamhousepuzzle/` em 990 × 550. A segunda incorpora `barbie.swf` em 990 × 800, com `environment=http://design-my-dreamhouse.barbie.com` e `locale=en-us`.
- “Life in the Dreamhouse” nomeia a área/franquia mostrada no slide. O jogo desse slide é **Dreamhouse Puzzle Party**. O logo “Life in the Dreamhouse” dentro dele possui um hotspot distinto para `/en-US/cast/`; clicar na chamada do jogo abre o Puzzle Party.

## Fontes preservadas e método

1. O Wayback fornece o wrapper do Puzzle Party capturado em 25/06/2013; várias dependências dele só resolveram para capturas de 2014. O `barbie.swf` de My Dreamhouse referido pela página de 2013 resolveu para captura de 22/01/2014 e tem metadados internos com modificação em 20/05/2013. Datas e URLs resolvidas estão em `asset-manifest.json`.
2. [Flashpoint: Puzzle Party](https://flashpointarchive.org/view?id=ed19bc40-a48f-4c88-8253-bd97a764027f) e [Flashpoint: My Dreamhouse](https://flashpointarchive.org/view?id=8b1220a2-e543-49e4-8f36-0b349083309d) catalogam ambos. Seu espelho público Legacy usa a forma `https://infinity.unstable.life/Flashpoint/Legacy/htdocs/<host-original>/<caminho-original>`; isso permitiu recuperar artes que faltavam no Wayback. O próprio catálogo Flashpoint indica como comandos de abertura os SWFs em `assets.barbie.com/games-bin/DreamhousePuzzleParty/` e `assets.barbie.com/games-bin/Design-my-Dreamhouse/`.
3. [NuMuKi: Puzzle Party](https://www.numuki.com/game/dreamhouse-puzzle-party/) e [NuMuKi: My Dreamhouse](https://www.numuki.com/game/barbie-my-dreamhouse/) também disponibilizam cópias. O SWF de My Dreamhouse obtido do NuMuKi é byte a byte igual ao SWF de My Dreamhouse no Flashpoint Legacy. Os recursos dependentes do CDN NuMuKi não foram acessíveis diretamente na pesquisa (desafio Cloudflare); o espelho Flashpoint forneceu os arquivos.
4. O XML `assets.xml` de My Dreamhouse no Flashpoint é byte a byte igual ao XML encontrado no Wayback, cuja captura resolvida é de 01/08/2015. O `sitecopy.xml` local também veio dessa captura. Esses arquivos posteriores não demonstram qual era exatamente o conjunto de junho de 2013.

## Dreamhouse Puzzle Party: arquivos, implementação e estado

- Rota local: `/dreamhouse/puzzle-party/`, definida em `../public/app.js` e `../public/_redirects`. O SWF roda no Ruffle; a rota passa `assetPath` para `../public/_original/dreamhouse.barbie.com/Content/games/en-US/dreamhousepuzzle/`.
- Nessa pasta estão `dhpuzzlewrapper.swf`, `preloader.swf`, `loader.swf`, `fonts.swf`, `audioswf.swf`, `dhpuzzletitle.swf`, `dhpuzzlegame.swf`, XMLs de configuração/textos/sons e imagens. A lista exata de capturas Wayback está em `asset-manifest.json`.
- Configuração completa preservada: `dreamhouse-puzzle-gamesettings-original.xml`. Ela referencia 269 JPEGs distintos: 123 imagens para o primeiro conjunto e 73 imagens finais, cada uma com contraparte grande.
- Resultado da recuperação: 25 JPEGs válidos via Wayback + 213 via Flashpoint = **238/269** arquivos. `flashpoint-puzzle-images.json` informa o resultado e a URL de cada tentativa; `../scripts/recover_flashpoint_puzzle.py` permite repetir essa busca. O script `../scripts/recover.py` valida assinaturas para impedir que páginas de erro sejam aceitas como JPEG/SWF.
- Os 31 arquivos ausentes são: `pic101.jpg`, `pic110.jpg`, `pic119.jpg`, `pic120.jpg`, `pic122.jpg`, `pic123.jpg`, `pic146.jpg`, `pic147.jpg`, `pic149.jpg`, `pic155.jpg`, `pic165.jpg`, `pic2.jpg`, `pic2big.jpg`, `pic46.jpg`, `pic47.jpg`, `pic48.jpg`, `pic49.jpg`, `pic5.jpg`, `pic5big.jpg`, `pic52.jpg`, `pic54.jpg`, `pic56.jpg`, `pic59.jpg`, `pic60.jpg`, `pic62.jpg`, `pic66.jpg`, `pic68.jpg`, `pic75.jpg`, `pic84.jpg`, `pic90.jpg`, `pic98.jpg`.
- O XML de execução em `../public/_original/dreamhouse.barbie.com/Content/games/en-US/dreamhousepuzzle/xml/gamesettings.xml` foi reconstruído a partir do original para excluir seleções sem JPEG válido. Restaram **96/123** imagens no primeiro conjunto e **71/73** pares completos no conjunto final. As lacunas afetam a variedade histórica, mas não são bloqueios comprovados do sorteio atual.
- Teste no navegador: slide da home e card de Games levam à rota local; tela inicial, seleção de dificuldade e primeira fase com imagem e peças carregam. Ainda faltam teste de cinco fases até a tela de meme final, ambos os níveis de dificuldade, dicas, tempo, pontos e replay. O áudio está mutado pela função `movie()` de `../public/app.js`.

## My Dreamhouse: arquivos, implementação e estado

- Rota local: `/my-dreamhouse/` em `../public/app.js` e `../public/_redirects`. A cópia da página original está em `details/my-dreamhouse-20130627.html`.
- `../public/my-dreamhouse/barbie.swf` é o SWF ligado à página de 2013, preservado pelo Wayback em 2014. Ele ficou em branco no teste com os XMLs recuperados de 2015; por isso a rota usa `../public/my-dreamhouse/game-numuki.swf`, uma versão posterior com metadados internos de modificação em 30/06/2014. Esse arquivo coincide byte a byte com o SWF preservado pelo Flashpoint.
- Dependências XML em `../public/_original/design-my-dreamhouse.barbie.com/en-us/xml/`: `assets.xml` e `sitecopy.xml`. As **473 referências distintas a PNG/JPEG/SWF/MP3 do `assets.xml`** foram recuperadas do Flashpoint Legacy com assinatura binária válida e estão em `../public/_original/design-my-dreamhouse.barbie.com/en-us/Images/`. O relatório por URL é `flashpoint-my-dreamhouse-assets.json`; o script reproduzível é `../scripts/recover_flashpoint.py`.
- Teste no navegador: menu, escolha de casa, miniaturas, exterior e interior da Chelsea Dreamhouse, catálogo de decorações e arrastar uma palmeira para o cômodo funcionaram. O menu inicialmente aparece sem algumas imagens durante o carregamento e depois as exibe.
- O HTML de 2013 inclui interfaces de login/salvamento Janrain. **Salvar, carregar como usuário recorrente e galeria online não foram testados** no projeto local; podem depender de serviços que deixaram de existir. Não foi implementado substituto local. O fato de todos os arquivos listados no XML estarem presentes não elimina a possibilidade de requisições dinâmicas adicionais.
- A versão local é jogável no fluxo de decoração observado, mas a combinação SWF de 2014 + XML/artes preservados em 2015 não comprova fidelidade exata a junho de 2013. O SWF mais próximo de 2013 fica preservado para futura investigação de compatibilidade/configuração.

## Navegação e verificações

- Testados por clique real no navegador: os dois cards da aba Games; o título/chamada do slide Puzzle Party; o botão **Play** do slide My Dreamhouse. Cada chamada abre a rota local correspondente.
- O SWF do carrossel contém hotspots distintos: clicar no logo “Life in the Dreamhouse” do slide Puzzle Party vai para `/en-US/cast/`, que atualmente mostra a tela intermediária de link externo. Isso não é o botão de jogar.
- `git diff --check`, compilação Python dos dois scripts Flashpoint e `node --check ../public/app.js` passaram na sessão de recuperação. Não houve publicação em GitHub/Cloudflare.

## Próximas tarefas para chegar a 100%

1. Executar uma partida inteira de Puzzle Party em cada dificuldade e verificar estados de dica, pontuação, tempo, final e replay; corrigir qualquer falha observada. Recuperar os 31 JPEGs restantes se houver fonte legítima para completar a variedade original.
2. Exercitar no My Dreamhouse construção livre, decoração de vários cômodos, edição/exclusão, botão **Glam It Up**, salvar, retorno e galeria; registrar requisições e erros reais. Se os antigos serviços de conta/galeria não existirem, decidir e implementar persistência/galeria local equivalente para funcionalidade independente.
3. Testar e decidir a política de som para ambos; a reprodução atual está mutada globalmente.
4. Investigar XMLs/serviços de 2013 compatíveis com `barbie.swf` e documentar diferenças reais entre a versão lançada naquele ano e a versão de 2014/2015 hoje executada.
