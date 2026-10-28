import { SessionMiddleware } from "tabby-terminal";
import { AdvancedHighlighter } from "./highlighter";
import { AdvancedHighlightService } from "./services/advancedHighlight.service";

/**
 * SessionMiddleware que resalta eventos clave de consola en tiempo real
 * a partir de las reglas configuradas en el panel "Highlight".
 *
 * Incluye un acumulador de stream de bajo retardo (25ms) para resolver el problema
 * de fragmentación de micro-paquetes en enlaces serie lentos (UART a 9600 baudios),
 * asegurando que palabras divididas entre chunks se reconstruyan antes del resaltado.
 */
export class AdvancedHighlightMiddleware extends SessionMiddleware {
  private buffer = "";
  private timer: NodeJS.Timeout | null = null;
  private readonly INCOMPLETE_ANSI_REGEX = /\x1b(\[[0-9;?]*)?$/;

  constructor(private service: AdvancedHighlightService) {
    super();
  }

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

    // Si el buffer contiene un escape ANSI cortado al final, esperamos al siguiente chunk
    if (this.INCOMPLETE_ANSI_REGEX.test(this.buffer)) {
      this.armFlushTimer(25);
      return;
    }

    // Buscamos el último límite seguro (salto de línea o espacio)
    const lastSafeBreak = Math.max(
      this.buffer.lastIndexOf("\n"),
      this.buffer.lastIndexOf("\r"),
      this.buffer.lastIndexOf(" "),
      this.buffer.lastIndexOf("\t")
    );

    if (lastSafeBreak !== -1) {
      const readyPart = this.buffer.slice(0, lastSafeBreak + 1);
      this.buffer = this.buffer.slice(lastSafeBreak + 1);
      this.emit(this.highlight(readyPart));
    }

    // Si aún queda texto en el buffer sin límite delimitado, programamos un flush rápido (25ms)
    if (this.buffer.length > 0) {
      this.armFlushTimer(25);
    }
  }

  private armFlushTimer(ms: number): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      this.process(true);
    }, ms);
  }

  private highlight(text: string): string {
    const rules = this.service.activeRules;
    if (!rules || rules.length === 0) {
      return text;
    }
    return AdvancedHighlighter.highlight(text, rules);
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
