# B — Filosofía pedagógica

Mathy parte de una convicción: la matemática no es una colección de símbolos que se aprenden a manipular, sino un conjunto de estructuras que primero se juegan y después se nombran. Este documento enuncia las reglas que gobiernan todo el diseño. Cada una tiene su desarrollo en otra sección; acá están juntas para que se vea que forman un sistema y no una lista de buenas intenciones.

## 1. Toda idea pasa por capas, y ninguna capa se salta

Un concepto no se enseña: se recorre. El recorrido tiene ocho capas, definidas en [H](H-progresion-abstraccion.md): una situación del mundo real, una anticipación sin herramientas, la manipulación de objetos concretos, una representación visual, la notación, la definición formal con sus condiciones, la abstracción sin analogía y la transferencia a otro contexto. La resta se juega como deshacer la suma en una recta antes de escribirse, la ecuación se nivela en una balanza antes de tener un signo igual, la derivada se camina con zoom antes de tener un límite.

Las capas no son etapas de edad ni pantallas distintas. El mismo objeto en pantalla se transforma de capa en capa, y el criterio de salida de cada una es evidencia de lo que el jugador puede hacer, no tiempo transcurrido ([K](K-evaluacion.md)).

## 2. La matemática es transformación, estructura e invariantes

Sumar es desplazar. Multiplicar es escalar. Componer es encadenar. Invertir es deshacer. Derivar es medir una tasa. Integrar es acumular. Una transformación lineal deforma el espacio. Mathy usa una gramática visual única, de doce primitivas ([H](H-progresion-abstraccion.md)), para que el jugador reconozca la misma estructura cuando reaparece en otra área: la llave que abre `x + 5 = 12` es la misma que abre `eˣ = 20`, que invierte una matriz y que hace del teorema fundamental del cálculo un "esto ya lo hiciste". Trece mecánicas reutilizables ([E](E-mecanicas/E0-catalogo.md)) encarnan esa gramática; cada una conserva un invariante, y ese invariante es lo que se aprende.

## 3. La analogía se elige por estructura y desaparece a tiempo

Una analogía entra al juego solo si preserva la estructura matemática del concepto, con un mapa explícito de objetos, operaciones e invariante, y con su punto de ruptura documentado ([G](G-analogias/G0-reglas.md)). Se elige por eso, nunca por divertida. Y se retira cuando deja de aportar: cuando el jugador la usa como muleta, cuando el concepto excede lo que la analogía puede representar, o cuando el nodo está en capa abstracta. La fruta del libro de cuentas se convierte en `x` y no vuelve. Los nodos avanzados pueden declarar que nunca tuvieron capa concreta, y esa es una decisión explícita, no una omisión.

## 4. Toda notación tiene una historia

Ningún símbolo se introduce porque toca. La `x` aparece porque hace falta nombrar una cantidad que no se conoce; `f(x)`, porque hace falta nombrar una transformación; `f⁻¹`, porque hace falta deshacerla; `lim`, porque hace falta hablar de acercarse; `∫`, porque hace falta acumular de forma continua; `∇`, porque hace falta generalizar la pendiente. La tabla de [H](H-progresion-abstraccion.md) registra, para cada símbolo del curriculum, el problema que lo hizo necesario, el objeto concreto del que surge y el nodo donde nace. Un archivo de concepto que no puede responder "¿qué problema necesitábamos resolver?" no está terminado.

## 5. Los errores son datos, no fallas

Cuando el jugador hace un movimiento inválido, el juego lo ejecuta de verdad y muestra qué pasó: la balanza se inclina, la llave se traba, a las baldosas les falta una pieza. Nunca dice "incorrecto". Cada error conocido tiene un nombre en una taxonomía ([L](L-modelo-errores/L0-taxonomia.md)), una regla que lo detecta, y un patrón de explicación dinámica que reproduce el movimiento sobre el estado real del jugador y le devuelve el control con una pregunta. Un error repetido bloquea el avance del nodo hasta que se remedia, aunque los aciertos digan otra cosa.

## 6. Saber no es acertar diez veces

El progreso no es experiencia acumulada sino conocimiento demostrado en seis dimensiones: reconocer, explicar, manipular, aplicar, generalizar y transferir ([K](K-evaluacion.md)). Un concepto habilita a sus sucesores cuando el jugador lo reconoce, lo entiende y lo aplica; se considera dominado cuando además lo transfiere a otra área con otra mecánica y lo sostiene en el tiempo. Las habilidades se oxidan y se repasan; la comprensión, mucho menos.

## 7. Nadie empieza en el mismo lugar, y nadie salta prerequisitos

El grafo de conocimiento ([C](C-knowledge-graph/C0-esquema.md)) tiene prerequisitos explícitos y los hace cumplir sin excepción. Un diagnóstico ubica a cada persona y detecta las lagunas que arrastra, y un selector decide cada sesión qué repasar, qué remediar, qué avanzar y qué transferir ([J](J-adaptativo.md)). La adaptación es por evidencia, no por edad ni por declaración.

## 8. Todo ejercicio es un minijuego

No hay pantallas de ejercitación desnudas ni preguntas de opción múltiple con texto. Los seis verbos de evidencia se instancian dentro de la mecánica del concepto: elegir un cofre, elegir la animación que justifica un paso, arrastrar la llave, construir la ecuación desde la situación, abrir una cerradura nunca vista, usar la misma llave en otra área ([F](F-minijuegos/F0-principios.md)). Los problemas difíciles existen y son problemas de verdad, del tipo que se ve en olimpíadas, con datos faltantes que hay que descubrir construyendo ([S](S-desafios/S0-desafios.md)), y se juegan con la cheatsheet abierta.

## 9. Lo que se aprende se guarda y se puede usar

Cada concepto suma sus fórmulas, reglas, definiciones y estrategias a una cheatsheet personal organizada por tema que empieza vacía ([R](R-cheatsheet/R0-cheatsheet.md)), y desbloquea operaciones en una calculadora que crece con el jugador ([M](M-calculadora/M0-progresion.md)). Ninguna de las dos se revoca; las dos muestran óxido cuando el concepto decae. La herramienta es el premio.

## 10. Un solo juego para todas las edades y todos los idiomas

El mismo grafo, las mismas mecánicas y el mismo contenido sirven a una persona de seis años y a una de sesenta; cambian la presentación y el input, nunca la matemática ([Q](Q-edad-universal.md)). Los primeros niveles se juegan sin leer, con instrucción por demostración y voz. Y ninguna cadena visible está fija: el juego nace internacionalizado, con la notación matemática misma como una capa localizable ([P](P-internacionalizacion.md)).

## 11. La visualización es un sistema de estados, no un video

La gramática visual viene de Manim, pero Manim se usa como especificación y como herramienta de autoría, no como reproductor ([I](I-manim/I0-mapping.md), [O](O-arquitectura-tecnica.md)). Una ecuación en pantalla es un objeto cuyos términos se mueven, se agrupan y se transforman conservando su identidad, para que `🍎 + 🍎` pueda convertirse en `x + x` y en `2x` sin que nada se reemplace. Lo que el jugador toca es interactivo y nativo; lo que solo mira puede pre-renderizarse, sin texto, para todos los idiomas.

## Lo que estas reglas prohíben

Enseñar un símbolo antes de su problema. Elegir una analogía porque es simpática. Dejar una analogía cuando ya estorba. Decir "incorrecto". Contar puntos como si fueran conocimiento. Saltar un prerequisito porque el jugador "ya lo vio". Poner una pantalla de ejercicios. Bloquear a un niño por su edad o a un adulto por su historia. Hardcodear una cadena. Reemplazar un objeto en pantalla en lugar de transformarlo.
