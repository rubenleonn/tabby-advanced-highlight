import { Injectable } from "@angular/core";
import { BaseSession, BaseTerminalTabComponent, TerminalDecorator } from "tabby-terminal";
import { RouterEventHighlightMiddleware } from "./middleware";

@Injectable()
export class RouterEventHighlightDecorator extends TerminalDecorator {
  private attachedSessions = new WeakSet<BaseSession>();

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

    const middleware = new RouterEventHighlightMiddleware();
    session.middleware.push(middleware);
  }
}
