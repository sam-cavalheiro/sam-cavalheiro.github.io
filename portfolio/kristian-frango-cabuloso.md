---
title: "Kristian: Frango Cabuloso"
layout: portfolio
category: Graduação
order: 0
media_paths: [ aRbBsfYjupA, /assets/portfolio/kristian-frango-cabuloso-media-0.png, /assets/portfolio/kristian-frango-cabuloso-media-1.png ]
media_thumbnail_paths: [ /assets/portfolio/kristian-frango-cabuloso-media-0.png ]
role: Programador
frame_time: 4
team_size: 5
year: 2019
engine: Unity
prog_language: C#
web_pages: [ https://samcavalheiro.itch.io/kristian-frango-cabuloso ]
web_page_types: [ itch.io ]
image: /images/image-1.png

description: |
    Jogo de **tiro e plataforma 2D**, cuja o objetivo é eliminar maior leva de zumbis possível.

    Meu primeiro TCP. E meu primeiro projeto em **Unity** e **C#**.
---

# Introdução

Neste projeto, me encarreguei de **programar as mecânicas do jogo** e **implementar artes, animações de spritesheets e efeitos sonoros**.

Projeto desenvolvido para a disciplina **TCP I** (Trabalho de Conclusão de Período I) da graduação de **Jogos Digitais do IFRJ Campus Eng. Paulo de Frontin**. O **TCP I** vigente consistia no dever de produzir e apresentar um **jogo 2D** ao final da disciplina na graduação.

Além de ser o primeiro **TCP** meu e de toda equipe, também foi o meu primeiro projeto de jogo feito em **Unity**. O projeto foi realizado por 5 membros, sendo: 1 Programador, 1 Produtora, 1 Game Designer, 1 Artista 2D de Cenário, 1 Artista e Animador 2D de Personagens. [Os créditos podem ser acessados na página do itch.io](https://samcavalheiro.itch.io/kristian-frango-cabuloso){:target="_blank"}.

# Movimentação

**Movimentação** básica de jogos de **plataforma 2D**. Devido às inexperiências com **C#** e principalmente **Unity**, fiz com que o controle de movimentação do jogador utilizasse Rigidbody, o que torna a movimentação muito deslizante. Contudo, hoje sei que o ideal seria o uso dos Character Controller para uso da física dos personagens.

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-movement.GIF" }}" />
</p>

# IA dos Inimigos

A **IA dos inimigos** foi pensada para ser simples, para que fosse divertido para os jogadores e possível de desenvolver com minha inexperiência programando. Havia sido planejado para que o inimigo atacasse, mas não conseguimos fazer a tempo.

Os inimigos sempre andam para alguma direção, essa direção é atualizada quando o inimigo pisa em uma plataforma diferente. Se o inimigo estiver na mesma plataforma que o jogador, ele irá seguir em direção ao jogador. Se o inimigo pisa em uma plataforma diferente do jogador, o inimigo anda na direção oposta à sua própria direção em relação ao centro da tela.

O jogador morre ao encostar no inimigo.

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-enemies.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

# Subir e Descer Escadas

Foi desafiador criar este sistema, pois eu não conhecia uma forma de detectar quando o jogador sairia da **escada** de maneira eficaz. Da maneira mais simples, apenas utilizando uma detecção de saída de colisão, o jogador precisaria sair por completo da escada, pois seu colisor era grande demais para detectar a saída da escada. Foi aí que pensei em criar um fantasma do jogador que serviria apenas para **detectar saída da escada**.

<details>
<summary>Comportamento do <em>fantasma</em></summary>
{{ "- Um personagem a parte, com Rigidbody 2D e collider 2D;
- Invisível;
- Quando o jogador começa a **subir uma escada**:
	- O _fantasma_ muda para a exata posição do jogador;
	- Também é controlado pelo jogador quando pressiona os botões de **subir ou descer escadas** -- ou seja, **sobe e desce escadas** com o jogador;
- Quando seu colisor sai da escada, ele avisa ao jogo que o jogador não está mais **subindo escadas**, então o jogador troca de estado e consequentemente o fantasma para de ouvir os comandos de **subir/descer escadas**." | markdownify }}
</details>
<p></p>

Apesar desse sistema ter funcionado, ele foi uma _gambiarra_. Hoje, vejo como uma solução mais eficaz fazer outro colisor ou trigger no jogador que fosse mais acima dele, e conseguiria reconhecer caso saísse da escada. Outra solução, seria verificar o eixo Y, atribuindo no componente das escadas uma coordenada somada à sua posição, e se estivesse acima do valor, sairia da escada.

# Implementação de Animações em Spritesheet

Assumi a responsabilidade de **implementar as animações**. Para fins de otimização, propus ao Animador 2D da equipe a gerar **spritesheets** das animações. Essa decisão tornou o processo de implementação e de exportação da animação mais difícil que o esperado.

Hoje, não teria proposto a ideia de utilizar **spritesheets** devido ao trabalho que dá ao animador e para quem fosse implementar. Inclusive, pesquisaria se realmente há eficácia performática utilizar animações em **spritesheets** na **Unity**.

<p align="center">
<a href="{{ "/assets/portfolio/kristian-frango-cabuloso-spritesheets-0.png" }}" target="_blank">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-spritesheets-0.png" }}" width="286" height="295" />
</a>
<a href="{{ "/assets/portfolio/kristian-frango-cabuloso-spritesheets-1.png" }}" target="_blank">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-spritesheets-1.png" }}" width="286" height="295" />
</a>
</p>

# Outros

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-shoot.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

- **Mecânica de tiro;**
- **Sistema de levas/spawn:**
	- Cada leva possui uma quantia personalizada de inimigos que o jogador precisa eliminar para avançar para a próxima;
	- Cada leva possui inimigos personalizados.
- **Implementação de assets:**
	- Animações (spritesheets);
	- Cenário;
	- Som (quando o jogador é derrotado).

# Lições Aprendidas

Aprendi a realizar coisas básicas em **Unity** e **C#**, por ser meu primeiro projeto de jogo. Também é meu primeiro projeto realizado em um prazo estipulado, então foi aí que aprendi a lidar e me preocupar com prazos de entrega de projetos.

Aprendi que devo tomar iniciativa de buscar ajuda ou guias a respeito da execução de tarefas no projeto nas quais eu esteja possuindo dificuldade ou não saiba como realizar, ao invés de esperar que o orientador ensine exatamente o quê preciso para o projeto.

Também aprendi que, antes de propor uma ideia de execução de tarefa para outros membros da equipe, preciso buscar o equilíbrio entre tempo e resultado (como no caso das **animações por spritesheets**, que eram bem trabalhosos com o único intuito de melhorar o desempenho de um projeto curto, o que não valeria a pena).
