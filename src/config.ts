import { ConfigProvider } from "tabby-core";
import { parseRulesText } from "./highlighter";
import { HighlightRule } from "./types";

export const DEFAULT_RULES_LINES: string[] = [
  String.raw`"[<\[]cpe[^>\]]*[>\]]", 1, 0, B3B4BC, , 1`,
  String.raw`"\bup(?:\(s\))?", 1, 0, 3C9F50, , 1`,
  String.raw`"\bdown\b", 1, 0, DC0000, , 1`,
  String.raw`"administratively", 0, 0, AD01AD, , 1`,
  String.raw`"error:.*", 1, 0, FFFFFF, DC0000, 1`,
  String.raw`"description", 0, 0, 8000FF, , 1`,
  String.raw`"unassigned", 0, 0, 585B70, , 1`,
  String.raw`"10ge\d/\d/\d{1,2}(\.\d{1,10})?", 1, 0, 5CC7C7, , 1`,
  String.raw`"gi\d/\d/\d{1,2}(\.\d{1,10})?", 1, 0, 5CC7C7, , 1`,
  String.raw`"GigabitEthernet\d/\d/\d{1,2}(\.\d{1,10})?", 1, 0, 5CC7C7, , 1`,
  String.raw`"Cellular\d/\d/\d{1,2}(\.\d{1,10})?", 1, 0, 5CC7C7, , 1`,
  String.raw`"loopback\d+(\.\d{1,10})?", 1, 0, 5CC7C7, , 1`,
  String.raw`"vlanif\d+(\.\d{1,10})?", 1, 0, 5CC7C7, , 1`,
  String.raw`"NULL\d+?", 1, 0, 585B70, , 1`,
  String.raw`"(?<![\d.])(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(?:\/\d{1,2})?(?!\.?\d)", 1, 0, ECEC74, , 1`,
  String.raw`".*will be erased.*", 1, 0, FF0000,, 1`,
  String.raw`"warning:.*", 1, 0, FB9246, , 1`,
  String.raw`"info:.*", 1, 0, D2D2AC, , 1`,
];

export const DEFAULT_RULES_TEXT: string = DEFAULT_RULES_LINES.join("\n");

export const DEFAULT_HIGHLIGHT_RULES: HighlightRule[] = parseRulesText(DEFAULT_RULES_TEXT);

export class AdvancedHighlightConfigProvider extends ConfigProvider {
  defaults = {
    advancedHighlight: {
      rules: DEFAULT_RULES_LINES,
    },
  };

  platformDefaults = {};
}
