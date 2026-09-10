/**
 * La cheatsheet incremental.
 *
 * Es la memoria escrita del jugador: empieza vacía y crece con lo que el juego
 * ya le mostró. No enseña nada nuevo y no se bloquea nunca, así que acá no hay
 * candados ni entradas grises. Lo que todavía no vio, simplemente no está.
 *
 * Se abre sin salir de la actividad: el panel convive con el lienzo, no lo
 * reemplaza.
 */
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  searchEntries,
  topicTree,
  unlockedEntries,
  type CheatsheetEntry,
  type EntryKind,
  type TopicNode,
} from "@mathy/content";
import { theme } from "./theme.ts";

/** Los seis tipos de R0, con el nombre que lee el jugador. */
const KIND_LABEL: Record<EntryKind, string> = {
  formula: "fórmula",
  rule: "regla",
  definition: "definición",
  theorem: "teorema",
  strategy: "estrategia",
  example: "ejemplo",
};

export function Cheatsheet({
  reached,
  onClose,
}: {
  readonly reached: ReadonlySet<string>;
  readonly onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const mine = useMemo(() => unlockedEntries(reached), [reached]);
  const found = useMemo(() => searchEntries(mine, query), [mine, query]);
  const tree = useMemo(() => topicTree(found), [found]);

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>Chuleta</Text>
          <Text style={styles.count}>
            {mine.length === 0
              ? "todavía sin entradas"
              : `${mine.length} ${mine.length === 1 ? "entrada" : "entradas"}`}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={theme.hitSlop} style={styles.close}>
          <Text style={styles.closeLabel}>×</Text>
        </Pressable>
      </View>

      {mine.length > 0 ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por título"
          placeholderTextColor={theme.color.inkFaint}
          style={styles.search}
          autoCorrect={false}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {mine.length === 0 ? (
          <Empty
            title="Acá se va a escribir sola"
            body={
              "Cada vez que un nivel te muestre una regla o una fórmula, queda anotada " +
              "en esta hoja, ordenada por tema. Nada de lo que entre se borra después."
            }
          />
        ) : tree.length === 0 ? (
          <Empty
            title={`Ningún título dice “${query.trim()}”`}
            body="La búsqueda mira los títulos, no los cuerpos. Probá con una palabra más corta."
          />
        ) : (
          tree.map((node) => <Topic key={node.topic.id} node={node} depth={0} />)
        )}
      </ScrollView>
    </View>
  );
}

function Topic({ node, depth }: { readonly node: TopicNode; readonly depth: number }) {
  return (
    <View style={depth > 0 ? styles.subtopic : styles.topic}>
      <Text style={depth === 0 ? styles.topicName : styles.subtopicName}>{node.topic.name}</Text>
      {node.entries.map((entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
      {node.children.map((child) => (
        <Topic key={child.topic.id} node={child} depth={depth + 1} />
      ))}
    </View>
  );
}

function Entry({ entry }: { readonly entry: CheatsheetEntry }) {
  return (
    <View style={styles.entry}>
      <Text style={styles.entryTitle}>{entry.title}</Text>
      {/* La fórmula va como texto hasta que el tipografiador de Skia salga del
          lienzo de la actividad: un segundo Canvas acá costaría más de lo que
          resuelve. */}
      {entry.displayForm === "formula" ? <Text style={styles.formula}>{entry.latex}</Text> : null}
      <Text style={styles.entryBody}>{entry.body}</Text>
      <Text style={styles.kind}>{KIND_LABEL[entry.kind]}</Text>
    </View>
  );
}

function Empty({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
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
  search: {
    marginHorizontal: theme.space[3],
    marginBottom: theme.space[2],
    paddingHorizontal: theme.space[2],
    height: 36,
    borderRadius: theme.radius.token,
    borderWidth: 1,
    borderColor: theme.color.line,
    backgroundColor: theme.color.surfaceHigh,
    color: theme.color.ink,
    fontSize: 13,
  },
  list: { paddingHorizontal: theme.space[3], paddingBottom: theme.space[6], gap: theme.space[3] },
  topic: { gap: theme.space[1] },
  subtopic: { gap: theme.space[1], marginTop: theme.space[2] },
  topicName: {
    color: theme.color.inkDim,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  subtopicName: { color: theme.color.inkFaint, fontSize: 12, marginTop: theme.space[0] },
  entry: {
    backgroundColor: theme.color.surfaceHigh,
    borderRadius: theme.radius.token,
    borderWidth: 1,
    borderColor: theme.color.line,
    padding: theme.space[2],
    gap: theme.space[0],
  },
  entryTitle: { color: theme.color.ink, fontSize: 13, lineHeight: 18 },
  entryBody: { color: theme.color.inkDim, fontSize: 12, lineHeight: 17 },
  formula: {
    color: theme.color.accent,
    fontSize: 13,
    fontFamily: "monospace",
    marginVertical: theme.space[0],
  },
  kind: { color: theme.color.inkFaint, fontSize: 10, letterSpacing: 0.6 },
  empty: { gap: theme.space[1], paddingTop: theme.space[4] },
  emptyTitle: { color: theme.color.inkDim, fontSize: 14 },
  emptyBody: { color: theme.color.inkFaint, fontSize: 12, lineHeight: 18 },
});
