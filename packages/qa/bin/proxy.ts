/**
 * El proxy de desarrollo, y por qué existe.
 *
 * La app es offline y sin cuenta: no tiene backend, y meterle la clave de
 * TypeSafe al bundle sería repartirla a cualquiera que abra el juego. Además
 * `api.typesafe.ai` no manda `access-control-allow-origin`, así que el
 * navegador bloquea la llamada directa igual.
 *
 * Entonces, para probar la búsqueda semántica en la máquina del que desarrolla:
 * este proceso escucha en el 8788, acepta sólo pedidos del servidor de Expo,
 * sólo la forma exacta que manda el buscador, y le agrega la clave desde el
 * entorno. En producción esto lo tiene que hacer un servidor de verdad, o no se
 * hace: el juego funciona sin él.
 *
 *     source ~/.zshrc; npm run qa:proxy -w packages/qa
 */

import { createServer } from "node:http";

const PUERTO = 8788;
/**
 * Sólo el servidor de Expo, y sólo de esta casa: el mismo puerto y una
 * dirección local. Un teléfono en la misma red entra; internet no.
 */
const PERMITIDO = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):8081$/;
const permitido = (origen: string): boolean => PERMITIDO.test(origen);

interface Pedido {
  readonly consulta: string;
  readonly candidatas: readonly { readonly id: string; readonly texto: string }[];
}

const clave = process.env["TYPESAFE_API_KEY"] ?? "";
if (clave.length === 0) {
  console.error("Falta TYPESAFE_API_KEY. El juego anda igual: el buscador usa su ranking local.");
  process.exit(1);
}

createServer((req, res) => {
  const origen = req.headers.origin ?? "";
  const cors: Record<string, string> = {
    "access-control-allow-origin": permitido(origen) ? origen : "null",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  if (req.method !== "POST" || req.url !== "/llave" || !permitido(origen)) {
    res.writeHead(404, cors);
    res.end();
    return;
  }

  let cuerpo = "";
  req.on("data", (trozo) => {
    cuerpo += String(trozo);
    // Un buscador manda una consulta y una docena de títulos; nada más.
    if (cuerpo.length > 8000) req.destroy();
  });
  req.on("end", () => {
    void (async () => {
      try {
        const pedido = JSON.parse(cuerpo) as Pedido;
        const opciones: Record<string, string> = { ninguna: "Ninguna de estas llaves responde la consulta." };
        for (const c of pedido.candidatas.slice(0, 12)) opciones[c.id] = c.texto;
        const r = await fetch("https://api.typesafe.ai/v1/systemone", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${clave}` },
          body: JSON.stringify({
            model: "jev-latest",
            state: { consulta_escrita_por_el_jugador: pedido.consulta },
            questions: {
              cual_llave: {
                type: "choice",
                instructions:
                  "El jugador escribió `consulta_escrita_por_el_jugador` en el buscador de su chuleta. ¿Cuál de estas llaves está buscando? Escribe como habla un chico y puede no usar las mismas palabras que el título.",
                criteria: opciones,
              },
            },
          }),
        });
        const json = (await r.json()) as {
          answers?: { cual_llave?: { choice?: string; probabilities?: Record<string, number> } };
        };
        const elegida = json.answers?.cual_llave?.choice ?? "ninguna";
        const p = json.answers?.cual_llave?.probabilities?.[elegida] ?? 0;
        res.writeHead(200, { ...cors, "content-type": "application/json" });
        res.end(JSON.stringify({ id: elegida === "ninguna" ? null : elegida, p }));
      } catch (error) {
        res.writeHead(502, { ...cors, "content-type": "application/json" });
        res.end(JSON.stringify({ id: null, p: 0, error: (error as Error).message }));
      }
    })();
  });
}).listen(PUERTO, () => {
  console.log(`Proxy de búsqueda en http://localhost:${PUERTO}/llave`);
});
