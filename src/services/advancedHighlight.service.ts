import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { ConfigService } from "tabby-core";
import { DEFAULT_HIGHLIGHT_RULES, DEFAULT_RULES_TEXT } from "../config";
import { compileRule, formatRulesToText, parseRulesText } from "../highlighter";
import { CompiledHighlightRule, HighlightRule } from "../types";

@Injectable({ providedIn: "root" })
export class AdvancedHighlightService {
  readonly rulesChanged$ = new Subject<void>();
  activeRules: CompiledHighlightRule[] = [];

  private subs = new Subscription();

  constructor(public config: ConfigService) {
    this.updateCompiledRules();

    if (this.config.ready$) {
      this.subs.add(
        this.config.ready$.subscribe(() => {
          this.updateCompiledRules();
          this.rulesChanged$.next();
        })
      );
    }

    if (this.config.changed$) {
      this.subs.add(
        this.config.changed$.subscribe(() => {
          this.updateCompiledRules();
          this.rulesChanged$.next();
        })
      );
    }
  }

  /**
   * Obtiene el texto de reglas configurado en formato CSV
   */
  get rulesText(): string {
    const rawRules =
      this.config.store?.advancedHighlight?.rules ??
      this.config.store?.routerEventHighlight?.rules;

    if (Array.isArray(rawRules) && rawRules.length > 0) {
      if (typeof rawRules[0] === "string") {
        return rawRules.join("\n");
      }
      if (typeof rawRules[0] === "object") {
        return formatRulesToText(rawRules);
      }
    }
    if (typeof rawRules === "string" && rawRules.trim().length > 0) {
      return rawRules;
    }

    const rawText =
      this.config.store?.advancedHighlight?.rulesText ??
      this.config.store?.routerEventHighlight?.rulesText;

    if (typeof rawText === "string" && rawText.trim().length > 0) {
      return rawText;
    }

    return DEFAULT_RULES_TEXT;
  }

  /**
   * Obtiene las reglas parseadas actuales
   */
  get rules(): HighlightRule[] {
    const text = this.rulesText;
    const parsed = parseRulesText(text);
    if (parsed.length > 0) {
      return parsed;
    }
    return JSON.parse(JSON.stringify(DEFAULT_HIGHLIGHT_RULES));
  }

  /**
   * Guarda el texto de reglas directamente desde el editor cuando el usuario pulsa Guardar
   */
  saveRulesText(text: string): void {
    if (!this.config.store) {
      return;
    }
    if (!this.config.store.advancedHighlight) {
      this.config.store.advancedHighlight = {};
    }

    // Dividimos por líneas, eliminamos espacios sobrantes y descartamos líneas vacías
    const cleanLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Guardamos la lista limpia de líneas en 'rules'
    this.config.store.advancedHighlight.rules = cleanLines;

    // Eliminamos claves legacy si existían
    if (this.config.store.advancedHighlight.rulesText !== undefined) {
      delete this.config.store.advancedHighlight.rulesText;
    }
    if (this.config.store.routerEventHighlight !== undefined) {
      delete this.config.store.routerEventHighlight;
    }

    this.config.save();
    this.updateCompiledRules();
    this.rulesChanged$.next();
  }

  /**
   * Recompila las reglas activas a partir del texto de configuración
   */
  updateCompiledRules(): void {
    const rulesList = this.rules;
    const compiled: CompiledHighlightRule[] = [];

    let id = 1;
    for (const rule of rulesList) {
      const cr = compileRule(rule, id++);
      if (cr) {
        compiled.push(cr);
      }
    }

    this.activeRules = compiled;
  }
}
