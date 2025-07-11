---
title: "Kristian: Frango Cabuloso (Online)"
layout: portfolio
media_paths: https://www.google.com
role: Programador
frame_time: 4
team_size: 5
year: 2021
engine: Unity
prog_language: C#
category: Graduação
web_pages: [ https://samcavalheiro.itch.io/tcp6-kristian-frango-cabuloso ]
web_page_types: [ itch.io ]

description: |
    Jogo de **tiro em primeira pessoa (FPS) online**. Os jogadores devem sobreviver à maior quantia de levas de frangos zumbis possível trabalhando em equipe.
    
    Meu primeiro projeto com **coleta de telemetria**. Projeto realizado para o **TCP VI**.
---

<!-- O online do jogo voltou a funcionar. Se der errado de novo, vou descomentar -->
<!--
# Aviso

> **Kristian: Frango Cabuloso (Online)** fazia uso do **Photon Bolt** para possibilitar a conectividade online entre os jogadores. Infelizmente o **Photon Bolt** foi descontinuado, o que impossibilita o jogo funcionar devido ao fato do jogo ser exclusivamente online.
>
> Quando eu conseguir arranjar um tempo, farei a migração deste projeto para alguma outra edição do **Photon** em funcionamento. Também vou avaliar a possibilidade de uma versão offline do jogo.
>
> Obrigado pela compreensão. :)
-->

# Introdução

Neste projeto, assumo a responsabilidade de programar um **jogo de tiro em primeira pessoa (FPS) online** e confeccionar, junto da equipe, um **artigo científico** que utilize este jogo como objeto de estudo, utilizando os **dados de telemetria coletados dos jogadores** como auxílio. Atuei como o **único programador** deste projeto.

Este projeto foi realizado durante a pandemia de Covid-19, sendo produzido remotamente devido ao lockdown. <!-- não tenho 100% de certeza -->

Projeto desenvolvido para a disciplina **TCP VI** (Trabalho de Conclusão de Período VI) da graduação de **Jogos Digitais do IFRJ Campus Eng. Paulo de Frontin**. O **TCP VI** vigente consistia no dever de produzir e entregar um **jogo de plataforma especial*** e um **artigo científico** ao final da disciplina na graduação.

A equipe do projeto conta com 5 membros, sendo eu, o **único programador**. [Os créditos podem ser acessados na página do itch.io](https://samcavalheiro.itch.io/tcp6-kristian-frango-cabuloso){:target="_blank"}.

Este foi meu primeiro projeto com **coleta de telemetria** (inclusive com uso do **Unity Analytics**) e utilizando especificamente o **Photon Bolt**.

<small>\* Plataforma especial com uso de tecnologias como VR, giroscópio, telemetria, dentre outras possibilidades na aplicação de jogos.</small>

# Conectividade Online com Photon Bolt

<!-- talvez isso possa entrar como um "Outros", já que não possui muita coisa importante -->

Decidi realizar a **conectividade online** do jogo com o uso do **Photon Bolt**. O **Photon Bolt** me chamou a atenção por ter compensação de *lag*, aparentando ser o ideal para um jogo **FPS** frenético. Claro, também tem a questão da disponibilidade gratuita dos servidores do **Photon**.

Pesquisei por tutoriais na internet e consultei a documentação oficial para implementar corretamente a **conectividade online do Photon Bolt**. Este é meu primeiro projeto com uso do **Photon Bolt**, mas não do **Photon** em si.

```cs
using Photon.Bolt;
using Photon.Bolt.Matchmaking;
using System;
using System.Collections;
using System.Collections.Generic;
using UdpKit;
using UnityEngine;

public class NetworkMenuScene : GlobalEventListener
{
    public string gameSceneName;

    public void Command_StartServer()
    {
        BoltLauncher.StartServer();
    }

    public void Command_StartClient()
    {
        BoltLauncher.StartClient();
    }

    public override void BoltStartDone()
    {
        // 1234 = qualquer numero. não sei q colocar por enquanto
        BoltMatchmaking.CreateSession("1234", sceneToLoad: gameSceneName);
    }

    public override void SessionListUpdated(Map<Guid, UdpSession> sessionList)
    {
        foreach (KeyValuePair<Guid, UdpSession> session in sessionList)
        {
            UdpSession photonSession = session.Value;
            if (photonSession.Source == UdpSessionSource.Photon)
            {
                BoltMatchmaking.JoinSession(photonSession);
            }
        }
    }
}
```

O método ```Command_StartServer()``` ocorre quando o jogador clica no botão "INICIAR SERVIDOR", enquanto o método ```Command_StartClient()``` ocorre quando o jogador clica no botão "INICIAR CLIENTE". Assim que um dos botões são clicados, a cena da partida é carregada quando a **conexão** com o **Bolt** é realizada com sucesso (em ```BoltStartDone()```).

Quando o jogador finalmente é teletransportado para a cena da partida, o **prefab** do jogador é instanciado no ponto de *spawn* na partida **online**.

```cs
using Photon.Bolt;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NetworkGameManager : GlobalEventListener
{
    [SerializeField] GameObject networkPlayerPrefab;
    public Transform spawnPoint;

    public override void SceneLoadLocalDone(string scene, IProtocolToken token)
    {
        Vector3 spawnPos = new Vector3();
        if (spawnPoint)
            spawnPos = spawnPoint.position;
        BoltNetwork.Instantiate(networkPlayerPrefab, spawnPos, Quaternion.identity);
    }
}
```

# Spawn de Inimigos

O sistema de ***spawn* de inimigos** deste projeto foi feito especificamente pensando no escopo do projeto e, claro, na integração **online**.

Importante ressaltar que o processamento de cada *frame* (```Update()```) não ocorrerá **se o cliente não for o *host***.

1. O sistema ***spawna*** um objeto ```GameObject spawnObject``` pela quantia de vezes que o *designer* definir: ***spawnando*** quantia ```int spawnAmountPerInterval```;
2. Aguardar ```float spawnWaitTimeAfterInterval``` segundos;
3. Continuar ***spawnando*** e aguardando, até ***spawnar*** quantia ```int spawnObjectLenght``` de objetos.

Quando todos os inimigos da partida estiverem mortos, o **Coroutine** que realiza os ***spawns*** começará (como é exibido no método ```Update()```). Os objetos são ***spawnados*** de forma **online** através do ```BoltNetwork```.

> Os comentários deste código foram criados para facilitar a leitura, portanto não estavam presentes no código original.

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Bolt;
using UnityEngine;

public class Spawner : GlobalEventListener
{
    public GameObject spawnObject; // objeto que será spawnado
    public Transform[] spawnPoints; // pontos de spawn
    public int spawnObjectLenght = 4; // quant. de objetos p/ spawnar
    public int spawnAmountPerInterval = 3; // quant. de objetos p/ aguardar um intervalo p/ continuar spawnando mais
    public float spawnWaitTimeAfterInterval = 3f; // segundos p/ aguardar de intervalo
    public float safeWaitTime = 5f; // tempo seguro p/ evitar bugs

    BattleManager battleManager; // classe que guarda lista dos jogadores e NPCs

    WaveEvent waveEvent; // evento do Photon Bolt sobre as ondas
    float count; // contador de tempo
    int currentWave; // onda atual
    bool isSpawning; // flag que indica se está spawnando objetos

    void Start()
    {
        // Desativar se não for o servidor, impossibilitando rodar o Update()
        if (!BoltNetwork.IsServer)
        {
            enabled = false;
            return;
        }

        waveEvent = WaveEvent.Create();
        battleManager = FindObjectOfType<BattleManager>();
        count = safeWaitTime;
    }

    void Update()
    {
        // Se não estiver spawnando e não houver nenhum NPC na partida
        if (!isSpawning && battleManager.NPCs.Count == 0)
        {
            // Contar tempo
            count -= BoltNetwork.FrameDeltaTime;
            if (count > 0f)
                return;

            // Começar o Coroutine de spawn quando o tempo acabar
            StartCoroutine(Spawn());
        }
    }
    
    IEnumerator Spawn()
    {
        isSpawning = true;

        currentWave++; // Aumenta uma onda
        RefreshAndSendEvent(); // Atualiza a onda e envia aos clientes

        int spawnedAmount = 0; // Quant. de objetos spawnados

        // Aleatoriza a posição de spawn do objeto dentre os spawnPoints
        Vector3 spawnPosition = spawnPoints[Random.Range(0, spawnPoints.Length - 1)].position;

        // Spawnar cada objeto.
        // A quantia de objeto a ser spawnada é multiplicada pelo número de
        // jogadores em partida e pela onda atual, conforme o design do projeto pedia.
        for (int i = 0; i < spawnObjectLenght * (battleManager.players.Count + 1) * currentWave; i++)
        {
            spawnedAmount++; // Aumenta um objeto spawnado

            // Spawna o objeto online em uma distância considerada de outro
            GameObject spawned = BoltNetwork.Instantiate(spawnObject, spawnPosition + (Vector3.left * 3.5f * spawnedAmount), Quaternion.identity);

            EnemyCharacterController enemy = spawned.GetComponent<EnemyCharacterController>();
            Health health = spawned.GetComponent<Health>();

            // Definir este ponto de spawn como base do inimigo,
            // se o objeto spawnado for um inimigo
            if (enemy)
                enemy.baseTransform = transform;

            // Multiplicar a vida máxima deste objeto pela onda atual,
            // se o objeto spawnado tiver um Health
            if (health)
            {
                health.maxHealth *= currentWave;
                health.state.PlayerHealth = health.maxHealth; // Atualiza online também
            }

            // Se já spawnou uma quant. de objetos dentro do intervalo definido
            if (spawnedAmount == spawnAmountPerInterval)
            {
                // Zerar quant. objetos spawnados
                spawnedAmount = 0;

                // Releatorizar a posição de spawn do objeto dentre os spawnPoints
                spawnPosition = spawnPoints[Random.Range(0, spawnPoints.Length - 1)].position;

                // Aguardar o tempo de intervalo para spawnar o restante dos objetos
                yield return new WaitForSeconds(spawnWaitTimeAfterInterval);
            }
        }

        // Fim do spawn

        count = safeWaitTime;

        isSpawning = false;
    }
    
    // ...
```

A **contagem de ondas** é atualizada **online**, simplesmente atualizando o valor do nosso evento ```WaveEvent waveEvent``` e enviando-os aos clientes.

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-photon-waveevent.png" }}" />
</p>

```cs
    // ...
    
    // Atualiza a onda e envia aos clientes
    void RefreshAndSendEvent()
    {
        waveEvent.CurrentWave = currentWave;
        waveEvent.Send();
    }

    // Enviar a onda atual caso um jogador novo entre
    public override void EntityAttached(BoltEntity entity)
    {
        if (enabled && !entity.IsOwner)
            waveEvent.Send();
    }
}
```

# Uso de Armas

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-uso-armas.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

O **Uso de Armas** é onde o jogador ou inimigo **controlam suas armas online**. Mas antes, vamos dar uma breve olhada na **arma** em si.

## Arma

<p align="center"><a href="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-arma.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-arma.jpg" }}" />
</a></p>

A **arma** é controlada externamente pelo ```WeaponController```. Apesar de funcionar offline, o ```WeaponController``` cria as condições para que a **arma** (```Weapon```) funcione **online**.

Para o ```WeaponController``` verificar se é possível um tiro ser efetuado, o método ```TryConsumeShot()``` é usado. Ele **recarrega** a **arma** se for necessário, consome a(s) **bala(s)**, e retorna ```true``` se ficou com **balas** suficiente após o processo e ```false``` se já estava ou ficou sem **balas** para conseguir **atirar**.

```cs
public class Weapon : MonoBehaviour
{
    // ...
    
    [SerializeField] int maxAmmo = 10;
    int ammo;
    [SerializeField] int maxRecharges = 10;
    int recharges;
    // ...
    [SerializeField] int bulletConsumeAmount = 1;
    [SerializeField] bool infinityRecharge;
    [SerializeField] float shotCooldown = 1f;
    
    // ...
    
    float shotCooldownCount;
    
    // ...
    
    public bool TryConsumeShot()
    {
        if (ammo == 0)
            Recharge();

        if (ammo > 0 && shotCooldownCount <= 0f)
        {
            ammo -= bulletConsumeAmount;
            ammo = Mathf.Max(0, ammo);
            shotCooldownCount = shotCooldown;
            return true;
        }

        return false;
    }
    
    // ...
    
    void Recharge()
    {
        if (infinityRecharge || recharges > 0)
        {
            recharges--;
            ammo = maxAmmo;
        }
    }
}
```

Os **projéteis** são instanciados através do método ```Shoot(Transform shotPoint, PlayerAnalytics playerAnalytics = null)```. Este método é chamado através de um evento do **Photon Bolt** (explicarei em [Tiro](#tiro)).

```cs
public class Weapon : MonoBehaviour
{
    public Animator animator;
    // ...
    [SerializeField] int spawnBulletConsumeAmount = 1;
    // ...
    [SerializeField] Projectile projectile;

    public Projectile Projectile { private set => projectile = value; get => projectile; }

    // ...
    
    public void Shoot(Transform shotPoint, PlayerAnalytics playerAnalytics = null)
    {
        Vector3 _position = shotPoint.position;
        Vector3 _rotation = shotPoint.eulerAngles;

        bool canUsePlayerAnalytics = playerAnalytics != null;

        for (float i = -spawnBulletConsumeAmount / 2f; i < spawnBulletConsumeAmount / 2f; i++)
        {
            Projectile p = Instantiate(projectile, _position, Quaternion.Euler(_rotation + Vector3.up * i));
            if (canUsePlayerAnalytics)
                p.playerAnalytics = playerAnalytics;
        }

        // Aumenta um tiro realizado nos analytics se pode usar analitycs
        if (canUsePlayerAnalytics)
            playerAnalytics.shotsMade += spawnBulletConsumeAmount;

        if (animator)
            animator.SetTrigger(attackAnimationTrigger);
    }
    
    // ...
}
```

## Projétil

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-projetil.jpg" }}" width="570" height="290" />
</p>

O **projétil** é um simples objeto que percorre a cena do jogo até atingir (colidir) alguma vítima (que são objetos com o componente ```Health``` -- explico este componente em [Sistema de Vida](#sistema-de-vida)) e dar dano.

> Os comentários deste código foram criados para facilitar a leitura, portanto não estavam presentes no código original.

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Bolt;
using UnityEngine;

public class Projectile : MonoBehaviour
{
    [SerializeField] LayerMask layerMask; // layer p/ filtrar colisão p/ atingir
    [SerializeField] float speed = 1f;
    [SerializeField] int damage = 1;
    [SerializeField] float size = 1f;

    [SerializeField, Tooltip("Tempo para o projétil se autodestruir. <= 0 desabilita autodestruição")]
    float selfDestructTime = 5f;

    [HideInInspector] public PlayerAnalytics playerAnalytics;

    public LayerMask LayerMask { private set => layerMask = value; get => layerMask; }

    void Start()
    {
        // Destruir projétil depois de selfDestructTime segundos
        if (selfDestructTime > 0f)
            Destroy(gameObject, selfDestructTime);
    }

    void Update()
    {
        // Fazer projétil se mover para frente continuamente
        transform.position += transform.forward * speed * BoltNetwork.FrameDeltaTime;

        // Fazer checagem de sobreposição de colisão usando layerMask como filtro
        Collider[] colliders = Physics.OverlapSphere(transform.position, size, layerMask);

        // Se colidiu com algum objeto
        if (colliders.Length > 0)
        {
            bool usingAnalytics = playerAnalytics != null;

            // Checar cada objeto colidido com o projétil
            foreach (Collider c in colliders)
            {
                // Se o objeto colidido possui Health e se ele está funcionando online
                Health h = c.GetComponentInParent<Health>();
                if (h && h.entity.IsAttached)
                {
                    // Dar dano ao Health e ligar flag caso tenha matado o objeto
                    bool killed = h.ReceiveDamage(damage, usingAnalytics);

                    // Se estiver usando analitycs (telemetria)
                    if (usingAnalytics)
                    {
                        // Se o objeto atingido é um jogador
                        if (h.ReviveController)
                        {
                            // Somar ao analitycs mais um jogador abatido se matou este jogador
                            if (killed)
                                playerAnalytics.kodPlayers++;

                            // Somar ao analitycs mais um jogador atingido
                            playerAnalytics.hittedPlayers++;
                        }
                        // Entretanto, se o objeto atingido é um inimigo
                        else if (h.GetComponent<EnemyCharacterController>())
                        {
                            // Somar ao analitycs mais um inimigo abatido se matou este inimigo
                            if (killed)
                                playerAnalytics.killedEnemies++;

                            // Somar ao analitycs mais um inimigo atingido
                            playerAnalytics.hittedEnemies++;
                        }
                    }
                }
            }
            
            // O projétil é destruído ao atingir um alvo
            Destroy(gameObject);
        }
    }

    // Desenhar o hitbox do projétil no Unity
    void OnDrawGizmosSelected()
    {
        Gizmos.DrawWireSphere(transform.position, size * 0.5f);
    }
}
```

Apesar do script ser totalmente offline, o método ```ReceiveDamage(int damage, bool damageFromPlayer)``` do componente ```Health``` só funciona no cliente dono/proprietário daquele objeto/jogador.

```cs
public class Health : EntityBehaviour<IKFCPlayerState>
{
    // ...
    
    // Retorna TRUE se após receber dano teve vida == 0
    public bool ReceiveDamage(int damage, bool damageFromPlayer)
    {
        // Não rodar código se não for o dono (o Photon nem deixa)
        if (!entity.IsOwner)
            return false;
    
    // ...
}
```

## Controlador de Armas

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-jogador-controladorarma.jpg" }}" height="397" />
</p>

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-inimigo-controladorarma.jpg" }}" />
</p>

E finalmente, o **controlador de armas**! O **controle de armas** possibilita a intermediação do *input* do jogador à **arma**, possibilitando a ação de **atirar**, **recarregar** e de **troca de arma**. O componente ```WeaponController```, que abordaremos aqui, pode ser adicionado em jogadores, inimigos e NPCs para **controle de suas armas**.

Na inicialização do código, já é instanciado todas as **armas** iniciais.

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Photon.Bolt;

public class WeaponController : EntityBehaviour<IKFCPlayerState>
{
    [SerializeField] Transform weaponHolder;
    [SerializeField] Weapon[] initialWeapons;
    
    // ...

    Weapon[] weapons;
    public Weapon CurrentWeapon { private set; get; }

    void Awake()
    {
        weapons = new Weapon[initialWeapons.Length];
        if (weapons.Length > 0)
        {
            Weapon w = weapons[0] = Instantiate(initialWeapons[0], weaponHolder);
            CurrentWeapon = w;

            for (int i = 1; i < weapons.Length; i++)
            {
                w = Instantiate(initialWeapons[i], weaponHolder);
                w.gameObject.SetActive(false);
                weapons[i] = w;
            }
        }
    }
    
    // ...
}
```

Quando o ```WeaponController``` já está pronto pelo **Photon**, configuramos a parte que pode replicar **online**:

- O número da **arma**: ```state.PlayerWeaponIndex = 0;```
- O evento da ação de **atirar**: ```state.OnPlayerShoot = Photon_Shoot;```
- E o evento de coleta de **arma** (que abordo no tópico [Coleta de Arma](#coleta-de-arma)): ```state.AddCallback("PlayerPickupWeaponPath", Photon_AddWeapon);```

```cs
public class WeaponController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    
    PlayerAnalytics playerAnalytics;
    Animator animator;
    
    // ...
    
    public override void Attached()
    {
        state.PlayerWeaponIndex = 0;
        state.OnPlayerShoot = Photon_Shoot;
        state.AddCallback("PlayerPickupWeaponPath", Photon_AddWeapon);
        playerAnalytics = GetComponent<PlayerAnalytics>();
        animator = GetComponentInChildren<Animator>();
    }
    
    // ...
}
```

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-photon-playerstate-weaponindex.jpg" }}" />
</p>

### Troca de Armas

No ```Update()```, existe um sistema que **troca a arma** se o número da **arma** replicado **online** for diferente do número local. Isto ocorrerá apenas caso este cliente não seja do dono/proprietário, pois isto já ocorreu na máquina do dono/proprietário.

```cs
public class WeaponController : EntityBehaviour<IKFCPlayerState>
{
    int oldWeaponIndex;
    
    // ...
    
    void Update()
    {
        if (!entity.IsOwner)
        {
            int _weaponIndex = state.PlayerWeaponIndex;
            if (oldWeaponIndex != _weaponIndex)
                SwitchWeapon(_weaponIndex, oldWeaponIndex);
        }
    }
    
    // ...
}
```

A **troca de arma** é feita desligando a **arma** anterior e ligando a nova. No fim, a variável **online** da **arma** é modificada.

```cs
public class WeaponController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    
    public void SwitchWeapon(bool next)
    {
        int currentWeaponIndex = state.PlayerWeaponIndex;
        int newWeaponIndex = currentWeaponIndex;

        if (next)
        {
            newWeaponIndex++;
            if (newWeaponIndex > weapons.Length - 1)
                newWeaponIndex = 0;
        }
        else
        {
            newWeaponIndex--;
            if (newWeaponIndex < 0)
                newWeaponIndex = weapons.Length - 1;
        }

        SwitchWeapon(newWeaponIndex, currentWeaponIndex);
    }

    public void SwitchWeapon(int weaponIndex, int currentWeaponIndex = -1)
    {
        if (currentWeaponIndex == -1)
            currentWeaponIndex = state.PlayerWeaponIndex;

        if (weaponIndex == currentWeaponIndex || weaponIndex < 0 || weaponIndex > weapons.Length - 1)
            return;
            
        weapons[currentWeaponIndex].gameObject.SetActive(false);

        Weapon w = weapons[weaponIndex];
        w.gameObject.SetActive(true);
        CurrentWeapon = w;

        state.PlayerWeaponIndex = weaponIndex;
        oldWeaponIndex = weaponIndex;
    }
    
    // ...
}
```

O ```SwitchWeapon(bool next)``` é chamado pelo jogador quando ele rola a roda do *mouse*.

Alguns controles não funcionavam como esperado no **Linux** com o novo **Input Manager** da **Unity**, então, neste caso, foi necessário utilizar o antigo **Input Manager** caso o usuário estivesse no **Linux**.

```cs
public class PlayerCharacterController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    WeaponController weaponController;
    PlayerInputAction input;
    
    // ...
    
    // Atualizar (Bolt) apenas para o jogador sendo controlado pelo cliente
    public override void SimulateOwner()
    {
        // ...

        float scrollAxis;

        if (SystemInfo.operatingSystemFamily == OperatingSystemFamily.Linux)
        {
            scrollAxis = Input.GetAxis("Mouse ScrollWheel");
        }
        else
        {
            scrollAxis = input.Player.SwitchWeaponScroll.ReadValue<float>();
        }

        if (scrollAxis != 0f)
            weaponController.SwitchWeapon(scrollAxis > 0f);
    }
    
    // ...
}
```

Já o ```SwitchWeapon(int weaponIndex, int currentWeaponIndex = -1)``` é chamado quando o jogador pressiona do 0 ao 9 no teclado.

```cs
public class PlayerInputHandler : MonoBehaviour
{
    WeaponController weaponController;
    // ...
    public PlayerInputAction Input { private set; get; }
    
    // ...
    
    void OnEnable()
    {
        // Ativações/Atribuições necessárias para o Input System
        PlayerInputAction.PlayerActions playerActions = Input.Player;
        // ...
        playerActions.SwitchWeapon.performed += ctx => weaponController.SwitchWeapon((int)ctx.ReadValue<float>() - 1);
        // ...
        Input.Enable();
    }
    
    // ...
}
```

Ambos os métodos ```SwitchWeapon``` também foram projetados para ser chamados por inimigos. Mas no fim das contas, todos os inimigos nem sequer usaram múltiplas **armas** e nem mesmo **armas** à distância, dispensando a necessidade de integrar e implementar a **troca de armas** nos inimigos.

### Tiro

Por fim, o **tiro**! O método ```Photon_Shoot()``` já é o **tiro** replicado **online**, ou seja, ocorrerá em todos os clientes. Ele foi configurado no método ```Attached()``` (já exibido em [Controlador de Armas](#controlador-de-armas)).

```cs
public class WeaponController : EntityBehaviour<IKFCPlayerState>
{
    [SerializeField] Transform shotPoint
    
    // ...

    public override void Attached()
    {
        // ...
        state.OnPlayerShoot = Photon_Shoot;
        // ...
    }

    // ...

    void Photon_Shoot()
    {
        if (animator)
            animator.SetTrigger(attackAnimationTriggerParameterName);
        CurrentWeapon.Shoot(shotPoint, playerAnalytics);
    }
    
    // ...
}
```

Entretanto, o método que será chamado pelo jogador, inimigo ou NPC para realizar o **tiro**, é o método ```TryShoot()```. Este método, sim, chamará o evento para que o mesmo seja replicado **online** (que no fim chama o ```Photon_Shoot()``` em todos os clientes).

```cs
public class WeaponController : EntityBehaviour<IKFCPlayerState>
{
    // ...

    public void TryShoot()
    {
        if (CurrentWeapon.TryConsumeShot())
            state.PlayerShoot();
    }
    
    // ...
}
```

O método ```TryShoot()``` é chamado o jogador quando a tecla de **atirar** é pressionada.

```cs
public class PlayerCharacterController : EntityBehaviour<IKFCPlayerState>
{
    WeaponController weaponController;
    
    // ...
    
    public void Command_Fire()
    {
        if (weaponController)
            weaponController.TryShoot();
    }
    
    // ...
}
```

```cs
public class PlayerInputHandler : MonoBehaviour
{
    PlayerCharacterController playerCharacterController;
    // ...
    public PlayerInputAction Input { private set; get; }
    
    // ...
    
    void OnEnable()
    {
        // Ativações/Atribuições necessárias para o Input System
        PlayerInputAction.PlayerActions playerActions = Input.Player;
        // ...
        playerActions.Fire.performed += ctx => playerCharacterController.Command_Fire();
        // ...
        Input.Enable();
    }
    
    // ...
}
```

O método ```TryShoot()``` também é chamado quando o inimigo está no alcance de um alvo.

```cs
public class EnemyCharacterController : EntityBehaviour<IKFCPlayerState>
{
    Health target;
    // ...
    public float followTargetToShotDistance = 5f;
 
    // ...
    
    void FightUpdate()
    {
        // ...

        Transform targetTransform = target.transform;
        // ...
        float dist = Vector3.Distance(transform.position, targetTransform.position);

        if (dist > followTargetToShotDistance)
        {
            // ...
        }
        else
        {
            if (animator)
                state.EnemySpeed = 0;
            weaponController.TryShoot();
        }
    }
    
    // ...
}
```

# Coleta de Arma

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-coleta-armas.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

É possível **coletar armas** no jogo, e a **arma** era adicionada **online**. Porém, a **arma a ser coletada** em si, era local.

A **arma** só podia ser **coletada** uma vez pelo jogador. A **coleta** não impossibilitava um próximo jogador de **coletar a arma** por ser a única disponível do mapa.

<!-- Só existia uma **arma a ser coletada** e ela só era **coletada** uma única vez para cada jogador. Devido ao prazo já corrido no final do projeto, não tivemos tempo de pensar em um *level design* interessante para a **coleta de armas** e nem criar mais **armas** (na prática, só há Pistola e Shotgun). -->

<p align="center"><a href="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-pickup.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-pickup.jpg" }}" />
</a></p>

```cs
public class WeaponPickup : MonoBehaviour
{
    [SerializeField] string weaponPrefabPath;
    bool waitingForDestroy;

    void OnTriggerEnter(Collider c)
    {
        if (waitingForDestroy)
            return;

        PlayerCharacterController pcc = c.GetComponentInParent<PlayerCharacterController>();
        if (pcc && pcc.entity.IsOwner)
        {
            pcc.state.PlayerPickupWeaponPath = weaponPrefabPath;
            waitingForDestroy = true;
            foreach (MeshRenderer meshRenderer in GetComponentsInChildren<MeshRenderer>())
                meshRenderer.enabled = false;
            //pcc.GetComponent<WeaponController>().AddWeapon(weaponPrefabPath);
            StartCoroutine(WaitToAnnulateAndDestroy(pcc));
        }
    }

    IEnumerator WaitToAnnulateAndDestroy(PlayerCharacterController pcc)
    {
        yield return new WaitForSeconds(2f);
        pcc.state.PlayerPickupWeaponPath = "";
        Destroy(gameObject);
    }
}
```

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-photon-playerstate-weaponpickuppath.jpg" }}" />
</p>

O ```string PlayerCharacterController.state.PlayerPickupWeaponPath``` é o caminho do *prefab* da **arma a ser coletada**. Esta variável é replicada **online** pelo **Photon Bolt**. O ```WeaponController``` trata da **coleta de arma** sendo replicada com nosso *callback* ```Photon_AddWeapon()```.

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Photon.Bolt;

public class WeaponController : EntityBehaviour<IKFCPlayerState>
{
    [SerializeField] Transform weaponHolder;
    Animator animator;
    Weapon[] weapons;
    
    // ...
    
    public override void Attached()
    {
        // ...
        state.AddCallback("PlayerPickupWeaponPath", Photon_AddWeapon);
        // ...
        animator = GetComponentInChildren<Animator>();
    }
    
    // ...
    
    public void Photon_AddWeapon()
    {
        string _weaponPrefabPath = state.PlayerPickupWeaponPath;

        if (string.IsNullOrEmpty(_weaponPrefabPath))
            return;

        Weapon w = Instantiate(Resources.Load<Weapon>(_weaponPrefabPath), weaponHolder);
        w.gameObject.SetActive(false);

        Weapon[] _weapons = new Weapon[weapons.Length + 1];
        for (int i = 0; i < weapons.Length; i++)
            _weapons[i] = weapons[i];

        _weapons[_weapons.Length - 1] = w;
        weapons = _weapons;
    }
    
    // ...
}
```

# Sistema de Vida

O **sistema de vida** do jogo possibilita a um jogador, inimigo ou NPC **receber dano, morrer, regenerar-se e ser reanimado**. Isso sincronizando **online** :).

## Dano/Morte

<p align="center">
<video src=" {{ "/assets/portfolio/kristian-frango-cabuloso-online-matar-morrer.mp4" }}" height="270" controls loop autoplay muted></video>
</p>

Basicamente, o método ```ReceiveDamage(int damage, bool damageFromPlayer)``` retorna ```true``` caso o objeto tenha sido **debilitado** ou **morto**, do contrário, ```false```.

O objeto não **recebe dano** se o cliente não for o dono, ou se estiver sendo **reanimado**. Neste caso, ao invés de **receber dano**, irá **atrapalhar a reanimação** ou **acelerar o tempo de morte**.

A parte da telemetria, explico em [Telemetria](#telemetria).

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Bolt;
using UnityEngine;

public class Health : EntityBehaviour<IKFCPlayerState>
{
    public int maxHealth = 10;

    [Header("Regeneração")]
    [SerializeField] int regenerationAmount = 2;
    [SerializeField] float regenerationWaitTime = 0.5f;
    [SerializeField] float regenerationStartWaitTime = 5f;

    public PlayerReviveController ReviveController { private set; get; }

    PlayerAnalytics playerAnalytics;

    float regenerationStartCount;
    float regenerationCount;
    
    
    public override void Attached()
    {
        if (entity.IsOwner)
        {
            state.PlayerHealth = maxHealth;

            ReviveController = GetComponent<PlayerReviveController>();
            playerAnalytics = GetComponent<PlayerAnalytics>();

            if (ReviveController) // Prevenir o bug de atribuir vida dos inimigos à HUD do servidor
                FindObjectOfType<HealthHUD>().Setup(this);
        }
    }

    // Retorna TRUE se após receber dano teve vida == 0
    public bool ReceiveDamage(int damage, bool damageFromPlayer)
    {
        // Não rodar código se não for o dono (o Photon nem deixa)
        if (!entity.IsOwner)
            return false;

        // Atrapalhar o jogador de reanimar se ele estiver necessitando reanimar
        if (ReviveController && ReviveController.TryReceiveDamage())
            return false;

        // Processo normal de perda de vida

        int health = state.PlayerHealth;

        health -= damage; // Perder vida
        health = Mathf.Max(health, 0); // Impedir que a vida fique menor que 0

        // Atualizar a vida online com a vida modificada
        state.PlayerHealth = health;

        // Se vida chegou a 0
        if (health == 0)
        {
            if (playerAnalytics)
            {
                if (damageFromPlayer)
                {
                    playerAnalytics.kodByPlayers++;
                }
                else
                {
                    playerAnalytics.kodByEnemies++;
                }
            }

            if (ReviveController)
            {
                ReviveController.TriggerTimeToDie();
                regenerationStartCount = Mathf.Infinity;
            }
            else
            {
                Die();
            }

            return true;
        }

        regenerationStartCount = regenerationStartWaitTime;
       
        return false;
    }
    
    // ...
    
    public void Die()
    {
        // Enviar analytics de morte se for jogador
        if (playerAnalytics)
            playerAnalytics.SendDieAnalytics();

        // Destruir objeto pelo Bolt se a vida foi zerada
        BoltNetwork.Destroy(gameObject);
    }
}
```

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-photon-playerstate-playerhealth.jpg" }}" />
</p>

Se o objeto ficou com a **vida** (```health```) igual a ```0``` e possuir um componente ```PlayerReviveController```, ele não **morrerá** diretamente mas ficará **debilitado**. -- Abordo isso em [Reanimação entre Jogadores](#reanimação-entre-jogadores). -- Mas caso NÃO possua o componente ```PlayerReviveController```, **morrerá** diretamente.

## Regeneração

<p align="center">
<video src=" {{ "/assets/portfolio/kristian-frango-cabuloso-online-regen.mp4" }}" height="270" controls loop autoplay muted></video>
</p>

A **regeneração** funciona de forma muito simples:

Ao passar o tempo de início da **regeneração**; passa a ser contado o tempo para a **regeneração** e, quando este tempo acaba, é restaurada uma quantia de **vida**, e este processo é repetido até que a **vida** esteja totalmente recuperada.

Essa contagem ocorre apenas no cliente proprietário deste objeto.

```cs
    // ...
    
    public override void SimulateOwner()
    {
        if (regenerationStartCount <= 0f)
        {
            int healthAmount = state.PlayerHealth;

            if (healthAmount < maxHealth)
            {
                if (regenerationCount <= 0f)
                {
                    state.PlayerHealth = Mathf.Min(healthAmount + regenerationAmount, maxHealth);
                    regenerationCount = regenerationWaitTime;
                }
                else
                {
                    regenerationCount -= Time.deltaTime;
                }
            }
        }
        else
        {
            regenerationStartCount -= Time.deltaTime;
        }
    }
    
    // ...
```

O tempo de início de **regeneração** só começa a quando o objeto tem **vida** menor que a **vida máxima**, como pode ser visto na condicional ```if (healthAmount < maxHealth)```. O valor do tempo de início de **regeneração** é sempre iniciado ou reiniciado quando o objeto **recebe dano**.

```cs
    // ...
    
    // Retorna TRUE se após receber dano teve vida == 0
    public bool ReceiveDamage(int damage, bool damageFromPlayer)
    {
        // ...
        regenerationStartCount = regenerationStartWaitTime;
       
        return false;
    }
    
    // ...
```

# Reanimação entre Jogadores

É possível **reanimar outro jogador debilitado**. Ou ser **reanimado por outro jogador**, caso o próprio esteja **debilitado**.

A **reanimação** é tratada no componente ```PlayerReviveController```, mas o sistema começa sendo chamado ainda no ```Health``` através do método ```ReceiveDamage(int damage, bool damageFromPlayer)```. O ```TryReceiveDamage()``` é chamado sempre que recebe dano; o ```TriggerTimeToDie()``` é chamado quando o jogador atinge ```0``` de **vida**.

```cs
public class Health : EntityBehaviour<IKFCPlayerState>
{
    // ...
    public PlayerReviveController ReviveController { private set; get; }
    // ...


    public override void Attached()
    {
        if (entity.IsOwner)
        {
            // ...
            ReviveController = GetComponent<PlayerReviveController>();
            // ...
        }
    }
    
    // ...
    
    // Retorna TRUE se após receber dano teve vida == 0
    public bool ReceiveDamage(int damage, bool damageFromPlayer)
    {
        // Não rodar código se não for o dono (o Photon nem deixa)
        if (!entity.IsOwner)
            return false;

        // Atrapalhar o jogador de reanimar se ele estiver necessitando reanimar
        if (ReviveController && ReviveController.TryReceiveDamage())
            return false;

        // Processo normal de perda de vida
        // ...

        // Se vida chegou a 0
        if (health == 0)
        {
            // ...

            if (ReviveController)
            {
                ReviveController.TriggerTimeToDie();
                regenerationStartCount = Mathf.Infinity;
            }
            else
            {
                Die();
            }

            return true;
        }
        regenerationStartCount = regenerationStartWaitTime;
        return false;
    }
}
```

## Debilitação

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-debilitacao.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

O método ```TriggerTimeToDie()``` cancela a movimentação do jogador, o rotaciona (para parecer que está caído no chão) e troca seu estado para **"morrendo"** (```ReviveState.Dying```). É aqui onde o jogador passa a ficar **debilitado**.

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Bolt;
using UnityEngine;

public enum ReviveState : byte
{
    None,
    Dying,
    Reviving
}

[RequireComponent(typeof(Health), typeof(PlayerCharacterController))]
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    [Tooltip("Tempo que o jogador levará para morrer")]
    public float timeToDie = 10f;
    // ...
    public Vector3 dieRotation;
    
    // ...
    
    public ReviveState State { private set; get; }
    public float Count { private set; get; }
    
    // ...
    
    public void TriggerTimeToDie()
    {
        Count = timeToDie;
        transform.localEulerAngles = dieRotation;
        State = ReviveState.Dying;
        state.PlayerIsDying = true;

        playerCharacterController.Command_CancelMove();
    }
    
    // ...
}
```

Ah! O ```state.PlayerIsDying``` é a *flag* **online** que indica se o jogador está **morrendo** ou não, para que um jogador consiga identificar se o outro **morrendo**.

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-photon-playerstate-playerisdying.jpg" }}" />
</p>

O jogador fica impossibilitado de andar quando **debilitado**.

```cs
// ...
public class PlayerInputHandler : MonoBehaviour
{
    // ...

    void OnEnable()
    {
        // Ativações/Atribuições necessárias para o Input System
        PlayerInputAction.PlayerActions playerActions = Input.Player;
        // ...
        playerActions.Move.performed += ctx => {
            if (playerReviveController.State != ReviveState.Dying)
                playerCharacterController.Command_Move(ctx.ReadValue<Vector2>());
            playerReviveController.Command_CancelRevive();
        };
        playerActions.Move.canceled += ctx => playerCharacterController.Command_CancelMove();
        // ...
        Input.Enable();
    }
    
    // ...
}
```

Quando o jogador passa muito tempo **debilitado**, sem ter sucesso em ser **reanimado por outro jogador**: troca seu estado para "nada" (```ReviveState.None```); desliga a *flag* **online** que indica que está morrendo (pois agora morreu); e destrói seu objeto pelo **Photon Bolt** através do ```Health.Die()``` (abordo em [Dano/Morte](#danomorte)).

```cs
// ...
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    // ...

    void Update()
    {
        switch (State)
        {
            case ReviveState.Dying:
                if (Count <= 0f)
                {
                    State = ReviveState.None;
                    state.PlayerIsDying = false;
                    reviveHud.Clear();
                    health.Die();
                }
                else
                {
                    Count -= Time.deltaTime;
                }
                break;

            case ReviveState.Reviving:
                // ...
                break;
        }
    }
    
    // ...
}

```

## Ao Receber Dano

O método ```TryReceiveDamage()``` retorna ```true``` se o jogador estiver **morrendo** (**debilitado**) ou **renimando**. Do contrário, ```false```.

Para além disso, caso o jogador esteja **morrendo** ou **reanimando**, ele será atrapalhado de concluir o processo de **se manter vivo** ou **reanimar** por outro jogador. 

No código, o contador de tempo é decrementado caso esteja **morrendo** e incrementado caso esteja **renimando**. O contador é processado no método ```Update()```.

```cs
// ...
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    // Retorna TRUE se recebeu dano (ou seja, está renimando ou morrendo)
    public bool TryReceiveDamage()
    {
        switch (State)
        {
            case ReviveState.Dying:
                Count -= Time.deltaTime * 2f; return true;

            case ReviveState.Reviving:
                Count += Time.deltaTime * 2f; return true;
        }

        return false;
    }
    // ...
}
```

## Reanimar e Ser Reanimado

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-reanimar-e-ser-reanimado.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

Antes de explicar como é **ser reanimado**, é importante primeiro explicar como é **reanimar outro jogador**.

Quando o jogador está próximo suficiente de outro jogador **debilitado** e mantém a tecla ```F``` pressionada, o jogador começa o processo de **reanimar** o outro jogador **debilitado**.

Ao tentar **reanimar outro jogador**, o jogador olha para este outro jogador, aciona o contador com o tempo de **reanimar** e troca seu estado para **"reanimando"** (```ReviveState.Reviving```).

```cs
// ...
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    Health otherPlayerHealth;
    
    // ...
    public void Command_Revive()
    {
        Vector3 _pos = transform.position;

        foreach (Health h in battleManager.players)
        {
            if (Vector3.Distance(_pos, h.transform.position) <= reviveDistance)
            {
                if (h.GetComponent<PlayerReviveController>() && h.state.PlayerIsDying)
                {
                    otherPlayerHealth = h;
                    transform.LookAt(h.transform);
                    Vector3 _rot = transform.eulerAngles;
                    transform.eulerAngles = Vector3.up * _rot.y;
                    Count = timeToRevive;
                    State = ReviveState.Reviving;
                    break;
                }
            }
        }
    }
    
    public void Command_CancelRevive()
    {
        if (State == ReviveState.Reviving)
        {
            State = ReviveState.None;
            reviveHud.Clear();
        }
    }
    
    // ...
}
```

```cs
// ...
public class PlayerInputHandler : MonoBehaviour
{
    PlayerReviveController playerReviveController;
    // ...
    
    void Start()
    {
        // ...
        playerReviveController = GetComponent<PlayerReviveController>();
        // ...
    }
    
    void OnEnable()
    {
        // ...
        playerActions.Move.performed += ctx => {
            if (playerReviveController.State != ReviveState.Dying)
                playerCharacterController.Command_Move(ctx.ReadValue<Vector2>());
            playerReviveController.Command_CancelRevive();
        };
        
        // ...

        playerActions.Revive.performed += ctx => playerReviveController.Command_Revive();
        playerActions.Revive.canceled += ctx => playerReviveController.Command_CancelRevive();

        Input.Enable();
    }
    
    // ...
}
```

Quando o jogador consegue finalizar o processo de **reanimar outro jogador**, ele troca seu estado para "nada" (```ReviveState.None```) e replica **online** qual jogador que será reanimado (trocando o valor da variável ```state.PlayerReviveEntity```).

```cs
// ...
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    // ...

    void Update()
    {
        switch (State)
        {
            case ReviveState.Dying:
                // ...
                break;

            case ReviveState.Reviving:
                if (Count <= 0f)
                {
                    if (playerAnalytics)
                        playerAnalytics.revivedPlayers++;
                    state.PlayerReviveEntity = otherPlayerHealth.entity;
                    State = ReviveState.None;
                    reviveHud.Clear();
                }
                else
                {
                    Count -= Time.deltaTime;
                }
                break;
        }
    }
    
    // ...
}
```

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-photon-playerstate-playerrevive.jpg" }}" />
</p>

O trecho ```state.PlayerReviveEntity = otherPlayerHealth.entity;``` é muito importante, pois ele notifica a todos os jogadores que **jogador A reanimou jogador B** (```otherPlayerHealth.entity```). Isso foi feito junto da adição de um *callback*.

```cs
// ...
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    BattleManager battleManager;
    
    // ...
    
    public override void Attached()
    {
        battleManager = FindObjectOfType<BattleManager>();
        // ...

        if (entity.IsOwner && playerAnalytics)
        {
            battleManager.owner = health;
            // ...
        }

        state.AddCallback("PlayerReviveEntity", OnReviveEntityChange);
    }
```

O *callback* ```OnReviveEntityChange()``` chama o método para **reanimar o outro jogador**, mas já que ele só pode ocorrer no próprio cliente do jogador que seria **reanimado**, foi necessário fazer uma verificação que garantisse que o ```ReviveController.Revive()``` só seria chamado no cliente do **jogador que será reanimado**.

Se este método estiver ocorrendo no próprio cliente dono deste jogador, um **Coroutine** para anular o valor do ```state.PlayerReviveEntity``` será rodado para evitar *bugs*.

```cs
// ...
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    
    void OnReviveEntityChange()
    {
        BoltEntity reviveEntity = state.PlayerReviveEntity;

        if (reviveEntity != null)
        {
            if (entity.IsOwner)
            {
                StartCoroutine(AnnulReviveEntityLater());
                return;
            }

            Health _owner = battleManager.owner;

            if (reviveEntity == _owner.entity)
                _owner.ReviveController.Revive();
        }
    }
    
    IEnumerator AnnulReviveEntityLater()
    {
        yield return new WaitForSecondsRealtime(2f);
        state.PlayerReviveEntity = null;
    }
    
    // ...
}
```

Pronto! Agora que sabemos como é **reanimar outro jogador**, vamos ver como é **ser reanimado**.

Simplesmente a *flag* **online** que indica que está **morrendo** (**debilitado**) é desligada, o estado troca para "nada" (```ReviveState.None```) e o jogador é **reanimado** com ```30%``` da **vida**. Ah, e ele troca a rotação para não parecer mais que está deitado.

```cs
// ...
public class PlayerReviveController : EntityBehaviour<IKFCPlayerState>
{
    Health health;
    // ...
    
    public override void Attached()
    {
        // ...
        health = GetComponent<Health>();
        // ...
    }
    
    // ...
    
    public void Revive()
    {
        State = ReviveState.None;
        state.PlayerIsDying = false;
        if (playerAnalytics)
            playerAnalytics.revivedByPlayers++;
        reviveHud.Clear();
        transform.localEulerAngles = Vector3.zero;
        health.Revive();
    }
    
    // ...
}
```

```cs
public class Health : EntityBehaviour<IKFCPlayerState>
{
    float regenerationStartCount;
    
    // ...

    public void Revive()
    {
        state.PlayerHealth = Mathf.RoundToInt(maxHealth * 0.3f);
        regenerationStartCount = regenerationStartWaitTime / 2f;
    }
```

# IA e Movimentação de Inimigos

Antes de tudo, começarei com o *setup* inicial que abrange tanto a **IA** quanto a **movimentação online dos inimigos**.

- No método ```Start()```, ocorre o *setup* de cada componente necessário;
- No ```Attached()```, o ```transform``` do **inimigo** e de sua cabeça (para saber onde o **inimigo** está olhando) são atribuídas **online** pelo **Bolt** para que sua posição fique **online**, e é adicionado à lista de NPCs do ```BattleManager```;
- No ```Update()```, é alterada a velocidade da animação de **movimentação** com base na velocidade **online** do **inimigo** (```state.EnemySpeed```).

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Bolt;
using UnityEngine;

// ...

[RequireComponent(typeof(CharacterController), typeof(BoltEntity))]
public class EnemyCharacterController : EntityBehaviour<IKFCPlayerState>
{
    CharacterController controller;
    WeaponController weaponController;
    Animator animator;

    BattleManager battleManager;
    // ...
    Collider[] colliders;
    
    // ...
    
    [SerializeField] Transform enemyHead;
    
    // ...

    void Start()
    {
        controller = GetComponent<CharacterController>();
        weaponController = GetComponent<WeaponController>();
        animator = GetComponentInChildren<Animator>();
        colliders = GetComponentsInChildren<Collider>();
    }

    public override void Attached()
    {
        // Setar o transform do Bolt (online)
        state.SetTransforms(state.PlayerTransform, transform);
        state.SetTransforms(state.PlayerHeadTransform, enemyHead);

        battleManager = FindObjectOfType<BattleManager>();

        Health health = GetComponent<Health>();
        if (health)
            battleManager.NPCs.Add(health);
    }

    void Update()
    {
        if (animator)
            animator.SetFloat(animationSpeedFloatParameterName, state.EnemySpeed);
    }
    
    // ...
}
```

<p align="center">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-photon-playerstate-playertransforms.jpg" }}" />
</p>

A **inteligência artificial (IA) dos inimigos** simplesmente utiliza do conceito de **máquina de estado finita (FSM)** para determinar o **comportamento do inimigo**.

Os possíveis estados que o **inimigo** pode alcançar são:

- "Descansando" => ```EnemyState.Resting```
- "Lutando" => ```EnemyState.Fighting```
- "Voltando à Base" => ```EnemyState.BackingToBase```

A cada *frame* atualizado no cliente proprietário deste **inimigo** (que na prática é o *host*), são processadas as ações do **inimigo** relativo ao seu estado (```EnemyState enemyState```) e processado a gravidade da **movimentação** com uso do *fixed delta time* do **Bolt**.

```cs
public enum EnemyState : byte
{
    Resting,
    Fighting,
    BackingToBase
}

[RequireComponent(typeof(CharacterController), typeof(BoltEntity))]
public class EnemyCharacterController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    EnemyState enemyState;
    // ...
    Collider[] colliders;
    // ...
    bool isGrounded;
    
    // ...
    
    public Transform groundCheck; //usado para armazenar a posi??o do groundCheck no jogo
    public float groundDistance = 0.4f; // defini o raio de detec??o do algum objeto
    public LayerMask groundMask; // Utilizado para definir se um objeto sera reconhecido como ch?o, para saber se o personagem pode pular/ desacelerar a queda
    
    // ...
    
    public override void SimulateOwner()
    {
        switch (enemyState)
        {
            case EnemyState.Resting: 
                RestUpdate(); break;

            case EnemyState.Fighting:
                FightUpdate(); break;

            case EnemyState.BackingToBase:
                BackBaseUpdate(); break;
        }

        velocity.y += gravity * BoltNetwork.FrameDeltaTime;

        GroundCheck();

        controller.Move(velocity * BoltNetwork.FrameDeltaTime);
    }
    
    // ...
    
    private void GroundCheck()
    {
        Collider[] _colliders = Physics.OverlapSphere(groundCheck.position, groundDistance, groundMask);

        if (_colliders.Length <= colliders.Length)
        {
            int selfColliders = 0;

            foreach (Collider ca in _colliders)
            {
                foreach (Collider cb in colliders)
                {
                    if (ca == cb)
                    {
                        selfColliders++;
                        break;
                    }
                }
            }

            isGrounded = selfColliders != _colliders.Length;
        }
        else
        {
            isGrounded = _colliders.Length > 0;
        }

        if (isGrounded && velocity.y < 0)
            velocity.y = -2f;

    }
    
    // ...
}
```

O método ```GroundCheck()``` simplesmente faz o **inimigo** parar de cair se o colisor de detecção de chão colidiu com algo para além dos próprios colisores do **inimigo**.

## Processamento de Cada Estado do Inimigo

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estados-inimigo-pt.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

Agora, comentarei sobre cada método de atualização utilizado na **máquina de estado** da **IA do nosso inimigo**. Já expliquei como cada um desses métodos são chamados [logo acima](#ia-e-movimentação-de-inimigos).

### Método ```RestUpdate()```

O **```RestUpdate()```** é processado quando o **inimigo** está no estado "descansando" (```EnemyState.Resting```), que é justamente quando o **inimigo** está parado à espera de um adversário.

O **inimigo** tenta procurar um novo alvo e, caso encontre, trocará seu estado para "lutando".

```cs
// ...
public class EnemyCharacterController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    Health target;
    // ...
    public float startFightDistance = 1f;

    // ...
    
    void RestUpdate()
    {
        if (TryFindNewTarget())
            enemyState = EnemyState.Fighting;
    }
    
    // ...
    
    bool TryFindNewTarget()
    {
        Vector3 _position = transform.position;
        Health closerPlayer = null;
        float closerDistance = startFightDistance;

        foreach (Health h in battleManager.players)
        {
            float dist = Vector3.Distance(_position, h.transform.position);
            if (dist < closerDistance)
            {
                closerDistance = dist;
                closerPlayer = h;
            }
        }

        if (closerPlayer)
        {
            target = closerPlayer;
            return true;
        }

        return false;
    }
    
    // ...
}
```

O método ```TryFindNewTarget()``` procura por jogadores próximos no raio de ```startFightDistance```, sendo o jogador mais próximo, o novo alvo. Retorna ```true``` se conseguiu algum novo alvo, do contrário, ```false```.

### Método ```FightUpdate()```

O **```FightUpdate()```** é processado quando o **inimigo** está no estado "lutando" (```EnemyState.Fighting```). Neste estado, o **inimigo** está perseguindo ou atacando um alvo adversário (```Health target```).

O **inimigo** mantém-se constantemente olhando para seu alvo.

Se o **inimigo** estiver fora do alcance para atacar (```float followTargetToShotDistance```), ele anda reto (consequentemente em direção ao alvo) e salta à altitude do alvo se for necessário e possível. Se estiver no alcance, ele tenta atirar no alvo.

No entanto, se o **inimigo** não possuir nenhum alvo, ele tentará buscar um novo. Mas se não houver sucesso, ele passa para o estado "voltando à base", parando de perseguir e atacar *alguém*.

Apesar de estarmos falando de tiro, na prática, o *"tiro"* possui uma distância tão curta, que o ataque desferido pelo **inimigo** é corpo-a-corpo. Fizemos desta forma para testar e ganhar tempo, podendo ser substituído por um script propriamente para ataque corpo-a-corpo futuramente.

```cs
// ...
public class EnemyCharacterController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    Animator animator;
    // ...
    bool isGrounded;
    float jumpStartTime;
    // ...
    public float walkingSpeed = 6f;
    public float gravity = -9.81f;
    public float jumpHeight = 2f;
    public float jumpCooldown = 5f;
    public float jumpYDistanceTrigger = 1.3f;
    // ...
    public float followTargetToShotDistance = 5f;
    [SerializeField] Transform enemyHead;
    
    // ...
    
    void FightUpdate()
    {
        if (!target && !TryFindNewTarget())
        {
            enemyState = EnemyState.BackingToBase;
            return;
        }

        Transform targetTransform = target.transform;

        transform.LookAt(targetTransform);

        Vector3 _rot = transform.eulerAngles;
        transform.eulerAngles = Vector3.up * _rot.y;

        enemyHead.LookAt(targetTransform);

        float dist = Vector3.Distance(transform.position, targetTransform.position);

        if (dist > followTargetToShotDistance)
        {
            controller.Move(transform.forward * walkingSpeed * BoltNetwork.FrameDeltaTime);

            TryJump(targetTransform.position.y);

            if (animator)
                state.EnemySpeed = walkingSpeed;
        }
        else
        {
            if (animator)
                state.EnemySpeed = 0;
            weaponController.TryShoot();
        }
    }
    
    // ...
    
    void TryJump(float followTargetYPosition)
    {
        if (isGrounded && Time.time - jumpStartTime > jumpCooldown)
        {
            float yDiff = followTargetYPosition - transform.position.y;
            if (Mathf.Abs(yDiff) >= jumpYDistanceTrigger)
            {
                velocity.y = Mathf.Sqrt((Mathf.Max(yDiff, 0) * Random.Range(1f, 20f)) + jumpHeight * -2f * gravity);
                jumpStartTime = Time.time;
            }
        }
    }
    
    // ...
}
```

Em ```TryJump(float followTargetYPosition)```, o **inimigo** salta mais ou menos na altitude de seu alvo caso esteja no chão, dentro do tempo de espera e acima da distância mínima de altitude.

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-pulo-inimigo.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

### Método ```BackBaseUpdate()```

O **```BackBaseUpdate()```** é processado quando o **inimigo** está no estado "voltando à base" (```EnemyState.BackingToBase```). Neste estado, o **inimigo** está caminhando até sua base (```Transform baseTransform```), que é o local de onde o **inimigo** *spawnou*.

O **inimigo** mantém-se constantemente olhando para a base, anda em direção à base e salta se for necessário e possível.

Se o **inimigo** estiver próximo suficiente de sua base, ele passa para o estado "descansando" (```EnemyState.Resting```), parando de ir até a base.

```cs
// ...
public class EnemyCharacterController : EntityBehaviour<IKFCPlayerState>
{
    // ...
    
    void BackBaseUpdate()
    {
        if (!baseTransform || Vector3.Distance(transform.position, baseTransform.position) <= 1f)
        {
            enemyState = EnemyState.Resting;
            return;
        }

        transform.LookAt(baseTransform);
        Vector3 _rot = transform.eulerAngles;
        transform.eulerAngles = Vector3.up * _rot.y;

        TryJump(baseTransform.position.y);

        controller.Move(transform.forward * walkingSpeed * BoltNetwork.FrameDeltaTime);
    }
    
    // ...
}
```

# Telemetria

<!-- TODO: Postar print dos dados da telemetria (em um lugar oportuno desse tópico) -->

Este foi meu primeiro projeto com **coleta de telemetria**. No projeto, foi necessário selecionar alguma tecnologia especial para integrar com o jogo, e a equipe escolheu a **telemetria**. Com a **telemetria**, foi possível **obter dados** dos jogadores que testaram o jogo para adicionarmos as **informações coletadas** ao artigo científico que acompanharia o projeto no fim do período letivo. <!-- TODO: postar link para o artigo? -->

Considerando que a experiência atual do projeto se resume a apenas uma **partida**, os **dados de telemetria** são enviados assim que o jogador morre em partida.

```cs
public class Health : EntityBehaviour<IKFCPlayerState>
{
    // ...
    PlayerAnalytics playerAnalytics;
    
    // ...
    
    public void Die()
    {
        // Enviar analytics de morte se for jogador
        if (playerAnalytics)
            playerAnalytics.SendDieAnalytics();

        // Destruir objeto pelo Bolt se a vida foi zerada
        BoltNetwork.Destroy(gameObject);
    }
}
```

```cs
// ...
public class PlayerAnalytics : MonoBehaviour
{
    // ...
    
    public void SendDieAnalytics()
    {
        SendStatiscsAnalytics();
    }
    
    // ...
    
    void OnApplicationQuit()
    {
        SendStatiscsAnalytics();
    }
    
    // ...
}
```

Os **dados** também são enviados quando o jogador fecha o jogo.

## Dados Comuns

<p align="center"><a href="{{ "/assets/portfolio/kristian-frango-cabuloso-online-tabela-dados-comuns-tempo.png" }}" target="_blank">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-tabela-dados-comuns-tempo.png" }}" height="365" />
</a></p>

<p align="center"><a href="{{ "/assets/portfolio/kristian-frango-cabuloso-online-tabelas-interacao-jogadores.png" }}" target="_blank">
<img src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-tabelas-interacao-jogadores.png" }}" height="423" />
</a></p>

Bem, em ```SendStatiscsAnalytics()```, é possível observar os **dados** básicos e os **dados** de interação entre jogadores que são enviados para **telemetria**. O nome dos **dados** são bem autoexplicativos sobre suas definições.

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Analytics;

[RequireComponent(typeof(PlayerReviveController), typeof(WeaponController), typeof(NextPlayersAnalytics))]
public class PlayerAnalytics : MonoBehaviour
{
    public static string playerName;

    float startGameTime;
    
    // ...
    
    [HideInInspector] public int revivedPlayers;
    [HideInInspector] public int revivedByPlayers;

    [HideInInspector] public int kodByPlayers;
    [HideInInspector] public int kodByEnemies;

    [HideInInspector] public int shotsMade;

    [HideInInspector] public int hittedEnemies;
    [HideInInspector] public int killedEnemies;

    [HideInInspector] public int hittedPlayers;
    [HideInInspector] public int kodPlayers;

    void Start()
    {
        startGameTime = Time.time;
    }
    
    // ...

    void SendStatiscsAnalytics()
    {
        RefreshToNewMostTimeArea();

        int missShots = shotsMade - hittedPlayers - hittedEnemies;

        AnalyticsResult result1 = Analytics.CustomEvent("Dados basicos", new Dictionary<string, object>()
        {
            { "Nome do jogador", playerName },
            { "Posicao", transform.position },
            { "Tempo de jogo", Time.time - startGameTime },
            { "Area onde passou mais tempo", mostTimeAreaName },
        });
        print("Dados básicos | Resultado: " + result1);

        AnalyticsResult result2 = Analytics.CustomEvent("Interacao com jogadores", new Dictionary<string, object>()
        {
            { "Nome do jogador", playerName },
            { "Reanimado por jogadores", revivedByPlayers },
            { "Reanimou jogadores", revivedPlayers },
            { "Nocauteado por jogadores", kodByPlayers },
            { "Nocauteado por inimigos", kodByEnemies },
            { "Tiros nao acertados", missShots },
            { "Acerto em jogadores", hittedPlayers },
            { "Nocaute em jogadores", kodPlayers },
            { "Acerto em inimigos", hittedEnemies },
            { "Matou inimigos", killedEnemies }
        });
        print("Interação com jogadores | Resultado: " + result2);

        GetComponent<NextPlayersAnalytics>().FinishAndSendAnalytics();
    }
    
    // ...
}
```

Todos os **dados** são alterados durante a jogatina, quando o jogador faz ações específicas.

> Não exibirei cada trecho de código das implementações dos **dados** sendo engatilhados para não prolongar muito. Entretanto, as implementações são possíveis de se acessar em diversos outros sistemas postados aqui.

Para determinar a **área onde o jogador passou mais tempo** na partida (Dado: ```"Area onde passou mais tempo"``` \| Variável: ```string mostTimeAreaName```), foi necessário espalhar diversas áreas pelo cenário contendo o nome da área.

<p align="center">
<video src="{{ "/assets/portfolio/kristian-frango-cabuloso-online-estrutura-areas.mp4" }}" controls loop autoplay muted></video>
</p>

```cs
public class RegionArea : MonoBehaviour
{
    public string regionName;

    // Start is called before the first frame update
    void Start()
    {
        foreach (Collider c in GetComponentsInChildren<Collider>())
            c.isTrigger = true;
    }
}
```

Quando o jogador entrar em uma destas áreas, trocará a área atual e atualizará qual **área o jogador passou mais tempo**.

O método ```RefreshToNewMostTimeArea()``` verifica se o jogador está há mais tempo na área atual e, se estiver, troca a área que está há mais tempo pela área atual.

```cs
// ...
public class PlayerAnalytics : MonoBehaviour
{
    // ...
    string mostTimeAreaName;
    string currentAreaName;
    float mostTimeAreaTime;
    float currentStartAreaTime;
    
    // ...

    void RefreshToNewMostTimeArea()
    {
        float _time = Time.time - currentStartAreaTime;
        if (_time > mostTimeAreaTime)
        {
            mostTimeAreaTime = _time;
            mostTimeAreaName = currentAreaName;
        }
    }
    
    // ...

    void OnTriggerEnter(Collider c)
    {
        RegionArea area = c.GetComponentInParent<RegionArea>();
        if (area && area.regionName != currentAreaName)
        {
            RefreshToNewMostTimeArea();

            currentStartAreaTime = Time.time;
            currentAreaName = area.regionName;
        }
    }
    
    // ...
}
```

Revisando o código, pude concluir que há um problema: o jogador não acumula o tempo em que foi incrementando na área e, quando sai da área, o tempo é zerado. Este problema poderia ser facilmente resolvido se eu tivesse utilizado um dicionário para armazenar cada área usando seus nomes (```string```) como chave e o tempo (```float```) como valor.

## Dados Sobre Jogadores Próximos

<!-- TODO: Print dos dados sobre jogadores próximos -->

A pedido do *game designer*, criei um sistema à parte para **coleta de telemetria de jogadores próximos**. Esta **coleta de dados** consiste em saber o quanto o **jogador trabalhou em equipe com outros jogadores**.

O jogador possui vários grupos separados contendo seus respectivos **jogadores em que esteve próximo** ao longo da partida. Este grupo é a classe ```NextPlayersAnalyticsGroup```. O grupo também possui uma variável para saber por quanto tempo o jogador permaneceu neste grupo (```float totalTime```) para compor parte dos **dados** finais na **coleta**.

```cs
using System;
using System.Collections.Generic;

[System.Serializable]
public class NextPlayersAnalyticsGroup
{
    public List<Health> players = new List<Health>();
    public float totalTime;
}
```

Todo processamento e gerenciamento dos grupos de **jogadores** ocorre em ```Update()```.

- É realizada uma verificação para saber se há algum(ns) jogador(es) próximo(s) do jogador, fora do atual grupo, para assim adicioná-los.
- Se passou tempo suficiente para ocorrer troca de grupo (```float changeGroupTimeTolerance```), um novo grupo é criado caso algum jogador que já estava no grupo esteja distante ou nulo.
    - Este novo grupo passará a ser o grupo atual.
- Se não houver nenhum jogador no grupo atual, é incrementado tempo em que o **jogador está distante de outros jogadores** (```float distantFromPlayersTotalTime```).

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Analytics;

public class NextPlayersAnalytics : MonoBehaviour
{
    [SerializeField, Tooltip("Distânca mínima para considerar que o jogador está próximo de algum(ns) outro(s) jogador(es)")]
    float nextToPlayersMinimumDistance = 5f;
    [SerializeField, Tooltip("Tempo de intervalo para considerar que o jogador trocou de grupo, caso haja mudança nos membros do grupo")]
    float changeGroupTimeTolerance = 10f;

    BattleManager battleManager;

    List<NextPlayersAnalyticsGroup> nextPlayersAnalyticsGroups = new List<NextPlayersAnalyticsGroup>{ new NextPlayersAnalyticsGroup() };
    float currentGroupStartTime;

    float distantFromPlayersTotalTime;
    //bool emptyGroupFlag = true;

    void Start()
    {
        battleManager = FindObjectOfType<BattleManager>();
    }

    void Update()
    {
        NextPlayersAnalyticsGroup currentGroup = nextPlayersAnalyticsGroups[nextPlayersAnalyticsGroups.Count - 1];

        Vector3 _pos = transform.position;
        List<Health> closerPlayers = currentGroup.players;

        float currentGroupTimeCount = Time.time - currentGroupStartTime;

        // Verificar se é necessário remover algum jogador do grupo se o tempo de troca de grupo passou
        if (currentGroupTimeCount >= changeGroupTimeTolerance)
        {
            foreach (Health otherPlayer in closerPlayers)
            {
                if (otherPlayer == null || Vector3.Distance(_pos, otherPlayer.transform.position) > nextToPlayersMinimumDistance)
                {
                    // Iniciar um novo grupo
                    NextPlayersAnalyticsGroup newGroup = new NextPlayersAnalyticsGroup();
                    nextPlayersAnalyticsGroups.Add(newGroup);
                    currentGroup.totalTime = currentGroupTimeCount;
                    currentGroup = newGroup;
                    currentGroupStartTime = Time.time;
                    closerPlayers = newGroup.players;
                    break;
                }
            }
        }

        // Verificar se há algum jogador próximo
        foreach (Health otherPlayer in battleManager.players)
        {
            if (!closerPlayers.Contains(otherPlayer) && Vector3.Distance(_pos, otherPlayer.transform.position) <= nextToPlayersMinimumDistance)
                closerPlayers.Add(otherPlayer);
        }

        // Se não houver jogadores próximos (após operações que add/rem jogadores à lista)
        if (closerPlayers.Count == 0)
            distantFromPlayersTotalTime += Time.deltaTime;
    }
    
    // ...
}
```

Quando o processo é finalizado, os **dados** são tratados e enviados no método ```FinishAndSendAnalytics()```.

Novamente, o nome dos **dados** são autoexplicativos. O componente se desliga (em ```enabled = false;```) para que o processamento em ```Update()``` não ocorra mais.

```cs
public class NextPlayersAnalytics : MonoBehaviour
{
    // ...
    
    public void FinishAndSendAnalytics()
    {
        float nextToPlayersTotalTime = 0f;
        int maxNextPlayersCount = 0;
        int totalPlayers = 0;

        foreach (NextPlayersAnalyticsGroup group in nextPlayersAnalyticsGroups)
        {
            nextToPlayersTotalTime += group.totalTime;

            int _count = group.players.Count;
            totalPlayers += _count;

            if (_count > maxNextPlayersCount)
                maxNextPlayersCount = _count;
        }

        int groupsCount = nextPlayersAnalyticsGroups.Count;

        Dictionary<string, object> dict = new Dictionary<string, object>
        {
            {"Nome do jogador", PlayerAnalytics.playerName},
            {"Tempo total proximo de jogadores", nextToPlayersTotalTime},
            {"Media tempo proximo de jogadores", nextToPlayersTotalTime / groupsCount},
            {"Numero maximo de jogadores proximos", maxNextPlayersCount},
            {"Media numero de jogadores proximos", totalPlayers / groupsCount},
            {"Tempo total distante de jogadores", distantFromPlayersTotalTime},
        };
        AnalyticsResult result = Analytics.CustomEvent("Proximodade de jogadores", dict);
        print("Proximodade de jogadores | Resultado: " + result);
        string printMessage = "";
        foreach (KeyValuePair<string, object> k in dict)
        {
            printMessage += '\n' + k.Key + " : " + k.Value;
        }
        print(printMessage);

        enabled = false;
    }
}
```

Junto dos [Dados Comuns](#dados-comuns), os **dados sobre os jogadores próximos** são tratados e enviados quando o jogador morre ou fecha o jogo (como explicado no [início do tópico](#telemetria)).

```cs
[RequireComponent(typeof(PlayerReviveController), typeof(WeaponController), typeof(NextPlayersAnalytics))]
public class PlayerAnalytics : MonoBehaviour
{
    // ...
    
    void SendStatiscsAnalytics()
    {
        // ...
        GetComponent<NextPlayersAnalytics>().FinishAndSendAnalytics();
    }
    
    // ...
}
```

O **sistema de coleta de dados dos jogadores próximos ao jogador** possui dois problemas:

1. Os grupos não são reutilizado quando o **jogador se aproxima de um grupo de jogadores** no qual já se aproximou anteriormente, gerando lista de grupos muito extensas, consumindo mais memória da máquina;
2. Não é criado um grupo novo quando o **jogador se aproxima de mais jogadores** após o tempo de troca de grupo ter finalizado, deixando de criar grupos com a quantia de membros condizentes com a realidade.

Devido ao fato deste sistema ter sido implementando próximo dos dias de entrega do projeto, acabei não conseguindo tempo para tais correções/otimizações. Inclusive, no escopo do projeto, não se mostrou necessário saber com quais **jogadores** específicos **estavam próximos do jogador** durante a partida. Considerando como o projeto está atualmente funcionando, o sistema provavelmente demandaria uma simplificação, talvez dispensando o agrupamento de jogadores.

# Outros

- **Movimentação/Controle do jogador;**
    - O processamento dos *inputs* com a **movimentação do jogador** é realizada a cada *frame* no cliente dono do dito **jogador**.
- **Codificação das HUDs;**
- **Implementação de assets:** Telas, HUDs, modelo 3D e animação do frango zumbi.

# Lições Aprendidas

Para além de ter utilizado **Photon Bolt** e **coleta de dados com Unity Analytics** pela primeira vez, neste projeto, pude observar o quão importante pode ser o *play test* de outras pessoas. Muitos dados interessantes foram gerados para o artigo.

Me propus a ser mais **proativo** neste projeto, o que trouxe um resultado que considero satisfatório. E novamente, a realização de testes se mostra muito necessário em muitos projetos, mas é importante principalmente em projetos que envolvem o lado mais humano: como um jogo de **multijogadores** (**online**) e com **coleta de dados dos jogadores**.
