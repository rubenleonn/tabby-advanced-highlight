import { Injectable } from "@angular/core";
import { BaseSession, BaseTerminalTabComponent, TerminalDecorator } from "tabby-terminal";
import { AdvancedHighlightMiddleware } from "./middleware";
import { AdvancedHighlightService } from "./services/advancedHighlight.service";

@Injectable()
export class AdvancedHighlightDecorator extends TerminalDecorator {
  private attachedSessions = new WeakSet<BaseSession>();

  constructor(private service: AdvancedHighlightService) {
    super();
  }

  attach(tab: BaseTerminalTabComponent<any>): void {
    if (tab.sessionChanged$) {
      tab.sessionChanged$.subscribe((session) => {
        if (session) {
          this.attachToSession(session);
        }
      });
    }
    if (tab.session) {
      this.attachToSession(tab.session);
    }
  }

  private attachToSession(session: BaseSession): void {
    if (this.attachedSessions.has(session)) {
      return;
    }
    this.attachedSessions.add(session);

    const middleware = new AdvancedHighlightMiddleware(this.service);
    session.middleware.push(middleware);
  }
}
