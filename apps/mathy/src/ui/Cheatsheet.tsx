/**
 * La cheatsheet incremental.
 *
 * Es la memoria escrita del jugador: empieza vacía y crece con lo que el juego
 * ya le mostró. No enseña nada nuevo y no se bloquea nunca, así que acá no hay
 * candados ni entradas grises. Lo que todavía no vio, simplemente no está.
 *
 * Arriba van las llaves, una por nivel superado: son las ideas que el jugador
 * probó con las manos y que los niveles siguientes le piden usar. Abajo, las
 * reglas y fórmulas del diseño, que llegan con las capas escritas.
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
import { t, tf } from "../i18n.ts";
import type { EarnedKey } from "../lessons/index.ts";
import { KeyCard } from "./KeyGlyph.tsx";
import { Lumi } from "./Lumi.tsx";
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
  keys,
  highlight,
  onPlay,
  onClose,
}: {
  readonly reached: ReadonlySet<string>;
  readonly keys: readonly EarnedKey[];
  /** La llave que hay que señalar al abrir: la recién ganada o la que se pidió. */
  readonly highlight: string | null;
  readonly onPlay: ((node: string, level: number) => void) | null;
  readonly onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const mine = useMemo(() => unlockedEntries(reached), [reached]);
  const found = useMemo(() => searchEntries(mine, query), [mine, query]);
  const tree = useMemo(() => topicTree(found), [found]);
  const groups = useMemo(() => groupKeys(keys, query), [keys, query]);
  const total = mine.length + keys.length;
  const nothingFound = groups.length === 0 && tree.length === 0;

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        {total > 0 ? <Lumi pose="read" size={44} float={false} /> : null}
        <View style={styles.headText}>
          <Text style={styles.title}>{t("ui.cs.title")}</Text>
          <Text style={styles.count}>
            {total === 0
              ? t("ui.cs.none")
              : total === 1
                ? t("ui.cs.count.one")
                : tf("ui.cs.count.other", { n: total })}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={theme.hitSlop} style={styles.close}>
          <Text style={styles.closeLabel}>×</Text>
        </Pressable>
      </View>

      {total > 3 ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("ui.cs.search")}
          placeholderTextColor={theme.color.inkFaint}
          style={styles.search}
          autoCorrect={false}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {total === 0 ? (
          <Empty title={t("ui.cs.empty.title")} body={t("ui.cs.empty.body")} />
        ) : nothingFound ? (
          <Empty title={tf("ui.cs.notFound.title", { q: query.trim() })} body={t("ui.cs.notFound.body")} />
        ) : null}

        {groups.length > 0 ? (
          <View style={styles.topic}>
            <Text style={styles.topicName}>{t("ui.cs.keys")}</Text>
            {groups.map((g) => (
              <View key={g.node} style={styles.group}>
                <Text style={styles.subtopicName}>{t(`node.${g.node}.name`)}</Text>
                {g.keys.map((k) => (
                  <KeyCard
                    key={k.key.id}
                    glyph={k.key.glyph}
                    title={t(k.key.titleKey)}
                    body={t(k.key.bodyKey)}
                    highlight={k.key.id === highlight}
                    {...(k.key.id === highlight ? { tag: t("ui.key.new") } : {})}
                    footer={
                      onPlay ? (
                        <Pressable onPress={() => onPlay(k.node, k.level)} hitSlop={6}>
                          <Text style={styles.play}>{tf("ui.key.play", { n: k.level })}</Text>
                        </Pressable>
                      ) : null
                    }
                  />
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {tree.length > 0 ? (
          <View style={styles.topic}>
            {groups.length > 0 ? <Text style={styles.topicName}>{t("ui.cs.facts")}</Text> : null}
            {tree.map((node) => (
              <Topic key={node.topic.id} node={node} depth={0} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

interface KeyGroup {
  readonly node: string;
  readonly keys: readonly EarnedKey[];
}

/** Las llaves por concepto, en el orden en que se ganaron, filtradas por título. */
function groupKeys(keys: readonly EarnedKey[], query: string): readonly KeyGroup[] {
  const needle = fold(query);
  const out: { node: string; keys: EarnedKey[] }[] = [];
  for (const k of keys) {
    if (needle.length > 0 && !fold(t(k.key.titleKey)).includes(needle)) continue;
    const last = out[out.length - 1];
    if (last && last.node === k.node) last.keys.push(k);
    else out.push({ node: k.node, keys: [k] });
  }
  return out;
}

/** Sin acentos y en minúsculas, igual que la búsqueda de `@mathy/content`. */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function Topic({ node, depth }: { readonly node: TopicNode; readonly depth: number }) {
  return (
    <View style={depth > 0 ? styles.subtopic : styles.group}>
      <Text style={depth === 0 ? styles.subtopicName : styles.subtopicName}>{node.topic.name}</Text>
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
      <Lumi pose="sleep" size={96} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 48 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
    paddingHorizontal: theme.space[3],
    paddingBottom: theme.space[2],
  },
  headText: { flex: 1, gap: 2 },
  title: { color: theme.color.ink, fontSize: 18, letterSpacing: 0.3 },
  count: { color: theme.color.inkFaint, fontSize: 12 },
  close: { paddingHorizontal: theme.space[1] },
  closeLabel: { color: theme.color.inkFaint, fontSize: 22, lineHeight: 22 },
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
  list: { paddingHorizontal: theme.space[3], paddingBottom: theme.space[6], gap: theme.space[4] },
  topic: { gap: theme.space[2] },
  group: { gap: theme.space[1] },
  subtopic: { gap: theme.space[1], marginTop: theme.space[2] },
  topicName: {
    color: theme.color.inkDim,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  subtopicName: { color: theme.color.inkFaint, fontSize: 12, marginTop: theme.space[0] },
  play: { color: theme.color.accent, fontSize: 13, marginTop: 4 },
  entry: {
    backgroundColor: theme.color.surfaceHigh,
    borderRadius: theme.radius.token,
    borderWidth: 1,
    borderColor: theme.color.line,
    padding: theme.space[2],
    gap: theme.space[0],
  },
  entryTitle: { color: theme.color.ink, fontSize: 14, lineHeight: 19 },
  entryBody: { color: theme.color.inkDim, fontSize: 13, lineHeight: 18 },
  formula: {
    color: theme.color.accent,
    fontSize: 13,
    fontFamily: "monospace",
    marginVertical: theme.space[0],
  },
  kind: { color: theme.color.inkFaint, fontSize: 10, letterSpacing: 0.6 },
  empty: { gap: theme.space[1], paddingTop: theme.space[4] },
  emptyTitle: { color: theme.color.inkDim, fontSize: 15 },
  emptyBody: { color: theme.color.inkFaint, fontSize: 13, lineHeight: 19 },
});
