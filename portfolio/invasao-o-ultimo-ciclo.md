---
title: "Invasão: O Último Ciclo"
layout: portfolio
category: Graduação
order: 1
media_paths: https://www.youtube.com/watch?v=5ZZnn_CNmGU, /assets/portfolio/invasao-o-ultimo-ciclo-media-0.png, /assets/portfolio/invasao-o-ultimo-ciclo-media-1.png, /assets/portfolio/invasao-o-ultimo-ciclo-media-2.png, /assets/portfolio/invasao-o-ultimo-ciclo-media-3.png
role: Programador
frame_time: 4
team_size: 12
year: 2019
engine: Unity
prog_language: C#
web_pages: [ https://samcavalheiro.itch.io/invasao-o-utimo-ciclo ]
web_page_types: [ itch.io ]

description: |
    Jogo de **defesa de torres 3D**, cuja o objetivo é posicionar as torres para que os inimigos sejam derrotados e não consigam destruir a torre principal.

    Meu primeiro projeto de **jogo 3D**, seguindo a **metodologia Scrum** e aplicando **controle de versão**. Projeto realizado para o **TCP II**.
---

# Introdução

Neste projeto, assumi a responsabilidade de exercer tarefas com foco em **mecânicas de inimigos, mecânicas da câmera, gerenciamento de tempo e gerenciamento das levas**. Inicialmente não eram estas minhas responsabilidades, mas com o decorrer do prazo e das necessidades do projeto, foi necessário adaptar às demandas.

Projeto desenvolvido para a disciplina **TCP II** (Trabalho de Conclusão de Período II) da graduação de **Jogos Digitais do IFRJ Campus Eng. Paulo de Frontin**. O **TCP II** vigente consistia no dever de produzir e apresentar um **jogo 3D** ao final da disciplina na graduação.

A equipe foi selecionada aleatoriamente pelo orientador. A equipe conta com 12 membros, 2 destes membros atuavam como **programadores**. Os gestores da equipe são de turmas externas à do **TCP II** vigente, eles se voluntariaram para serem gestores através de um anúncio do orientador, e nossa equipe votou nestes gestores. Tivemos *workshops* e palestras de 7 alunos de turmas externas à do **TCP II** vigente, proporcionados pelos nossos gestores. [Os créditos podem ser acessados na página do itch.io](https://samcavalheiro.itch.io/invasao-o-utimo-ciclo){:target="_blank"}.

Este foi meu primeiro projeto realizado com uma **equipe com mais de dez pessoas**, de um **jogo em 3D**, com uso de **controle de versão** (neste porojeto foi utilizado **Unity Collab**) e seguindo a **metodologia Scrum**.

# Câmera

A **câmera** teve seu *design* desenvolvido e testado em forma colaborativa, com a participação de diversos cargos da equipe na avaliação, enquanto os programadores implementavam as possíveis soluções.

Quando o ângulo e a distância da **câmera** foram decididos, eu e o outro programador da equipe fizemos a codificação em um **Dojo**, pois nenhum de nós dois possuíamos experiência **programando de forma colaborativa**, e eu particularmente também não possuía experiência em **programar jogos em espaço 3D**.

<p align="center">
<video src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-camera.mp4" }}" loop autoplay muted></video>
</p>

<p align="center"><a href="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-camera.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-camera.jpg" }}" />
</a></p>

## Movimentação da Câmera

No **Dojo**, conseguimos realizar a **movimentação da câmera**. A **movimentação da câmera** é simplesmente uma **câmera** que move horizontalmente (eixo X) quando o mouse alcança as extremidades horizontais da tela e verticalmente (eixos Y e Z) quando o mouse alcança as extremidades verticais da tela. Não foi difícil pesquisar tal solução, mas encontrávamos dificuldade em entender como uma **câmera** se movimentaria em um **espaço 3D**.

```cs
    void MoveCamera()
    {
        float deltaX = 0;
        float deltaYZ = 0;
        if (Input.mousePosition.x <= 0 && (!activeMoveLimit || (activeMoveLimit && this.transform.position.z > 3f)))
        {
            deltaX = -cameraSpeed;
        }
        else if (Input.mousePosition.x >= camera.scaledPixelWidth - 1 && (!activeMoveLimit || (activeMoveLimit && this.transform.position.z < 9f)))
        {
            deltaX = cameraSpeed;
        }
        if (Input.mousePosition.y <= 0 && (!activeMoveLimit || (activeMoveLimit && this.transform.position.x < 20f)))
        {
            deltaYZ = -cameraSpeed;
        }
        else if (Input.mousePosition.y >= camera.scaledPixelHeight - 1 && (!activeMoveLimit || (activeMoveLimit && this.transform.position.x > 10f)))
        {
            deltaYZ = cameraSpeed;
        }
        camera.transform.Translate(deltaX * Time.deltaTime, deltaYZ * Time.deltaTime, deltaYZ * Time.deltaTime);
    }
```

## Zoom da Câmera

Realizei a mecânica de **zoom da câmera** individualmente por inicialmente ser responsável pela **câmera**.
A **câmera** aplica um *zoom* ao rolar com o *scroll do mouse*. O eixo do *scroll do mouse* é aplicada em um valor flutuante de 0 a 1, e este valor é multiplicado a velocidade da rolagem de **câmera**, e aplicada em uma transladação no eixo Z (frente/trás) na própria **câmera**.

```cs
    void Zoom()
    {
        if (Input.mouseScrollDelta.y != 0)
        {
            if (scrolling + Input.mouseScrollDelta.y > scrollLimitMin && scrolling + Input.mouseScrollDelta.y < scrollLimitMax)
            {
                scrolling += Input.mouseScrollDelta.y;
                camera.transform.Translate(0, 0, Input.mouseScrollDelta.y * scrollSpeed * Time.deltaTime);
            }
        }
    }
```

Há um *bug* na mecânica que pode ocorrer **zoom** excessivamente se o jogador rodar freneticamente o *scroll do mouse*. Revisitando o código, pude observar que esqueci de considerar multiplicar o *scroll do mouse* com a velocidade do *scroll* (`scrollSpeed`) e estava aplicando o *zoom* utilizando `Time.deltaTime`, fazendo o *bug* ocorrer porque o *zoom* estava tendo seu *delay de frame* compensado sem necessidade.

```cs
    void Zoom()
    {
        if (Input.mouseScrollDelta.y == 0)
            return;

        float applyScroll = Input.mouseScrollDelta.y * scrollSpeed;

        if (scrolling + applyScroll > scrollLimitMin && scrolling + applyScroll < scrollLimitMax)
        {
            scrolling += applyScroll;
            camera.transform.Translate(0, 0, applyScroll);
        }
    }
```

# Inimigos

Os **inimigos** são bem simples:

- Possuem uma movimentação com **NavMesh** que vão do ponto inicial até a torre do jogador;
- Assim que encostam na torre, se autodestrói e causa dano à torre;
- Carrega **buffs** e **debuffs** (status positivos e negativos).

## Movimentação dos Inimigos

A **movimentação** utiliza **NavMesh** para facilitar o processo. Os **inimigos** só precisam **se mover** do ponto de *spawn* até a torre principal. O uso do **NavMesh** foi um pedido do gestor da equipe, pois eu mesmo não conhecia tal tecnologia (e provavelmente iria programar no dedo um sistema de movimentação). Para aprender sobre, fui realizando pesquisas e redigindo um documento (o documento era necessário para realização da tarefa) sobre o uso do **NavMesh** aplicado em nosso projeto.

Foram necessários vários ajustes no **NavMesh dos inimigos** e do cenário, pois a passagem para os **inimigos** atravessarem era muito estreita. Com os ajustes feitos, os **inimigos** conseguiram andar pela passagem.

Os **inimigos** no jogo realizavam uma curva muito lenta ao andar, e isso não era intencional. Utilizar um sistema de **movimentação** mais simples ou realizar uma simples **transladação** dos **inimigos** até a base do jogador seria uma solução esteticamente mais eficaz apesar da possibilidade de levar muito tempo. No entanto ter aprendido a usar o **NavMesh** foi essencial para minhas habilidades em diversos outros projetos.

<p align="center">
<video src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-movimentacao-inimigos.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

## Buffs e Debuffs em Inimigos

Os **inimigos** podem armazenar **buffs/debuffs** (status positivos/negativos) a partir de dano recebido por uma torre ou a partir de alguma habilidade passiva do próprio **inimigo**.

No projeto, temos apenas o **buff e debuff** da **Torre** de Gelo e do **inimigo** XR3 implementados:

- A **Torre** de Gelo reduz a velocidade do **inimigo** atingido por seu projétil por alguns segundos;
- O **inimigo** XR3 aumenta sua própria velocidade por alguns segundos, necessitando aguardar um tempo (*cooldown*) para usar o **buff** novamente.

<p align="center">
<video src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-buffs-debuffs-inimigos.mp4" }}" controls loop autoplay muted></video>
</p>

Apesar do sistema funcionar muito bem na prática, a codificação tinha alguns problemas de amadorismo:

- O script não respeitava conceitos de **POO**, com todo o processamento dos **buffs/debuffs** ocorrendo direto da classe do **inimigo**. Quando programei esse projeto, eu ainda não fazia uso do **POO** com afinco como hoje faço;
- Os efeitos dos **buffs/debuffs** não eram flexíveis, sendo necessário programar cada um deles. Apesar de ser um problema, se for levado em consideração o prazo e escopo do projeto, programar o efeito de cada **buff/debuff** direto no código, era o jeito mais rápido. Inclusive, só havia 2 **buffs/debuffs** para programar, e ambos eram de alteração de velocidade.

> Os comentários deste código foram criados para facilitar a leitura, portanto não estavam presentes no código original.

```cs
// ...

public class Enemy : MonoBehaviour
{
    // ...

    void Update()
    {
        // Reduzir cooldown (tempo de espera) de cada buff/debuff
        for (int i = 0; i < buffsCd.Length; i++)
        {
            if (buffsCd[i] >= 0)
            {
                buffsCd[i] -= Time.deltaTime;
            }
            else
            {
                // Se o inimigo for o XR3 e este buff não estiver em cooldown
                // e este for o buff do XR3
                if (isStat("xr3") && buffs[i] == "xr3")
                {
                    // Se estiver em movimento
                    if (!GetComponent<NavMeshAgent>().isStopped)
                    {
                        // Chamar o buff do XR3 (aumento de velocidade)
                        CallBuff(buffs[i], i);
                    }
                }
            }
        }

        // Se for o XR3 e não contiver o buff do XR3 inicializado
        // (Isso não deveria estar no Update)
        if (isStat("xr3") && !ContainsBuff("xr3"))
        {
            // Se estiver em movimento
            if (!GetComponent<NavMeshAgent>().isStopped)
            {
                // Adiciona o buff do XR3 (à lógica de buffs)
                AddBuff("xr3");
            }
        }

        // Reduzindo a duração de cada buff/debuff
        for (int i = 0; i < buffsDuration.Length; i++)
        {
            if (buffsWorking[i])
            {
                if (buffsDuration[i] >= 0)
                {
                    buffsDuration[i] -= Time.deltaTime;
                }
                else
                {
                    // Parar efeito do buff se acabou sua durabilidade
                    UncallBuffOnIndex(i);
                }
            }
        }
    }

    // ...

    public void TakeDamageFromTower(int damage, int projectileType)
    {
        Debug.Log(projectileType);

        // Adicionar buff/debuff caso seja atingido por um projétil específico
        switch (projectileType)
        {
            case 3:
                SetBuff("lentidão gelo");
                break;
        }
        TakeDamage(damage);
    }

    // ...

    // Adiciona buff à lógica se ainda não estiver,
    // se já estiver na lógica, apenas o chama
    void SetBuff(string buffName)
    {
        int index = GetBuffIndex(buffName);
        if (index == -1)
        {
            AddBuff(buffName);
        }
        else
        {
            CallBuff(buffName, index);
        }
    }

    // ...

    // Adiciona buff à lógica de buffs
    // (Eu não sabia usar List)
    void AddBuff(string buffName)
    {
        int index = GetNullIndex(buffs);
        if (index > -1)
        {
            buffs[index] = buffName;
            CallBuff(buffName, index);
        }
    }

    // Localiza elemento vazio (null) no array de strings (usado nos buffs)
    int GetNullIndex(string[] array)
    {
        for (int i = 0; i < array.Length; i++)
        {
            if (array[i] == null)
            {
                return i;
            }
        }
        return -1;
    }

    // Verifica se há tal buff à lógica de buffs
    bool ContainsBuff(string buffName)
    {
        for (int i = 0; i < buffs.Length; i++)
        {
            if (buffs[i] == buffName)
            {
                return true;
            }
        }
        return false;
    }

    // Chamar efeito do buff/debuff
    void CallBuff(string buffName, int index)
    {
        // Remover o buff caso ele já tenha sido chamado
        if (buffs[index] == buffName && buffsWorking[index])
        {
            UncallBuffOnIndex(index);
        }

        // Puxar os dados do buff a partir do prefab "Buffs"
        // (Mal otimizado)
        buffsCd[index] = Resources.Load<GameObject>(@"Buffs").GetComponent<Buffs>().GetCd(buffName);
        buffsDuration[index] = Resources.Load<GameObject>(@"Buffs").GetComponent<Buffs>().GetDuration(buffName);
        buffsAttribute[index] = Resources.Load<GameObject>(@"Buffs").GetComponent<Buffs>().GetAttribute(buffName);
        buffsWorking[index] = true; // Marcar que o buff está em funcionamento

        // Realizar o efeito do buff/debuff dependendo de qual buff for
        switch (buffName)
        {
            case "xr3": // Adicionar passiva do XR3 (aumento de velocidade)
                ChangeSpeed(buffsAttribute[index]);
                break;
            case "lentidão gelo": // Adicionar efeito do tiro da Torre de Gelo (redução de velocidade)
                ChangeSpeed(-buffsAttribute[index]);
                break;
        }
    }

    // Remover efeito do buff/debuff
    void UncallBuff(string buffName, int index)
    {
        buffsWorking[index] = false; // Marcar que o buff não está mais em funcionamento

        // Realizar remoção de efeito de buff/debuff de qual buff for
        switch (buffName)
        {
            case "xr3": // Remover passiva do XR3 (retoma velocidade aumentada)
                ChangeSpeed(-buffsAttribute[index]);
                break;
            case "lentidão gelo": // Remover efeito do tiro da Torre de Gelo (retoma a velocidade reduzida)
                ChangeSpeed(buffsAttribute[index]);
                break;
        }
    }

    // ...

    void ChangeSpeed(float n)
    {
        NavMeshAgent nav = GetComponent<NavMeshAgent>();
        speed += n;
        nav.speed = speed * 0.1f;
        ////nav.acceleration = (speed / 3) * 0.01f;
        ////nav.angularSpeed = 120;
        //nav.acceleration = speed * 0.01f;
        //nav.angularSpeed = speed * 0.01f;
    }

    bool isStat(string statName)
    {
        for (int i = 0; i < Stats.Length; i++)
        {
            if (Stats[i] == statName)
            {
                return true;
            }
        }
        return false;
    }

    bool isBuffReady(string buffName)
    {
        int index = GetBuffIndex(buffName);
        if (index == -1)
        {
            return true;
        }
        else if (buffsCd[index] < 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    int GetBuffIndex(string buffName)
    {
        for (int i = 0; i < buffs.Length; i++)
        {
            if (buffs[i] == buffName)
            {
                return i;
            }
        }
        return -1;
    }
}
```

Hoje, eu faria os **buffs/debuffs** em uma classe separada da classe **inimigo**, inserindo esta classe como componente do **game object** no **inimigo** na **Unity**. Inclusive, seria interessante se os **buffs/debuffs** não fossem *hardcodados*, mas no contexto desse projeto, talvez não fosse altamente necessário considerando que só havia 2 **buffs/debuffs**.

# Tutorial

<p align="center">
<video src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-tutorial.mp4" }}" controls loop autoplay muted></video>
</p>

No projeto havia um discreto **tutorial**. No vídeo acima é possível observar um retângulo vermelho sobre alguns botões específicos, que é onde o **tutorial** está indicando para onde o jogador deve clicar.

O código possuía várias partes *hardcodadas*; as ações dos botões ocorriam pela *interface* da **Unity** (como exibido na imagem abaixo); e fazia uso do `GameObject.Find` ao invés de `[SerializeField]` ou `public` para alocar/utilizar os elementos da interface, o que acaba sendo menos performático e menos flexível para não programadores alterar os elementos da interface que o **sistema de tutorial** utilizaria. O **tutorial** foi adicionado e requisitado bem no final do projeto ~~(eu literalmente dormi no teclado na madrugada do dia da apresentação)~~, tive uma semana ou menos para concluí-lo.

<p align="center"><a href="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-tutorial.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-tutorial.jpg" }}" width="315" height="538" />
</a></p>

```cs
public class GameManager : MonoBehaviour
{
    //...
    InterfaceControl UI;
    [SerializeField] int tutorialStep = 1;
    //...

    void Start()
    {
        //...
        SetTutorial(tutorialStep, 0);
        //...
    }

    //...
    public void SetTutorial(int step, int n)
    {
        tutorialStep = step;
        UI.SetTutorial(step, n);
        switch (step)
        {
            case 1:
                chao.GetComponent<Transform>().position = new Vector3(chao.GetComponent<Transform>().position.x, 7000, chao.GetComponent<Transform>().position.z);
                cartadatorre.SetActive(false);
                break;
            case 2:
                cartadatorre.SetActive(true);
                break;
            case 4:
                chao.GetComponent<Transform>().position = new Vector3(chao.GetComponent<Transform>().position.x, 0f, chao.GetComponent<Transform>().position.z);
                break;

        }
    }
    //...
}
```

```cs
public class InterfaceControl : MonoBehaviour
{
    //...
    public void SetTutorial(int step, int n)
    {
        switch (step)
        {
            case 1:
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/Tut").SetActive(true);
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/1").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/2").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (0)").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (1)").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (2)").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (3)").GetComponent<Button>().interactable = false;
                break;
            case 2:
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/Tut").SetActive(false);
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Tut").SetActive(true);
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/1").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (0)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (1)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (2)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (3)").GetComponent<Button>().interactable = true;
                break;
            case 3:
                for (int i = 0; i < 4; i++)
                {
                    if (n == i)
                    {
                        GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (" + i + ")").GetComponent<Button>().interactable = true;
                    }
                    else
                    {
                        GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (" + i + ")").GetComponent<Button>().interactable = false;
                    }
                }
                break;
            case 4:
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/Tut").SetActive(false);
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Tut").SetActive(false);
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/0").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/1").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Torres/2").GetComponent<Button>().interactable = false;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (0)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (1)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (2)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (3)").GetComponent<Button>().interactable = true;
                SetTutorial(0, 0);
                break;
            case 5:
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (0)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (1)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (2)").GetComponent<Button>().interactable = true;
                GameObject.Find(UI_LOCATION_NAME + "BarradeAcao/Inventory/Slot (3)").GetComponent<Button>().interactable = true;
                SetTutorial(0, 0);
                break;
        }
    }
    //...
}
```

# Sistema de Levas

O **Sistema de Levas** instancia cada **inimigo** definido pelos *designers* a partir da *interface* da **Unity**. Os **inimigos** são instanciados um por vez dentro de um **tempo de intervalo** também definido através da *interface* da **Unity**. No código abaixo, é possível observar que há variável tanto para os **inimigos** (`GameObject[] Enemies`) quanto para o **tempo de intervalo para o spawn** de cada um deles (`float spawnIntervalTime`):

```cs
public class EnemyGroup : MonoBehaviour
{
    public GameObject[] Enemies;
    public float spawnIntervalTime;
}
```

Para passar para próxima **leva**, todos os **inimigos** da **leva** precisam ser detonados para então prosseguir. Cada **leva** usará os **inimigos** definidos pelo *designer* através dos **grupos de inimigos** (classe `EnemyGroup`).

Os problemas que consigo encontrar nesse código são:

- Não utiliza funções delegados no momento em que os **inimigos** são detonados ou na hora de atualizar o número de levas da IU;
- A classe usada para atribuir os grupos de **inimigos** (`EnemyGroup`) não é um **ScriptableObject**, um objeto da **Unity** feita para dados, e não para objetos comuns/instanciáveis (**prefab**);
- Novamente, o fato de utilizar `GameObject.Find`, que nesse uso poderia simplesmente ser um `FindComponentOfType<GameManager>()`.

> A maioria dos comentários deste código foram criados para facilitar a leitura, portanto não estavam presentes no código original.

```cs
public class GameManager : MonoBehaviour
{
    //...
    // NOTA (AO GD):
    // No jogo, contamos da leva 1 ao 10. Aqui, contamos da leva 0 a 9.
    // Subtraia 1 na hora de configurar as levas.
    [SerializeField] int currentWave;
    [SerializeField] int maxWaves = -1; // Deixe -1 para ilimitado (usar o numero maximo de grupos de inimigos)
    //...
    InterfaceControl UI;
    public EnemyGroup[] EnemyGroup; // Array de grupos de inimigos (definido através do inspector da Unity)
    bool isSpawningEnemies; // Flag p/ saber se está spawnnado inimigos
    int spawnedEnemies; // Quantia de inimigos spawnados nessa leva
    float spawnCount; // Tempo restante para spawnar o próximo inimigo
    int waveKills; // Inimigos mortos na leva atual
    int waveToKill; // Quantidade de inimigos para matar na leva atual
    //...


    void Start()
    {
        //...
        StartWave();
        //...
    }

    // Iniciar leva
    void StartWave()
    {
        UI.SetWave(currentWave);

        // Se a leva atual for maior que o máximo de levas (já realizou todas as levas)
        if (currentWave > GetMaxWaves())
        {
            Debug.Log("GANHOU?");
            // VENCE (Sim, não acontece nada)
        }
        else
        {
            waveKills = 0; // zera contador de mortes na leva
            waveToKill = EnemyGroup[currentWave].Enemies.Length; // atribui o número máximo de inimigos
            spawnCount = 0; // reseta contador de spawn
            spawnedEnemies = 0; // zera contador de inimigos spawnado
            isSpawningEnemies = true; // ativa flag para spawn de inimigos
        }
    }

    int GetMaxWaves()
    {
        if (maxWaves < 0)
        {
            return EnemyGroup.Length;
        }
        else
        {
            return maxWaves;
        }
    }

    void Update()
    {
        if (tutorialStep > 3 || tutorialStep == 0) // O tempo de jogo nao acrescentara enquanto estiver no tutorial
        {
            //...

            // Spawn dos grupos de inimigos
            // Se está spawnando inimigos
            if (isSpawningEnemies)
            {
                // Se a quantia de inimigo spawnado for menor que a quantia de inimigos total da atual leva
                if (spawnedEnemies < waveToKill)
                {
                    EnemyGroup currentEnemyGroup = EnemyGroup[currentWave];
                    float spawnTime;
                    spawnCount += Time.deltaTime; // contar tempo de spawn

                    // Se inimigos spawnados for maior que 0
                    if (spawnedEnemies > 0)
                    {
                        // atribuir o tempo de spawn para o tempo do grupo da leva
                        spawnTime = currentEnemyGroup.spawnIntervalTime;
                    }
                    // Se nenhum inimigo foi spawnado, é porque a leva iniciou agora
                    // (Tempo p/ spawnar será maior p/ dar intervalo)
                    else
                    {
                        // atribuir o tempo de spawn p/ o tempo do grupo da leva somado ao intervalor p/ próxima leva
                        spawnTime = currentEnemyGroup.spawnIntervalTime + timeIntervalWaves;
                    }

                    // Spawnar inimigo se já passou o tempo para spawnar
                    if (spawnCount >= spawnTime)
                    {
                        // Instanciar inimigo
                        GameObject instance;
                        instance = Instantiate(currentEnemyGroup.Enemies[spawnedEnemies], this.transform);

                        spawnCount = 0; // Resetar contador de tempo de spawn
                        spawnedEnemies++; // Acrescentar 1 inimigo à quantia de inimigos spawnados
                    }
                }
                else // Para de spawnar inimigos se já spawnou todos
                {
                    isSpawningEnemies = false;
                }
            }
        }
    }

    //...
    // Ao matar um inimigo
    public void KillEnemy()
    {
        waveKills++; // Adicionar mais uma morte no contador

        // Se matou todos os inimigos da leva
        if (waveKills == waveToKill)
        {
            currentWave++; // Ir para próxima leva
            StartWave(); // Iniciar atual leva
        }
    }
    //...
}
```

```cs
public class Enemy : MonoBehaviour
{
    //...
    [SerializeField] int hp;
    //...

    //...
    public void TakeDamage(int damage)
    {

        hp -= damage;
        if (hp <= 0)
        {
            Die();
        }
    }

    public void Die()
    {
        GameObject instance;
        instance = Instantiate(explosion, this.transform.position, Quaternion.identity);
        GameObject.Find("GameManager").GetComponent<GameManager>().KillEnemy();//(GetComponent<Transform>().transform);
        Destroy(this.gameObject);
    }
    //...
}
```

# Gerenciamento de Tempo

Ao decorrer o **tempo de jogo**, a IU é atualizada para exibir os **segundos** de partida. Se passar o **tempo para receber dinheiro** (`moneyTime`) definido pelo *designer* na **Unity**, o jogador recebe a quantia de dinheiro por tempo (`moneyPerTime`) também definido pelo *designer*.

Acho que esse código funciona muito bem mas, considerando que conversa com a IU, usar delegados seria uma escolha mais adequada. Também faz uso do `GameObject.Find` ao invés do `[SerializeField]` ou `public`.

> Alguns comentários deste código foram criados para facilitar a leitura, portanto não estavam presentes no código original.

```cs
public class GameManager : MonoBehaviour
{
    //...
    InterfaceControl UI;
    int money; // Dinheiro atual
    [SerializeField] int moneyPerTime = 1; // Dinheiro para cada moneyTime passado
    [SerializeField] float moneyTime; // Segundos para receber dinheiro
    float moneyTimeCount; // Contador de tempo de dinheiro
    //...


    void Start()
    {
        //...
        UI.TimeRefresh();
        UI.SetMoney(money);
        moneyTimeCount = moneyTime;
        //...
    }

    void Update()
    {
        if (tutorialStep > 3 || tutorialStep == 0) // O tempo de jogo nao acrescentara enquanto estiver no tutorial
        {
            // Contagem de tempo de jogo
            if (gameTime < 0)
            {
                UI.PassSecond();
                gameTime = 1;
            }
            else
            {
                gameTime -= Time.deltaTime;
            }
            // Contagem automatica de dinheiro
            if (moneyTimeCount < 0)
            {
                ChangeMoney(moneyPerTime);
                moneyTimeCount = moneyTime;
            }
            else
            {
                moneyTimeCount -= Time.deltaTime;
            }
            //...
        }
        //...
    }

    //...
    public void ChangeMoney(int value)
    {

        money += value;
        UI.SetMoney(money);

    }
    //...
}
```

```cs
public class InterfaceControl : MonoBehaviour
{
    const string UI_LOCATION_NAME = "Canvas";

    int timeSec;
    int timeMin;

    //...

    public void PassSecond()
    {
        if (++timeSec >= 60)
        {
            timeSec = 0;
            timeMin++;
        }
        TimeRefresh();
    }

    public void SetMoney(int money)
    {
        GameObject.Find(UI_LOCATION_NAME + "/Dinheiro/Text").GetComponent<Text>().text = money.ToString();
        string itensLocation = UI_LOCATION_NAME + "/BarradeAcao/Torres";
        //...
    }

    //...
    public void TimeRefresh()
    {
        string secText;
        if (timeSec < 10)
        {
            secText = "0" + timeSec.ToString();
        }
        else
        {
            secText = timeSec.ToString();
        }
        GameObject.Find(UI_LOCATION_NAME + "/Horda/TimerText").GetComponent<Text>().text = timeMin.ToString() + ":" + secText;
    }
}
```

# Outros

- **Implementação de assets:** Modelo 3D dos inimigos, sons dos inimigos e interface gráfica;
- **Algumas correções e ajustes em outros scripts.**

# Lições Aprendidas

No vigente projeto, aprendi a fazer algum uso de **POO (Programação Orientada a Objeto)**, mesmo que não dominando o conceito na hora de aplicar, estava presente no projeto e é possível observar que o conceito é utilizado conforme o avanço do projeto.

Considerando ser o meu primeiro **projeto com mais de dez pessoas**, a comunicação foi fundamental: aprimorei minhas habilidades de comunicação nesse cenário totalmente novo para mim, seja no momento de implementar assets (comunicando com as pessoas artistas da equipe), comunicando o progresso e dificuldades nas *dailies* no **Scrum**, e trabalhando em conjunto com outro programador. Tanto trabalhar em conjunto com outro programador quanto participar da metodologia **Scrum**, eram coisas novas para mim nesse projeto e foi uma experiência muito valiosa!

Aprendi muito com o fato de ter trabalhado com **outro programador** pela primeira vez também, realizando várias trocas de conhecimentos seja através **Dojo**, pessoalmente ou enquanto produzia no projeto com uso de **controle de versão** (nosso primeiro projeto utilizando).

Pelo fato de ser um projeto que envolve muitas pessoas e possuía metodologia para ser levado a sério, estar nesse contexto me fez refletir o peso de cada ação dentro de um projeto. Não fazer nada e aguardar o *cargo* responsável agir? Agir e fazer algo que possivelmente não seria eficiente? Apesar de soar mais como uma dúvida que como uma lição, a lição está em considerar essas dúvidas em alguns cenários, seja comunicando com a equipe ou ter repertório para aplicar o conhecimento no momento correto. As pessoas precisam de você e você delas.

# Bônus

Fotos da apresentação do projeto no auditório do **IFRJ Campus Eng. Paulo de Frontin**. A foto da esquerda foi postada no meu perfil do Instagram ([@sam_aovivo](https://www.instagram.com/sam_aovivo){:target="_blank"}) e a da direita foi postada no perfil da [PlayerUm](https://playerum.com.br/){:target="_blank"} ([@playerum](https://www.instagram.com/playerum){:target="_blank"}), que teve sua participação na banca de avaliação para dar feedbacks a convite de nosso orientador desse **TCP II**.

<table border="0">
<tr>
<td><p align="center"><a href="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-foto-tcp-0.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-foto-tcp-0.jpg" }}" />
</a></p></td>
<td><p align="center"><a href="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-foto-tcp-1.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/invasao-o-ultimo-ciclo-foto-tcp-1.jpg" }}" />
</a></p></td>
</tr>
<tr>
<td><p align="center">
<a href="https://www.instagram.com/p/B5oQBw3nSR8/?igsh=MWU0d3B0eHdqOXF1dA==" target="_blank">Visualizar no Instagram (@sam_aovivo)</a>
</p></td>
<td><p align="center">
<a href="https://www.instagram.com/p/B5vIw88JnK_/?igsh=enpqanRnNTdibHB5&img_index=4" target="_blank">Visualizar no Instagram (@playerum)</a>
</p></td>
</tr>
</table>
