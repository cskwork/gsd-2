// GSD-2 + packages/pi-coding-agent/src/modes/interactive/components/collapsible-message.ts - Shared collapsible message lifecycle.

import { Container } from "@gsd/pi-tui";

/**
 * Base component for message surfaces with a collapsed/expanded state.
 */
export abstract class CollapsibleMessageComponent extends Container {
	private _expanded = false;

	protected get expanded(): boolean {
		return this._expanded;
	}

	setExpanded(expanded: boolean): void {
		if (this._expanded === expanded) return;
		this._expanded = expanded;
		this.rebuildContent();
	}

	override invalidate(): void {
		super.invalidate();
		this.rebuildContent();
	}

	protected abstract rebuildContent(): void;
}
