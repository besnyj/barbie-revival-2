# Catálogo de animações do carrossel

Inventário do código em execução em 02/10/2026. Para criar outra cena, use o valor da coluna **Entrada** na propriedade `entrance` de cada elemento, como em `public/carousel/welcome.js`. O `delay` é individual, em milissegundos; sem `entrance`, o elemento recebe `pop`. As regras ativas estão em `public/carousel/welcome.css`, e cada entrada reinicia quando a cena volta a aparecer. `prefers-reduced-motion` desativa esses movimentos.

| Entrada | O que aparece na tela | Duração | Uso atual |
| --- | --- | --- | --- |
| `pop` | O elemento surge pequeno, cresce um pouco além do tamanho final e assenta com leve giro. | 1 s | Entrada padrão. |
| `sticker-shake` | Após surgir, o sticker oscila de um lado para o outro com balanço mais amplo e desacelera até parar. Aplicado automaticamente às imagens do Welcome sem outra entrada definida. | 5,5 s no total | Corações e estrelas do Welcome. |
| `from-left` | O elemento desliza da esquerda até sua posição. | 1,4 s | Personagem do Welcome. |
| `from-right` | O elemento desliza da direita até sua posição. | 1 s | Disponível; ainda não usado. |
| `from-top` | O elemento desce até sua posição. | 1 s | Pergunta do Welcome. |
| `from-bottom` | O elemento sobe até sua posição. | 1 s | Frase final do Welcome. |
| `zoom` | O elemento aumenta de metade do tamanho, ultrapassa levemente o tamanho final e assenta. | 1 s | Janela ilustrada do Welcome. |
| `glitter-reveal` | O texto é revelado da esquerda para a direita em três passagens de glitter. Uma nuvem móvel de brilhos rosa, estrelas brancas e um borrão branco cintilante acompanha a borda para suavizar o corte; as partículas surgem, giram, diminuem e desaparecem. “to old and nostalgic” mantém as duas linhas visuais, mas recebe uma única passagem. O próximo texto começa quando o anterior chega à metade. | 1,1 s por texto; intervalo de 0,55 s | “Welcome back”, “to old and nostalgic” e “Barbie.com!”, nessa ordem. |

Exemplo de configuração para uma cena futura:

```js
{id:'novo-elemento', type:'image', file:'elemento.png', x:400, y:200, w:300, z:3, delay:500, entrance:'zoom'}
```

`x`, `y`, `w` e `z` posicionam a peça no palco de 1920 × 1080; `tilt`, quando informado, define uma inclinação própria. A implementação que aplica as classes e reinicia as entradas está em `public/carousel/welcome.js`. Uma nova cena pode usar os mesmos nomes e estilos sem copiar animações para o conteúdo.

## Controles e efeitos compartilhados

| Efeito | O que aparece na tela | Origem ativa e reutilização |
| --- | --- | --- |
| Hover das setas | O círculo da seta muda para o estado iluminado; o glitter percorre sua borda e para. Ao sair, a seta volta ao estado normal. | `public/carousel/controller.js` e `public/carousel/original-arrows/`; quadros extraídos de `HomeCDA.swf`, 30 fps. Entrada até quadro 7, brilho até quadro 39, saída até quadro 15. O controlador aplica às duas setas de todos os slides. |
| Cintilação das bolinhas | Uma pequena estrela sobre cada indicador pulsa em brilho e tamanho, com fases desencontradas. | `carousel-dot-sparkle` em `public/carousel/controller.css`; ciclo de 3,4 s. |
| Seleção das bolinhas | A bolinha ativa fica dourada e cresce; ao passar o mouse, ela aumenta levemente. | `.home-carousel-dot.is-active` e `.home-carousel-dot:hover` em `public/carousel/controller.css`. |
| Troca de slides | O controlador substitui o conteúdo e o fundo após clique ou 10 s; as entradas da cena nova recomeçam. | `select()` em `public/carousel/controller.js`. Os slides Flash mantêm as transições internas do SWF; não há preset CSS compartilhado para essa transição. |

## Elementos abaixo do carrossel

Estes movimentos aparecem na homepage, mas pertencem aos cartões, não às cenas. Estão em `public/site.css` e podem servir de referência para outros grupos de cartões.

| Efeito | O que aparece na tela | Duração |
| --- | --- | --- |
| `bottom-arrive` | Cartões entram de baixo com aumento de opacidade, um após o outro. | 0,55 s, com atraso de 90 ms por cartão. |
| Hover do cartão | O cartão sobe e cresce um pouco. | Transição de 0,22 s. |
| `bottom-click` | O cartão encolhe rapidamente e volta com um pequeno salto antes de abrir o link. | 0,4 s. |

## Animações Flash preservadas

Os três slides antigos continuam com suas animações internas nos arquivos `public/global/homepageCDARotation/DreamhousePuzzleParty.swf`, `BLIDProfile.swf` e `MyDreamhouse.swf`, reproduzidos pelo controlador `HomeCDA.swf` via Ruffle. Esses movimentos não são presets independentes para cenas novas. As setas são a parte já extraída e reutilizada; seus quadros ficam em `public/carousel/original-arrows/`.

Ao adicionar um efeito novo, registre aqui seu nome, aparência breve, duração, onde está implementado e quais elementos o usam. Isso mantém o catálogo alinhado ao site em execução.
