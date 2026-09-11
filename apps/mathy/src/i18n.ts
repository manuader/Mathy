/**
 * La costura de idioma.
 *
 * El diseño manda que ninguna cadena visible esté escrita dentro de un
 * componente: todo pasa por una clave, para que localizar sea traducir un
 * archivo y no salir a buscar textos por el código. Esto es lo mínimo que
 * cumple esa regla hoy —un diccionario en memoria y una función—, y es el
 * lugar donde después entra i18next con ICU MessageFormat, la detección de
 * `expo-localization` y los bundles por locale.
 *
 * `es` es el locale fuente. Una clave sin traducción devuelve la clave, que se
 * ve horrible a propósito: un texto sin traducir tiene que doler.
 */

const es: Record<string, string> = {
  "app.name": "Mathy",
  "app.tagline": "Cada concepto se aprende manipulando algo antes de escribirlo.",
  "map.back": "‹ Conceptos",
  "map.progress": "recorridos",
  "game.back": "‹ Niveles",

  "node.alg.eq.one_step.name": "Cofres y llaves",
  "node.alg.eq.one_step.tagline": "Una cerradura, una llave",

  "level.oneKeyTwoPans": "Una llave, dos platos",
  "level.fourLocks": "Cuatro cerraduras",
  "level.barsAndArrows": "Barras y flechas",
  "level.tokensBeside": "Fichas al lado",
  "level.ghostBalance": "Balanza fantasma",
  "level.hardNumbers": "Números difíciles",
  "level.boxOnTheRight": "La caja a la derecha",
  "level.locksNeverSeen": "Cerraduras que nunca viste",

  "node.found.count.number_line.name": "El camino de piedras",
  "node.found.count.number_line.tagline": "Los números viven en fila",

  "level.oneToothOneStone": "Un diente, una piedra",
  "level.stonesHaveNames": "Las piedras tienen nombre",
  "level.stoneWithNoSteps": "La piedra donde no diste ningún paso",
  "level.gaps": "Huecos",
  "level.tracksThatResize": "Pistas que cambian de tamaño",
  "level.marksOnly": "Solo marcas",

  "node.found.count.cardinality.name": "Los cuencos de fruta",
  "node.found.count.cardinality.tagline": "Contar dice cuántas hay",

  "level.onePairPerFruit": "Un par por fruta",
  "level.tickAndCard": "El tic y la tarjeta",
  "level.movingChangesNothing": "Mover no cambia",
  "level.cardTravels": "La tarjeta viaja",
  "level.moreFruitMoreMix": "Más frutas, más mezcla",
  "level.pebblesShellsMarks": "Piedras, conchas, marcas",

  "node.found.count.cardinality.learned":
    "Contar es darle a una colección un número que no cambia aunque las cosas se muevan, y ese número se puede llevar a otro lado.",

  "lesson.found.count.cardinality.1.why":
    "Cómo saber qué grupo tiene más sin contar: poniendo cada cosa frente a otra. Lo que queda sin pareja dice quién tiene más.",
  "lesson.found.count.cardinality.1.goal": "Emparejá todas las frutas y fijate qué cuenco tiene más.",
  "lesson.found.count.cardinality.1.coach.look":
    "Dos cuencos con frutas. ¿Cuál tiene más? Lo vas a descubrir sin contar ni una.",
  "lesson.found.count.cardinality.1.coach.drag":
    "Arrastrá una fruta de cualquier cuenco hasta la franja del medio. Se acomoda sola en su fila.",
  "lesson.found.count.cardinality.1.coach.bridge":
    "Ahora una fruta del otro cuenco. Va a quedar enfrente, y entre las dos aparece un puente.",
  "lesson.found.count.cardinality.1.coach.pairAll":
    "El puente dice que esas dos son pareja. Seguí hasta pasar todas las frutas a la franja.",
  "lesson.found.count.cardinality.1.coach.reveal":
    "La fruta que quedó sin puente es la que sobra: su cuenco tiene más. Comparaste sin contar.",

  "lesson.found.count.cardinality.2.why":
    "Cada fruta que entra suma exactamente uno. La tarjeta de puntos lleva la cuenta por vos.",
  "lesson.found.count.cardinality.2.goal": "Llená el cuenco hasta que su tarjeta tenga los mismos puntos que la otra.",
  "lesson.found.count.cardinality.2.coach.look":
    "La tarjeta de la izquierda pide una cantidad de puntos. El cuenco de la derecha arranca vacío.",
  "lesson.found.count.cardinality.2.coach.drag":
    "Arrastrá una fruta de la canasta al cuenco. Mirá la tarjeta del cuenco: gana un punto.",
  "lesson.found.count.cardinality.2.coach.fill":
    "Seguí de a una hasta que las dos tarjetas tengan los mismos puntos.",
  "lesson.found.count.cardinality.2.coach.reveal":
    "Cuando coinciden, se iluminan. Si te pasás, arrastrá la fruta de vuelta a la canasta.",

  "lesson.found.count.cardinality.3.why":
    "Mover, apilar o desparramar las frutas no cambia cuántas hay. Vas a cazar a la tarjeta que diga lo contrario.",
  "lesson.found.count.cardinality.3.goal": "Tocá la película en la que la tarjeta miente.",
  "lesson.found.count.cardinality.3.coach.look":
    "Las dos películas muestran el mismo cuenco. En las dos, las frutas se mueven de lugar.",
  "lesson.found.count.cardinality.3.coach.choose":
    "Mirá las tarjetas: en una, el número cambia mientras las frutas se mueven. Tocá esa, es la que miente.",
  "lesson.found.count.cardinality.3.coach.reveal":
    "Mover no cambia cuántas hay. Si el número cambió, alguien agregó o sacó una fruta.",

  "lesson.found.count.cardinality.4.why":
    "Los puntos de la tarjeta se juntan en un solo signo: el número. Sirve para acordarse de cuántas había aunque ya no se vean.",
  "lesson.found.count.cardinality.4.goal": "Llevale al cuenco la tarjeta que dice cuántas frutas tenía.",
  "lesson.found.count.cardinality.4.coach.look":
    "Mirá bien cuántas frutas hay. Cuando sigas, el cuenco se va a tapar.",
  "lesson.found.count.cardinality.4.coach.carry":
    "Arrastrá hasta el cuenco la tarjeta que dice cuántas había. Si dudás, tocá el cuenco para espiar.",
  "lesson.found.count.cardinality.4.coach.reveal": "El número guardó por vos algo que ya no se ve.",

  "lesson.found.count.cardinality.5.why":
    "Con muchas frutas mezcladas ya no se cuentan de un vistazo. Emparejar sigue funcionando si tocás cada una una sola vez.",
  "lesson.found.count.cardinality.5.goal": "Emparejá todas las frutas y fijate qué cuenco tiene más.",
  "lesson.found.count.cardinality.5.coach.recall":
    "Es el juego del nivel 1, con más frutas y mezcladas. Tu llave: emparejar compara.",

  "lesson.found.count.cardinality.6.why":
    "El número es de la colección, no de su forma: tres piedras grandes y tres marcas chicas son tres.",
  "lesson.found.count.cardinality.6.goal": "Poné sobre la colección la tarjeta que dice cuántas hay.",
  "lesson.found.count.cardinality.6.coach.recall":
    "Ya no son frutas: piedras, conchas o marcas, grandes y chicas. Se cuentan cosas, no tamaños.",

  "key.count.pair_compares.title": "Emparejar compara",
  "key.count.pair_compares.body":
    "Poné cada cosa frente a otra. Si sobra alguna, ese lado tiene más; si no sobra ninguna, tienen lo mismo. No hace falta contar.",
  "key.count.one_more.title": "Cada cosa suma uno",
  "key.count.one_more.body":
    "Cada cosa que entra suma exactamente un punto. Para llegar a un número se agrega de a una y se para justo ahí.",
  "key.count.moving_keeps.title": "Mover no cambia cuántas hay",
  "key.count.moving_keeps.body":
    "Apilar, desparramar o reordenar deja el mismo número. Si el número cambió, algo se agregó o se sacó.",
  "key.count.number_travels.title": "El número recuerda",
  "key.count.number_travels.body":
    "Un número guarda cuántas había aunque la colección ya no esté a la vista. Por eso los números se escriben.",
  "key.count.one_by_one.title": "Una por una, ninguna dos veces",
  "key.count.one_by_one.body":
    "Con muchas cosas mezcladas, emparejar sigue funcionando si cada una se toca una sola vez.",
  "key.count.shape_irrelevant.title": "El número no mira el tamaño",
  "key.count.shape_irrelevant.body":
    "Tres piedras grandes y tres marcas chicas son tres. El número es de la colección, no del lugar que ocupa.",

  "ui.intro.eyebrow": "Nivel {n} de {total} · {layer}",
  "ui.intro.learn": "Qué vas a aprender",
  "ui.intro.goal": "Tu objetivo",
  "ui.intro.uses": "Llaves que te sirven acá",
  "ui.intro.openKey": "Ver en la chuleta ›",
  "ui.intro.reward": "Al superar este nivel ganás una llave nueva para tu chuleta.",
  "ui.intro.start": "Empezar",
  "ui.intro.withGuide": "Jugar con la guía otra vez",
  "ui.intro.guideNote": "La primera ronda la jugás con una guía al lado.",

  "ui.coach.step": "Guía · paso {i} de {n}",
  "ui.coach.remember": "Recordá",
  "ui.coach.next": "Siguiente",
  "ui.coach.done": "Entendido",
  "ui.coach.skip": "Saltar guía",
  "ui.coach.yourMove": "Te toca: hacelo en el tablero.",
  "ui.goal.label": "Objetivo",
  "ui.goal.round": "Ronda {i} de {n}",

  "ui.done.eyebrow": "Nivel {n} de {total} · superado",
  "ui.done.nodeEyebrow": "Concepto completo",
  "ui.done.learned": "Lo que aprendiste",
  "ui.done.newKey": "Llave nueva · guardada en tu chuleta",
  "ui.done.keys": "{k} de {n} llaves de {node}",
  "ui.done.upNext": "Lo que viene",
  "ui.done.upNextNode": "El concepto que sigue",
  "ui.done.levelN": "Nivel {n}",
  "ui.done.next": "Siguiente nivel",
  "ui.done.nextNode": "Siguiente concepto",
  "ui.done.map": "Volver a los conceptos",
  "ui.done.replay": "Repetir",
  "ui.done.cheatsheet": "Ver en la chuleta",
  "ui.done.levels": "Niveles",

  "ui.key.locked": "Llave por descubrir",
  "ui.key.play": "Volver a jugar el nivel {n} ›",
  "ui.key.new": "Nueva",

  "ui.tools.cheatsheet": "Chuleta",
  "ui.tools.calculator": "Calculadora",
  "ui.cs.title": "Chuleta",
  "ui.cs.keys": "Tus llaves",
  "ui.cs.facts": "Reglas y fórmulas",
  "ui.cs.none": "Todavía vacía",
  "ui.cs.count.one": "1 idea guardada",
  "ui.cs.count.other": "{n} ideas guardadas",
  "ui.cs.search": "Buscar por título",
  "ui.cs.empty.title": "Tu chuleta está vacía, por ahora",
  "ui.cs.empty.body":
    "Cada nivel que superás te deja una llave: una idea corta que ya probaste con las manos. Las llaves vuelven a servir para resolver los niveles que siguen.",
  "ui.cs.notFound.title": "Ningún título dice “{q}”",
  "ui.cs.notFound.body": "La búsqueda mira los títulos, no los cuerpos. Probá con una palabra más corta.",

  "ui.bar.levels": "Niveles",
  "ui.map.concepts": "Conceptos",
  "ui.levels.walked": "{k} de {n} niveles recorridos",
  "area.found": "La huerta · contar",
  "area.arith": "El río · operar",
  "area.prealg": "El templo · la incógnita",
  "area.alg": "El taller · ecuaciones y funciones",
  "area.calc": "Las colinas · cambio y acumulación",
  "area.linalg": "El valle · vectores",
  "area.prob": "El mercado · azar",
  "area.graph": "Las islas · caminos",
  "area.geom": "El observatorio · formas y giros",
  "area.disc": "La biblioteca · lógica",
  "tomi.name": "Tomi",
  "ui.hint.ask": "Pedirle una pista a Tomi",
  "ui.hint.offer": "¿Te doy una pista?",
  "ui.hint.goal": "Lo que hay que lograr",
  "ui.hint.idea": "La idea de este concepto",
  "ui.hint.line": "Lo que te dice el juego",
  "ui.hint.show": "Mirá acá",
  "ui.hint.key": "Te sirve una llave",
  "ui.hint.tryTitle": "Si seguís sin saber",
  "ui.hint.try": "Probá un movimiento cualquiera: acá nada se pierde, y lo que pase te va a decir algo.",
  "ui.hint.more": "Otra pista",
  "ui.hint.close": "Entendido",
  "ui.hint.openKey": "Ver la llave",
  "ui.tools.sound": "Sonido",
  "ui.tools.soundOff": "Sin sonido",
  "ui.header.level": "nivel {n} de {total}",
  "ui.map.continue": "Seguí acá",
  "ui.levels.play": "Jugar",
  "ui.levels.keys": "{k} de {n} llaves",
  "ui.levels.rounds": "{n} rondas",

  "node.arith.add.displacement.name": "El viaje de dos tramos",
  "node.arith.add.displacement.tagline": "Sumar es avanzar en la pista",

  "level.oneJump": "Un tirón",
  "level.guessBeforeTurning": "Adivinar antes de girar",
  "level.twoLegsAndTheLedger": "Dos tramos y el libro",
  "level.theArrow": "La flecha",
  "level.theRow": "El renglón",
  "level.bigNumbersAndZero": "Números grandes y el cero",
  "level.theMissingLeg": "El tramo que falta",

  "node.arith.mul.scaling.name": "La banda y el piso",
  "node.arith.mul.scaling.tagline": "Multiplicar es estirar",

  "level.threeCellsPerTurn": "Tres casillas por vuelta",
  "level.rowsThatMerge": "Filas que se funden",
  "level.turnTheFloor": "Dar vuelta el piso",
  "level.theBand": "La banda",
  "level.keysAndCross": "Llaves y cruz",
  "level.ghostFloor": "Piso fantasma",
  "level.oneZeroAndFractions": "Uno, cero y fracciones",
  "level.bandsWithoutNumbers": "Bandas sin números",

  "node.arith.sub.undo_add.name": "La llave de vuelta",
  "node.arith.sub.undo_add.tagline": "Restar es deshacer un avance",

  "level.backInOneTug": "Volver de un tirón",
  "level.chooseWithoutTrying": "Elegir sin probar",
  "level.theReturnThatOvershoots": "La vuelta que se pasa",
  "level.twoWalkers": "Dos caminantes",
  "level.minusRow": "El renglón del menos",
  "level.bigNumbersZeroAndBack": "Números grandes, cero y vuelta completa",
  "level.locksThatArentSteps": "Cerraduras que no son pasos",

  "node.arith.div.undo_mul.name": "La llave que encoge",
  "node.arith.div.undo_mul.tagline": "Dividir deshace el estirado",

  "level.bandComesBack": "La banda vuelve",
  "level.theWholeKeyRing": "El llavero completo",
  "level.arrows": "Flechas",
  "level.floorWithWall": "El piso con la pared",
  "level.tokensBesideTheBand": "Fichas al lado",
  "level.ghostBand": "Banda fantasma",
  "level.whatIsLeftOver": "Lo que sobra",
  "level.undosNeverSeen": "Vueltas que nunca viste",

  "node.arith.int.negatives.name": "El ascensor y el caminante",
  "node.arith.int.negatives.tagline": "Negativo es la dirección contraria",

  "level.crossZero": "Cruzar el cero",
  "level.theElevator": "El ascensor",
  "level.coinsAndVouchers": "Monedas y vales",
  "level.arrowsAndStairs": "Flechas y escalera",
  "level.chipsBeside": "Fichas al lado",
  "level.noBuilding": "Sin edificio",
  "level.theStreetMoves": "La calle se muda",
  "level.directionsNeverSeen": "Direcciones que nunca viste",

  "node.arith.frac.parts_and_ratio.name": "La pizza y la barra",
  "node.arith.frac.parts_and_ratio.tagline": "Una fracción es partes del todo",

  "level.cutEven": "Cortar parejo",
  "level.lightSeveral": "Encender varias",
  "level.theJar": "El frasco",
  "level.barsAndOutlines": "Barras y contornos",
  "level.chipsBesideTheBar": "Fichas al lado de la barra",
  "level.theSharing": "El reparto",
  "level.theLineAlone": "La recta sola",
  "level.wholesNeverSeen": "Todos que nunca viste",

  "node.arith.expr.precedence_tree.name": "Cofres dentro de cofres",
  "node.arith.expr.precedence_tree.tagline": "Los paréntesis son cofres anidados",

  "level.oneChestInsideAnother": "Un cofre adentro de otro",
  "level.buildTheNesting": "Armar el anidamiento",
  "level.chestsAndTree": "Cofres y árbol",
  "level.thePipe": "La tubería",
  "level.chipsAndWalls": "Fichas y paredes",
  "level.invisibleChests": "Cofres invisibles",
  "level.undoIt": "Deshacer",
  "level.nestingsNeverSeen": "Encastres que nunca viste",
  "prec.definition":
    "Una expresión es un encastre de operaciones, y su forma se dibuja como un árbol. Para calcular el valor se empieza por el cofre de más adentro y se sube. Los paréntesis no operan: solo dicen qué está adentro de qué.",

  "node.prealg.var.unknown_as_box.name": "Cajas en el libro de cuentas",
  "node.prealg.var.unknown_as_box.tagline": "La incógnita es una caja cerrada",

  "level.eachInItsRow": "Cada cosa en su fila",
  "level.theBoxIsARowToo": "La caja también es una fila",
  "level.howMuchWithoutOpening": "Cuánto pesa sin abrirla",
  "level.twoMarks": "Dos marcas",
  "level.barsAndCounts": "Barras y conteos",
  "level.lettersBeside": "Letras al lado",
  "level.marksNeverSeen": "Marcas que nunca viste",

  "node.prealg.eq.balance.name": "Los dos platos",
  "node.prealg.eq.balance.tagline": "El igual es una balanza",

  "level.straighten": "Que quede derecha",
  "level.keepItStraight": "Que siga derecha",
  "level.boxInAPan": "La caja en un plato",
  "level.barsAndStates": "Barras y estados",
  "level.theBarBecomesEqual": "La barra se vuelve igual",
  "level.bothSidesComposed": "Los dos lados compuestos",
  "level.actionsNeverSeen": "Acciones que nunca viste",
  "bal.definition.sameWorth": "Una igualdad dice que los dos lados valen lo mismo.",
  "bal.definition.sameAction":
    "Si dos lados iguales reciben la misma acción, siguen iguales.",
  "bal.definition.notAnOrder": "El igual no ordena calcular: afirma.",

  "node.prealg.inv.operation_as_key.name": "El llavero",
  "node.prealg.inv.operation_as_key.tagline": "Toda operación tiene llave",

  // Los otros tres títulos de este nodo ya están en el diccionario y dicen
  // exactamente lo mismo: `level.fourLocks`, `level.arrows` y
  // `level.locksNeverSeen`. Una clave repetida con el mismo texto es una
  // traducción que después hay que mantener dos veces.
  "level.theKeyThatEnters": "La llave que entra",
  "level.theCompleteKey": "La llave completa",
  "level.chipsOnTheArrows": "Fichas sobre las flechas",
  "level.chainsAndNegatives": "Cadenas y negativos",
  "key.definition":
    "Deshacer una operación es aplicar otra que devuelve exactamente lo que había. Cada operación tiene su llave: sumar y restar el mismo número; multiplicar y dividir por el mismo número, distinto de cero. Una acción y su llave dejan todo como estaba.",

  "node.alg.eq.multi_step.name": "Cofres anidados",
  "node.alg.eq.multi_step.tagline": "Varias llaves, en orden",

  "level.twoChestsTwoKeys": "Dos cofres, dos llaves",
  "level.fourNestedLocks": "Cuatro cerraduras anidadas",
  "level.boxesAndLadder": "Cajas y escalera",
  "level.mixWithSymbols": "Mezcla con símbolos",
  "level.ghostChests": "Cofres fantasma",
  "level.buildTheKey": "Armar la llave",
  "level.newEquations": "Ecuaciones nuevas",

  "multi.hint.outerFirst": "Empezá por el cofre de afuera: es el único con la tapa al alcance.",
  "multi.hint.next": "Ese cedió. Ahora el que estaba adentro.",
  "multi.hint.bounce": "Esa llave sirve, pero todavía no: la tapa de afuera la cubre. La cerradura expuesta dice",
  "multi.hint.jam": "Esa llave gira un cuarto de vuelta y se traba. La cerradura expuesta dice",
  "multi.hint.tilt": "Sacaste de un plato y lo pusiste en el otro. La barra se hundió.",
  "multi.hint.solved": "La x quedó sola y la balanza siguió nivelada.",
  "multi.hint.alone": "La x quedó sola, y cada renglón dice qué se hizo para llegar.",
  "multi.hint.assemble": "Armá la llave: primero la operación, después el número.",
  "multi.hint.needNumber": "Falta el número de la llave.",
  "multi.hint.needOp": "Falta la operación de la llave.",
  "multi.hint.sameSize": "Los dos cofres son del mismo tamaño: podés empezar por cualquiera.",
  "multi.hint.commute": "Ese salió igual. El otro sigue ahí.",
  "multi.hint.strangeChest": "Este cofre es raro. Abrilo y mirá qué queda.",
  "multi.hint.noKey": "Este cofre no tiene llave. Mirá qué quedó a los dos lados.",
  "multi.hint.noSolution": "El cofre está vacío: ningún valor deja la igualdad en pie.",
  "multi.hint.identity": "El cofre abre con cualquier valor: la igualdad ya era cierta.",
  "multi.hint.wrongCase": "No es ese caso. Compará los dos lados otra vez.",
  "multi.slot.empty": "Llave sin armar",
  "multi.slot.filled": "Llave a medio armar:",
  "multi.answer.noTreasure": "No hay tesoro",
  "multi.answer.anyKey": "Abre con cualquiera",
  "multi.chests.show": "ver cofres",
  "multi.chests.hide": "ocultar cofres",
  "multi.balance.show": "ver balanza",
  "multi.balance.hide": "ocultar balanza",
  "multi.pipe.show": "ver tubería",
  "multi.pipe.hide": "ocultar tubería",
  "multi.pipe.forward": "correr de ida",
  "multi.pipe.backward": "correr al revés",
  "multi.definition":
    "Una ecuación de varios pasos es una igualdad donde la incógnita está envuelta en más de una operación. Resolverla es abrir las envolturas de afuera hacia adentro, aplicando cada inversa a los dos lados. Cada paso produce una ecuación nueva con las mismas soluciones que la anterior, y por eso se llaman equivalentes.",

  "node.alg.expr.distributive_tiles.name": "Dos habitaciones",
  "node.alg.expr.distributive_tiles.tagline": "El mismo piso contado de dos maneras",

  // El nivel 4 se llama "Fichas al lado" y esa clave ya existe más arriba con
  // ese texto exacto: `level.tokensBeside`. Una clave repetida con el mismo
  // texto es una traducción que después hay que mantener dos veces.
  "level.coverTheFloor": "Cubrir el piso",
  "level.theRoomWithNoMeasure": "La habitación sin medida",
  "level.barsAndBraces": "Barras y llaves",
  "level.noFloor": "Sin piso",
  "level.theSquareThatGrows": "El cuadrado que crece",

  "node.alg.sys.two_by_two.name": "El libro de frutas",
  "node.alg.sys.two_by_two.tagline": "Dos filas comparten frutas",

  "level.oneFruitAlone": "Una fruta sola",
  "level.twoFruitsOneRow": "Dos frutas, una fila",
  "level.twoRows": "Dos filas",
  "level.barsAndSegments": "Barras y segmentos",
  "level.lettersAndBrace": "Letras y llave",
  "level.chooseTheMethod": "Elegir el método",
  "level.whenThereIsNoCross": "Cuando no hay cruce",

  "sys.hint.share": "Repartí el total: soltá una ficha bajo la fruta hasta que la línea quede derecha.",
  "sys.hint.pairs": "Buscá pares que dejen la línea derecha. Hay más de uno.",
  "sys.hint.pairsMore": "Ese par sirve. ¿Habrá otro?",
  "sys.hint.pairAgain": "Ese par ya lo encontraste. Probá otro.",
  "sys.hint.pairsDone": "Muchos pares dejan derecha una sola fila. Una fila no alcanza para dos frutas.",
  "sys.hint.substitute": "La fila de arriba dice cuánto vale una fruta. Tocala para cambiarla por sus pesas.",
  "sys.hint.pour": "Volcá un renglón sobre el otro: tocá el asa de uno y después la del otro.",
  "sys.hint.choose": "Elegí: reemplazar una fruta o volcar las filas. Antes de volcar puede hacer falta agrandar una.",
  "sys.hint.classify": "Mirá las dos rectas antes de resolver. ¿Cuántos pares cumplen las dos?",
  "sys.hint.pickChip": "Elegí una ficha del mostrador y soltala bajo una fruta.",
  "sys.hint.chipHeld": "Ahora soltala bajo una fruta. Va a aparecer bajo todas.",
  "sys.hint.factorHeld": "Tocá el asa de una fila para agrandarla entera.",
  "sys.hint.rowHeld": "Tocá el asa de la otra fila para volcar esta encima.",
  "sys.hint.keepGoing": "Las dos filas siguen en pie. Falta la otra.",
  "sys.hint.keepGoingOne": "La fila sigue abierta: falta la otra.",
  "sys.hint.tilted": "Una fila quedó derecha y la otra se inclinó. Falta reemplazar en la otra.",
  "sys.hint.bothTilted": "Las dos líneas se inclinaron. Probá otro par.",
  "sys.hint.tiltedOne": "La línea se inclinó. Probá otra ficha.",
  "sys.hint.substituted": "La fruta se fue de las dos filas al mismo tiempo.",
  "sys.hint.substitutedLetter": "La incógnita se fue de las dos filas al mismo tiempo.",
  "sys.hint.solvedOne": "La línea quedó derecha: la fruta ya muestra su valor.",
  "sys.hint.needValue": "Esa fruta todavía no mostró su valor.",
  "sys.hint.alreadyGone": "Esa fruta ya se reemplazó en todas las filas.",
  "sys.hint.poured": "Las dos filas se juntaron y una fruta se canceló sola.",
  "sys.hint.pouredNothing": "Se juntaron, pero no se canceló nada: la fila nueva trae las dos frutas.",
  "sys.hint.noRoom": "No entra otro renglón en el cartel.",
  "sys.hint.scaled": "La fila creció entera: todos sus términos y también el total.",
  "sys.hint.wrongFactor": "Con ese factor no se acerca ninguna cancelación. Mirá los dos coeficientes.",
  "sys.hint.solved": "Las dos líneas quedaron derechas al mismo tiempo.",
  "sys.hint.verified": "Los valores volvieron a las filas de origen y las dos siguen derechas.",
  "sys.hint.class.unique": "Se cruzan en un punto: hay un solo par.",
  "sys.hint.class.none": "Son paralelas y no se tocan: ningún par cumple las dos.",
  "sys.hint.class.infinite": "Es la misma recta dos veces: infinitos pares cumplen las dos.",
  "sys.hint.wrongClass": "No es esa. Mirá si las rectas se cruzan, si no se tocan o si son la misma.",
  "sys.answer.unique": "Un solo par",
  "sys.answer.none": "Ningún par",
  "sys.answer.infinite": "Infinitos pares",
  "sys.balance.other": "la otra fila",
  "sys.grid.show": "ver la grilla",
  "sys.grid.hide": "ocultar la grilla",
  "sys.definition":
    "Un sistema de dos por dos son dos igualdades sobre las mismas dos incógnitas. Una solución es un par de valores que cumple las dos al mismo tiempo. Dos sistemas son equivalentes si tienen exactamente las mismas soluciones. Dos rectas que se cruzan dan una solución; dos paralelas, ninguna; dos superpuestas, infinitas.",

  "node.alg.fn.function_as_machine.name": "La fábrica",
  "node.alg.fn.function_as_machine.tagline": "Una función es una máquina",

  "level.guessTheMachine": "Adivinar la máquina",
  "level.buildTheMachine": "Armar la máquina",
  "level.dotsAndArrows": "Puntos y flechas",
  "level.theMachineHasAName": "La máquina tiene nombre",
  "level.inputsThatArentNumbers": "Entradas que no son números",
  "level.twoWritingsOneFunction": "Dos escrituras, una función",

  "fn.ask.guess": "La placa está tapada. Meté fichas en la ranura hasta que salga la que se pide.",
  "fn.ask.build": "Armá la máquina: soltá fichas de operación en el caño hasta que la tabla coincida.",
  "fn.ask.broken": "Armá la máquina. Fijate qué hace cada ficha antes de dejarla adentro.",
  "fn.ask.network": "Colgá una flecha desde cada punto de la izquierda hasta donde lo manda la regla.",
  "fn.ask.judge": "Una de las dos no es una máquina. Tocala.",
  "fn.ask.name": "Esa salida la produce una sola de las dos. Tocá cuál.",
  "fn.ask.evaluate": "Meté esa entrada en la ranura y elegí lo que sale.",
  "fn.ask.letters": "La entrada ya no es un número. La regla no cambia: elegí lo que sale.",
  "fn.ask.chain": "Las dos máquinas están en el orden equivocado. Tocá una para darlas vuelta.",
  "fn.ask.reject": "Esta máquina no acepta cualquier ficha. Encontrá una que entre y que salga como se pide.",
  "fn.ask.sameRule": "Una de las tres es la misma función escrita distinto. Tocala.",
  "fn.ask.fromTable": "Dos reglas explican esa fila. Meté la ficha que queda para ver cuál es.",
  "fn.ask.relation": "Mirá la tabla. ¿Es una máquina?",

  "fn.hint.otherOutput": "Salió otra cosa. Ya sabés algo más de lo que hace adentro.",
  "fn.hint.sameAgain": "Misma ficha, misma salida: la fila que ya estaba se encendió en vez de repetirse.",
  "fn.hint.spat": "La máquina escupió esa ficha sin tocarla. Esa entrada no es de las que acepta.",
  "fn.hint.twoOutputs": "Con esa ficha salieron dos cosas de una sola entrada. Mirá el tubo de al lado.",
  "fn.hint.wrongPiece": "Con esa la tabla no da. Probá con otra.",
  "fn.hint.nextPiece": "Entró. Ahora la que sigue, en la ranura de al lado.",
  "fn.hint.twoArrows": "Ese punto ahora manda a dos lados a la vez. Las dos flechas parpadean.",
  "fn.hint.wrongArrow": "La regla no lo manda ahí. Mirá el número del punto.",
  "fn.hint.nextArrow": "Ese ya tiene la suya. Falta algún punto apagado.",
  "fn.hint.thatOneIsAMachine": "Esa sí es una máquina: cada punto manda a un solo lado. Mirá la otra.",
  "fn.hint.otherMachine": "Con esa entrada, esa máquina saca otra cosa. Probá la otra.",
  "fn.hint.otherOrder": "En ese orden sale otra cosa. La entrada es la misma: cambió el camino.",
  "fn.hint.itIsAMachine": "Esa entrada se repite, pero las dos veces sale lo mismo. Sigue siendo una máquina.",
  "fn.hint.itIsNot": "Buscá la entrada que aparece dos veces y mirá las dos salidas.",
  "fn.hint.extraRow": "Esa fila nueva las separa: ahora las dos reglas ya no dicen lo mismo.",

  "fn.lure.only_first_step": "Esa es lo que sale de la primera parte. Falta lo que hace la que sigue.",
  "fn.lure.only_last_step": "Esa se saltea la primera parte. La ficha las atraviesa todas.",
  "fn.lure.outside_the_slot": "Eso es operar con lo que salió. El paréntesis es la ranura: lo de adentro es lo que entra.",
  "fn.lure.other_rule": "Esa también explicaba la primera fila. Mirá la fila nueva.",
  "fn.lure.default": "Esa no es. Seguí la ficha por adentro de la máquina.",

  "fn.done.guess": "Esa era. Con la placa tapada, la tabla es lo único que dice qué hace adentro.",
  "fn.done.build": "La máquina reproduce la tabla entera: una salida por entrada, siempre la misma.",
  "fn.done.network": "Cada punto de la izquierda tiene una flecha y una sola. Eso es una función.",
  "fn.done.judge": "Esa no era una máquina: un punto mandaba a dos lados.",
  "fn.done.name": "Esa era. Ahora que hay dos, cada una necesita nombre para poder decir cuál.",
  "fn.done.evaluate": "Eso sale. El nombre dice cuál máquina y el paréntesis, con qué se la alimenta.",
  "fn.done.letters": "La regla es la misma con cualquier entrada. Eso es tratarla como un objeto.",
  "fn.done.chain": "En ese orden sale lo pedido. Encadenar no es sumar: importa cuál recibe a cuál.",
  "fn.done.reject": "Esa entró. Las que la máquina escupe no son de su dominio.",
  "fn.done.sameRule": "Dan lo mismo para toda entrada, aunque estén escritas distinto: son la misma función.",
  "fn.done.fromTable": "Esa es. Una tabla con pocas filas no alcanza para decidir cuál es la regla.",
  "fn.done.relationYes": "Sí: la entrada repetida saca las dos veces lo mismo.",
  "fn.done.relationNo": "No: esa entrada saca dos salidas distintas, y ninguna máquina hace eso.",

  "fn.answer.isMachine": "Es una máquina",
  "fn.answer.isNot": "No lo es",
  "fn.definition":
    "Una función asigna a cada entrada exactamente una salida. El conjunto de entradas que acepta es su dominio; el de salidas que produce, su imagen. Dos funciones son iguales si dan la misma salida para toda entrada, aunque sus reglas estén escritas distinto.",

  "node.alg.fn.composition.name": "La cadena de máquinas",
  "node.alg.fn.composition.tagline": "Encadenar máquinas es componer",

  "level.paintAndCap": "Pintar y tapar",
  "level.whatIfWeSwapThem": "¿Y si las damos vuelta?",
  "level.hookUpThePipe": "Enganchar el tubo",
  "level.orderMatters": "El orden importa",
  "level.theGearTrain": "El tren de engranajes",
  "level.namesAndParentheses": "Nombres y paréntesis",
  "level.chainsOfThree": "Cadenas de tres",

  "comp.ask.watch": "La cinta corre sola. Tocá la bola que salió del final.",
  "comp.ask.swap": "Esa bola pasó por las dos máquinas. Si las damos vuelta, ¿cuál sale?",
  "comp.ask.connect": "Enganchá el tubo: soltá una máquina en cada ranura, en el orden que llega a la bola marcada.",
  "comp.ask.which": "La misma bola por dos caminos. Tocá el carril que saca la bola pedida.",
  "comp.ask.order": "En este orden sale otra cosa. Tocá una caja para intercambiarla con la de al lado.",
  "comp.ask.predict": "Antes de soltar la bola: ¿cuánto va a marcar el contador? Soltá esa ficha en el pico.",
  "comp.ask.lasso": "Tocá cada caja: su regla se contrae hasta su letra. Con las dos nombradas, la cadena tiene nombre.",
  "comp.ask.nest": "Sin tubos. Resolvé lo que está escrito y tocá la ficha que sale.",
  "comp.ask.chain3": "Tres máquinas. Tocá una caja para intercambiarla con la de al lado hasta llegar a la bola pedida.",
  "comp.ask.commutes": "Los dos órdenes, con la misma bola. ¿Da igual?",
  "comp.ask.reject": "Una de esas cadenas no se puede correr: lo que sale de la primera no entra en la segunda. Tocala.",

  "comp.hint.pipeSlips": "El tubo se resbaló: esa máquina no engancha acá. Probá otra.",
  "comp.hint.nowTheOther": "Enganchada. Ahora la que sigue, en la ranura de al lado.",
  "comp.hint.otherOrder": "En ese orden sale otra cosa. La bola es la misma: cambió el camino.",
  "comp.hint.andTheOther": "Esa ya tiene nombre. Falta la otra.",
  "comp.hint.thatLaneGivesAnother": "Ese carril saca otra bola. Mirá las dos salidas antes de elegir.",
  "comp.hint.lookAgainSame": "Mirá otra vez las dos salidas: son la misma bola.",
  "comp.hint.lookAgainDiffer": "Mirá otra vez las dos salidas: no son la misma bola.",

  "comp.lure.only_outer": "Esa se saltea la máquina de adentro. La bola las atraviesa a las dos.",
  "comp.lure.only_inner": "Esa es lo que salió de la primera. Todavía le falta la segunda.",
  "comp.lure.same_either_way": "Esa es la que salía antes. Sumar y multiplicar no cambiaban con el orden; encadenar sí.",
  "comp.lure.wrong_order": "Eso es aplicarlas al revés. La que actúa primero es la que está pegada a la entrada.",
  "comp.lure.ratios_added": "Ahí las razones están sumadas. Cada rueda estira lo que le llega: se multiplican.",
  "comp.lure.default": "Esa no es. Seguí la bola por adentro de las dos.",

  "comp.done.watch": "Esa salió. Pasó por las dos, en ese orden.",
  "comp.done.swap": "Con las máquinas al revés sale otra bola. La entrada es la misma: cambió el camino.",
  "comp.done.connect": "La cadena está armada y la bola la atraviesa entera. Dos máquinas con un tubo son una máquina.",
  "comp.done.which": "Ese carril la saca. El otro tiene las mismas cajas y da otra cosa.",
  "comp.done.order": "En ese orden sale la pedida. Encadenar no es sumar: importa cuál recibe a cuál.",
  "comp.done.predict": "Eso marcó. Cada rueda estira lo que le llega, así que las razones se multiplican.",
  "comp.done.lasso": "Las dos entraron en una caja sola, con un tubo de entrada y uno de salida. Esa caja tiene nombre.",
  "comp.done.nest": "Eso sale. Lo que está más adentro actúa primero, aunque se lea al final.",
  "comp.done.reject": "Esa no se puede correr: lo que sale de la primera no entra en la boca de la segunda.",
  "comp.done.commutesYes": "Sí: ese par da lo mismo en los dos órdenes. Hay pares que conmutan, y encontrarlos no cambia la regla general.",
  "comp.done.commutesNo": "No: las dos salidas son distintas. Cambiar el orden dio otra función.",

  "comp.answer.same": "Da igual",
  "comp.answer.different": "No da igual",
  "comp.definition":
    "Componer dos funciones es aplicar una y después la otra. En f∘g actúa primero g, la que está pegada a la entrada. El orden importa: cambiarlo suele dar otra función. La cadena existe solo si lo que sale de la primera sirve como entrada de la segunda.",

  "node.alg.fn.graph_as_picture.name": "El rastro del caminante",
  "node.alg.fn.graph_as_picture.tagline": "La gráfica es el rastro",

  "level.thePencilThatDrawsAlone": "El lápiz que dibuja solo",
  "level.whereDoesItGoOn": "¿Por dónde sigue?",
  "level.dragTheWalker": "Arrastrar al caminante",
  "level.belowSeaLevel": "Bajo el nivel del mar",
  "level.threadsAndRulers": "Hilos y reglas",
  "level.pairsAndAxes": "Pares y ejes",
  "level.tracesNeverSeen": "Rastros que nunca viste",
  "level.theVerticalLine": "La recta vertical",

  "gp.hint.spot": "El caminante ya pasó. Tocá la gota que dejó en esa posición.",
  "gp.hint.continue": "El caminante se detuvo. Tocá la línea por donde va a seguir.",
  "gp.hint.walk": "Arrastrá al caminante. Con cada paso cae una gota a la hoja.",
  "gp.hint.read": "La gota está encendida y sus dos hilos bajan a las reglas. Tocá el par que la nombra.",
  "gp.hint.place": "Soltá la gota en la hoja, en el lugar que dice el par.",
  "gp.hint.judge": "Bajá la recta vertical con el dedo y mirá cuántas veces corta la curva.",
  "gp.hint.spotted": "Esa es: en esa posición el caminante estaba a esa altura.",
  "gp.hint.otherDrop": "Esa gota es de otra posición. Mirá la regla de abajo.",
  "gp.hint.continued": "Por ahí sigue: la línea copia el alto del terreno que viene.",
  "gp.hint.otherCurve": "Por ahí no: el terreno sube donde esa línea baja.",
  "gp.hint.twoHeights": "Esa vuelve sobre sus pasos y pone dos alturas sobre el mismo lugar. Ninguna máquina hace eso.",
  "gp.hint.readIt": "Ese es el par: primero la posición, después la altura.",
  "gp.hint.swapped": "Moviste al caminante hasta acá. ¿A qué altura quedó?",
  "gp.hint.otherPair": "Ese par cae en otro lugar. Seguí los dos hilos.",
  "gp.hint.placed": "Ahí va: esa posición y esa altura.",
  "gp.hint.itFell": "La gota cayó por su peso hasta la altura que devuelve la máquina.",
  "gp.hint.otherPlace": "Esa es otra posición. El primer número es el que caminaste.",
  "gp.hint.covered": "La hoja quedó completa: una gota por posición, y ninguna repetida.",
  "gp.hint.pickCurve": "Tocá una de las tres líneas.",
  "gp.hint.dragTheDrop": "Arrastrá la gota hasta la hoja.",
  "gp.hint.isGraph": "Ninguna recta vertical la corta dos veces: puede ser el rastro de una máquina.",
  "gp.hint.why.two_heights": "Vuelve sobre sí misma: sobre esa posición hay dos alturas.",
  "gp.hint.why.closed_curve": "Es cerrada: la recta vertical la corta arriba y abajo.",
  "gp.hint.why.vertical_segment": "Tiene un tramo derecho parado: sobre esa posición hay infinitas alturas.",
  "gp.hint.sweepIt": "No es esa. Pasá la recta vertical por toda la curva antes de decidir.",
  "gp.answer.isGraph": "Puede ser un rastro",
  "gp.answer.notGraph": "No puede",
  "gp.machine.show": "ver la máquina",
  "gp.machine.hide": "ocultar la máquina",
  "gp.definition":
    "La gráfica de una función es el conjunto de todos los pares de entrada y salida. Cada punto se escribe con la entrada primero y la salida después. Una curva es la gráfica de una función solo si ninguna recta vertical la corta dos veces.",

  "node.alg.fn.linear_slope.name": "La rampa del caminante",
  "node.alg.fn.linear_slope.tagline": "La pendiente es lo empinado",

  "level.twoRamps": "Dos rampas",
  "level.whichCostsMore": "¿Cuál cuesta más?",
  "level.restTheStep": "Apoyar el escalón",
  "level.stepsOfAnyWidth": "Escalones de cualquier ancho",
  "level.crankAndGrid": "Manivela y grilla",
  "level.tilesBeside": "Fichas al lado",
  "level.ghostRamp": "Rampa fantasma",
  "level.theRampWithoutSlope": "La rampa que no tiene pendiente",

  "sl.hint.pickRamp": "Tocá la rampa que sube eso por cada paso.",
  "sl.hint.whichHarder": "Tocá la rampa que cuesta más subir.",
  "sl.hint.placeStep": "Arrastrá el escalón a otro lugar de la rampa y mirá el color.",
  "sl.hint.stretchStep": "El escalón se ensanchó y quedó flotando. Movés la esquina hasta que vuelva a tocar la rampa.",
  "sl.hint.crank": "Girá la manivela. Cada vuelta avanza un paso y sube lo mismo.",
  "sl.hint.stretchGrid": "Estirá la grilla hasta que la rampa pase por el punto marcado.",
  "sl.hint.setSliders": "Movés uno y la rampa se corre; movés el otro y gira. Pasá por los dos puntos.",
  "sl.hint.slopeBetween": "Dos puntos de la rampa. Tocá la ficha que dice cuánto sube por cada avance.",
  "sl.hint.readForm": "La misma recta, escrita de tres maneras. Tocá la ficha que es la pendiente.",
  "sl.hint.judge": "Mirá la rampa y elegí.",
  "sl.hint.thatOne": "Esa: por cada paso sube esa altura.",
  "sl.hint.steepest": "Esa cuesta más: sube más por cada paso que avanza.",
  "sl.hint.otherRamp": "Esa no. Mirá cuánto sube cada una por un paso.",
  "sl.hint.moreStepsNotSteeper": "Por esa se dan más pasos, pero cada paso sube menos. El paso no es la cuesta.",
  "sl.hint.restAgain": "Cambiaron las marcas y el color no. Apoyalo en otro lugar más.",
  "sl.hint.sameColor": "El escalón cambió de lugar y el color no cambió: la cuesta es la misma en toda la rampa.",
  "sl.hint.floating": "Quedó flotando. La sombra muestra dónde tendría que apoyar.",
  "sl.hint.wideNotSteeper": "El escalón se hizo más ancho y la subida quedó igual. Si avanza el doble, ¿cuánto sube?",
  "sl.hint.itFits": "Apoyó. Los dos escalones tienen anchos distintos y encajan: es la misma cuesta.",
  "sl.hint.keepTurning": "Seguí girando hasta la bandera.",
  "sl.hint.sameEveryTurn": "Cada vuelta avanzó lo mismo y subió lo mismo.",
  "sl.hint.keepStretching": "La grilla se estiró y la rampa se acostó. Seguí hasta el punto.",
  "sl.hint.gridChangedIt": "Acá el color sí cambió: se estiró la grilla, no el escalón.",
  "sl.hint.turnItMore": "Todavía no pasa por los dos. Uno de los deslizadores gira la rampa y el otro la sube.",
  "sl.hint.rightSlopeWrongStart": "La cuesta ya está. Falta la altura de arranque.",
  "sl.hint.throughBoth": "Pasa por los dos: esa cuesta y ese arranque.",
  "sl.hint.thatIsTheSlope": "Esa es: sube eso por cada uno que avanza.",
  "sl.hint.thatIsM": "Esa es la pendiente, esté la recta despejada o no.",
  "sl.hint.riseOnly": "Eso es lo que sube, pero no en un paso. ¿Cuánto avanzó mientras subía eso?",
  "sl.hint.runOnly": "Eso es lo que avanza, y la cuesta es cuánto sube por cada avance.",
  "sl.hint.otherRatio": "Esa no. Contá la subida y el avance del escalón.",
  "sl.hint.lookAgain": "Esa no. Mirá si hay avance, y si las dos suben lo mismo por paso.",
  "sl.hint.why.flat": "Sube cero por cada paso: la pendiente es cero, y sigue siendo una función.",
  "sl.hint.why.vertical": "No tiene pendiente: no hay avance, así que el escalón no se puede apoyar.",
  "sl.hint.why.parallel": "Misma cuesta y distinto arranque: nunca se cruzan.",
  "sl.hint.why.crossing": "Cuestas distintas: en algún lado se cruzan.",
  "sl.answer.slopeZero": "Tiene pendiente cero",
  "sl.answer.noSlope": "No tiene pendiente",
  "sl.answer.notAFunction": "No es una función",
  "sl.answer.theyCross": "Se cruzan",
  "sl.answer.neverCross": "No se cruzan nunca",
  "sl.ramp.show": "ver la rampa",
  "sl.ramp.hide": "ocultar la rampa",
  "sl.definition":
    "Una función lineal sube siempre lo mismo por cada unidad que avanza. La pendiente es cuánto sube dividido cuánto avanza, medida entre dos puntos cualesquiera de la recta. La ordenada al origen es la altura donde la recta cruza el eje vertical. Una recta vertical no tiene pendiente porque no hay avance.",

  "node.alg.fn.inverse_function.name": "La máquina en reversa",
  "node.alg.fn.inverse_function.tagline": "La llave ahora es una máquina entera",

  "level.wrapAndUnwrap": "Envolver y desenvolver",
  "level.whatComesOutTheOtherSide": "¿Qué sale por el otro lado?",
  "level.pullTheLever": "Tirar de la palanca",
  "level.theMachineKeyRing": "El llavero de máquinas",
  "level.foldTheGrid": "Doblar la grilla",
  "level.namesAndTheMark": "Nombres y marca",
  "level.twoStepsAndGhostMachine": "Dos pasos y máquina fantasma",
  "level.machinesThatDoNotComeBack": "Máquinas que no vuelven",

  "inv.ask.watch": "La máquina corre en las dos posiciones. Tocá la bola que volvió a ser la que era.",
  "inv.ask.predict": "La bola cambiada está frente a la boca de salida. ¿Qué sale del otro lado?",
  "inv.ask.lever": "Soltá la bola. Después tirá de la palanca y metela por donde salió.",
  "inv.ask.ring": "Llevá a la flecha de vuelta la máquina que devuelve la bola como estaba.",
  "inv.ask.fold": "La grilla se dobla por la diagonal. Tocá el rastro que queda del otro lado.",
  "inv.ask.swap": "Tocá la gota que tiene los dos números del par intercambiados.",
  "inv.ask.name": "Tocá la ficha que dice lo que hace la máquina de vuelta.",
  "inv.ask.identity": "La bola atraviesa las dos máquinas. Tocá la ficha que dice con qué sale.",
  "inv.ask.order": "Tocá la cadena que deja la bola como entró.",
  "inv.ask.exists": "Mirá la máquina y decidí si se puede correr al revés.",
  "inv.ask.cut": "Elegí qué entradas se admiten para que la vuelta exista.",

  "inv.lever.back": "tirar de la palanca",
  "inv.lever.forward": "volver la palanca",

  "inv.hint.leverBack": "La palanca giró: ahora la bola entra por donde salía.",
  "inv.hint.leverForward": "La palanca volvió: la máquina corre para adelante otra vez.",
  "inv.hint.pullTheLeverNow": "Salió cambiada. Tirá de la palanca y metela por la otra boca.",
  "inv.hint.cameOutChanged": "Entró por un lado y salió cambiada por el otro.",
  "inv.hint.cameBack": "Entró la cambiada y salió la que era: la original sigue en la canasta.",
  "inv.hint.notTheSame": "Volvió, pero no es la que estaba en la canasta. Mirá las dos.",
  "inv.hint.chainKeeps": "Atravesó las dos máquinas y salió como entró.",
  "inv.hint.otherDrop": "Esa no. Buscá la que tiene los mismos dos números al revés.",

  "inv.done.watch": "Esa es: volvió a ser exactamente la que entró.",
  "inv.done.predict": "Eso pasa: la máquina al revés devuelve la caja como era.",
  "inv.done.lever": "La bola volvió a ser la que era. La máquina de vuelta la deshizo.",
  "inv.done.ring": "Esa máquina devolvió la bola como estaba: es la de vuelta.",
  "inv.done.fold": "La grilla se dobló y los dos rastros quedaron simétricos.",
  "inv.done.swap": "Ese es el par dado vuelta, del otro lado de la diagonal.",
  "inv.done.name": "Esa es la regla de la máquina de vuelta, y se llama f⁻¹.",
  "inv.done.identity": "La cadena deja la bola como estaba: f⁻¹(f(x)) = x.",
  "inv.done.order": "Esa: la última máquina que tocó la bola es la primera que se deshace.",
  "inv.done.exists": "Eso es: mirá cuántas entradas caen en la misma salida.",
  "inv.done.cut": "Con esas entradas admitidas hay una sola por cada salida, y la vuelta existe.",

  "inv.lure.same_operation": "Esa vuelve a hacer lo mismo en vez de deshacerlo.",
  "inv.lure.other_pair": "Ese es el número de la máquina, pero no es la operación que la deshace.",
  "inv.lure.near_value": "Esa entra y lo que vuelve no es la bola que estaba en la canasta.",
  "inv.lure.wrong_order": "Esas son las dos, y en ese orden. ¿Cuál tocó la bola al final?",
  "inv.lure.reciprocal": "La marca no significa uno dividido la máquina. Es la que devuelve.",
  "inv.lure.applied_twice": "Eso sale de correrla dos veces para adelante, no de correrla al revés.",
  "inv.lure.over_x_axis": "Ese rastro está dado vuelta de arriba abajo, no sobre la diagonal.",
  "inv.lure.over_y_axis": "Ese rastro está dado vuelta de izquierda a derecha, no sobre la diagonal.",
  "inv.lure.through_origin": "Ese rastro giró media vuelta, y el doblez es sobre la diagonal.",
  "inv.lure.default": "Esa no devuelve la bola como estaba.",

  "inv.ending.same": "Sale la caja original",
  "inv.ending.twice": "Sale envuelta dos veces",
  "inv.ending.jam": "La máquina se traba",

  "inv.exists.yes": "Se puede correr al revés",
  "inv.exists.cut": "Hay que recortar las entradas",
  "inv.exists.never": "No se puede de ninguna manera",

  "inv.cut.none": "Todas las entradas",
  "inv.cut.nonNegative": "Solo las entradas de este lado del cero",
  "inv.cut.nonPositive": "Solo las entradas del otro lado del cero",
  "inv.cut.onePeriod": "Solo una vuelta de entradas",
  "inv.cut.onePoint": "Una sola entrada",

  "inv.why.jam": "Esta máquina no junta dos cajas en una: hay una sola que pudo haber entrado.",
  "inv.why.yes": "Bajá la recta y mirá: hay dos entradas a la misma altura.",
  "inv.why.cut": "Bajá la recta: cada altura la toca una sola entrada, y no hace falta recortar.",
  "inv.why.never": "Recortando queda una sola entrada admitida, y eso ya no es una máquina.",
  "inv.why.none": "Con todas las entradas hay más de una que cae en la misma salida.",
  "inv.why.nonNegative": "De ese lado quedan dos entradas por salida.",
  "inv.why.nonPositive": "De ese lado quedan dos entradas por salida.",
  "inv.why.onePeriod": "Ese recorte deja entradas de más y la vuelta sigue sin saber a cuál volver.",
  "inv.why.onePoint": "Ese recorte deja una sola entrada, y con una sola no hay máquina.",

  "inv.identity.said": "La cadena, en los dos sentidos, deja todo como estaba.",
  "inv.definition":
    "La inversa de una función es la función que devuelve cada salida a su entrada. Se reconoce porque las dos cadenas, en un sentido y en el otro, dejan todo como estaba. Una función tiene inversa solo si entradas distintas dan salidas distintas.",

  "layer.real": "mundo real",
  "layer.intuition": "intuición",
  "layer.concrete": "manipulación",
  "layer.visual": "representación",
  "layer.symbolic": "notación",
  "layer.formal": "definición",
  "layer.abstract": "abstracción",

  // El recorrido entre niveles: la tarjeta de cierre de un nivel que ya estaba
  // superado. La llave no vuelve a entrar al llavero, y la tarjeta no lo finge.
  "ui.done.keyAgain": "Ya estaba en tu chuleta",
};

export function t(key: string): string {
  return es[key] ?? key;
}

/** Una clave con huecos `{nombre}`. Es lo mínimo hasta que entre ICU MessageFormat. */
export function tf(key: string, vars: Readonly<Record<string, string | number>>): string {
  return t(key).replace(/\{(\w+)\}/g, (hole, name: string) => (name in vars ? String(vars[name]) : hole));
}
