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
