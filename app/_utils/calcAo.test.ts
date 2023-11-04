import { calcAo } from './calcAo';

describe('calcAo', () => {
  it('returns average excluding max and min', () => {
    expect(
      calcAo(
        [1, 10, 100, 1000, 10000].map((time) => ({
          time,
          penalty: false,
          dnf: false,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        })),
      ),
    ).toEqual(370);
  });

  it('takes dnf as the maximum record', () => {
    expect(
      calcAo([
        {
          time: 1,
          penalty: false,
          dnf: true,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        },
        {
          time: 10,
          penalty: false,
          dnf: false,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        },
        {
          time: 100,
          penalty: false,
          dnf: false,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        },
      ]),
    ).toBe(100);
  });

  it('returns Infinity if more than one DNF is included when calculating ao5', () => {
    expect(
      calcAo([
        {
          time: 1,
          penalty: false,
          dnf: true,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        },
        {
          time: 10,
          penalty: false,
          dnf: true,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        },
        {
          time: 100,
          penalty: false,
          dnf: false,
          createdAt: '',
          scramble: '',
          id: '',
          event: '',
        },
      ]),
    ).toBe(Infinity);
  });
});
