---
title: "Eris Online"
layout: portfolio
category: Graduação
order: 2
media_paths: [ CjY80Qu6x0A, /assets/portfolio/eris-online-media-0.png, /assets/portfolio/eris-online-media-1.png, /assets/portfolio/eris-online-media-2.png, /assets/portfolio/eris-online-media-3.png, /assets/portfolio/eris-online-media-4.png, /assets/portfolio/eris-online-media-5.png, /assets/portfolio/eris-online-media-6.png, /assets/portfolio/eris-online-media-7.png ]
media_thumbnail_paths: [ /assets/portfolio/eris-online-thumbnail-0.png ]
role: Programador
frame_time: 4
team_size: 25
year: 2020
engine: Unity
prog_language: C#
web_pages: [ https://infinity-door.itch.io/eris-online ]
web_page_types: [ itch.io ]

description: |
    **RPG online (MMORPG)** que possibilita um jogador se conectar com outros jogadores e batalhar contra inimigos.
    
    Meu primeiro projeto de **jogo online**. Projeto realizado para o **TCP III**.
---

# Introdução

Assumi a responsabilidade de programar um **jogo online** do gênero **MMORPG** ao lado de mais 4 programadores, sendo minhas atuações no projeto focadas na **implementação de soluções de interação online, combate e autenticação (login/registro)**.

Este projeto foi iniciado alguns meses antes da pandemia de Covid-19. Quando ocorreu o lockdown, suspendemos o projeto e o retomamos junto com as aulas na graduação quando retomadas remotamente.

Projeto desenvolvido para a disciplina **TCP III** (Trabalho de Conclusão de Período III) da graduação de **Jogos Digitais do IFRJ Campus Eng. Paulo de Frontin**. O **TCP III** vigente consistia no dever de produzir e apresentar um **jogo online** ao final da disciplina na graduação.

A equipe do projeto é composta por todos os alunos do **TCP III** vigente. O produtor foi selecionado pelo orientador em consenso com os alunos da turma. O gestor foi selecionado pelo orientador. A equipe conta com 25 membros, 5 destes membros atuavam como **programadores**. [Os créditos podem ser acessados na página do itch.io](https://infinity-door.itch.io/eris-online){:target="_blank"}.

Este foi meu primeiro projeto realizado com uma **equipe com mais de vinte pessoas** e de **jogo online** (inclusive meu primeiro com uso de **Photon (PUN)**). Trabalhei neste projeto em paralelo a outro projeto, sendo um projeto de *startup* de outros alunos da faculdade. <!-- TODO: Inserir link/menção para o dito projeto -->

# Interação Online com Photon PUN

<p align="center">
<video src="{{ "/assets/portfolio/eris-online-interacao-online.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

Eu e outros programadores do projeto decidimos que utilizaríamos o **Photon PUN** como solução para que a **interação online** no jogo seja facilitada, também possibilitando utilizar os **servidores** gratuitos disponibilizados pela **Photon** para o jogo.

Feito isto, devido ao fato de ser meu primeiro projeto utilizando **Photon** (incluindo **PUN**), fiz as configurações e integrações do **Photon** seguindo tutoriais da internet e a documentação do **Photon**. Os códigos que possibilitam as **interações online** são surpreendentemente simples. Foi necessário um código para os ***callbacks* do Photon** (```NetworkController```), **menu de autenticação** (```AuthenticationController```) e ***setup* em cena de jogo** (```NetworkSetup```)

Classe ```NetworkController``` - Ouve os *callbacks* do **Photon**, sendo utilizado para inicializar a conexão com o **Photon** assim que o jogador acessa o menu inicial. Código abaixo:

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Photon.Pun;

/// <summary>
/// Controlador do Photon.
/// Aqui é decidido tudo que acontecerá relacionado à conexão com a internet usando Photon.
/// <see href="https://youtu.be/02P_mrszvzY">Vídeo de referência</see>
/// </summary>
public class NetworkController : MonoBehaviourPunCallbacks
{
    // Start is called before the first frame update
    void Start()
    {
        PhotonNetwork.ConnectUsingSettings();
    }

    public override void OnConnectedToMaster()
    {
        print("Conectado com o servidor da região " + PhotonNetwork.CloudRegion + "!");
    }
}
```

Classe ```AuthenticationController``` - Parte que lida com a autenticação do jogo sendo acessado através de uma IU. Os trechos destacados do código abaixo são passos que conecta o jogador ao mundo do jogo através do **Photon** (a parte de autenticação comento no tópico [Autenticação](#autenticação)):

```cs
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Photon.Pun;
using Photon.Realtime;

public class AuthenticationController : MonoBehaviourPunCallbacks
{
    // ...
    
    void CreateRoom()
    {
        print("Criando sala...");
        int randomRoomNumber = Random.Range(0, 100);
        RoomOptions roomOpts = new RoomOptions() { IsVisible = true, IsOpen = true, MaxPlayers = 20 };
        PhotonNetwork.CreateRoom("Sala " + randomRoomNumber, roomOpts);
        print("Número da sala: " + randomRoomNumber);
    }

    public void CommandWarningConfirm()
    {
        if (sucessWarningFlag)
        {
            PhotonNetwork.JoinRandomRoom();
            okButton.interactable = false;
        }
        else
        {
            warningWindowRoot.SetActive(false);
        }
    }
    
    // ...
    
    public void CommandWarningConfirm()
    {
        if (sucessWarningFlag)
        {
            PhotonNetwork.JoinRandomRoom();
            okButton.interactable = false;
        }
        else
        {
            warningWindowRoot.SetActive(false);
        }
    }
    
    // ...
    
    public override void OnConnectedToMaster()
    {
        connectedToPhotonFlag = true;
        if (warningWindowRoot.activeSelf && sucessWarningFlag)
            okButton.interactable = true;
        PhotonNetwork.AutomaticallySyncScene = true;
    }

    public override void OnJoinRandomFailed(short returnCode, string message)
    {
        print("Falha ao entrar em sala aleatória.\n" + message + "\n" + returnCode);
        CreateRoom();
    }

    public override void OnCreateRoomFailed(short returnCode, string message)
    {
        print("Falha ao criar sala aleatória.\n" + message + "\n" + returnCode);
        print("Tentando novamente...");
        CreateRoom();
    }

    public override void OnJoinedRoom()
    {
        print("Entrou na sala.");

        if (PhotonNetwork.IsMasterClient)
        {
            print("Iniciando jogo...");
            PhotonNetwork.LoadLevel(multiplayerSceneIndex);
        }
    }
}
```

Classe ```NetworkSetup``` - Classe de inicialização da parte **online** da cena principal do jogo (onde ocorre o jogo), onde *spawna* o jogador no mundo **online** no ponto especificado na cena da **Unity**. Código abaixo:

```cs
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Photon.Pun;
using System.IO;

public class NetworkSetup : MonoBehaviour
{
    [SerializeField] Transform playerSpawnPoint;

    // Start is called before the first frame update
    void Start()
    {
        CreatePlayer();
    }

    void CreatePlayer()
    {
        print("Criando jogador...");
        //PhotonNetwork.Instantiate(Path.Combine("PhotonPrefabs", "Bear"), new Vector3(Random.Range(-2f, 2f), 1f, Random.Range(-2f, 2f)), Quaternion.identity);
        PhotonNetwork.Instantiate(Path.Combine("PhotonPrefabs", "Bear"), playerSpawnPoint.position, playerSpawnPoint.rotation);
    }
}
```

# Autenticação

<p align="center">
<video src="{{ "/assets/portfolio/eris-online-autenticacao.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

> Apesar de eu ter sido o primeiro a desenvolver este sistema para este projeto, o mesmo posteriormente passou por muitas alterações feitas por outro programador, inclusive adicionando uma *feature*. Os trechos de código que exibo em meu portfólio são trechos que eu mesmo escrevi.

O sistema de **autenticação** era uma das exigência do orientador do projeto. Novamente, por nunca ter desenvolvido um sistema de **autenticação na Unity** antes, fui atrás de tutorial na internet. No conteúdo dos tutoriais que encontrei, constava que eu deveria enviar e receber dados pelo **código do jogo** para um **arquivo PHP no servidor remoto FTP**.

Resumindo os passos:

1. Hospedar um **servidor FTP**;
2. Criar **códigos PHP** que tratam os **campos** preenchidos pelo jogador no **jogo**;
3. Enviar os **códigos PHP** para o **servidor FTP**;
4. Preencher os **campos** no **arquivo PHP** através do **código do jogo**;
5. Aguardar resposta do servidor (no **código do jogo**);
6. Tratar tal resposta da maneira devida **no jogo**.

## Hospedagem do Servidor FTP

Felizmente, devido o fato de eu ter brincado um pouco com manuseio de **servidor remoto FTP** quando adolescente, de imediato pensei no uso do **FileZilla** como software para envio dos arquivos remotos, e do **000webhost** (assinatura gratuito) para serviço de hospedagem do **servidor remoto**. Apesar do tutorial também guiar nesse tópico, era possível tomar as rédeas usando conhecimento prévio.

## Códigos PHP (Servidor Remoto)

O **código PHP** foi confeccionado usando o tutorial como base, também pesquisando conteúdo sobre **programação em PHP**. Há um script tanto para **login** quanto para  **registro**.


<!-- TODO: Tentar acessar o servidor FTP com mais afinco e corrigir o necessário aqui -->

> Atualmente não consigo mais acessar o **servidor remoto FTP** do projeto, então estas versões dos **scripts PHP** podem não corresponder com a versão mais atual presente no servidor.

```php
<?php
    // login.php
    
    if (isset($_POST["username"]) && !empty($_POST["username"]) &&
    isset($_POST["password"]) && !empty($_POST["password"])){

        Login($_POST["username"], $_POST["password"]);
    }
    else{
        echo "start_error";
    }

    function Login($username, $password){
        $conn = new mysqli("localhost", "userdb", "password", "playerdb");

        $sql = "SELECT id FROM player WHERE username='".$username."' AND password='".$password."' LIMIT 1;";// AND password=?";
        $result = $conn->query($sql);

        echo "SERVER: erro, nome de usuario ou senha incorretos.";
        exit();*/
        if($result->num_rows > 0){
            $row = $result->fetch_row();
            echo $row[0];
        }else{
            echo "SERVER: Erro, crendenciais incorretas.";
        }

        $conn->close();
    }

?>
```

```php
<?php
    // register.php
    
    if (isset($_POST["username"]) && !empty($_POST["username"]) &&
        isset($_POST["password"]) && !empty($_POST["password"])){

            Register($_POST["username"], $_POST["password"]);
    }
    else{
        echo "start_error";
    }

    function Register($username, $password){
        $conn = new mysqli("localhost", "userdb", "password", "playerdb");

        $sql = "SELECT username FROM player WHERE username='".$username."';";// AND password=?";

        $result = $conn->query($sql);

        if($result->num_rows > 0){
            echo "SERVER: Erro, usuario ja existe.";
        }
        else{
            $sql = "INSERT INTO player (username, password) VALUES ('".$username."', '".$password."');";// SELECT SCOPE_IDENTITY();";
            if ($conn->query($sql) == TRUE){
                $id = $conn->insert_id;
                echo $id;
                exit();
            }
            echo "SERVER: Erro: ".$conn->error;
        }

        $conn->close();
    }

?>
```

Como é possível observar nos códigos, também foi necessário mexer com **banco de dados**. Fiz um **banco de dados** básico apenas para realização da **autenticação**, aproveitando do fato do **000webhost** também possibilitar manipular **banco de dados** através de sua plataforma online. Conforme o projeto foi evoluindo, eu e outro programador trabalhamos em adicionar, remover ou editar as tabelas no **banco de dados**.

Os **códigos PHP** posteriormente são enviados para o **servidor remoto FTP** através do **FileZilla**.

## Código C# (Unity)

A **parte C# do código** faz uso de utilitários da **Unity** para preencher formulários no nosso **servidor remoto**, são eles ```WWW``` e ```WWWForms```. Utilizei os **coroutines** para aguardar as respostas do servidor remoto. Esta parte também foi feita seguindo o tutorial apesar do código estar adaptado para se integrar com a IU do jogo.

```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Photon.Pun;
using Photon.Realtime;

public class AuthenticationController : MonoBehaviourPunCallbacks
{
    [Header("General Settings")]
    [SerializeField] string url;
    [SerializeField] int multiplayerSceneIndex;

    [Header("Auth. Window")]
    [SerializeField] InputField userField;
    [SerializeField] InputField passField;

    [Header("Warning/Loading Window")]
    [SerializeField] GameObject warningWindowRoot;
    [SerializeField] Button okButton;
    // ...

    bool connectedToPhotonFlag;
    bool sucessWarningFlag;

    enum WarningType { Sucess, Fail, Cancel, None };


    IEnumerator Login()
    {
        WWWForm form = new WWWForm();
        form.AddField("username", userField.text);
        form.AddField("password", passField.text);

        WWW w = new WWW(url + "login.php", form);
        yield return w;

        if (w.error != null)
        {
            WarningMessage("Erro no servidor. Tente novamente.", WarningType.Fail);
        }
        else if (w.isDone)
        {
            if (w.text.Contains("Erro"))
                WarningMessage("Nome de usuário ou senha inválido.", WarningType.Fail);
            else
                WarningMessage("Bem-vindo(a), " + userField.text + "!", WarningType.Sucess);
        }

        w.Dispose();
    }

    IEnumerator Register()
    {
        WWWForm form = new WWWForm();
        form.AddField("username", userField.text);
        form.AddField("password", passField.text);

        WWW w = new WWW(url + "register.php", form);
        yield return w;

        if (w.error != null)
            WarningMessage("Erro no servidor. Tente novamente.", WarningType.Fail);
        else if (w.isDone)
        {
            if (w.text.Contains("Erro"))
                WarningMessage("Não foi possível cadastrar.\nUsuário já está cadastrado.", WarningType.Fail);
            else
                WarningMessage("Bem-vindo(a), " + userField.text + "!", WarningType.Sucess);
        }

        w.Dispose();
    }

    void CreateRoom()
    {
        print("Criando sala...");
        int randomRoomNumber = Random.Range(0, 100);
        RoomOptions roomOpts = new RoomOptions() { IsVisible = true, IsOpen = true, MaxPlayers = 20 };
        PhotonNetwork.CreateRoom("Sala " + randomRoomNumber, roomOpts);
        print("Número da sala: " + randomRoomNumber);
    }

    public void CommandLogin()
    {
        WarningMessage("Conectando ao servidor...", WarningType.Cancel);
        StartCoroutine(Login());
    }

    public void CommandRegister()
    {
        WarningMessage("Conectando ao servidor...", WarningType.Cancel);
        StartCoroutine(Register());
    }

    public override void OnConnectedToMaster()
    {
        connectedToPhotonFlag = true;
        if (warningWindowRoot.activeSelf && sucessWarningFlag)
            okButton.interactable = true;
        PhotonNetwork.AutomaticallySyncScene = true;
    }

    public override void OnJoinRandomFailed(short returnCode, string message)
    {
        print("Falha ao entrar em sala aleatória.\n" + message + "\n" + returnCode);
        CreateRoom();
    }

    public override void OnCreateRoomFailed(short returnCode, string message)
    {
        print("Falha ao criar sala aleatória.\n" + message + "\n" + returnCode);
        print("Tentando novamente...");
        CreateRoom();
    }

    public override void OnJoinedRoom()
    {
        print("Entrou na sala.");

        if (PhotonNetwork.IsMasterClient)
        {
            print("Iniciando jogo...");
            PhotonNetwork.LoadLevel(multiplayerSceneIndex);
        }
    }

    // ...

    public void CommandWarningConfirm()
    {
        if (sucessWarningFlag)
        {
            PhotonNetwork.JoinRandomRoom();
            okButton.interactable = false;
        }
        else
        {
            warningWindowRoot.SetActive(false);
        }
    }

    public void CommandWarningCancel()
    {
        StopAllCoroutines();
        warningWindowRoot.SetActive(false);
    }
}
```

# Combate

<p align="center">
<video src="{{ "/assets/portfolio/eris-online-combate.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

O **sistema de combate** é muito simples: O jogador ataca seu alvo com base em seus parâmetros, e o inimigo faz o mesmo. Um ataque é desferido a cada segundo de intervalo (parâmetro de ataque: tempo de espera). Infelizmente o sistema não ficou muito polido e careceu de testes, o que levou a possuir alguns *bugs*. A parte mais desafiadora foi conseguir fazer o **sistema de combate** funcionar **online**.

## Parâmetros de Combate

<p align="center">
<img src="{{ "/assets/portfolio/eris-online-parametros.jpg" }}" />
</p>

Antes de explicar como funciona a [interação em combate](#interação-em-combate), vou explicar como funciona os **parâmetros do jogo utilizado em combate**.

A classe ```Parameters``` possui os **parâmetros** que um jogador, inimigo ou NPC podem possuir. Há alguns momentos do jogo que estes **parâmetros** são utilizados.

```cs
public class Parameters : MonoBehaviour
{
    // Status do Personagem
    public FloatMultiplierParameter power;

    public IntMultiplierParameter vitality;

    public IntMultiplierParameter technology;

    IntParameter levelUp = new IntParameter(); // Agora não me lembro de cabeça como é a interação desse parâmetro

    // Combate
    public FloatParameter baseDamage;

    public int health;

    public IntParameter maxHealth;
    public IntParameter skillPoint;

    private void Awake()
    {
        power.Setup(baseDamage);
        vitality.Setup(maxHealth);
        technology.Setup(skillPoint);


        if (health <= 0)
            health = maxHealth.value;
    }
}
```

Cada **parâmetro** possui um tipo de classe para definí-los, que são: ```IntParameter```, ```FloatParameter```, ```IntMultiplierParameter``` e ```FloatMultiplierParameter```.

Os ```IntParameter``` e ```FloatParameter``` são **parâmetros** simples. A classe possibilita obter o valor (valor correto), valor bruto (valor sem alterações), valor de ganho (apenas a alteração de valor), valor ganho por *buff* (apenas a alteração de valor realizada através de *buffs*) e valor ganho por parâmetro (apenas a alteração de valor realizada através de outros parâmetros).

```cs
[System.Serializable]
public class IntParameter
{
    public int value { get => bruteValue + gainValue; } // Valor total do parâmetro, considerando todos os ganhos

    public int bruteValue { set => SetBruteValue(value); get => _bruteValue; } // Valor do parâmetro sem nenhum ganho
    [SerializeField] private int _bruteValue;

    public int gainValue { get => parameterGain + buffGain; } // Apenas ganhos no parâmetro, que forma o value (valor total)

    public int parameterGain { set => SetParameterGain(value); get => _parameterGain; } // Alterações no parâmetro feitos atravez de outros parâmetros
    private int _parameterGain;

    public int buffGain { set => SetBuffGain(value); get => _buffGain; } // Alterações no parâmetro feitas atravez de buffs
    private int _buffGain;

    protected virtual void Refresh() { }

    public void SetBruteValue(int value)
    {
        _bruteValue = value;
        Refresh();
    }

    public void SetParameterGain(int parameterGain)
    {
        _parameterGain = parameterGain;
        Refresh();
    }

    public void SetBuffGain(int buffGain)
    {
        _buffGain = buffGain;
        Refresh();
    }
}
```

```cs
[System.Serializable]
public class FloatParameter
{
    public float value { get => bruteValue + gainValue; } // Valor total do parâmetro, considerando todos os ganhos

    public float bruteValue { set => SetBruteValue(value); get => _bruteValue; } // Valor do parâmetro sem nenhum ganho
    [SerializeField] private float _bruteValue;

    public float gainValue { get => parameterGain + buffGain; } // Apenas ganhos no parâmetro, que forma o value (valor total)

    public float parameterGain { set => SetParameterGain(value); get => _parameterGain; } // Alterações no parâmetro feitos atravez de outros parâmetros
    private float _parameterGain;

    public float buffGain { set => SetBuffGain(value); get => _buffGain; } // Alterações no parâmetro feitas atravez de buffs
    private float _buffGain;

    protected virtual void Refresh() { }

    public void SetBruteValue(float value)
    {
        _bruteValue = value;
        Refresh();
    }

    public void SetParameterGain(float parameterGain)
    {
        _parameterGain = parameterGain;
        Refresh();
    }

    public void SetBuffGain(float buffGain)
    {
        _buffGain = buffGain;
        Refresh();
    }
}
```

Os ```IntMultiplierParameter``` e ```FloatMultiplierParameter``` são **parâmetros** (inclusive herdam de ```IntParameter``` e ```FloatParameter```) que alteram outro **parâmetro** multiplicando o seu próprio valor por um número determinado na **interface da Unity**. Útil para criar **parâmetros** que alteram outros **parâmetros** com alguma multiplicação.

```cs
[System.Serializable]
public class IntMultiplierParameter : IntParameter
{
    [SerializeField] int multiplyAmount;
    IntParameter parameterToMultiply;

    int lastValue;

    public void Setup(IntParameter parameterToMultiply)
    {
        this.parameterToMultiply = parameterToMultiply;
        Refresh();
    }

    protected override void Refresh()
    {
        int newValue = value * multiplyAmount;
        parameterToMultiply.parameterGain -= lastValue;
        parameterToMultiply.parameterGain += newValue;
        lastValue = newValue;
    }
}
```

```cs
[System.Serializable]
public class FloatMultiplierParameter : FloatParameter
{
    [SerializeField] float multiplyAmount;
    FloatParameter parameterToMultiply;

    float lastValue;

    public void Setup(FloatParameter parameterToMultiply)
    {
        this.parameterToMultiply = parameterToMultiply;
        Refresh();
    }

    protected override void Refresh()
    {
        float newValue = value * multiplyAmount;
        parameterToMultiply.parameterGain -= lastValue;
        parameterToMultiply.parameterGain += newValue;
        lastValue = newValue;
    }
}
```

O maior problema foi o fato de existir uma versão ```int``` e ```float```, talvez eu devesse trabalhar apenas com ```float``` e criar uma *flag* para decidir se usaria o ponto flutuante ou não. A multiplicação é muito interessante, mas hoje considero que ela deveria ter suas regras realizadas em um *singleton* com acesso à regras realizadas através do uso da **Unity** (como uso de **ScriptableObjects**). Como é de se observar, os parâmetros também não são **online**, eles simplesmente são alterados no projeto, dispensando a necessidade fazê-lo ser **online**.

## Interação em Combate

As **interações no combate** ocorrem entre os **objetos interagíveis** (```InteractibleObject```), objetos estes que podem ser tanto o jogador, quanto os inimigos (```EnemyInteractible```), quanto os NPCs. Os **objetos interagíveis** são sincronizados **online**, possuem um ataque básico (```Attack normalAttack```) e um time (```byte team```) para decidir quem pode atacá-lo em **combate**.

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Pun;
using UnityEngine;

[RequireComponent(typeof(Parameters), typeof(PhotonView))]
public class InteractibleObject : MonoBehaviour
{
    [Tooltip("Time no qual este objeto pertence. Isso impede que outro objeto do mesmo time ataque este objeto.")]
    public byte team;

    public Attack normalAttack;


    [HideInInspector] public Parameters parameters;
    public PhotonView pv { private set; get; }

    protected virtual void Awake()
    {
        parameters = GetComponent<Parameters>();
        pv = GetComponent<PhotonView>();
    }

    public virtual void TakeDamage(float damageAmount, InteractibleObject fromDamage)
    {
        TakeDamage(damageAmount);
    }

    public virtual void TakeDamage(float damageAmount)
    {
        pv.RPC("RPC_TakeDamage", RpcTarget.All, damageAmount);
    }

    [PunRPC]
    protected void RPC_TakeDamage(float damageAmount)
    {
        if (!pv.IsMine)
            return;

        parameters.health -= (int)damageAmount;
        print(gameObject.name + " recebeu " + damageAmount + " dano.\nVida: " + parameters.health);
        if (parameters.health <= 0)
            OnDie();
    }

    public virtual void OnDie()
    {
        // Toca a animação, creio eu; e é destruído+
        PhotonNetwork.Destroy(gameObject);
    }
}
```

Os inimigos possuem sua própria versão do ```InteractibleObject```, que é o ```EnemyInteractible```. Ela altera o que ocorre quando o inimigo recebe dano (em ```void TakeDamage```) e quando morre (em ```void OnDie```).

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Pun;
using UnityEngine;

[RequireComponent(typeof(EnemyController))]
public class EnemyInteractible : InteractibleObject
{
    EnemyController enemy;


    protected override void Awake()
    {
        base.Awake();

        enemy = GetComponent<EnemyController>();
    }

    public override void TakeDamage(float damageAmount, InteractibleObject fromDamage)
    {
        print("INIMIGO RECEBEU DANO");
        if (pv.IsMine)
            enemy.OnTakeDamage(fromDamage);

        base.TakeDamage(damageAmount, fromDamage);
    }

    public override void OnDie()
    {
        // Contar como inimigo morto se for um inimigo e tiver um spawnerOwner
        if (enemy.spawnerOwner)
        {
            enemy.spawnerOwner.OnKillEnemy(gameObject);
        }
        else
        {
            base.OnDie();
        }
    }
}
```

Confesso que a existência do ```EnemyInteractible``` seria dispensável se eu tivesse utilizado delegados (talvez **UnityAction**) e essas alterações fossem realizadas sendo adicionadas aos delegados por meio do script do inimigo. A **interação de combate** especificamente dos inimigos, eu abordo em [Inimigos](#inimigos).

E claro, o que seria a **interação em combate** sem o ataque? Um ataque só pode ser desferido se estiver próximo e pronto (dentro do tempo de recarga). Também é possível atacar em área.

```cs
public class Attack : MonoBehaviour
{
    [SerializeField] AttackFloatParameter damage;
    [SerializeField] AttackFloatParameter range;
    [SerializeField] float cooldown;
    public AreaOverlap damageArea;

    bool isCooldown = false;

    public bool AttackIfCan(InteractibleObject fromInteractible, InteractibleObject targetInteractible, AttackTargetType targetType = AttackTargetType.Enemy)
    {
        if (damageArea)
            return AreaAttackIfCan(fromInteractible, targetInteractible.transform.position, targetType);
        return SingleAttackIfCan(fromInteractible, targetInteractible);
    }

    public bool AreaAttackIfCan(InteractibleObject fromInteractible, Vector3 targetPos, AttackTargetType targetType = AttackTargetType.Enemy)
    {
        if (!damageArea)
        {
            Debug.LogError("Não foi possível tentar atacar porque não existe um damageArea.");
            return false;
        }
        if (!isCooldown && Vector3.Distance(fromInteractible.transform.position, targetPos) <= GetRange())
        {
            fromInteractible.transform.rotation = Quaternion.LookRotation(targetPos, fromInteractible.transform.up);
            //fromInteractible.transform.LookAt(targetPos);
            AreaAttack(fromInteractible, targetType);
            return true;
        }
        return false;
    }

    public bool SingleAttackIfCan(InteractibleObject fromInteractible, InteractibleObject targetInteractible)
    {
        if (!isCooldown && Vector3.Distance(fromInteractible.transform.position, targetInteractible.transform.position) <= GetRange())
        {
            SingleAttack(fromInteractible, targetInteractible);
            return true;
        }
        return false;
    }

    void SingleAttack(InteractibleObject fromInteractible, InteractibleObject targetInteractible)
    {
        fromInteractible.transform.rotation = Quaternion.LookRotation(targetInteractible.transform.position, Vector3.up);
        //fromParameters.transform.LookAt(targetInteractible.transform.position);
        targetInteractible.TakeDamage(GetDamage(fromInteractible.parameters), fromInteractible);
        StartCoroutine(StartCooldown());
    }

    void AreaAttack(InteractibleObject fromInteractible, AttackTargetType targetType)
    {
        Parameters parameters = fromInteractible.parameters;
        foreach (InteractibleObject hittedObject in damageArea.FilteredOverlap(fromInteractible.team, targetType))
        {
            hittedObject.TakeDamage(GetDamage(parameters), fromInteractible);
        }
        StartCoroutine(StartCooldown());
    }

    IEnumerator StartCooldown()
    {
        isCooldown = true;
        yield return new WaitForSeconds(cooldown);
        isCooldown = false;
    }

    public float GetDamage(Parameters fromParameters = null)
    {
        if (!fromParameters || damage.ignoreExternalParameterChanges)
            return damage.parameterValue;
        return fromParameters.baseDamage.value + damage.parameterValue;
    }

    public float GetRange()
    {
        return range.parameterValue;
    }
}
```

```cs
[System.Serializable]
public class AttackFloatParameter
{
    public float parameterValue;
    public bool ignoreExternalParameterChanges;
}
```

```cs
public enum AttackTargetType { Ally, Enemy, Neutral, All };

public class AreaOverlap : MonoBehaviour
{
    // ...
    
    public List<InteractibleObject> FilteredOverlap(byte fromTeam, AttackTargetType targetDamageableType)
    {
        List<InteractibleObject> filteredTargets = new List<InteractibleObject>();
        Collider[] targets = Physics.OverlapSphere(GetPoint().position, areaSize);
        for (int i = 0; i < targets.Length; i++)
        {
            InteractibleObject currTarget = targets[i].GetComponent<InteractibleObject>();
            if (currTarget == null)
                continue;
            if ((targetDamageableType == AttackTargetType.All) || (targetDamageableType == AttackTargetType.Ally && (fromTeam == currTarget.team && currTarget.team != 0))
                || (targetDamageableType == AttackTargetType.Enemy && (fromTeam != currTarget.team) && currTarget.team != 0) || (targetDamageableType == AttackTargetType.Neutral && currTarget.team == 0))
                filteredTargets.Add(currTarget);
        }
        return filteredTargets;
    }
    
    // ...
}
```

Agora, a **interação** do jogador com os inimigos. Ao clicar com o botão direito do *mouse*, um alvo é definido para o combate, e enquanto este alvo permanecer, o jogador tentará atacá-lo.

```cs
using UnityEngine;
using System.Collections;
using Photon.Pun;

[RequireComponent(typeof(InteractibleObject))]
public class PlayerController : MonoBehaviour
{
    [SerializeField] LayerMask attackClickLayerMask;

    // ...

    InteractibleObject interactible;
    [SerializeField] InteractibleObject combatTarget;

    // ...

    
    void Update()
    {
       if (!photonView.IsMine)
        {
            return;
        }

        // ...

        if (Input.GetMouseButtonUp(1))
        {
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit;
            if (Physics.Raycast(ray, out hit, Mathf.Infinity, attackClickLayerMask))
            {
                InteractibleObject newTarget = hit.transform.GetComponentInParent<InteractibleObject>();
                if (newTarget && newTarget.team != interactible.team && newTarget.team != 0)
                    combatTarget = newTarget;
            }
        }

        if (combatTarget)
        {
            interactible.normalAttack.AttackIfCan(interactible, combatTarget);
        }
    }

    // ...
}
```

# Inimigos

<p align="center">
<video src="{{ "/assets/portfolio/eris-online-inimigos.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

Programar os **inimigos** foi uma parte bem desafiadora do projeto, pois colocaria toda implementação do **Photon** realizada em prática. Apesar de se tratar de um sistema aparentemente simples, suas lógicas são complexas de se programar, principalmente por ser uma interação **online**. Infelizmente o desafio foi tanto que ficou com notórios *bugs*, mesmo no fim do projeto.

## IA de Combate

Os **inimigos** possuem sua própria **IA para lidar com combates**.

- Os **inimigos** atacam alvos próximos se forem agressivos, do contrário só atacam se forem atacados;
- Quando um alvo se distancia ou morre, o inimigo ataca o alvo mais próximo dentre todos os alvos dentro de sua distância;
- Quando todos seus potenciais alvos se distanciam, ele retorna ao seu ponto de *spawn*;
- Enquanto houver um alvo, o **inimigo** tentará atacar;
    - Quando consegue atacar, ele para de se mover;
    - Quando/Enquanto não consegue atacar, ele persegue o alvo.

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Pun;
using Photon.Realtime;
using UnityEngine;

[RequireComponent(typeof(EnemyInteractible), typeof(OnlineNavMeshAgentController), typeof(Rigidbody))]
public class EnemyController : MonoBehaviour
{
    [SerializeField, Tooltip("Se ativado, atacará os alvos que estiverem próximo mesmo se NÃO for atacado.")]
    bool isAggressive;

    EnemyInteractible interactible;
    PathFollower pathFollower;
    UnityEngine.AI.NavMeshAgent agent;
    OnlineNavMeshAgentController onlineAgentController;
    InteractibleObject combatTarget;
    List<InteractibleObject> closerTargets = new List<InteractibleObject>();

    public NetworkSpawner spawnerOwner { private set; get; }
    bool lastAttackFlag;
    bool lastNullTargetClearFlag = true;


    private void Awake()
    {
        interactible = GetComponent<EnemyInteractible>();
        pathFollower = GetComponent<PathFollower>();

        if (pathFollower)
        {
            onlineAgentController = pathFollower.onlineAgentController;
        }
        else
        {
            onlineAgentController = GetComponent<OnlineNavMeshAgentController>();
        }

        agent = onlineAgentController.agent;

        spawnerOwner = PhotonView.Find((int)interactible.pv.InstantiationData[0]).GetComponent<NetworkSpawner>();
    }

    private void Update()
    {
        if (!interactible.pv.IsMine)
            return;

        // Coisas que acontecerão se o inimigo tiver um alvo
        if (combatTarget)
        {
            // Atacar o alvo se possível, e receber true se conseguiu atacar ou false se não conseguiu
            bool attackFlag = interactible.normalAttack && interactible.normalAttack.AttackIfCan(interactible, combatTarget);

            // Verificar se este inimigo possui um NavMeshAgent
            if (agent)
            {
                if (attackFlag)
                {
                    // Fazer inimigo parar de se mover se pode atacar mas da última vez não pôde
                    if (!lastAttackFlag)
                        agent.destination = transform.position;
                }
                else
                {
                    // Perseguir alvo se não pode atacar
                    agent.destination = combatTarget.transform.position;
                }

                lastAttackFlag = attackFlag;
            }
        }
        else if (!lastNullTargetClearFlag)
        {
            closerTargets.Remove(combatTarget);
            SwitchTarget();
            lastNullTargetClearFlag = true;
        }
    }

    void SetTarget(InteractibleObject combatTarget)
    {
        this.combatTarget = combatTarget;
        lastNullTargetClearFlag = false;
        lastAttackFlag = false;
        if (pathFollower)
            pathFollower.enabled = false;
    }

    void UnsetTarget()
    {
        this.combatTarget = null;

        if (pathFollower)
        {
            pathFollower.enabled = true;
        }
        else if (spawnerOwner)
        {
            agent.destination = spawnerOwner.transform.position;
        }
    }

    void SwitchTarget()
    {
        InteractibleObject[] closerTargets = this.closerTargets.ToArray();
        float closerDist = Mathf.Infinity;
        int closerId = -1;

        for (int i = 0; i < closerTargets.Length; i++)
        {
            if (closerTargets[i] == null && this.closerTargets.Contains(closerTargets[i]))
            {
                this.closerTargets.RemoveAt(i);
                continue;
            }

            float dist = Vector3.Distance(transform.position, closerTargets[i].transform.position);
            if (dist < closerDist)
            {
                closerDist = dist;
                closerId = i;
            }
        }

        if (closerId == -1)
        {
            UnsetTarget();
        }
        else
        {
            SetTarget(closerTargets[closerId]);
        }
    }

    public void OnTakeDamage(InteractibleObject fromInteractible)
    {
        if (!isAggressive && !combatTarget)
            SetTarget(fromInteractible);
    }

    private void OnTriggerEnter(Collider c)
    {
        InteractibleObject newTarget = c.GetComponent<InteractibleObject>();
        if (newTarget && newTarget.team != 0 && newTarget.team != interactible.team)
        {
            closerTargets.Add(newTarget);
            if (!combatTarget && isAggressive && interactible.pv.IsMine) 
            {
                print("É agressivo? " + isAggressive.ToString());
                SetTarget(newTarget);
            }
        }
    }

    private void OnTriggerExit(Collider c)
    {
        InteractibleObject newTarget = c.GetComponent<InteractibleObject>();
        if (newTarget && newTarget.team != 0 && newTarget.team != interactible.team)
        {
            closerTargets.Remove(newTarget);
            if (combatTarget == newTarget && interactible.pv.IsMine)
                SwitchTarget();
        }
    }
}
```

## Movimentação Online

Como foi possível observar na [IA de Combate](#ia-de-combate), o **inimigo** apenas **segue** o alvo e retorna para seu ponto de *spawn*. Também criei um script já ativa ou desativa o ```NavMeshAgent``` do **inimigo** dependendo se for o *host* ou não, evitando assim *bugs* que poderiam ocorrer com a **sincronia online**.

```cs
using System.Collections;
using System.Collections.Generic;
using Photon.Pun;
using Photon.Realtime;
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent), typeof(PhotonView))]
public class OnlineNavMeshAgentController : MonoBehaviourPunCallbacks
{
    public NavMeshAgent agent { private set; get; }
    PhotonView pv;

    void Awake()
    {
        agent = GetComponent<NavMeshAgent>();
        pv = GetComponent<PhotonView>();

        agent.enabled = pv.IsMine;
    }

    IEnumerator PassOwnership()
    {
        for (byte i = 0; i < 3; i++)
            yield return null;

        agent.enabled = pv.IsMine;
    }

    public override void OnPlayerLeftRoom(Player otherPlayer)
    {
        if (pv.Owner == null)
            StartCoroutine(PassOwnership());
    }
}
```

## Spawner

Os **inimigos** precisam ser *spawnados* para que eles funcionem **online**. É necessário que o *spawn* ocorra apenas no *host*.

```cs
using Photon.Pun;
using Photon.Realtime;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(PhotonView))]
public class NetworkSpawner : MonoBehaviourPunCallbacks
{
    [Header("Geral")]
    //[SerializeField] InteractibleObject[] spawnObjects;
    [SerializeField] float spawnWaitTime;
    [SerializeField] string[] spawnObjectPrefabName;

    [Header("Gatilhos para Recomeçar Spawn")]
    public bool waitTimeUpTrigger;
    public bool waitAllSpawnedEnemiesDieTrigger;


    public PhotonView pv { private set; get; }

    List<GameObject> spawnedEnemies = new List<GameObject>();
    int enemiesLeft;


    void Awake()
    {
        pv = GetComponent<PhotonView>();
        /*if (!pv.IsOwnerActive)
            pv.TransferOwnership(pv.Owner);*/
    }

    void Start()
    {
        if (pv.IsMine)
            StartCoroutine(WaitForSpawn());
    }

    IEnumerator WaitForSpawn()
    {
        yield return new WaitForSeconds(spawnWaitTime);
        Spawn();

        if (waitTimeUpTrigger)
            StartCoroutine(WaitForSpawn());
    }

    void Spawn()
    {
        foreach (string spawnPrefabName in spawnObjectPrefabName)
            spawnedEnemies.Add(PhotonNetwork.InstantiateRoomObject("PhotonPrefabs/" + spawnPrefabName, transform.position, transform.rotation, 0, new object[] { pv.ViewID }));
        //PhotonNetwork.Instantiate("PhotonPrefabs/" + spawnPrefabName, transform.position, transform.rotation, 0, new object[] { pv.ViewID });
        enemiesLeft = spawnObjectPrefabName.Length;
    }

    IEnumerator PassOwnership()
    {
        for (byte i = 0; i < 3; i++)
            yield return null;
            
        if (pv.IsMine && (waitAllSpawnedEnemiesDieTrigger || waitTimeUpTrigger))
            StartCoroutine(WaitForSpawn());
    }

    public void OnKillEnemy(GameObject enemy)
    {
        spawnedEnemies.Remove(enemy);
        PhotonNetwork.Destroy(enemy);

        if (--enemiesLeft == 0 && waitAllSpawnedEnemiesDieTrigger)
            Spawn();
    }

    public override void OnPlayerLeftRoom(Player otherPlayer)
    {
        if (pv.Owner == null)
            StartCoroutine(PassOwnership());
    }

    private void OnDrawGizmos()
    {
        Gizmos.DrawCube(transform.position, Vector3.one);
    }
}
```

# Lições Aprendidas

Foi um projeto com *background* muito específico: com o início da pandemia de Covid-19 forçando sua suspensão para posteriormente ser retomado de maneira remota, projeto que agrupa a turma inteira da disciplina com variadas experiências e com o grande desafio de fazer um **MMORPG**. Neste projeto, aprendi a utilizar o **Photon** e, inclusive, criar um **jogo online**; Pude aprimorar minha aplicabilidade de **POO**; Também pude aplicar e aprimorar até mesmo minha habilidade de **codificar na Unity**.

Aprendi também que, mesmo precisando equilibrar o tempo de esforço entre múltiplos projetos, eu preciso dedicar àquele projeto que renderia melhor para o futuro. Este projeto tem seus problemas, mas eu poderia ter sido aquele que contribuiria para um projeto ainda melhor se eu tivesse me dedicado mais.

Neste projeto decidi me responsabilizar pelas tarefas mais complexas, pelas que envolvessem praticamente tudo que pudesse abranger a **interação online**, o que me fez perceber o potencial e resultado que podemos ter a partir do nossa determinação e vontade de crescer.
