---
title: "Time KickerZ"
layout: portfolio
category: Graduação
order: 4
media_paths: https://www.google.com
role: Programador
frame_time: 4
team_size: 8
year: 2021
engine: Unity
prog_language: C#
web_pages: [ https://jaimeadalid.itch.io/time-kickerz ]
web_page_types: [ itch.io ]

description: |
    Jogo de **sobrevivência** com mecânicas de **briga de rua** contextualizado em um apocalipse temporal. O jogador controla uma carateca cuja o objetivo é devolver o maior número de inimigos possível de outras dimensões temporais para suas próprias, na base do chute. O jogo usa uma estética que mescla **personagens em 2D e cenários em 3D**.
    
    Projeto realizado para o **TCP V**.
---

# Introdução

Assumi a responsabilidade de programar um **jogo que funcione com *gamepad*** e de **garantir que suas mecânicas funcionem com arte que mescla personagens em 2D e cenários em 3D**.

Este projeto foi realizado durante a pandemia de Covid-19, sendo produzido remotamente devido ao lockdown.

Projeto desenvolvido para a disciplina **TCP V** (Trabalho de Conclusão de Período V) da graduação de **Jogos Digitais do IFRJ Campus Eng. Paulo de Frontin**. O **TCP V** vigente consistia no dever de produzir e apresentar um **potencial jogo para console** ao final da disciplina na graduação.

A equipe do projeto conta com 8 membros, 2 destes membros atuavam como **programadores**. [Os créditos podem ser acessados na página do itch.io](https://jaimeadalid.itch.io/time-kickerz){:target="_blank"}.

# Billboard

<p align="center">
<video src="{{ "/assets/portfolio/time-kickerz-billboard.mp4" }}" controls loop autoplay muted></video>
</p>

Considerando que o jogo pretendia **misturar 2D (para personagens) com 3D (para cenários)**, foi necessário fazer com que os **objetos "2D"** (planos chapados usando um *sprite* como textura) sempre **olhassem para a câmera** para passar convencer melhor de que se tratava de um **objeto em 2D**, e não um papel.

```cs
public class Billboard : MonoBehaviour
{
    [SerializeField] LockAxis lockAxis;
    [SerializeField] bool invertAxis;

    Transform cameraTransform;

    [System.Serializable]
    struct LockAxis
    {
        public bool x, y, z;
    }

    // Start is called before the first frame update
    void Start()
    {
        cameraTransform = Camera.main.transform;
    }

    // Update is called once per frame
    void Update()
    {
        Vector3 prevRotation = transform.eulerAngles;
        transform.LookAt(cameraTransform);
        Vector3 newRotation = transform.eulerAngles;
        if (invertAxis)
            newRotation *= -1f;

        if (lockAxis.x)
            newRotation.x = prevRotation.x;
        if (lockAxis.y)
            newRotation.y = prevRotation.y;
        if (lockAxis.z)
            newRotation.z = prevRotation.z;

        transform.eulerAngles = newRotation;
    }
}
```

O componente ```Billboard``` era inserido nos inimigos e no jogador, sendo um objeto extra que continha como seus filhos: o(s) *sprite*(s) (representação gráfica do objeto), o(s) *hurtbox*(es) (colisor que determina onde o objeto receberá dano) e, no caso específico do jogador, os pontos de onde o jogador iria desferir seus chutes.

<p align="center">
<img src="{{ "/assets/portfolio/time-kickerz-billboard-estrutura.jpg" }}" />
</p>

# Movimentação do Jogador

Um **script de movimentação** bem simples que controla o componente ```CharacterController```, seguindo o [modelo disponibilizado documentação da Unity](https://docs.unity3d.com/ScriptReference/CharacterController.Move.html){:target="_blank"} com adaptações. Uma das adaptações presentes é a máquina de estado do jogador e o **uso do *gamepad***.

```cs
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;

public enum PlayerState : byte
{
    Idle,
    Movement,
    Kicking
}

// Esse código foi feito no site da Unity: https://docs.unity3d.com/ScriptReference/CharacterController.Move.html
// Esse código sofreu algumas leves modificações.
[RequireComponent(typeof(CharacterController))]
public class PlayerCharacterController : MonoBehaviour
{
    [SerializeField] float moveSpeed = 1f;
    [SerializeField] float jumpHeight = 1f;
    [SerializeField] float gravity = -9.81f;
    [SerializeField] bool multiplyPhysicsAttributesByScale;

    // ...

    float physicsMultiplicationScale;

    CharacterController controller;
    GameInputAction input;

    Animator animator;
    SpriteRenderer spriteRenderer;

    Transform cameraTransform;

    Vector3 velocity;
    PlayerState state;
    public PlayerState State { set => SetState(value); get => GetState(); }


    void Awake()
    {
        input = new GameInputAction();
        // ...
    }

    // Start is called before the first frame update
    void Start()
    {
        controller = GetComponent<CharacterController>();
        cameraTransform = Camera.main.transform;
        spriteRenderer = GetComponentInChildren<SpriteRenderer>();
        animator = GetComponentInChildren<Animator>();

        // ...
    }

    void Update()
    {
        StateUpdate();
    }

    void FixedUpdate()
    {
        StateFixedUpdate();
    }

    void StateUpdate()
    {
        switch (state)
        {
            case PlayerState.Idle:
                MovementUpdate(); break;

            case PlayerState.Movement:
                MovementUpdate(); break;
        }
    }

    void StateFixedUpdate()
    {
    }

    void MovementUpdate()
    {
        float deltaTime = Time.deltaTime;

        // Resetar velocidade Y se estiver no chão e esteve em queda
        if (controller.isGrounded && velocity.y < 0)
            velocity.y = 0f;

        // Movimentação do joystick
        Vector2 analog = input.Player.Move.ReadValue<Vector2>();
        //Vector3 move = new Vector3(analog.x, 0f, analog.y);

        // Mover para direção do joystick
        Vector3 camRight = cameraTransform.right * analog.x;
        Vector3 camForw = cameraTransform.forward * analog.y;
        Vector3 move = new Vector3(camForw.x + camRight.x, 0f, camForw.z + camRight.z);

        controller.Move(move * deltaTime * moveSpeed * physicsMultiplicationScale);


        if (move != Vector3.zero)
        {
            // ...

            // Espelhar sprite se o eixo X do analógico < 0
            if (analog.x != 0)
                spriteRenderer.flipX = analog.x < 0;

            State = PlayerState.Movement;
        }
        else
        {
            State = PlayerState.Idle;
        }


        // Movimentação considerando a gravidade
        velocity.y += gravity * physicsMultiplicationScale * deltaTime;
        controller.Move(velocity * deltaTime);
    }

    public void SetState(PlayerState state)
    {
        if (this.state == state)
            return;

        // Estado antigo
        switch (this.state)
        {
            case PlayerState.Movement:
                animator.SetBool("IsMoving", false); break;
        }

        // Estado novo
        switch (state)
        {
            case PlayerState.Movement:
                animator.SetBool("IsMoving", true); break;
            case PlayerState.Kicking:
                animator.SetTrigger("Kick"); break;
        }

        this.state = state;
    }

    public PlayerState GetState()
    {
        return state;
    }

    void RefreshMultiplicationPhysicScale()
    {
        if (multiplyPhysicsAttributesByScale)
        {
            Vector3 _scale = transform.localScale;
            physicsMultiplicationScale = (_scale.x + _scale.y + _scale.z) / 3f;
        }
        else
        {
            physicsMultiplicationScale = 1f;
        }
    }

    private void CommandJump(InputAction.CallbackContext obj)
    {
        // Changes the height position of the player..
        if (controller.isGrounded)
        {
            velocity.y += Mathf.Sqrt(jumpHeight * physicsMultiplicationScale * -3.0f
                                     * gravity * physicsMultiplicationScale);
            
            // ...
        }
    }

    void OnEnable()
    {
        input.Player.Jump.performed += CommandJump;
        input.Enable();
        RefreshMultiplicationPhysicScale();
    }

    void OnDisable()
    {
        input.Disable();
    }
}
```

O método ```RefreshMultiplicationPhysicScale()``` aumenta a escala da **física da movimentação** (**gravidade**, **pulo** e **velocidade de movimentação**) usando a escala do próprio objeto como valor se a *flag* ```multiplyPhysicsAttributesByScale``` estiver ativada. Útil para cenas que necessitem que o personagem possua uma escala diferente, porém  de forma que a **física da movimentação** fosse coerente.

# Inimigo Chutável

<p align="center">
<video src="{{ "/assets/portfolio/time-kickerz-chutavel.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

O componente ```Kickable``` define que um objeto será ***chutável***, ou seja, poderá receber **chutes** do jogador. Apesar de eu não ter criado este script inicialmente, fiz a maior parte das alterações.

A parte principal, de **receber um chute**, é muito simples: O método ```Kick(Vector3 direction, float potency)``` chama o **Coroutine** ```Fly(Vector3 direction, float potency)``` quando possível, onde o objeto recebe o impacto do **chute** e só finaliza o **Coroutine** quando o objeto atingir o chão ou quando demorou tempo demais. Também há correções aplicadas caso o objeto saia da área do *NavMesh*, que abordo em [Áreas Seguras para o NavMesh](#áreas-seguras-para-o-navmesh).

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(Rigidbody))]
public class Kickable : MonoBehaviour
{

    private Rigidbody body;

    NavMeshAgent agent;

    [SerializeField] float flyingToleranceTime = 1f;
    [SerializeField] float tryNavMeshesDuration = 3f;

    NavMeshSafeArea safeArea;

    Coroutine flyingCoroutine;
    float floorY = Mathf.Infinity;

    // ...

    private void Start()
    {
        body = GetComponent<Rigidbody>();
        agent = GetComponent<NavMeshAgent>();

        body.isKinematic = true;

        // ...
    }

    public void Kick(Vector3 direction, float potency) 
    {
        if (IsFlying())
            StopCoroutine(flyingCoroutine);
        flyingCoroutine = StartCoroutine(Fly(direction, potency));
        // ...
    }

    IEnumerator Fly(Vector3 direction, float potency)
    {
        body.isKinematic = false;
        agent.enabled = false;

        if (transform.position.y < floorY)
            floorY = transform.position.y;

        body.AddForce(direction * potency, ForceMode.Impulse);

        float count = flyingToleranceTime;

        // Enquanto estiver fora do chão ou se o tempo ainda não acabou
        while (count > 0f && transform.position.y >= floorY)
        {
            count -= Time.deltaTime;
            yield return null;
        }

        body.isKinematic = true;
        agent.enabled = true;

        count = tryNavMeshesDuration;

        // Enquanto não ter contato com uma área de navmesh e o tempo ainda não acabou
        while (count > 0f && !agent.isOnNavMesh)
        {
            count -= Time.deltaTime;
            yield return null;
        }

        // Conseguir uma área segura de navmesh se não estiver em contato com um navmesh válido
        if (!agent.isOnNavMesh)
            safeArea.TeleportForClosestSafePoint(agent);

        floorY = Mathf.Infinity;
        flyingCoroutine = null;
    }

    public bool IsFlying()
    {
        return flyingCoroutine != null;
    }

    // ...
}
```

A parte mais desafiadora foi mesclar as mecânicas do ```Rigidbody``` com o ```NavMeshAgent```, que são sistemas de física e movimentação que funcionam de formas diferentes. A ideia de utilizar ```Rigidbody``` foi proposto pelo outro programador da equipe, com o argumento de que isso nos ajuda e facilita na a criação da física do personagem **sendo atingido pelo chute**. 

Utilizar ambos os sistemas de movimentação causa instabilidade na movimentação do personagem, podendo ocasionar em *bugs* e/ou comportamentos inesperados na movimentação. Para lidar com isto, o uso de ambos componentes são alternados entre eles: o ```Rigidbody``` ativa a *flag* ```isKinematic``` sempre que não precisamos da simulação de física, enquanto ativamos o componente do ```NavMeshAgent``` para possibilitar que o inimigo se mova pelo *NavMesh*. Quando queremos o contrário, só invertemos o ```isKinematic``` do ```Rigidbody``` e a ativação do componente ```NavMeshAgent```. Para correção de mais um tipo de conflito do *NavMesh* com o ```Rigidbody```, também aplicamos a correção do tópico [Áreas Seguras para o NavMesh](#áreas-seguras-para-o-navmesh).

# Áreas Seguras para o NavMesh

<p align="center">
<video src="{{ "/assets/portfolio/time-kickerz-navmesh-safe-area-pt.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

Quando os inimigos saem voando por receberem um chute, eles desligam seus ```NavMeshAgent``` e ligam o ```isKinematic``` de seus ```Rigidbody``` (explico este processo no tópico [Inimigo Chutável](#inimigo-chutável)). Quando esta troca é realizada, e o ```Rigidbody``` cai **fora da malha do *NavMesh***, o ```NavMeshAgent``` será incapaz de se locomover quando o componente for reativado, pois está **fora de uma área válida**. Criei este sistema para **corrigir** esta problema.

<p align="center"><a href="{{ "/assets/portfolio/time-kickerz-navmesh-safe-area-estrutura.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/time-kickerz-navmesh-safe-area-estrutura.jpg" }}" />
</a></p>


> **Resumo:** Assim que o inimigo (que é um objeto que alterna entre o uso do ```Rigidbody``` e ```NavMeshAgent``` dependendo da necessidade) é chutado e cai em uma **área inválida** para o *NavMesh*, o inimigo teletransportará para um **ponto** mais próximo dentro da **área segura** na qual o inimigo entrou pela última vez. Abaixo explico mais detalhadamente. :)

Pela cena do jogo, haveria várias **áreas** que contêm um colisor e um componente ```NavMeshSafeArea```, seus filhos são considerados **pontos de teletransporte** (```Transform[] points```) para decidir onde o objeto teletransportará quando objeto chutado cair para uma **área de *NavMesh*** inválido. Estas **áreas** possuem um método simples (```TeleportForClosestSafePoint(NavMeshAgent flyingAgent)```) que deve ser chamado externamente para teletransportar um objeto para o **ponto de teletransporte** mais próximo daquela **área**.

```cs
[RequireComponent(typeof(BoxCollider))]
public class NavMeshSafeArea : MonoBehaviour
{
    Transform[] points;

    private void Start()
    {
        points = GetComponentsInChildren<Transform>();
    }

    public void TeleportForClosestSafePoint(NavMeshAgent flyingAgent)
    {
        Vector3 agentPos = flyingAgent.transform.position;
        Transform closestPoint = null;
        float closestDistance = Mathf.Infinity;

        foreach(Transform point in points)
        {
            float dist = Vector3.Distance(agentPos, point.position);
            if (dist < closestDistance)
            {
                closestDistance = dist;
                closestPoint = point;
            }
        }

        if (closestPoint != null)
            flyingAgent.Warp(closestPoint.position);
    }
}
```

O objeto *chutável* (```Kickable```) se atrela à **área segura** (```NavMeshSafeArea safeArea```) em que estiver dentro no momento. Como entrada de colisões não são detectadas quando um objeto já é instanciado dentro da **área** de colisão, o código já inicia (em ```Start()```) procurando pela **área** mais próxima do objeto.

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(Rigidbody))]
public class Kickable : MonoBehaviour
{
    // ...
    
    NavMeshAgent agent;
    NavMeshSafeArea safeArea;

    // ...


    private void Start()
    {
        agent = GetComponent<NavMeshAgent>();

        // ...

        NavMeshSafeArea[] safeAreas = FindObjectsOfType<NavMeshSafeArea>();
        float closestDist = Mathf.Infinity;
        Vector3 _position = transform.position;

        foreach (NavMeshSafeArea area in safeAreas)
        {
            float dist = Vector3.Distance(_position, area.transform.position);
            if (dist < closestDist)
            {
                closestDist = dist;
                safeArea = area;
            }
        }
    }

    // ...
```

Na finalização do **Coroutine** do impacto do chute (em ```Fly(Vector3 direction, float potency)```), o ```Kickable``` verifica se o seu componente de ```NavMeshAgent``` está em uma **área de *NavMesh*** válida para então teletransporta-se para o **ponto de teletransporte** mais próximo de sua **área segura** (```safeArea```).

```cs
public class Kickable : MonoBehaviour
{
    // ...
    
    IEnumerator Fly(Vector3 direction, float potency)
    {
        // ...
        // Conseguir uma área segura de navmesh se não estiver em contato com um navmesh válido
        if (!agent.isOnNavMesh)
            safeArea.TeleportForClosestSafePoint(agent);
        // ...
    }
    
    // ...
}
```

E claro, o ```Kickable``` também atribui sua **área** na qual seu colisor entrou como **área segura** (```safeArea```).

```cs
public class Kickable : MonoBehaviour
{
    // ...
    
    private void OnTriggerEnter(Collider c)
    {
        NavMeshSafeArea _safeArea = c.GetComponentInParent<NavMeshSafeArea>();
        if (_safeArea)
            safeArea = _safeArea;
    }
}
```

# Portal

O **portal** é para onde o jogador precisa chutar os inimigos. Ao chutar um inimigo para o **portal**, o sistema de levas contabiliza a morte do inimigo e faz seu tratamento.

<p align="center">
<video src="{{ "/assets/portfolio/time-kickerz-portal.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

```cs
public class Portal : MonoBehaviour
{
    [SerializeField] TimelineType timeline;

    WaveManager waveManager;

    // ...

    private void Start()
    {
        waveManager = FindObjectOfType<WaveManager>();
    }

    private void OnTriggerEnter(Collider c)
    {
        Kickable k = c.GetComponentInParent<Kickable>();
        if (k)
        {
            GameObject go = k.gameObject;
            if (k.IsFlying() && k.CompareTimeline(timeline))
            {
                source.Play();
                waveManager.OnKillEnemy(go);
                Destroy(go);
            }

            return;
        }

        // ...
    }
}
```

Apesar de existir uma comparação de linhas temporais em ```k.CompareTimeline(timeline)```, não tivemos tempo de desenvolver tal ideia, então todos os inimigos, na prática, pertenciam à mesma linha temporal.

Quando o jogador encosta no **portal**, ele recebe dano e é teletransportado para o **ponto de *reset*** se o dano ocorreu. O dano pode não ocorrer caso o jogador esteja com invulnerabilidade por ter recebido outro dano em um curto período de tempo.

<p align="center">
<video src="{{ "/assets/portfolio/time-kickerz-portal-jogador.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

```cs
    // ...
    
    private void OnTriggerEnter(Collider c)
    {
        // ...

        PlayerTakeDamage player = c.GetComponentInParent<PlayerTakeDamage>();
        if (player)
        {
            if (player.TakeDamage())
            {
                CharacterController cc = player.GetComponent<CharacterController>();
                cc.enabled = false;
                player.transform.position = playerResetPoint.position;
                cc.enabled = true;
            }
        }
    }
    
    // ...
```

# Outros

- **Sistema de levas/*spawn*:**
    - Cada leva possui um inimigo para ***spawnar***, com a quantia de vezes que o mesmo irá ***spawnar*** e o seu **ponto de *spawn***;
    - O ***spawn*** possui um intervalo de tempo para ***spawnar*** outro inimigo;
    - Há um tempo limite para finalizar a **leva**. Se o jogador não conseguir finalizá-la há tempo, os inimigos da próxima **leva** começam a ***spawnar***, acumulando inimigos de **levas** diferentes.
- **Correção de bugs e ajustes em outros scripts de outro programador;**
- **Implementação do *NavMesh* dos inimigos;**
- **Implementação de *assets*:** algumas animações e um cenário.

# Lições Aprendidas

Neste projeto, pude colocar em prova minhas habilidades adquirida anteriormente em outros **projetos paralelos** e **TCPs**, e ter resultados muito mais polidos que antes, envolvendo **C#**, **POO**, **Unity** e **Git**.

Apesar de ser um projeto mais simples, a necessidade de organizar a equipe seria fundamental para que não ocorresse problemas na produção, principalmente quando se trata de programação. Foi tranquilo trabalhar ao lado do outro programador, mas ainda é uma válida lição que pude tirar deste projeto.
