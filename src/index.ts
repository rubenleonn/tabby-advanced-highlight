import { NgModule } from "@angular/core";
import { TerminalDecorator } from "tabby-terminal";
import { RouterEventHighlightDecorator } from "./decorator";

@NgModule({
  providers: [
    { provide: TerminalDecorator, useClass: RouterEventHighlightDecorator, multi: true },
  ],
})
export default class RouterEventHighlightModule {}
