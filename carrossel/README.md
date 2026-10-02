# Fluxo de criação dos carrosséis — v0.1

Status: proposta inicial para revisão. As regras de entrada abaixo refletem o pedido da usuária; as decisões visuais só se tornam padrão aprovado depois da avaliação do resultado.

## Entrada por cena

Cada subpasta representa um slide/cena do carrossel principal:

```text
carrossel/
  Nome da cena/
    background.png
    reference.png
    element 1.png
    element 2.png
    ...
```

- `reference`: fonte da composição, textos, cores, aparência tipográfica, proporções e sobreposições. Serve para comparação; não deve ser exibida como slide achatado.
- `background`: fundo do site associado à cena. Deve trocar junto com a cena, inclusive fora da área central.
- `element N`: peças independentes. A referência determina posição, escala, recorte e sobreposição. Pode haver versões alternativas da mesma peça; registrar a seleção, sem assumir que todos os arquivos aparecem simultaneamente.
- Preservar os arquivos fornecidos. Derivações para publicação devem ficar em `public/`, separadas das entradas.
- A usuária não precisa preparar JSON nem renomear os arquivos existentes. A configuração será montada durante a implementação.

## Etapas e resultado esperado

1. **Inventário:** conferir as pastas atuais, dimensões, transparência, variantes e integridade. Registrar peças faltantes e diferenças de proporção. Repetir quando entrarem novos arquivos.
2. **Preservação:** antes de alterar o site, salvar os arquivos afetados e dependências em ZIP datado com manifesto SHA-256 e instruções. Conferir o ZIP e os hashes. Registrar o caminho exato.
3. **Leitura da referência:** transcrever literalmente textos, pontuação e quebras; mapear cada elemento, posição, tamanho, ordem de camadas, cores, contornos e fontes. Não corrigir redação silenciosamente.
4. **Composição estática:** criar uma primeira cena revisável com texto real e imagens independentes. Comparar lado a lado com a referência antes de ajustar animações. Começar por Welcome; aplicar as decisões aprovadas em Contact depois.
5. **Revisão visual:** registrar o que foi aceito, o que deve mudar e quais escolhas são específicas daquela cena. Manter a revisão como rascunho até a usuária avaliar a prévia.
6. **Movimento e interação:** configurar entradas, saídas e duração por elemento/cena, sincronizar fundo e verificar cliques, setas e indicadores. Oferecer pausa e respeitar movimento reduzido.
7. **Integração e verificação:** conferir no contexto da homepage, carregamento de assets, legibilidade, limites da cena, navegação por teclado, troca manual/automática e sincronização do fundo. Testar larguras diferentes sem distorcer peças.
8. **Registro:** anotar arquivos, prévia, verificações realizadas, pendências, decisões aprovadas e caminho do backup. Só generalizar como padrão aquilo que foi validado como reutilizável.

## Configuração de implementação

O controlador deve ler uma lista de cenas. Cada cena terá identificador, estado ativo/inativo, ordem, duração, fundo e lista de elementos. Cada elemento terá identificador, tipo, arquivo ou texto, posição, tamanho, camada, estilo e animação; links terão destino explícito.

Setas pertencem ao controlador. Indicadores correspondem apenas às cenas ativas e são gerados automaticamente. Trocar conteúdo não deve exigir reescrever o controlador. Quando houver zero cenas ativas, exibir um estado definido; com uma cena, dispensar navegação/autoplay; ao desativar a cena atual, selecionar uma cena válida.

### Limites de edição estabelecidos após a primeira revisão

| Parte | Dono no código | Regra para a próxima cena |
|---|---|---|
| Cabeçalho, navegação principal, páginas inferiores e rodapé | `public/app.js`, `public/site.css`, `public/home-shell.css` | Não remover nem alterar ao editar uma cena. Verificar a homepage inteira após a mudança. |
| Moldura curva acima das páginas inferiores | `public/carousel/fixed-lower-frame.svg`, `public/carousel/controller.js` e `controller.css` | Peça fixa e vetorial, compartilhada pelos quatro slides. Sua borda amarela se sobrepõe à base do carrossel; o painel rosa fica atrás dos cartões. Não incluir essa moldura no fundo ou nos elementos de uma nova cena. |
| Setas, bolinhas, duração, ordem e troca do fundo do site | `public/carousel/controller.js` e `controller.css` | Permanecem visíveis em todos os slides. Bolinhas são geradas da lista de slides ativos. |
| Slides Flash originais | `public/global/homepageCDARotation/` e XMLs de uma cena em `public/carousel/legacy/` | Mantê-los na lista até pedido explícito para remover. A cópia XML isola cada slide sem modificar o original. |
| Welcome | `public/carousel/welcome.js`, `welcome.css`, `welcome/` | Somente conteúdo, composição e animação de seus elementos. O palco é transparente. |
| Novas cenas | Pasta de entrada em `carrossel/`, arquivos publicados em `public/carousel/` | Cada elemento declara entrada, atraso, posição, inclinação e camada; o controlador faz o resto. |

As animações padrão são `pop`, `from-left`, `from-right`, `from-top`, `from-bottom` e `zoom`. Cada elemento pode escolher uma entrada e atraso; a animação reinicia ao voltar para a cena. `prefers-reduced-motion` desativa esses movimentos. Uma nova cena não deve alterar o CSS do rodapé ou incluir setas/bolinhas próprias.

A moldura curva não é o rodapé de links/texto do fim da página. O SVG preserva o desenho do fundo dos slides antigos com traços e gradientes nítidos; o controlador o monta uma vez, fora da área recortada de cada slide. O `home-shell.css` posiciona os cartões sobre o painel. Ao revisar uma nova cena, conferir se a moldura e a frase final da cena continuam legíveis, sem mover a estrutura comum para dentro do slide.

Manter o visual atual de setas e indicadores como referência na implementação. O HTML/JS existente deve ser reaproveitado sem introduzir um framework só para esta seção.

### Setas originais restauradas em 02/10/2026

As setas e o brilho agora usam quadros exportados diretamente de `public/global/homepageCDARotation/HomeCDA.swf`, guardados em `public/carousel/original-arrows/`. Os símbolos Flash são `arrow_back_2` (id 23), `arrow_next_11` (id 26) e `sparkleoutlineanim_8` (id 22). O filme roda a 30 fps: as setas param no quadro 7 ao receber hover, voltam até o quadro 15 na saída, e o brilho para no quadro 39. O controlador reproduz esses tempos e preserva os botões HTML acessíveis. A exportação raster mantém a aparência dos quadros originais; a interação continua sob controle do carrossel atual para incluir a cena Welcome.

Backup anterior à troca: `backups/homepage-carousel/20261002-original-arrow-hover-before.zip`.

## Fidelidade e incertezas

- Uma referência rasterizada não confirma o nome da fonte. Usar a fonte informada/fornecida quando disponível; uma aproximação deve ser identificada como provisória, nunca apresentada como correspondência exata.
- Registrar cores em valores CSS e confirmar visualmente. Evitar amostrar bordas suavizadas como se fossem a cor principal.
- Texto principal deve continuar selecionável e editável; contornos e sombras são estilos. Texto que já integra uma ilustração fornecida não deve ser removido automaticamente.
- Animação não pode ser deduzida de uma imagem estática. Movimentos propostos devem ser separados da composição e avaliados na prévia.
- Não inventar destinos de botões. Registrar destinos ausentes; uma prévia pode mostrar o botão sem ação, claramente identificado como pendente no relatório.
- As referências atuais são 1920 × 1080; a área Flash atual é 910 × 520. Definir o encaixe visual na prévia, com escala proporcional e sem esticar a composição.
- Os backgrounds atuais são 1672 × 941. Conferir escala, repetição e posicionamento no site inteiro, sem tratar automaticamente esse arquivo como fundo limitado ao slide.

## Situação inicial — 01/10/2026

- Homepage ainda utiliza `public/global/homepageCDARotation/HomeCDA.swf` com três slides originais.
- Welcome: 12 elementos, background e referência.
- Contact: 2 elementos, background e referência. Os elementos são variantes da personagem; `element 2.png`, com contorno branco, corresponde à variante vista na referência.
- Fontes exatas e destino de CONTACT US pendentes de informação.
- Inventário técnico em `inventario.json`; textos transcritos e observações em `REVISOES.md`.
- Welcome foi integrada como quarto slide e está aguardando avaliação visual. Os três slides originais permanecem nas primeiras posições, com suas animações Flash e chamadas clicáveis. A homepage mantém uma opção de comparação com o controlador anterior sem Welcome em `/?original-carousel=1`.

## Backup e retorno

Snapshot desta etapa: `backups/homepage-carousel/20261001-190143-antes-do-fluxo-v1.zip` (relativo à raiz do projeto). Contém 62 arquivos: carrossel original, fundos/cabeçalho, Ruffle sem source maps, HTML/JS/CSS compartilhados, registros e imagens de entrada. Integridade ZIP e SHA-256 de cada arquivo conferidas.

Esse arquivo não substitui um backup completo do site e não é um dos três ZIPs antigos citados nos registros. Inclui as alterações locais já existentes em `public/site.css`.

Para retornar, extrair em pasta temporária, validar o manifesto e comparar antes de copiar somente os arquivos necessários. Nunca sobrescrever automaticamente alterações posteriores em arquivos compartilhados. `backups/` é ignorada pelo Git; conservar os ZIPs separadamente ao mover o projeto.
