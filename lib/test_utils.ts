import {assert} from 'chai';

export async function willBeRejected<ErrorT = any>(
  promise: Promise<any>,
): Promise<ErrorT> {
  try {
    await promise;
  } catch (err: any) {
    return err;
  }

  throw new Error('Promise unexpectedly resolved');
}

export async function willBeRejectedWith<T, ErrorT = any>(
  promise: Promise<T>,
  matcher?: RegExp,
): Promise<ErrorT> {
  const error = await willBeRejected(promise);
  if (matcher) {
    assert.match(error, matcher, 'Promise was rejected with unexpected error.');
  }
  return error as ErrorT;
}
