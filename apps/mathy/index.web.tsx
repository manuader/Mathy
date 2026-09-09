// En web, Skia es un binario WebAssembly que hay que cargar antes de montar
// nada. Por eso el registro de la app se difiere: si se montara antes, el
// primer lienzo se dibujaría contra un Skia que todavía no existe.
import { registerRootComponent } from "expo";
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

void LoadSkiaWeb({ locateFile: () => "/canvaskit.wasm" }).then(async () => {
  const App = (await import("./App")).default;
  registerRootComponent(App);
});
