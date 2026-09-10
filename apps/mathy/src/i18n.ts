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

  "layer.concrete": "manipulación",
  "layer.visual": "representación",
  "layer.symbolic": "notación",
  "layer.formal": "definición",
  "layer.abstract": "abstracción",
};

export function t(key: string): string {
  return es[key] ?? key;
}
