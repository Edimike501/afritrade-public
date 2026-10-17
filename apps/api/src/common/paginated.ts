/** Return this from a controller to have the envelope include pagination meta. */
export class Paginated<T> extends Array<T> {
  public readonly meta: { page: number; limit: number; total: number };

  constructor(
    items: T[],
    meta: { page: number; limit: number; total: number },
  ) {
    super(...items);
    this.meta = meta;
    Object.setPrototypeOf(this, Paginated.prototype);
  }

  get data(): T[] {
    return Array.from(this);
  }
}
