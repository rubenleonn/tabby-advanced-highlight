import { Injectable } from "@angular/core";
import { SettingsTabProvider } from "tabby-settings";
import { AdvancedHighlightSettingsTabComponent } from "./components/advancedHighlightSettingsTab.component";

@Injectable()
export class AdvancedHighlightSettingsTabProvider extends SettingsTabProvider {
  id = "advanced-highlight";
  icon = "highlighter";
  title = "Highlight";

  getComponentType(): any {
    return AdvancedHighlightSettingsTabComponent;
  }
}
