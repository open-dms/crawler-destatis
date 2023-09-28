export class NoEntityFoundError extends Error {
  constructor() {
    super("No entity found");
  }
}
