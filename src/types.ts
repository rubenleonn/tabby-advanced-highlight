export interface HighlightRule {
  pattern: string;
  isRegex: boolean;
  caseSensitive: boolean;
  fgColor?: string;
  bgColor?: string;
  enabled?: boolean;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface CompiledHighlightRule {
  id: number;
  pattern: RegExp;
  colorAnsi: string;
  resetAnsi: string;
  raw: HighlightRule;
}
