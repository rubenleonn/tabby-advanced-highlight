import { SessionMiddleware } from "tabby-terminal";

/**
 * ============================================================================
 * CONFIGURACIÓN DE COLOR Y ESTILO DEL RESALTADO (ANSI ESCAPE CODES)
 * ============================================================================
 * Usamos TrueColor (RGB 24 bits) para asegurar que el color no dependa de la
 * paleta ni de alteraciones del tema del terminal:
 *
 *   - ERROR:  Texto blanco puro sobre fondo rojo vivo
 *             \x1b[38;2;255;255;255;48;2;220;0;0m
 *   - UP:     Texto blanco puro sobre fondo verde vivo
 *             \x1b[38;2;255;255;255;48;2;22;160;50m
 *   - DOWN:   Texto blanco puro sobre fondo naranja vivo
 *             \x1b[38;2;255;255;255;48;2;230;95;0m
 *   - RESET:  \x1b[0m
 */
const STYLE_RESET = "\x1b[0m";
const STYLE_ERROR = "\x1b[38;2;255;255;255;48;2;220;0;0m";
const STYLE_UP = "\x1b[38;2;255;255;255;48;2;22;160;50m";
const STYLE_DOWN = "\x1b[38;2;255;255;255;48;2;230;95;0m";

/**
 * SessionMiddleware que resalta eventos clave de consola en routers y switches:
 *  - "Error:" (insensible a mayúsculas/minúsculas) en rojo vivo.
 *  - "UP" (case sensitive, palabra independiente) en verde vivo.
 *  - "DOWN" (case sensitive, palabra independiente) en naranja vivo.
 *
 * Incluye acumulador de stream de bajo retardo (25ms) y detección de límites
 * de palabra para enlaces serie lentos (9600 baud) evitando falsos positivos
 * en palabras compuestas como GROUP, SHUTDOWN, SETUP, BACKUP, UPDATE o DOWNLOAD.
 */
export class RouterEventHighlightMiddleware extends SessionMiddleware {
  private buffer = "";
  private prevChar = " ";
  private timer: NodeJS.Timeout | null = null;

  private readonly RE_ERROR = /error:/gi;
  private readonly RE_UP = /(^|[^a-zA-Z0-9_]|\x1b\[[0-9;?]*m)UP(?=[^a-zA-Z0-9_]|\x1b\[|$)/g;
  private readonly RE_DOWN = /(^|[^a-zA-Z0-9_]|\x1b\[[0-9;?]*m)DOWN(?=[^a-zA-Z0-9_]|\x1b\[|$)/g;

  // Secuencia de escape ANSI incompleta al final del chunk (ej. "\x1b" o "\x1b[1;31")
  private readonly INCOMPLETE_ANSI_REGEX = /\x1b(\[[0-9;?]*)?$/;

  // Prefijos parciales al final del chunk que podrían completarse en el siguiente paquete:
  // - "Error:" -> e, er, err, erro, error, error:
  // - "UP" -> U, UP (precedido por límite de palabra)
  // - "DOWN" -> D, DO, DOW, DOWN (precedido por límite de palabra)
  private readonly PREFIX_REGEX = /(?:e(r(r(o(r(:)?)?)?)?)?|(?<=^|[^a-zA-Z0-9_]|\x1b\[[0-9;?]*m)(?:U(P)?|D(O(W(N)?)?)?))$/i;

  feedFromSession(data: Buffer): void {
    if (data.length === 0) {
      return super.feedFromSession(data);
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.buffer += data.toString("utf-8");
    this.process(false);
  }

  private process(forceFlush: boolean): void {
    if (forceFlush) {
      if (this.buffer.length > 0) {
        this.emit(this.highlight(this.buffer));
        this.buffer = "";
      }
      return;
    }

    // 1. Emitir inmediatamente las líneas completas que terminan en \n o \r
    const lastNl = Math.max(this.buffer.lastIndexOf("\n"), this.buffer.lastIndexOf("\r"));
    if (lastNl !== -1) {
      const ready = this.buffer.slice(0, lastNl + 1);
      this.buffer = this.buffer.slice(lastNl + 1);
      this.emit(this.highlight(ready));
    }

    // 2. Para cualquier buffer parcial restante sin saltos de línea:
    if (this.buffer.length > 0) {
      const incompleteAnsi = this.buffer.match(this.INCOMPLETE_ANSI_REGEX);
      const prefixMatch = this.buffer.match(this.PREFIX_REGEX);

      if (incompleteAnsi || prefixMatch) {
        // Retener solo la posible secuencia incompleta (unos pocos caracteres)
        const holdLen = Math.max(
          incompleteAnsi ? incompleteAnsi[0].length : 0,
          prefixMatch ? prefixMatch[0].length : 0
        );
        const safeCut = this.buffer.length - holdLen;
        if (safeCut > 0) {
          const ready = this.buffer.slice(0, safeCut);
          this.buffer = this.buffer.slice(safeCut);
          this.emit(this.highlight(ready));
        }

        // Esperar hasta 25ms a que llegue el siguiente paquete del puerto serie
        this.timer = setTimeout(() => this.process(true), 25);
      } else {
        // Seguro de emitir inmediatamente (0ms de retraso al teclear)
        this.emit(this.highlight(this.buffer));
        this.buffer = "";
      }
    }
  }

  /**
   * Aplica el estilo configurado a "Error:", "UP" y "DOWN"
   */
  private highlight(text: string): string {
    let result = text.replace(this.RE_ERROR, (m) => `${STYLE_ERROR}${m}${STYLE_RESET}`);

    result = result.replace(this.RE_UP, (match, prefix, offset) => {
      if (offset === 0 && prefix === "" && /\w/.test(this.prevChar)) {
        return match;
      }
      return `${prefix}${STYLE_UP}UP${STYLE_RESET}`;
    });

    result = result.replace(this.RE_DOWN, (match, prefix, offset) => {
      if (offset === 0 && prefix === "" && /\w/.test(this.prevChar)) {
        return match;
      }
      return `${prefix}${STYLE_DOWN}DOWN${STYLE_RESET}`;
    });

    const stripped = text.replace(/\x1b\[[0-9;?]*m/g, "");
    if (stripped.length > 0) {
      this.prevChar = stripped[stripped.length - 1];
    }

    return result;
  }

  private emit(text: string): void {
    if (text.length > 0) {
      super.feedFromSession(Buffer.from(text, "utf-8"));
    }
  }

  close(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.buffer.length > 0) {
      this.emit(this.highlight(this.buffer));
      this.buffer = "";
    }
    super.close();
  }
}
