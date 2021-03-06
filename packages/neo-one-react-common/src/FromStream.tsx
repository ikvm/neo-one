// tslint:disable no-any
import * as React from 'react';
import { Observable, Subscription } from 'rxjs';
import { shallowEqual } from './shallowEqual';

// tslint:disable-next-line no-null-keyword
const initialValue = Symbol.for('initialValue');

interface Props<TProps, T> {
  /* Props to pass to createStream */
  readonly props?: TProps;
  /* Stream of props to render */
  readonly createStream: (props: TProps) => Observable<T>;
  /* Render function */
  readonly children: (props: T) => React.ReactNode;
}
// interface WithoutProps<T> {
//   /* Stream of props to render */
//   readonly createStream: () => Observable<T>;
//   /* Render function */
//   readonly children: (props: T) => React.ReactNode;
// }
// type Props<TProps, T> = WithProps<TProps, T> | WithoutProps<T>;
interface State<T> {
  readonly value: T | typeof initialValue;
}
/**
 * Renders a stream of `Observable` data.
 *
 * The `createStream` `Observable` is immediately subscribed on mount so the first render will include any data the observable immediately resolves with. This can be used to render a loading state in combination with `concat` and `of`. See example below.
 *
 * FromStream will only recreate the stream if the next `props` is not shallow equal to the previous `props`.
 *
 * @example
 * import { concat, defer, of as _of } from 'rxjs';
 *
 * <FromStream
 *  createStream={() => concat(
 *    _of(undefined),
 *    defer(async () => loadData()),
 *  )}
 * >
 *  {(data) => data === undefined
 *    ? <Loading />
 *    : <Component data={data} />}
 * </FromStream>
 */
export class FromStream<TProps, T> extends React.Component<Props<TProps, T>, State<T>> {
  // tslint:disable-next-line readonly-keyword
  public state: State<T>;
  private mutableSubscription: Subscription | undefined;
  private mutableMounted = false;

  public constructor(props: Props<TProps, T>) {
    super(props);

    this.state = {
      value: initialValue,
    };
    this.subscribe();
    this.mutableMounted = true;
  }

  public componentWillUnmount(): void {
    this.mutableMounted = false;
    this.unsubscribe();
  }

  public componentDidUpdate(prevProps: any): void {
    const props: any = this.props;
    if (
      (prevProps.props != undefined && props.props == undefined) ||
      (prevProps.props == undefined && props.props != undefined) ||
      (prevProps.props != undefined && props.props != undefined && !shallowEqual(prevProps.props, props.props))
    ) {
      this.subscribe();
    }
  }

  public render(): React.ReactNode {
    const { value } = this.state;
    if (value === initialValue) {
      // tslint:disable-next-line no-null-keyword
      return null;
    }

    return this.props.children(value);
  }

  private subscribe(): void {
    const props: any = this.props;

    this.unsubscribe();
    let stateSet = false;
    this.mutableSubscription = props.createStream(props.props).subscribe({
      next: (value: any) => {
        stateSet = true;
        this._setValue(value);
      },
    });

    if (!stateSet) {
      this._setValue(initialValue);
    }
  }

  private _setValue(value: T | typeof initialValue): void {
    if (this.mutableMounted) {
      this.setState(() => ({ value }));
    } else {
      // tslint:disable-next-line no-object-mutation
      this.state = { value };
    }
  }

  private unsubscribe(): void {
    if (this.mutableSubscription !== undefined) {
      this.mutableSubscription.unsubscribe();
      this.mutableSubscription = undefined;
    }
  }
}
