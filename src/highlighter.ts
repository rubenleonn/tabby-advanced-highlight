import { ColorRGB, CompiledHighlightRule, HighlightRule } from "./types";

/**
 * Parsea un código hexadecimal (#RRGGBB, RRGGBB, #RGB o RGB) a ColorRGB.
 * Devuelve null si la cadena está vacía o no es un hexadecimal válido.
 */
export function parseHexColor(hex: string | null | undefined): ColorRGB | null {
  if (!hex) {
    return null;
  }
  let clean = hex.trim();
  if (clean.startsWith("#")) {
    clean = clean.slice(1);
  }
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return null;
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convierte límites de palabra \b en límites inteligentes compatibles con secuencias ANSI
 * en streams de terminal. En un terminal, una palabra puede estar inmediatamente precedida
 * por el final de una secuencia de escape (ej. \x1b[0mUP o \x1b[32mUP). Como 'm' es un
 * carácter de palabra (\w), un \b estándar fallaría. Esta transformación permite detectar
 * límites de palabra respetando los límites de terminal y secuencias de control.
 */
export function smartWordBoundaries(pattern: string): string {
  return pattern
    .replace(/(?<!\\)\\b(?=\w)/g, "(?<=^|[^a-zA-Z0-9_]|\\x1b\\[[0-9;?]*m)")
    .replace(/(?<=\w)(?<!\\)\\b/g, "(?=[^a-zA-Z0-9_]|\\x1b\\[|$)");
}

/**
 * Convierte un patrón PCRE / Perl 5 a una expresión regular de JavaScript
 */
export function pcreToJs(
  pattern: string,
  caseSensitive: boolean
): { regex: RegExp; error?: undefined } | { regex?: undefined; error: string } {
  let p = pattern.trim();
  if (p.length === 0) {
    return { error: "El patrón no puede estar vacío" };
  }

  // Si el usuario incluyó comillas envolventes por costumbre, retirarlas
  if (p.startsWith('"') && p.endsWith('"') && p.length >= 2) {
    p = p.slice(1, -1);
  }

  let flags = "g";
  let isCase = caseSensitive;

  // Soporte para flags inline al inicio del patrón en sabor PCRE: (?i), (?m), (?s)
  while (/^\(\?[imsx]+\)/.test(p)) {
    const match = p.match(/^\(\?([imsx]+)\)/);
    if (match) {
      if (match[1].includes("i")) {
        isCase = false;
      }
      if (match[1].includes("m") && !flags.includes("m")) {
        flags += "m";
      }
      if (match[1].includes("s") && !flags.includes("s")) {
        flags += "s";
      }
      p = p.slice(match[0].length);
    }
  }

  if (!isCase) {
    flags += "i";
  }

  p = smartWordBoundaries(p);

  try {
    const regex = new RegExp(p, flags);
    return { regex };
  } catch (err: any) {
    return { error: err?.message || "Expresión regular no válida" };
  }
}

/**
 * Parsea una línea en formato:
 * "patrón", es_regex (0|1), case_sensitive (0|1), color_texto (HEX), color_fondo (HEX), activa (0|1)
 */
export function parseRuleLine(line: string, _lineNum?: number): HighlightRule | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
    return null;
  }

  // Coincide con: "patrón", campo2, campo3, campo4, campo5, campo6
  const match = trimmed.match(
    /^"((?:\\.|[^"\\])*)"\s*,\s*([^,]*)\s*,\s*([^,]*)\s*,\s*([^,]*)\s*,\s*([^,]*)(?:\s*,\s*([^,]*))?\s*$/
  );

  if (!match) {
    // Soporte alternativo para comillas simples
    const fallback = trimmed.match(
      /^'((?:\\.|[^'\\])*)'\s*,\s*([^,]*)\s*,\s*([^,]*)\s*,\s*([^,]*)\s*,\s*([^,]*)(?:\s*,\s*([^,]*))?\s*$/
    );
    if (!fallback) {
      return null;
    }
    return extract(fallback);
  }

  return extract(match);

  function extract(m: RegExpMatchArray): HighlightRule {
    const rawPattern = m[1].replace(/\\"/g, '"');
    const isRegex = m[2].trim() === "1";
    const caseSensitive = m[3].trim() === "1";
    const fgColor = m[4].trim();
    const bgColor = m[5].trim();
    const enabled = m[6] === undefined ? true : m[6].trim() === "1";

    return {
      pattern: rawPattern,
      isRegex,
      caseSensitive,
      fgColor: fgColor || "",
      bgColor: bgColor || "",
      enabled,
    };
  }
}

/**
 * Parsea el contenido multilínea del editor a un array de HighlightRule
 */
export function parseRulesText(text: string): HighlightRule[] {
  if (!text) {
    return [];
  }
  const lines = text.split(/\r?\n/);
  const rules: HighlightRule[] = [];
  for (let i = 0; i < lines.length; i++) {
    const rule = parseRuleLine(lines[i], i + 1);
    if (rule) {
      rules.push(rule);
    }
  }
  return rules;
}

/**
 * Formatea una regla a su representación en línea de texto CSV
 */
export function formatRuleToLine(rule: HighlightRule): string {
  const p = (rule.pattern || "").replace(/"/g, '\\"');
  const isRegex = rule.isRegex ? "1" : "0";
  const caseSensitive = rule.caseSensitive ? "1" : "0";
  let fg = (rule.fgColor || "").trim();
  if (fg.startsWith("#")) {
    fg = fg.slice(1);
  }
  let bg = (rule.bgColor || "").trim();
  if (bg.startsWith("#")) {
    bg = bg.slice(1);
  }
  const enabled = rule.enabled !== false ? "1" : "0";
  return `"${p}", ${isRegex}, ${caseSensitive}, ${fg}, ${bg}, ${enabled}`;
}

/**
 * Convierte un array de HighlightRule a texto multilínea
 */
export function formatRulesToText(rules: HighlightRule[]): string {
  return rules.map(formatRuleToLine).join("\n");
}

/**
 * Compila una regla individual de usuario a CompiledHighlightRule
 */
export function compileRule(rule: HighlightRule, id: number): CompiledHighlightRule | null {
  if (!rule || !rule.pattern || rule.pattern.trim().length === 0 || rule.enabled === false) {
    return null;
  }

  const fg = parseHexColor(rule.fgColor);
  const bg = parseHexColor(rule.bgColor);

  // Si no se especifica ni color de texto ni color de fondo, no hay modificación visual
  if (!fg && !bg) {
    return null;
  }

  let colorAnsi = "";
  let resetAnsi = "\x1b[0m";
  if (fg && bg) {
    colorAnsi = `\x1b[38;2;${fg.r};${fg.g};${fg.b};48;2;${bg.r};${bg.g};${bg.b}m`;
    resetAnsi = "\x1b[0m";
  } else if (fg) {
    colorAnsi = `\x1b[38;2;${fg.r};${fg.g};${fg.b}m`;
    resetAnsi = "\x1b[39m";
  } else if (bg) {
    colorAnsi = `\x1b[48;2;${bg.r};${bg.g};${bg.b}m`;
    resetAnsi = "\x1b[49m";
  }

  let regex: RegExp;

  if (rule.isRegex) {
    const compiled = pcreToJs(rule.pattern, rule.caseSensitive);
    if (compiled.error || !compiled.regex) {
      return null;
    }
    regex = compiled.regex;
  } else {
    // Literal: escapar caracteres especiales de regex
    let p = rule.pattern.trim();
    if (p.startsWith('"') && p.endsWith('"') && p.length >= 2) {
      p = p.slice(1, -1);
    }
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = rule.caseSensitive ? "g" : "gi";
    regex = new RegExp(escaped, flags);
  }

  return {
    id,
    pattern: regex,
    colorAnsi,
    resetAnsi,
    raw: rule,
  };
}

export class AdvancedHighlighter {
  /**
   * Resalta el texto aplicando las reglas configuradas de forma directa y eficiente,
   * preservando el formato del terminal sin colisiones.
   */
  static highlight(text: string, rules: CompiledHighlightRule[]): string {
    if (!text || rules.length === 0) {
      return text;
    }

    let result = text;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule || !rule.pattern) {
        continue;
      }
      rule.pattern.lastIndex = 0;
      result = result.replace(rule.pattern, (m) => `${rule.colorAnsi}${m}${rule.resetAnsi}`);
    }

    return result;
  }
}

export const RouterEventHighlighter = AdvancedHighlighter;

