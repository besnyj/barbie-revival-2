# Inventário reutilizável do header e dos ícones

Extração feita em 03/10/2026 a partir dos arquivos **locais**. O menu atual usa `public/global/barbie_nav_ordered.swf`; `barbie_nav_new.swf` e `research/nav.swf` foram guardados em `source/` para comparação. Nenhum arquivo em `public/` foi alterado nesta extração.

## Onde está cada coisa

- `source/`: os três SWFs da navegação. O SWF é a referência para movimento, composição e comportamento, inclusive interações não representadas por PNG.
- `extracted/frames/`: os cinco quadros da linha principal, em PNG transparente de **820 × 100 px**. `1.png` é uma referência visual imediata dos seis ícones e do logo.
- `extracted/sprites/`: **todos os quadros** de cada símbolo animado, em PNG. O número após `DefineSprite_` é o identificador do símbolo no SWF. As dimensões dos PNGs exportados são a área do símbolo e **não** a caixa final de clique na página.
- `extracted/shapes/`: formas vetoriais em SVG (110 arquivos), úteis para recuperar detalhes sem redesenhar por cima de capturas.
- `extracted/images/`: bitmaps internos; `219.png` é o logo atualmente embutido, **151 × 75 px**. `182.png` é outra imagem interna, **489 × 759 px**; `111.png` e `112.png` têm apenas 1 × 1 px.
- `extracted/fonts/101_HelveticaNeueLT Std.ttf`: subconjunto da fonte incorporada ao SWF. Contém os glifos necessários ao menu; não assumir que serve para texto geral do site.
- `extracted/texts/`: inscrições originais do menu, separadas por ID.
- `extracted/buttons/DefineButton2_224/`: quatro estados exportados do botão do logo (`up`, `over`, `down`, `hittest`).
- `extracted/symbolClass/symbols.csv`: nomes originais dos símbolos.
- `navigation.xml`: descrição detalhada do SWF, inclusive matrizes, camadas, cores, filtros e quadros. Exportação do JPEXS FFDec 26.3.0. Valores de coordenadas do XML em *twips* devem ser divididos por 20 para obter pixels.
- `current/`: capturas de fallback do menu para seis rotas, ícone de Downloads, quatro imagens do seletor de país e fundo atual do header.

## Geometria na página atual

| Elemento | Tamanho | Posição relativa ao header | Fonte |
| --- | ---: | ---: | --- |
| Header | 990 × 155 px; borda inferior 4 px | 0, 0 | `public/site.css` |
| Navegação Flash/fallback | 820 × 100 px | 0, 40 px | `#navigation` |
| Logo dentro do SWF | bitmap 151 × 75 px | botão em 87,5 × 41,25 px no espaço do SWF | símbolo 219/224 no XML |
| Seletor de país | contêiner 155 px | 835, 90 px | `.language` |
| Downloads reconstruído em HTML | área 108 × 100 px | 610, 40 px | `.nav-downloads` |

Áreas clicáveis do menu, medidas no espaço da navegação: logo `x=0–174`, Games `174–285`, Fairytale `285–396`, Fashion `396–502`, Sisters & Friends `502–610`, Downloads `610–718`, Videos `718–820`. As áreas estão em `public/site.css`. Downloads cobre a posição que no SWF corresponde a I Can Be; portanto seu ícone e sua etiqueta atuais são **reconstrução**, não recursos originais do SWF. O seu PNG tem 320 × 208 px e é exibido com `width:80px; height:52px; object-fit:contain`.

O fundo ativo é `public/assets/fundo-header-v2.png` (arquivo 2048 × 768 px, desenhado na página com largura de 990 px), com base `#ffe4f1` e borda inferior `#ed4b9b`. Os fallbacks de `current/` têm 820 × 100 px cada. O menu Flash é ocultado se falhar e pausado aproximadamente cinco segundos depois de carregar; assim, no site atual, a animação visível do SWF não é uma reprodução contínua.

## Fonte, etiqueta, cor e inclinação

O SWF incorpora **HelveticaNeueLT Std**, identificador de fonte 101, marcada como `bold=true` e `italic=false`. Os textos originais são objetos `DefineText`, não CSS. A inscrição normal é rosa **`#DF2A86`** e tem 11,5 a 14 px conforme o item; a inscrição de destaque é amarela **`#FFF200`** e tem 14 a 16 px. A etiqueta amarela da captura do menu usa também o amarelo `#FFF200` como fundo e texto rosa. As formas exportadas guardam os contornos reais dos ícones; não há uma propriedade CSS de `stroke` para o texto do SWF. O destaque inclui uma forma branca com filtro de desfoque de 20 unidades do Flash em várias sequências (símbolo 123), além dos objetos de texto/forma sobrepostos. Para reproduzir o aspecto, use os recursos vetoriais e os estados exportados; um `text-stroke` arbitrário seria apenas aproximação.

As etiquetas são inclinadas por matriz Flash, e não por itálico da fonte: `scaleX=scaleY≈0,9925537`, `rotateSkew0≈−0,12187195`, `rotateSkew1≈+0,12187195`, equivalentes a **aproximadamente −7° na orientação visual CSS**. Fashion normal usa uma matriz ligeiramente diferente (`scale≈1,008`, `skew≈0,1237`, aproximadamente 7° em magnitude). A borda/efeito de destaque pode usar outra matriz; os números completos estão em `navigation.xml`. A etiqueta HTML de Downloads usa **Arial/Helvetica**, 11 px, peso 900, rosa `#d31c81` em fundo `#ffef69`, `rotate(-4deg)` e sombra `1px 2px 0 #d27f9c` — visual próximo, mas distinto do SWF.

## Animação dos ícones de páginas

O SWF declara **30 fps**. A tabela identifica as sequências internas, com duração calculada por `quadros ÷ 30`; não significa que toda sequência execute integralmente em cada hover. Os botões de páginas têm 24 quadros cada (0,80 s), e os símbolos de transição podem ser acionados dentro deles conforme o estado e o ActionScript. Os PNGs em `extracted/sprites/` permitem percorrer a animação quadro a quadro.

| Página/efeito | Símbolo | Quadros | Duração teórica |
| --- | ---: | ---: | ---: |
| Fairytale: botão borboletas | 126 | 24 | 0,80 s |
| Fairytale: coroa | 120 | 25 | 0,83 s |
| Fairytale: pó/brilho de fada | 116 | 50 | 1,67 s |
| I Can Be: botão | 134 | 24 | 0,80 s |
| I Can Be: ícone no hover | 132 | 80 | 2,67 s |
| Games: botão | 146 | 24 | 0,80 s |
| Games: transição do ícone | 142 | 17 | 0,57 s |
| Videos: botão | 201 | 24 | 0,80 s |
| Videos: ícone | 198 | 41 | 1,37 s |
| Fashion: botão sapato | 209 | 24 | 0,80 s |
| Fashion: transição do sapato | 206 | 21 | 0,70 s |
| Sisters & Friends: botão urso | 218 | 24 | 0,80 s |
| Sisters & Friends: transição do ícone | 216 | 25 | 0,83 s |
| Logo: partículas brancas no hover | 221 | 50 | 1,67 s |

O logo usa o botão 224: estado normal com sprite 222; `over`/`down` acrescentam brilho amarelo e o sprite 221 de 50 quadros; a área clicável vem da forma 223. O bitmap 219 foi trocado anteriormente por uma arte fornecida para este projeto; por isso `219.png` documenta o **logo atual**, não o bitmap original de 2013. `research/nav.swf` guarda uma cópia antiga para comparação, mas a origem e a identidade exata de cada alteração histórica devem ser verificadas antes de chamá-la de original.

## Reextração

Com JPEXS FFDec 26.3.0: `java -jar ffdec-cli.jar -export image,shape,font,frame,sprite,button,text,symbolClass extracted barbie_nav_ordered.swf` e `java -jar ffdec-cli.jar -swf2xml barbie_nav_ordered.swf navigation.xml`. Esta pasta é um arquivo de pesquisa; os arquivos ativos continuam em `public/`.
