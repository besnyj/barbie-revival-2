# Revisões das cenas

## 01/10/2026 — moldura inferior fixa

A curva amarela com painel rosa dos fundos antigos foi recriada em `public/carousel/fixed-lower-frame.svg`. Por ser vetorial, mantém a borda, o brilho e os gradientes nítidos em diferentes larguras. O controlador a monta uma única vez sobre a base do carrossel, independentemente do slide ativo; os cartões inferiores permanecem sobre o painel. A margem e o rodapé de texto continuam separados em `public/home-shell.css`.

No Welcome, a frase laranja final foi colocada sobre a moldura para não desaparecer atrás da curva. O conteúdo e o fundo dos três slides Flash antigos não foram alterados. Backup anterior: `backups/homepage-carousel/20261001-212426-before-fixed-lower-frame.zip`. Prévia: `design-previews/fixed-frame-original-v2.png` e `design-previews/fixed-frame-welcome-v2.png`. Este desenho ainda aguarda avaliação visual da usuária para se tornar referência aprovada do fluxo.

## 01/10/2026 — indicadores centralizados com glitter

A pedido da usuária, o grupo de bolinhas passou a ser centralizado no carrossel, independentemente do número de slides. As bolinhas têm textura de glitter rosa e pequenos brilhos alternados; a ativa fica dourada com contorno rosa. O movimento reduzido desativa a cintilação. Alteração limitada a `public/carousel/controller.css`. Verificados no navegador: centralização, quatro indicadores, clique e atualização do ativo, movimento reduzido. Prévia: `design-previews/welcome-glitter-dots.png`.

## 01/10/2026 — entrada e proposta de fluxo

Estado: inventário e leitura de referências concluídos; composição e animação ainda não implementadas. Nenhuma decisão visual aprovada nesta etapa.

### Welcome

Transcrição da referência, preservando as quebras visuais:

```text
Remember spending hours
playing Barbie games after school?

Welcome back
to old and
nostalgic
Barbie.com!

A fan-made revival of the classic Barbie.com experience.
```

Aparência a reproduzir: pergunta roxa sobre branco; título rosa forte com contorno branco; complemento rosa claro e roxo com contorno branco; assinatura laranja com contorno branco. Personagem à esquerda, janela ilustrada à direita e adesivos em camadas independentes. A fonte de cada trecho permanece sem identificação confirmada.

### Contact

Transcrição da referência, preservando pontuação e quebras visuais:

```text
Help Us Restore
Barbie.com!

Remember something we’re missing?
We'd love your help!

Every forgotten game,
picture and memory
can help bring another
piece of our glittery
experience!.

Send a Memory
Share a File
Suggest a Game

CONTACT US
```

Observação editorial: a referência termina o parágrafo com `experience!.`. Preservado na transcrição; eventual correção depende da revisão da usuária.

Aparência a reproduzir: título branco, painel creme, pergunta/parágrafo em tom escuro, destaques e botão em magenta. Personagem à direita com borda branca (`element 2.png`). `element 1.png` é uma alternativa sem a borda; não duplicar a personagem. Painel e botão devem ser reconstruídos como formas, com texto real sobreposto.

Pendências: fontes por trecho e destino de CONTACT US. Confirmar durante a montagem se as três chamadas são apenas texto, como na referência, ou ações distintas; não inventar três destinos.

### Próxima revisão

Welcome foi montado como primeira prévia na homepage. Registrar o retorno no formato abaixo, distinguindo regra reutilizável de ajuste específico.

```text
Data / cena / versão:
Prévia e arquivos:
O que foi apresentado:
Retorno da usuária:
Decisões aprovadas para esta cena:
Regras aprovadas para o fluxo:
Ajustes pendentes:
Verificação executada e limitações:
Backup anterior à mudança:
```

## 01/10/2026 — Welcome v1 para avaliação

- Cena integrada na homepage em `public/carousel/welcome.js` e `public/carousel/welcome.css`. Elementos visuais continuam separados; texto é HTML editável. O fundo da página acompanha a cena.
- A composição usa o referencial 1920 × 1080 e é reduzida proporcionalmente para a área 910 × 520.
- Fonte da pergunta: Single Day (a grafia `Singkle Day` foi interpretada como `Single Day`, nome do arquivo de fonte). Fonte de “Welcome back”: Berkshire Swash. Ambas incorporadas localmente com licenças OFL em `public/carousel/fonts/`.
- Kitten foi informado para os demais trechos, mas o arquivo de fonte web não foi fornecido nem encontrado na máquina. O CSS usa Kitten se estiver instalada no navegador e, caso contrário, Berkshire Swash como substituta **provisória**. A aparência desses trechos ainda não é correspondência exata com a referência.
- Prévia para comparação: `design-previews/welcome-v3.png` (área central) e `design-previews/welcome-homepage-v1.png` (homepage completa). A versão em execução pode ser revista em `http://127.0.0.1:4173/` enquanto o servidor local estiver ativo. Os PNGs `welcome-v1.png` e `welcome-v2.png` são históricos anteriores aos últimos ajustes de tipografia.
- A versão Flash anterior pode ser visualizada em `/?original-carousel=1`; seus arquivos continuam preservados.
- Verificado: JavaScript sem erro de sintaxe; 15 imagens e as duas fontes incorporadas carregadas; fundo da página sincronizado; Welcome no navegador sem erro de página ou pedido de arquivo com falha; controlador Flash anterior acessível pela opção de comparação. Ainda falta avaliação visual da usuária.
- Backup anterior à mudança: `backups/homepage-carousel/20261001-190143-antes-do-fluxo-v1.zip`.

## 01/10/2026 — correções após revisão da usuária

Retorno: fundo interno do Welcome deveria ser transparente e revelar o fundo do site; elementos da referência têm inclinações leves; entradas individuais precisavam ser visíveis; setas, quatro bolinhas, três slides anteriores e margem branca do rodapé deviam permanecer.

Correção aplicada:

- Welcome é o quarto slide; Puzzle Party, BLID Profile e My Dreamhouse são os três primeiros. Os três continuam executados pelo controlador Flash original, com XMLs locais de uma cena para navegação externa previsível. Não há alteração nos SWFs ou no XML original.
- Navegação e fundo passaram a `public/carousel/controller.js` e `controller.css`. Setas e bolinhas pertencem à estrutura, geradas conforme os slides ativos. Há quatro bolinhas. As setas são fixas e a troca automática usa a duração de cada slide.
- O palco Welcome passou a ser transparente, inclusive atrás da personagem; o fundo `background.png` foi aplicado somente ao fundo do site. A imagem `element 3.png` da personagem já possuía transparência alfa, portanto não precisou ser alterada.
- Elementos Welcome agora usam entradas individuais (deslizar, ampliar e aparecer), com atrasos próprios. A pergunta, título, subtítulo, janela e assinatura receberam pequenas inclinações. Entradas reiniciam ao voltar ao Welcome; movimento reduzido é respeitado.
- Rodapé e margem branca são definidos em `public/home-shell.css`, fora das folhas das cenas. Cabeçalho e cartões inferiores permanecem em seus arquivos.
- Verificação: navegação pelas quatro bolinhas no navegador; os três conteúdos antigos apareceram; Welcome apareceu com fundo externo e palco transparente; duas setas visíveis e volta do quarto ao primeiro slide; troca automática do Welcome para o primeiro em 10 segundos; entradas independentes conferidas por seus nomes e atrasos no navegador; fundo 01/02/03/Welcome correspondente; rodapé branco com margem de 52 px. Sem erro de JavaScript. Uma requisição WASM foi cancelada quando um player Flash foi trocado rapidamente; as capturas dos três slides renderizaram.

Prévia da homepage após a correção: `design-previews/four-slide-homepage.png`. Capturas individuais: `design-previews/carousel-four-slide-1.png` a `carousel-four-slide-4.png`. A avaliação visual da usuária continua pendente.

## 01/10/2026 — ajuste fino do título Welcome back

A referência posiciona o texto com uma inclinação descendente da esquerda para a direita. A versão anterior tinha inclinação de -1 grau e passava por cima dos stickers à direita. O título agora usa +4 graus, parte de x=652 no referencial 1920 × 1080 e tem largura visual comprimida para caber antes da seta direita. O coração e a estrela da direita ficaram em camadas superiores ao texto, como na referência. Nenhum outro texto, slide, fundo ou controle foi alterado nesta revisão. Prévia: `design-previews/welcome-title-final.png`.
