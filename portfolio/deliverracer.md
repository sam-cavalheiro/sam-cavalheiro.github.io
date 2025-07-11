---
title: "Deliverracer"
layout: portfolio
media_paths: https://www.google.com
role: Programador
frame_time: 4
team_size: 7
year: 2021
engine: Godot
prog_language: GDScript
category: Graduação
web_pages: [ https://samcavalheiro.itch.io/deliverracer ]
web_page_types: [ itch.io ]

description: |
    Neste jogo para **dispositivo móvel**, o jogador precisa realizar entregas de comida com sua **moto**.
    
    Meu primeiro projeto de **jogo para dispositivo móvel**. E meu primeiro projeto utilizando **Godot** e **GDSCript**. Projeto realizado para o **TCP IV**.
---

# Introdução

Neste projeto, assumo a responsabilidade de programar um **jogo pra dispositivo móvel** sobre **entregas através de veículo de duas rodas**. Minha atuação no projeto foi **programando o jogo por inteiro**, pois eu era o único programador. Também precisei **implementar os assets**.

Este projeto foi realizado durante a pandemia de Covid-19, sendo produzido remotamente devido ao lockdown.

Projeto desenvolvido para a disciplina **TCP IV** (Trabalho de Conclusão de Período IV) da graduação de **Jogos Digitais do IFRJ Campus Eng. Paulo de Frontin**. O **TCP IV** vigente consistia no dever produzir e apresentar um **jogo para dispositivo móvel** ao final da disciplina na graduação.

A equipe do projeto conta com 7 membros, sendo eu, o **único programador**. [Os créditos podem ser acessados na página do itch.io](https://samcavalheiro.itch.io/deliverracer){:target="_blank"}.

Além deste ter sido meu primeiro projeto de **jogo para dispositivo móvel**, também foi meu primeiro projeto feito com uso da *engine* **Godot**.

# Personagem e seu Veículo

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-personagem.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

A mecânica do jogo consiste em tornar possível o jogador **pilotar a moto como o personagem**.

Optei pelo uso do ```KinematicBody``` para ter um objeto sem muita influência de simulação de física, precisava apenas de algo que pudesse colidir ou detectar colisão. ```Rigidbody``` atrapalharia a física da nossa **motinha** a longo prazo porque iria ter uma simulação de física funcionando enquanto a nossa física programada para **veículo** funcionaria em paralelo, causando muito conflito e resultados indesejados. Não utilizei ```CharacterBody``` porque ainda não existia esta *feature* no **Godot** 3.x. Também havia o ```VehicleBody```, mas não consegui aprender a utilizar e nem compreender a documentação.

Tudo que envolve os cálculos de **física do veículo** fiz me guiando por tutoriais e pesquisas sobre cálculos de física. Em algumas partes, fui testando alguns cálculos empíricos e parte deles mostraram-se funcionar nos resultados. O **personagem** é controlado pelo teclado, controle ou botões virtuais na tela (para telas de toque).

No sistema ocorre:

- **Aceleração e freio** se os devidos botões forem pressionados;
- **Desaceleração** caso o **veículo** esteja no ar (fora do chão), sem poder acelerar ou frear;
- **Impacto** na **velocidade** do **veículo** ao colidir de frente;
- Gravidade do **veículo**;
- Troca de rotação caso o **jogador** suba em uma superfície rotacionada (rampa, por exemplo).

<p align="center"><a href="{{ "/assets/portfolio/deliverracer-personagem.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/deliverracer-personagem.jpg" }}" width="550" height="390" />
</a></p>

```gdscript
extends KinematicBody
class_name PlayerController

export var gravity :float = 20
export var move_acceleration_speed :float = 10
export var move_slowdown_speed :float = 5
export var move_brake_speed :float = 20
export var air_slowdown_speed :float = 1
export var wall_impact_force :float = 1
export var rot_speed :float = 5
export var max_speed :float = 20

export var y_reset :float = NAN

export var floor_detection_ray_distance :float = 1

onready var coll :CollisionShape = $CollisionShape
onready var impact_coll :CollisionShape = $WallImpactDetection/CollisionShape
onready var floor_detection_point :Spatial = $FloorDetectionPoint
onready var input_hud :InputHUD = get_tree().get_nodes_in_group("InputHUD")[0]

var velocity :Vector3
var speed :float
var speed_reduction :float
var wall_impact_flag :bool

var collisions :Array
onready var reset_position :Vector3 = global_transform.origin
onready var reset_rotation :Vector3 = rotation_degrees


func _physics_process(delta):
	# Reiniciar o velocity e armazenar velocity.y para fins de gravidade
	var vel_y = velocity.y - (gravity * delta)
	velocity = Vector3.ZERO
	var speed_modifier :float
	
	# Se estiver no chão
	if is_in_floor():
		# Aumentar velocidade com base na aceleração se acelerou
		if Input.is_action_pressed("player_accelerate"):
			speed_modifier = move_acceleration_speed * delta
		
		# Reduzir velocidade com base no freio se freiou
		if Input.is_action_pressed("player_brake"):
			speed_modifier = -move_brake_speed * delta
		
		# Reduzir velocidade com base na desaceleração se não acelerou ou freiou
		if speed_modifier == 0:
			speed_modifier = -move_slowdown_speed * delta
	else:
		# Reduzir velocidade com base na desaceleração de ar (fora do chão)
		speed_modifier = -air_slowdown_speed * delta
	
	if wall_impact_flag:
		speed += abs(speed_modifier)
		if speed_reduction > 0:
			#speed += speed_modifier
			speed_reduction -= abs(speed_modifier)
			speed += speed_reduction * delta
		#else:
			#speed += abs(speed_modifier)
		if speed >= 0:
			wall_impact_flag = false
	else:
		speed += speed_modifier
		speed = clamp(speed, 0, max_speed)
	
	# Se velocidade não for 0
	if speed != 0:
		# Aumentar velocity para frente do jogador com base na velocidade
		velocity += transform.basis.z * speed
		
		# Fazer jogador rotacionar para esq/dir com base na direção pressionada
		rotation.y -= rot_speed * input_hud.get_horizontal_axis() * delta
	
	# Preservar gravidade acumulada no velocity.y
	velocity.y = vel_y
	
	# Fazer transição de rotação no jogador com base no chão se colidiu
	if is_in_floor():
		var collision :KinematicCollision = move_and_collide(velocity * delta, true, true, true)
		if collision:
			var space_state = get_world().direct_space_state
			var a_basis := global_transform.basis
			var player_origin := global_transform.origin
			var result = space_state.intersect_ray(player_origin, player_origin + a_basis.z + (Vector3.DOWN * floor_detection_ray_distance), [self])

			if result:
				var stored_scale = scale
				var b_basis := a_basis
				b_basis.y = result.normal.normalized() * stored_scale.y
				var new_quat := a_basis.get_rotation_quat().slerp(b_basis.get_rotation_quat(), min(speed * delta, delta))
				global_transform.basis = Basis(new_quat.normalized())
				scale = stored_scale
	
	velocity = move_and_slide(velocity, Vector3.UP)
	
	if y_reset != NAN:
		if (y_reset < 0 && global_transform.origin.y <= y_reset) || (y_reset > 0 && global_transform.origin.y >= y_reset) :
			global_transform.origin = reset_position
			set_collision_disabled(false)

func is_in_floor() -> bool:
	return !collisions.empty()

func set_collision_disabled(disabled :bool):
	coll.disabled = disabled
	impact_coll.disabled = disabled


# Chamado quando algum corpo entra na área de colisão deste objeto
func _on_FloorDetection_body_entered(body):
	# Para execução se colidiu com si mesmo
	if body == self: # <- NÃO ESTÁ FUNCIONANDO
		return
	
	# Trocar rotação do jogador com base no chão se não estava no chão e colidiu com algum objeto
	if !is_in_floor():
		#print("...")
		var space_state = get_world().direct_space_state
		var floor_point_origin := floor_detection_point.global_transform.origin
		#var result = space_state.intersect_ray(global_transform.origin, floor_detection_point.global_transform.origin + (Vector3.DOWN * floor_detection_ray_distance), [self])
		var result = space_state.intersect_ray(floor_point_origin, floor_point_origin + (Vector3.DOWN * floor_detection_ray_distance), [self])
		if result:
			#print("ENCOSTOU NO CHÃO | " + result.collider.name)
			var stored_scale = scale
			global_transform.basis.y = result.normal.normalized() * stored_scale.y
			scale = stored_scale
			rotation.z = 0 # IMPEDIR BUGS COM ROTAÇÃO ERRADA
	
	# Adicionar colisor à lista de colisões
	collisions.append(body)

# Chamado quando algum corpo sai na área de colisão deste objeto
func _on_FloorDetection_body_exited(body):
	# Remover colisor à lista de colisões
	collisions.erase(body)

func _on_WallImpactDetection_body_entered(body):
	if body == self: # <- NÃO ESTÁ FUNCIONANDO
		return
	
	speed *= wall_impact_force * -0.5
	speed_reduction = -speed
	wall_impact_flag = true
```


# Objetivos de Entregas

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-objetivos.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

O **objetivo** do jogador é **entregar** as comidas para os lugares requisitados. No estado atual do projeto, é possível realizar apenas uma entrega.

O sistema conta com uma IU que indica o **local de entrega da comida**, vários eventos no cenário que faria a interação com o **objetivo**, uma seta apontando para o **local de entrega**, e um objeto que aparece no **local de entrega** para que o jogador saiba onde deve **entregar** a comida.

<!-- TODO: Um diagrama -->

O script foi criado pensado em ter vários **objetivos** seguindo os estados (```enum QuestState```) que se esperaria de uma **entrega de comida**. Mas na prática, havia um único objetivo.

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-objetivos-estrutura-hud.mp4" }}" loop autoplay muted></video>
</p>

Cada "Quest\_n" dentro da estrutura acima representa uma **etapa do objetivo** (apesar do nome não intuir...) com relação ao ```enum QuestState```:

- Quest\_0 => ```QuestState.WAITING_CALL``` (aguardar chamado/ligação)
- Quest\_1 => ```QuestState.TAKE_FOOD``` (pegar comida)
- Quest\_2 => ```QuestState.SUBMIT_FOOD``` (entregar comida)
- Quest\_3 => ```QuestState.QUEST_OVER``` (objetivo finalizado)

O jogador passa para próxima **etapa** sempre que clica no "TextureButton" (botão de "OK"), em ```func _on_TextureButton_button_down()```.

> Os comentários deste código foram criados para facilitar a leitura, portanto não estavam presentes no código original.

```gdscript
extends TextureRect
class_name Quest

enum QuestState {
	WAITING_CALL, # (aguardar chamado/ligação)
	TAKE_FOOD,    # (pegar comida)
	SUBMIT_FOOD,  # (entregar comida)
	QUEST_OVER }  # (objetivo finalizado)

var state :int = QuestState.WAITING_CALL

# Efeitos sonoros genéricos (da IU)
onready var generic_sfxs :GenericSoundEffects = get_tree().get_nodes_in_group("GenericSoundEffects")[0]

# Seta que aponta para o objetivo
onready var look_arrow :LookArrow = get_tree().get_nodes_in_group("LookArrow")[0]

# Indicador que aparece no local do objetivo (um cilindro 3D)
onready var destiny_indicator :Spatial = get_tree().get_nodes_in_group("Quest_Destiny_Indicator")[0]

# Raiz de todos eventos de ETAPAS DE OBJETIVOS (não os objetivos em si,
# como o nome induz) dentro do cenário
onready var quests_root :Node = get_tree().get_nodes_in_group("Quests_Root")[0]

func _init():
	# Adiciona este node para o grupo "Quest" para facilitar buscas
	add_to_group("Quest")

# Concluir atual ETAPA DE OBJETIVO
func complete_current_quest():
	# Pausar jogo e exibir item da interface correspondente ao estado atual
	get_tree().paused = true
	show()
	get_current_quest_node_root().show()

# Obter node raiz da atual ETAPA DE OBJETIVO
func get_current_quest_node_root() -> Control:
	# Na prática, obtém a item da interface com base no state
	return get_node("Quest_" + str(state)) as Control


# Ao pressionar o botão "OK"
func _on_TextureButton_button_down():
	# Ocultar janela
	get_current_quest_node_root().hide()
	hide()
	
	var tree = get_tree()
	state += 1 # Ir p/ próximo estado do objetivo
	
	# Se entrou no estado que indica objetivo finalizado
	if state == QuestState.QUEST_OVER:
		# Destruir itens que indicariam a existencia de um objetivo
		# no cenário e na HUD
		tree.get_nodes_in_group("LookArrow_Texture")[0].queue_free()
		look_arrow.queue_free()
		destiny_indicator.queue_free()
	else:
		var quest_destiny :Spatial = quests_root.get_node("Quest_" + str(state))
		
		# Fazer seta que aponta ao objetivo apontar para o objetivo
		look_arrow.look_object = quest_destiny
		
		# Posicionar indicador do destino ao local do objetivo
		destiny_indicator.global_transform.origin = quest_destiny.global_transform.origin
	
	generic_sfxs.confirm_sfx.play()
	tree.paused = false
```

Para um objeto no cenário interagir com alguma **etapa do objetivo**, era necessário apenas criar um script (eu optei por fazê-los embutidos no objeto) que criasse uma condição para chamar ```complete_current_quest()``` do ```Quest```. Estes objetos ficam necessariamente no cenário para que o indicador de **objetivos** e a seta possam indicá-lo.

<p align="center">
<img src="{{ "/assets/portfolio/deliverracer-objetivos-estrutura-game.png" }}" />
</p>

Um exemplo comum, é o jogador chegar em uma área específica e isto avançar para próxima **etapa do objetivo**. Abaixo, apenas _um_ código de exemplo comum de como a interação ocorria:

```gdscript
extends Area

onready var quest :Quest = get_tree().get_nodes_in_group("Quest")[0]

func _on_Quest_1_body_entered(body):
	if quest.state == Quest.QuestState.TAKE_FOOD && body is PlayerController:
		quest.complete_current_quest()
```

A seta presente na HUD aponta para onde está localizado o **objetivo**. De frame em frame (```func _process(delta)```) se posiciona para onde o jogador está e rotaciona para o **objetivo**. Ela é um ```Viewport``` que possui um mundo próprio.

<p align="center"><a href="{{ "/assets/portfolio/deliverracer-objetivos-estrutura-seta.png" }}" target="_blank">
<img src="{{ "/assets/portfolio/deliverracer-objetivos-estrutura-seta.png" }}" width="570" height="514" />
</a></p>

```gdscript
extends Viewport
class_name LookArrow

#export var distance_to_camera :float  = 3
export var _look_object :NodePath
onready var look_object :Spatial = get_node(_look_object)

onready var la_world :Spatial = $LookArrow_World
onready var holder :Spatial = $LookArrow_World/Holder
onready var player :Spatial = get_tree().get_nodes_in_group("Player")[0]


func _init():
	add_to_group("LookArrow")

func _ready():
	(get_tree().get_nodes_in_group("LookArrow_Texture")[0] as TextureRect).texture = get_texture()

func _process(delta):
	la_world.global_transform.origin = player.global_transform.origin
	la_world.rotation = player.rotation
	holder.look_at(look_object.global_transform.origin, Vector3.UP)
```

# Configurações

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-configuracoes.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

A pedido da produtora do projeto, fiz o **sistema de configurações**, onde o jogador pode configurar suas preferências e estas preferências serem salvas e carregadas. Adorei a ideia porque trouxe mais funcionalidade para o projeto e mais personalização para os jogadores.

O jogador realiza as configurações na **janela de configurações** (acessível durante o jogo ou no menu inicial) e as configurações são salvas sempre que o jogador clica/toca no botão "OK".

A classe ```Settings``` é a estrutura de dados que será salva. Código abaixo:

```gdscript
extends Object
class_name Settings

var input_type :int
var accelerometer_clamp :float = 4
var use_fp_camera :bool

func to_dict():
	return {"input_type": input_type,
			"accelerometer_clamp": accelerometer_clamp,
			"use_fp_camera": use_fp_camera}
```

A classe *singleton* ```GameData``` é a responsável para salvar, carregar e acessar as **configurações do jogo** (```var stored_settings :Settings```). Código abaixo:

```gdscript
extends Node


var stored_settings :Settings

func _init():
	var loaded_settings := load_settings()
	if loaded_settings:
		stored_settings = loaded_settings
	else:
		stored_settings = Settings.new()

func load_settings() -> Settings:
	var file = File.new()
	if file.file_exists("user://settings.json"):
		file.open("user://settings.json", File.READ)
		var data = parse_json(file.get_as_text())
		file.close()
		if typeof(data) == TYPE_DICTIONARY:
			return dict_to_settings(data)
	
	return null

func save_settings(new_settings :Settings, store_data := true):
	var file = File.new()
	file.open("user://settings.json", File.WRITE)
	file.store_string(to_json(new_settings.to_dict()))
	file.close()
	
	if store_data:
		stored_settings = new_settings

func dict_to_settings(dict :Dictionary) -> Settings:
	var new_settings := Settings.new()
	new_settings.input_type = dict["input_type"]
	new_settings.accelerometer_clamp = dict["accelerometer_clamp"]
	new_settings.use_fp_camera = dict["use_fp_camera"]
	return new_settings
```

Os dados são aplicados às **configurações do jogo** na **janela de configurações** (classe ```SettingsWindow```). Código abaixo:

```gdscript
extends WindowDialog
class_name SettingsWindow

onready var input_hud = try_get_node_in_group("InputHUD")
onready var generic_sfxs :GenericSoundEffects = get_tree().get_nodes_in_group("GenericSoundEffects")[0]

onready var fp_camera :Camera = try_get_node_in_group("FP_Camera")
onready var tp_camera :Camera = try_get_node_in_group("TP_Camera")

func _ready():
	var loaded_settings := GameData.stored_settings
	$HBoxContainer/Input_Options.select(loaded_settings.input_type)
	if loaded_settings.use_fp_camera:
		$HBoxContainer/Camera_Options.select(0)
	else:
		$HBoxContainer/Camera_Options.select(1)
	try_refresh_cameras(loaded_settings.use_fp_camera)

func try_refresh_cameras(use_fp_camera :bool):
	if fp_camera && tp_camera:
		fp_camera.current = use_fp_camera
		tp_camera.current = !use_fp_camera

func try_get_node_in_group(group :String) -> Node:
	var try_find := get_tree().get_nodes_in_group(group)
	if !try_find.empty():
		return try_find[0]
	return null

func _on_SettingsWindow_about_to_show():
	generic_sfxs.confirm_sfx.play()

func _on_SettingsWindow_popup_hide():
	generic_sfxs.cancel_sfx.play()
	get_tree().paused = false

func _on_Ok_Button_button_up():
	var new_settings := Settings.new()
	new_settings.input_type = $HBoxContainer/Input_Options.selected
	new_settings.use_fp_camera = $HBoxContainer/Camera_Options.selected == 0
	GameData.save_settings(new_settings)
	#print("index = " + str($HBoxContainer/OptionButton.get_index() - 1) + "\ninput_type = " + str(new_settings.input_type))
	if input_hud:
		input_hud.refresh(new_settings.input_type)
	try_refresh_cameras(new_settings.use_fp_camera)
	
	hide()


func _on_Input_Options_button_up():
	generic_sfxs.confirm_sfx.play()


func _on_Camera_Options_button_up():
	generic_sfxs.confirm_sfx.play()


func _on_Input_Options_item_selected(index):
	generic_sfxs.confirm_sfx.play()


func _on_Camera_Options_item_selected(index):
	generic_sfxs.confirm_sfx.play()
```

As possíveis configurações são: [Tipos de Controles](#tipos-de-controles) e [Alternação de Câmera](#alternação-de-câmera).

## Tipos de Controles

Na **janela de configurações**, é possível escolher um **tipo de controle** que melhor se adéque ao perfil do jogador.

Independente de qual **tipo de controle** o jogador configurar, com exceção do tipo **Gamepad**, sempre estará presenta na HUD dois botões: um para acelerar e outro para frear. Ambos são simples nodes ```TouchScreenButton``` configurados pela interface do **Godot** para pressionar as ações para acelerar e frear.

<p align="center">
<img src="{{ "/assets/portfolio/deliverracer-botoes-basicos-estrutura.png" }}" />
</p>

<p align="center">
<img src="{{ "/assets/portfolio/deliverracer-botao-acelerar-acao.png" }}" /><img src="{{ "/assets/portfolio/deliverracer-botao-frear-acao.png" }}" />
</p>



### Toque na Tela

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-controles-touch.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

Existem duas **opções de controle de toque de tela**: **controle digital** (Setas) e o **controle analógico** (Guidão).

O **controle digital** são apenas duas setas do node ```TouchScreenButton``` configurados pela interface do **Godot** para pressionar as ações para o jogador se mover para esquerda e para direita.

<p align="center">
<img src="{{ "/assets/portfolio/deliverracer-botoes-setas-estrutura.png" }}" />
</p>

<p align="center">
<img src="{{ "/assets/portfolio/deliverracer-botao-seta-esquerda-acao.png" }}" /><img src="{{ "/assets/portfolio/deliverracer-botao-seta-direita-acao.png" }}" />
</p>

Já o **controle analógico** é um script. O *input* de toque na tela é tratado em ```func _input(event)```, verificando se o jogador tocou na região da imagem do **analógico**.

<p align="center">
<img src="{{ "/assets/portfolio/deliverracer-botao-analogico-estrutura.png" }}" />
</p>

```gdscript
extends Control
class_name TouchScreenAnalog

export var clamp_rotation :float = 45

var analog_x_axis :float
var touch_id :int = -1


func _init():
	add_to_group("TouchScreenAnalog")

func _input(event):
	if event is InputEventScreenDrag || event is InputEventScreenTouch:
		var event_local_pos :Vector2 = event.position - rect_global_position
		
		if touch_id == -1 && event_local_pos.x >= 0 && event_local_pos.y >= 0 && event_local_pos.x <= rect_size.x && event_local_pos.y <= rect_size.y:
			touch_id = event.index
		
		if touch_id == event.index:
			if event is InputEventScreenTouch && !event.pressed:
				rect_rotation = 0
				analog_x_axis = 0
				touch_id = -1
			else:
				var half_area_size_x := rect_size.x / 2
				var new_x_axis :float = (event_local_pos.x - half_area_size_x) / half_area_size_x
				analog_x_axis = clamp(new_x_axis, -1, 1)
				rect_rotation = clamp_rotation * analog_x_axis
```

### Acelerômetro

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-controles-acelerometro.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

O **controle por acelerômetro** é muito simples. Baseada na rotação da tela do celular ou tablet do usuário, foi possível determinar para qual direção o jogador pretendia ir.

```gdscript
extends Node
class_name InputHUD

# ...

func get_horizontal_axis() -> float:
	var axis :float = 0
	axis = Input.get_action_strength("player_right") - Input.get_action_strength("player_left") # <=== TECLADO/GAMEPAD
	
	if axis == 0:
		var input_type :int = GameData.stored_settings.input_type
		if input_type == GameEnumerators.InputType.ANALOG: # <=== ANALÓGICO
			return analog_pad.analog_x_axis
		elif input_type == GameEnumerators.InputType.ACCELEROMETER: # <=== ACELERÔMETRO
			var accel_axis := Input.get_accelerometer().x / GameData.stored_settings.accelerometer_clamp
			return clamp(accel_axis, -1, 1)
	
	return axis
```

No trecho de código acima é exibido tanto o teclado/gamepad, quanto o analógico, quanto o **acelerômetro**, sendo o **acelerômetro** apenas:

```gdscript
# ...

		elif input_type == GameEnumerators.InputType.ACCELEROMETER: # <=== ACELERÔMETRO
			var accel_axis := Input.get_accelerometer().x / GameData.stored_settings.accelerometer_clamp
			return clamp(accel_axis, -1, 1)
# ...
```

### Gamepad

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-controles-gamepad.mp4" }}" width="480" height="270" controls loop autoplay muted></video>
</p>

Mesmo o jogo sendo criado para rodar em **dispositivos móveis**, os *inputs* estão o tempo inteiro esperando comandos do teclado e do **gamepad** (controle com ou sem fio que é possível de conectar no computador ou dispositivo móvel).

```gdscript
# ...

func get_horizontal_axis() -> float:
	var axis :float = 0
	axis = Input.get_action_strength("player_right") - Input.get_action_strength("player_left") # <=== TECLADO/GAMEPAD
	
	if axis == 0:
		# ...
	
	return axis
```

O uso do **gamepad** como **tipo de controle** implica em simplesmente ocultar os botões de acelerar e frear da HUD, e destruir o direcional da HUD.

```gdscript
extends Node
class_name InputHUD

# ...

func refresh(input_type :int):
	try_kill_old_dir_pad()
	
	match input_type:
		GameEnumerators.InputType.ARROW:
			switch_dir_pad("res://Nodes/HUD/InputHUD/ArrowPad.tscn")
		GameEnumerators.InputType.ANALOG:
			switch_dir_pad("res://Nodes/HUD/InputHUD/AnalogPad.tscn")
			analog_pad = dir_pad.get_node("Analog")
		#GameEnumerators.InputType.ACCELEROMETER:
			# Nada
		GameEnumerators.InputType.GAMEPAD:
			buttons_pad.hide()

# ...

func try_kill_old_dir_pad():
	if dir_pad:
		dir_pad.queue_free()
		dir_pad = null
		if analog_pad:
			analog_pad.queue_free()
			analog_pad = null

# ...
```

## Alternação de Câmera

<p align="center">
<video src="{{ "/assets/portfolio/deliverracer-camera.mp4" }}" width="480" height="270" loop autoplay muted></video>
</p>

Na **janela de configurações**, é possível escolher um **tipo de câmera** que melhor se adéque ao perfil do jogador.

Existe a **câmera em terceira pessoa** por padrão, e a **câmera em primeira pessoa** como escolha alternativa. A **alternação de câmera** ocorre bem no ```SettingsWindow```, quando o código está pronto para inicializar e quando o jogador clica no botão "OK". O código é simples, e consiste em simplesmente indicar à *engine* qual é a câmera atual que renderizará o jogo, apenas trocando a *flag* ```current``` das duas câmeras (```fp_camera``` para primeira pessoa, e ```tp_camera``` para terceira pessoa).

```gdscript
extends WindowDialog
class_name SettingsWindow

# ...

onready var fp_camera :Camera = try_get_node_in_group("FP_Camera")
onready var tp_camera :Camera = try_get_node_in_group("TP_Camera")

# ...

func _ready():
	var loaded_settings := GameData.stored_settings
	# ...
	try_refresh_cameras(loaded_settings.use_fp_camera)

func try_refresh_cameras(use_fp_camera :bool):
	if fp_camera && tp_camera:
		fp_camera.current = use_fp_camera
		tp_camera.current = !use_fp_camera

# ...

func _on_Ok_Button_button_up():
	var new_settings := Settings.new()
	# ...
	new_settings.use_fp_camera = $HBoxContainer/Camera_Options.selected == 0
	GameData.save_settings(new_settings)
	# ...
	try_refresh_cameras(new_settings.use_fp_camera)
	# ...

# ...
```

A **câmera em primeira pessoa** fica dentro do jogador, em uma posição e ângulo que possibilita enxergar apenas as mãos do personagem, guidão da motocicleta e a estrada. Não há nenhum código aqui.

<p align="center"><a href="{{ "/assets/portfolio/deliverracer-fp-camera-estrutura.jpg" }}" target="_blank">
<img src="{{ "/assets/portfolio/deliverracer-fp-camera-estrutura.jpg" }}" width="550" height="511" />
</a></p>

Já a **câmera em terceira pessoa** fica na cena de jogo com um script personalizado para seguir o jogador. Este script é bem simples, ele apenas segue o jogador com um certo atraso, para ficar um pouco mais elegante.

```gdscript
extends Spatial

export var _follow_object :NodePath
export var folow_rotation_speed :float = 1
#export var follow_rotation_distance_tolerance :float = 180

onready var follow_object :Spatial = get_node(_follow_object)
onready var camera :Camera = $Camera

func _ready():
	var before_rot := rotation_degrees
	global_transform.basis = follow_object.global_transform.basis
	rotation_degrees = Vector3(before_rot.x, rotation_degrees.y, before_rot.z)

func _process(delta):
	if !camera.current:
		return
	
	global_transform.origin = follow_object.global_transform.origin
	
	var before_rot := rotation_degrees
	global_transform.basis = global_transform.basis.slerp(follow_object.global_transform.basis.orthonormalized(), folow_rotation_speed * delta)
	rotation_degrees = Vector3(before_rot.x, rotation_degrees.y, before_rot.z)
```

# Outros

- **Implementação de assets:**
    - Telas;
    - Arte dos menus/interfaces;
    - Efeitos sonoros;
    - Músicas de fundo;
    - Modelos 3D do personagem e do veículo.
    
# Uso do Godot

<!-- TODO: Logo da Godot? -->

A decisão de utilizar o **Godot** como *engine* para o projeto foi minha junto de um do produtor do projeto. O produtor já tinha curiosidade para usar a *engine*, e eu já havia utilizado a *engine* para experimentar e tentar criar projetos pessoais. O restante da equipe aceitou a ideia de criarmos um projeto com **Godot**. Só utilizei **Unity** em projetos de TCP porque no TCPI é obrigatório o uso da *engine*, o que torna inconveniente utilizar outras *engines* nos seguintes TCPs devido ao fato de que as pessoas da faculdade estão mais habituadas com **Unity**.

**Godot** é uma *engine* conveniente para jogos com escopo mais simples, como este projeto. A *engine* em si é muito leve, mas em performance de jogo produzido, já não sei dizer em comparação à **Unity**. Um **jogo para dispositivo móvel** com escopo simples cabe como uma luva nesta *engine*. Apesar da **Unity** ser capaz de nos conceder os mesmos resultados, o **Godot** era um caminho mais rápido e fácil para alcançar tal objetivo -- Um exemplo foi os objetos do cenário que se integravam ao sistema de objetivos, que podiam ser scripts embutidos ao objeto, e não um arquivo separado, deixando o projeto bem mais organizado.

Apesar de eu me maravilhar com o uso da *engine*, não acho que a equipe tenha tirado o mesmo proveito que eu. Isso me faz pensar que escolher uma *engine* para o projeto precisa do consenso mais claro da equipe. Inclusive, um dos artistas 3D da equipe enfrentou dificuldade em implementar seus *assets*, pois o **Godot** possui suas diferenças da **Unity** para realizar tal tarefa (diferenças e aparentemente alguns *bugs*, considerando ser a versão 3.x da *engine*).

# Lições Aprendidas

Considerando ser um projeto de **jogo para dispositivo móvel**, realizar este projeto junto da equipe me fez concluir que aprender uma modalidade nova em um projeto não precisa ser complicado e pode ser muito mais simples do que parece. Criar um **jogo para dispositivo móvel** foi menos complicado do que parecia, porque as *engines* oferecem ferramentas excelentes para trabalharmos com isto.

Também aprendi que precisamos ter uma comunicação clara e próxima dos membros da equipe para identificarmos se as posturas e mudanças no projeto são satisfatórias para todos, porque uma mudança pode afetar negativamente o trabalho de alguém.
