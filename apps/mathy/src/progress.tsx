/**
 * El puente entre el registro de aprendizaje y la app.
 *
 * `@mathy/progress` no sabe dónde se guarda nada: pide un almacén con dos
 * métodos. Acá se le da uno real y se expone el estado plegado por contexto,
 * para que el mapa, el juego y la cheatsheet lean lo mismo.
 *
 * AsyncStorage sirve en las tres plataformas: en el navegador escribe en
 * localStorage y en el teléfono en el almacén nativo. No hace falta una rama
 * por plataforma.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ProgressStore,
  emptyProgress,
  type Event,
  type Progress,
  type Storage,
} from "@mathy/progress";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const deviceStorage: Storage = {
  read: (key) => AsyncStorage.getItem(key),
  write: (key, value) => AsyncStorage.setItem(key, value),
};

interface ProgressApi {
  readonly progress: Progress;
  /** false mientras se lee el registro: el mapa no debe parpadear de bloqueado a abierto. */
  readonly ready: boolean;
  readonly record: (...events: readonly Event[]) => void;
  readonly reset: () => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({
  children,
  storage = deviceStorage,
}: {
  readonly children: ReactNode;
  readonly storage?: Storage;
}) {
  const store = useMemo(() => new ProgressStore(storage), [storage]);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void store.load().then((p) => {
      if (!alive) return;
      setProgress(p);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [store]);

  // Se escribe en segundo plano a propósito: el jugador ya vio el resultado de
  // su movimiento, y esperar al disco para pintarlo sería una pausa sin motivo.
  const record = useCallback(
    (...events: readonly Event[]) => {
      void store.append(...events).then(setProgress);
    },
    [store],
  );

  const reset = useCallback(() => {
    void store.reset().then(setProgress);
  }, [store]);

  const api = useMemo<ProgressApi>(
    () => ({ progress, ready, record, reset }),
    [progress, ready, record, reset],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("useProgress fuera de ProgressProvider");
  return api;
}
