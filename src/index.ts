import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import TabbyCoreModule, { ConfigProvider } from "tabby-core";
import { SettingsTabProvider } from "tabby-settings";
import { TerminalDecorator } from "tabby-terminal";

import { AdvancedHighlightSettingsTabComponent } from "./components/advancedHighlightSettingsTab.component";
import { AdvancedHighlightConfigProvider } from "./config";
import { AdvancedHighlightDecorator } from "./decorator";
import { AdvancedHighlightService } from "./services/advancedHighlight.service";
import { AdvancedHighlightSettingsTabProvider } from "./settings";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TabbyCoreModule,
  ],
  providers: [
    AdvancedHighlightService,
    { provide: ConfigProvider, useClass: AdvancedHighlightConfigProvider, multi: true },
    { provide: SettingsTabProvider, useClass: AdvancedHighlightSettingsTabProvider, multi: true },
    { provide: TerminalDecorator, useClass: AdvancedHighlightDecorator, multi: true },
  ],
  declarations: [
    AdvancedHighlightSettingsTabComponent,
  ],
  entryComponents: [
    AdvancedHighlightSettingsTabComponent,
  ],
  exports: [
    AdvancedHighlightSettingsTabComponent,
  ],
})
export default class AdvancedHighlightModule {}

export { AdvancedHighlightService } from "./services/advancedHighlight.service";
export { AdvancedHighlightDecorator } from "./decorator";
export { AdvancedHighlightMiddleware } from "./middleware";
export { AdvancedHighlighter } from "./highlighter";
export { HighlightRule, CompiledHighlightRule } from "./types";
