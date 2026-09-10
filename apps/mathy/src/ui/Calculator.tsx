/**
 * La calculadora evolutiva.
 *
 * Es herramienta, recompensa y sandbox al mismo tiempo. Empieza sin teclas: lo
 * que hay son siluetas, y cada silueta se vuelve tecla cuando su nodo llega a
 * `ready`. Ninguna se revoca después.
 *
 * Lo que se ve apagado no está escondido a propósito: ver lo que falta es parte
 * de la recompensa, y por eso las bloqueadas ocupan su lugar en la fila.
 *
 * La regla de layout que importa: **cada operación aparece al lado de su llave
 * inversa**, aunque la llave todavía sea silueta. Los pares salen de
 * `tiers[].pairs`, no de una lista escrita acá.
 */
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  calculatorTiers,
  findOp,
  inverseOf,
  isOpUnlocked,
  opsOfTier,
  type CalculatorOp,
  type CalculatorTier,
} from "@mathy/content";
import { theme } from "./theme.ts";

/**
 * Los nombres de las filas, de la tabla de tiers de M0. Todavía no hay clave de
 * locale para ellos (`calculator_ops.yaml` es data pura y el locale solo tiene
 * `label` y `hint` por operación), así que viven acá hasta que exista.
 */
const TIER_NAME: Record<string, string> = {
  t0: "Las cuatro operaciones y los números",
  t1: "Potencias, raíces y medida",
  t2: "Exponencial y logaritmo",
  t3: "Álgebra y funciones",
  t4: "Trigonometría",
  t5: "Límites, derivadas e integrales",
  t6: "Vectores y matrices",
  t7: "Complejos, series y ecuaciones diferenciales",
  t_disc: "Lógica, conjuntos, grafos y algoritmos",
  t_prob: "Probabilidad y estadística",
};

/** El teclado de números, en filas fijas: una calculadora no reordena sus dígitos. */
const DIGIT_ROWS: readonly (readonly string[])[] = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["0"],
];

/** Las cuatro que operan sobre dos números. El resto todavía no calcula. */
const BINARY: Record<string, (a: number, b: number) => number | null> = {
  op_add: (a, b) => a + b,
  op_sub: (a, b) => a - b,
  op_mul: (a, b) => a * b,
  op_div: (a, b) => (b === 0 ? null : a / b),
};

/** El MathLocale es lee coma decimal. El separador de miles todavía no aparece. */
function show(n: number): string {
  const rounded = Math.round(n * 1e6) / 1e6;
  return String(Object.is(rounded, -0) ? 0 : rounded).replace(".", ",");
}

export function Calculator({
  ready,
  onClose,
}: {
  readonly ready: ReadonlySet<string>;
  readonly onClose: () => void;
}) {
  const [entry, setEntry] = useState("");
  const [acc, setAcc] = useState<number | null>(null);
  const [pending, setPending] = useState<CalculatorOp | null>(null);
  const [last, setLast] = useState<CalculatorOp | null>(null);
  const [trace, setTrace] = useState("");
  const [note, setNote] = useState("Tocá una tecla y te digo qué hace.");

  const open = useMemo(
    () => new Set(calculatorTiers.flatMap((t) => opsOfTier(t)).filter((op) => isOpUnlocked(op, ready)).map((op) => op.id)),
    [ready],
  );
  // Los dígitos son la tecla `contar`: sin ella no hay con qué construir nada.
  const canType = open.has("op_count");
  const current = entry === "" ? (acc ?? 0) : Number(entry);

  const digit = (d: string): void => {
    if (!canType) return;
    setEntry((e) => (e === "0" ? d : e === "-0" ? `-${d}` : (e + d).slice(0, 12)));
  };

  const clear = (): void => {
    setEntry("");
    setAcc(null);
    setPending(null);
    setTrace("");
    setNote("Listo, la pista quedó vacía.");
  };

  const resolve = (op: CalculatorOp, a: number, b: number): void => {
    const result = BINARY[op.id]!(a, b);
    if (result === null) {
      setNote("Dividir por cero no tiene llave: ningún número multiplicado por cero da otra cosa.");
      return;
    }
    setTrace(`${show(a)} ${op.label} ${show(b)} = ${show(result)}`);
    setAcc(result);
    setEntry("");
    setPending(null);
    setLast(op);
  };

  const press = (op: CalculatorOp): void => {
    if (!open.has(op.id)) {
      // La silueta no dice "bloqueado". Cuando exista el mapa, esto abre el nodo
      // que la habilita; por ahora dice qué hace y cuándo llega.
      setNote(`${op.hint} Se abre cuando termines el nivel.`);
      return;
    }
    if (BINARY[op.id]) {
      if (pending && entry !== "") resolve(pending, acc ?? 0, current);
      else setAcc(current);
      setPending(op);
      setEntry("");
      setNote(op.hint);
      return;
    }
    switch (op.id) {
      case "op_neg": {
        // Sin coma decimal todavía (`op_decimal` no está en el alcance), así que
        // lo tipeado siempre es un entero y se le puede dar vuelta el signo.
        if (entry !== "") setEntry(String(-Number(entry)));
        else setAcc(-(acc ?? 0));
        setNote(op.hint);
        break;
      }
      case "op_compare": {
        // La balanza con tres resultados: acá cierra la cuenta pendiente.
        if (pending && entry !== "") resolve(pending, acc ?? 0, current);
        else setNote(op.hint);
        break;
      }
      case "op_inverse_op": {
        const key = last ? inverseOf(last.id) : undefined;
        const keyOp = key ? findOp(key) : undefined;
        setNote(
          last && keyOp
            ? `La llave de ${last.label} es ${keyOp.label}: deshace lo último que hiciste.`
            : op.hint,
        );
        break;
      }
      default:
        setNote(op.hint);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>Calculadora</Text>
          <Text style={styles.count}>
            {open.size} de {calculatorTiers.reduce((n, t) => n + opsOfTier(t).length, 0)} teclas
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={theme.hitSlop} style={styles.close}>
          <Text style={styles.closeLabel}>×</Text>
        </Pressable>
      </View>

      <View style={styles.screen}>
        <Text style={styles.trace} numberOfLines={1}>
          {trace || (pending ? `${show(acc ?? 0)} ${pending.label}` : " ")}
        </Text>
        <View style={styles.screenRow}>
          <Text style={styles.value} numberOfLines={1}>
            {entry === "" ? show(acc ?? 0) : entry.replace(".", ",")}
          </Text>
          <Pressable onPress={clear} hitSlop={theme.hitSlop}>
            <Text style={styles.clear}>borrar</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.digits}>
          {DIGIT_ROWS.map((row) => (
            <View key={row.join("")} style={styles.digitRow}>
              {row.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => digit(d)}
                  hitSlop={theme.hitSlop}
                  style={[styles.key, styles.digit, !canType && styles.locked]}
                >
                  <Text style={[styles.keyLabel, !canType && styles.lockedLabel]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {calculatorTiers.map((tier) => (
          <View key={tier.id} style={styles.tier}>
            <Text style={styles.tierName}>{TIER_NAME[tier.id] ?? tier.id}</Text>
            <View style={styles.keys}>
              {groupsOf(tier).map((group) =>
                group.length > 1 ? (
                  <View key={group[0]!.id} style={styles.pair}>
                    {group.map((op) => (
                      <Key key={op.id} op={op} unlocked={open.has(op.id)} onPress={() => press(op)} />
                    ))}
                  </View>
                ) : (
                  <Key
                    key={group[0]!.id}
                    op={group[0]!}
                    unlocked={open.has(group[0]!.id)}
                    onPress={() => press(group[0]!)}
                  />
                ),
              )}
            </View>
          </View>
        ))}

        <Text style={styles.note}>{note}</Text>
      </ScrollView>
    </View>
  );
}

/** Los pares primero, cada uno como una sola pieza; después las sueltas. */
function groupsOf(tier: CalculatorTier): readonly (readonly CalculatorOp[])[] {
  const paired = new Set(tier.pairs.flatMap((pair) => [pair.lock, pair.key]));
  const groups: CalculatorOp[][] = [];
  for (const pair of tier.pairs) {
    const both = [findOp(pair.lock), findOp(pair.key)].filter((op): op is CalculatorOp => !!op);
    if (both.length > 0) groups.push(both);
  }
  for (const op of opsOfTier(tier)) {
    if (!paired.has(op.id)) groups.push([op]);
  }
  return groups;
}

function Key({
  op,
  unlocked,
  onPress,
}: {
  readonly op: CalculatorOp;
  readonly unlocked: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={theme.hitSlop}
      style={[styles.key, !unlocked && styles.locked]}
    >
      <Text style={[styles.keyLabel, !unlocked && styles.lockedLabel]} numberOfLines={1}>
        {op.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 48 },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: theme.space[3],
    paddingBottom: theme.space[2],
  },
  headText: { flex: 1, gap: 2 },
  title: { color: theme.color.ink, fontSize: 16, letterSpacing: 0.3 },
  count: { color: theme.color.inkFaint, fontSize: 11 },
  close: { paddingHorizontal: theme.space[1] },
  closeLabel: { color: theme.color.inkFaint, fontSize: 20, lineHeight: 20 },
  screen: {
    marginHorizontal: theme.space[3],
    padding: theme.space[2],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
  },
  screenRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  trace: { color: theme.color.inkFaint, fontSize: 11, minHeight: 15 },
  value: { color: theme.color.ink, fontSize: 28, fontVariant: ["tabular-nums"], flex: 1 },
  clear: { color: theme.color.inkFaint, fontSize: 11 },
  body: { padding: theme.space[3], gap: theme.space[3] },
  digits: { gap: theme.space[1], alignItems: "flex-start" },
  digitRow: { flexDirection: "row", gap: theme.space[1] },
  digit: { width: theme.space[6] },
  tier: { gap: theme.space[1] },
  tierName: { color: theme.color.inkFaint, fontSize: 11, letterSpacing: 0.4 },
  // El aire entre grupos es mayor que el aire dentro de un par: así se ve de
  // lejos que el candado y su llave son una sola pieza.
  keys: { flexDirection: "row", flexWrap: "wrap", gap: theme.space[3], alignItems: "center" },
  pair: {
    flexDirection: "row",
    gap: theme.space[0],
    padding: theme.space[0],
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.color.line,
    backgroundColor: theme.color.surface,
  },
  key: {
    minWidth: theme.space[6],
    height: theme.space[6],
    paddingHorizontal: theme.space[1],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  keyLabel: { color: theme.color.ink, fontSize: 16 },
  // Silueta: se ve el lugar que va a ocupar, sin tinta adentro.
  locked: { backgroundColor: theme.color.surface, borderColor: theme.color.surfaceHigh },
  lockedLabel: { color: theme.color.inkFaint, opacity: 0.5 },
  note: { color: theme.color.inkDim, fontSize: 12, lineHeight: 17, marginTop: theme.space[1] },
});
