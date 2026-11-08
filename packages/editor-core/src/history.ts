export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export class HistoryManager<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];
  private maxDepth: number;

  constructor(initialState: T, maxDepth = 50) {
    this.present = JSON.parse(JSON.stringify(initialState));
    this.maxDepth = maxDepth;
  }

  public get state(): T {
    return this.present;
  }

  public get canUndo(): boolean {
    return this.past.length > 0;
  }

  public get canRedo(): boolean {
    return this.future.length > 0;
  }

  public push(newState: T): void {
    const serializedPresent = JSON.stringify(this.present);
    const serializedNew = JSON.stringify(newState);

    if (serializedPresent === serializedNew) {
      return; // No-op if identical
    }

    this.past.push(JSON.parse(serializedPresent));
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.present = JSON.parse(serializedNew);
    this.future = []; // Clear future on new action
  }

  public undo(): T | null {
    if (!this.canUndo) return null;

    const previous = this.past.pop()!;
    this.future.unshift(this.present);
    this.present = previous;
    return JSON.parse(JSON.stringify(this.present));
  }

  public redo(): T | null {
    if (!this.canRedo) return null;

    const next = this.future.shift()!;
    this.past.push(this.present);
    this.present = next;
    return JSON.parse(JSON.stringify(this.present));
  }

  public reset(newState: T): void {
    this.past = [];
    this.future = [];
    this.present = JSON.parse(JSON.stringify(newState));
  }
}

