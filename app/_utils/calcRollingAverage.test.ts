import { calcRa } from './calcRollingAverage';

describe('calcRa', () => {
  it('returns rolling average', () => {
    expect(
      calcRa(
        [1, 10, 100, 1000, 10000].map((time) => ({
          time,
          penalty: false,
          dnf: false,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        })),
        5,
      ),
    ).toEqual([null, null, null, null, 370]);

    expect(
      calcRa(
        [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25,
        ].map((time) => ({
          time,
          penalty: false,
          dnf: false,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        })),
        25,
      ),
    ).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      13,
    ]);
  });

  it('returns null-filled array if size is longer than length of array', () => {
    expect(
      calcRa(
        [1, 10, 100, 1000, 10000].map((time) => ({
          time,
          penalty: false,
          dnf: false,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        })),
        6,
      ),
    ).toEqual([null, null, null, null, null]);
  });
});
