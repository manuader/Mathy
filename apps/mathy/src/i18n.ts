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

  "layer.concrete": "manipulación",
  "layer.visual": "representación",
  "layer.symbolic": "notación",
  "layer.formal": "definición",
  "layer.abstract": "abstracción",
};

export function t(key: string): string {
  return es[key] ?? key;
}
