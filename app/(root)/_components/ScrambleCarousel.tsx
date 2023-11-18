import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { css } from '@emotion/react';
import {
  ButtonBack,
  ButtonNext,
  CarouselContext,
  CarouselProvider,
  Slide,
  Slider,
} from 'pure-react-carousel';
import { memo, useContext, useEffect } from 'react';

const CarouselIndex = ({
  carouselIndex,
  onCarouselIndexChange,
}: {
  carouselIndex: number;
  onCarouselIndexChange: (carouselIndex: number) => void;
}) => {
  const carouselContext = useContext(CarouselContext);

  useEffect(() => {
    const listener = () => {
      onCarouselIndexChange(carouselContext.state.currentSlide);
    };
    carouselContext.subscribe(listener);
    return () => carouselContext.unsubscribe(listener);
  }, [carouselContext, onCarouselIndexChange]);

  useEffect(() => {
    carouselContext.setStoreState({ currentSlide: carouselIndex });
  }, [carouselIndex, carouselContext]);
  return null;
};

export const ScrambleCarousel = memo(function Carousel({
  scrambleHistory,
  animationDisabled, // HACK: totalSlides が変化したときに不要なアニメーションが走るので、そのときにアニメーションを無効化する
  carouselIndex,
  onTransitionEnd,
  onCarouselIndexChange,
}: {
  scrambleHistory: string[];
  animationDisabled: boolean;
  carouselIndex: number;
  onTransitionEnd?: () => void;
  onCarouselIndexChange: (carouselIndex: number) => void;
}) {
  return (
    <CarouselProvider
      naturalSlideWidth={50}
      naturalSlideHeight={24}
      isIntrinsicHeight
      totalSlides={scrambleHistory.length === 0 ? 1 : scrambleHistory.length} // まだ scrambleHistory がない場合はスピナーを出す
    >
      <CarouselIndex
        carouselIndex={carouselIndex}
        onCarouselIndexChange={onCarouselIndexChange}
      />
      <HStack w="full">
        <ButtonBack disabled={animationDisabled ? true : undefined}>
          <ArrowLeftIcon
            css={css`
              button:disabled & {
                opacity: 0.4;
              }
            `}
          />
        </ButtonBack>
        <Slider
          classNameAnimation={animationDisabled ? 'disabled' : undefined}
          style={{ flex: '1' }}
          onTransitionEnd={onTransitionEnd}
        >
          {scrambleHistory.length === 0 ? (
            <Slide key={0} index={0} style={{ margin: '0 8px' }}>
              <VStack align="center">
                <Spinner />
              </VStack>
            </Slide>
          ) : (
            scrambleHistory.map((scramble, index) => (
              <Slide key={index} index={index} style={{ margin: '0 8px' }}>
                <Text fontSize={['xl', '3xl']} textAlign="center">
                  {scramble}
                </Text>
              </Slide>
            ))
          )}
        </Slider>
        <ButtonNext disabled={animationDisabled ? true : undefined}>
          <ArrowRightIcon
            css={css`
              button:disabled & {
                opacity: 0.4;
              }
            `}
          />
        </ButtonNext>
      </HStack>
    </CarouselProvider>
  );
});
