import { useCallback, useEffect, useRef, useState } from 'react';
import { Scrambow } from 'scrambow';

export const useScrambleHistory = (currentEvent: string) => {
  const [scrambler, setScrambler] = useState<Scrambow | undefined>();
  const [scrambleHistory, setScrambleHistory] = useState<string[]>([]);
  const [currentScramble, setCurrentScramble] = useState(0);
  useEffect(() => {
    if (scrambler) {
      return;
    }
    const newScrambler = new Scrambow();
    newScrambler.setType(currentEvent);
    setScrambler(newScrambler);
    setScrambleHistory(newScrambler.get(10).map((x) => x.scramble_string));
  }, [currentEvent, scrambler]);
  {
    const prevEvent = useRef<string | null>(currentEvent);
    useEffect(() => {
      if (prevEvent.current === currentEvent || !scrambler) {
        return;
      }
      prevEvent.current = currentEvent;
      scrambler.setType(currentEvent);
      setScrambleHistory(scrambler.get(50).map((x) => x.scramble_string));
    }, [currentEvent, scrambler]);
  }

  const [onCarouselTransitionEnd, setOnCarouselTransitionEnd] = useState<
    (() => void) | undefined
  >(undefined);
  const [carouselAnimationDisabled, setCarouselAnimationDisabled] =
    useState(false);
  const onCarouselIndexChange = useCallback(
    (nextCarouselIndex: number) => {
      setCurrentScramble(nextCarouselIndex);
      if (!scrambler || scrambleHistory.length - nextCarouselIndex >= 8) {
        return;
      }
      // pure-react-carousel は要素を増やすと不要なアニメーションが走る(https://github.com/express-labs/pure-react-carousel/issues/371)
      // この問題へのワークアラウンドとして、要素を追加したときはアニメーションを一時的に無効化している
      setOnCarouselTransitionEnd(() => () => {
        setScrambleHistory((list) => [
          ...list,
          ...scrambler.get(50).map((x) => x.scramble_string),
        ]);
        setCarouselAnimationDisabled(true);
        setTimeout(() => {
          setCarouselAnimationDisabled(false);
          setOnCarouselTransitionEnd(undefined);
        }, 100);
      });
    },
    [scrambleHistory.length, scrambler]
  );
  return {
    scrambleHistory,
    currentScramble,
    nextScramble: useCallback(() => setCurrentScramble((n) => n + 1), []),
    onCarouselIndexChange,
    workaround_for_pure_react_carousel: {
      onCarouselTransitionEnd,
      carouselAnimationDisabled,
    },
  } as const;
};
