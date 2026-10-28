import { Component, OnDestroy, OnInit } from "@angular/core";
import { AdvancedHighlightService } from "../services/advancedHighlight.service";

@Component({
  template: require("./advancedHighlightSettingsTab.component.html"),
  styles: [require("./advancedHighlightSettingsTab.component.scss")],
})
export class AdvancedHighlightSettingsTabComponent implements OnInit, OnDestroy {
  rulesText = "";
  saveSuccess = false;
  private saveTimeout: any = null;

  // Color picker auxiliar
  pickerColorHex = "#00FF00";
  pickerHexRaw = "00FF00";
  copySuccess = false;
  private copyTimeout: any = null;

  readonly quickColors: string[] = [
    "FFFFFF", // Blanco
    "DC0000", // Rojo error
    "16A032", // Verde UP
    "E65F00", // Naranja DOWN
    "00FFFF", // Cian interface
    "FFFF00", // Amarillo IP
    "FF00FF", // Magenta
    "585B70", // Gris tenue
  ];

  constructor(private service: AdvancedHighlightService) {}

  ngOnInit(): void {
    this.rulesText = this.service.rulesText;
  }

  ngOnDestroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }

  save(): void {
    this.service.saveRulesText(this.rulesText);
    this.triggerSuccess();
  }

  private triggerSuccess(): void {
    this.saveSuccess = true;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
  }

  onPickerInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.pickerColorHex = val;
      this.pickerHexRaw = val.replace("#", "").toUpperCase();
    }
  }

  onHexInputChange(val: string): void {
    const clean = (val || "").trim().replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
      this.pickerColorHex = "#" + clean.toUpperCase();
    } else if (/^[0-9a-fA-F]{3}$/.test(clean)) {
      const expanded = clean
        .split("")
        .map((c) => c + c)
        .join("");
      this.pickerColorHex = "#" + expanded.toUpperCase();
    }
  }

  selectQuickColor(hex: string): void {
    this.pickerHexRaw = hex.toUpperCase();
    this.pickerColorHex = "#" + hex.toUpperCase();
  }

  copyColor(): void {
    if (!this.pickerHexRaw) {
      return;
    }
    try {
      navigator.clipboard.writeText(this.pickerHexRaw).catch(() => {});
    } catch (e) {}

    this.copySuccess = true;
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
    this.copyTimeout = setTimeout(() => {
      this.copySuccess = false;
    }, 2000);
  }
}
