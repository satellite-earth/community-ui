import TransparentObservable from "./observable";

export class Subject<T> extends TransparentObservable<T> {
  value: T | undefined;

  constructor(value?: T) {
    super();
    this.value = value;
  }

  next(v: T) {
    this.value = v;
    return super.next(v);
  }
}

export class PersistentSubject<T> extends Subject<T> {
  value: T;
  constructor(value: T) {
    super(value);
    this.value = value;
  }
}

export default Subject;
