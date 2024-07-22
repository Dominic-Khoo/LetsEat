export class Interval {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }
}

export class IntervalTreeNode {
  interval: Interval;
  left: IntervalTreeNode | null = null;
  right: IntervalTreeNode | null = null;
  max: number;

  constructor(interval: Interval) {
    this.interval = interval;
    this.max = interval.end;
  }
}

export class IntervalTree {
  root: IntervalTreeNode | null = null;

  insert(interval: Interval) {
    this.root = this._insert(this.root, interval);
  }

  private _insert(
    node: IntervalTreeNode | null,
    interval: Interval
  ): IntervalTreeNode {
    if (!node) {
      return new IntervalTreeNode(interval);
    }
    if (interval.start < node.interval.start) {
      node.left = this._insert(node.left, interval);
    } else {
      node.right = this._insert(node.right, interval);
    }
    if (node.max < interval.end) {
      node.max = interval.end;
    }
    return node;
  }

  search(interval: Interval): Interval[] {
    return this._search(this.root, interval);
  }

  private _search(
    node: IntervalTreeNode | null,
    interval: Interval
  ): Interval[] {
    const result: Interval[] = [];
    if (!node) {
      return result;
    }
    if (this._doOverlap(node.interval, interval)) {
      result.push(node.interval);
    }
    if (node.left && node.left.max >= interval.start) {
      result.push(...this._search(node.left, interval));
    }
    if (node.right && node.right.interval.start <= interval.end) {
      result.push(...this._search(node.right, interval));
    }
    return result;
  }

  private _doOverlap(interval1: Interval, interval2: Interval): boolean {
    return interval1.start <= interval2.end && interval2.start <= interval1.end;
  }
}