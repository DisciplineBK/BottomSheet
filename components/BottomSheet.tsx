import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useImperativeHandle } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
console.log('SCREEN_HEIGHT :',SCREEN_HEIGHT)

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

// 외부에서 React.ReactNode를 받아오기 위함
type BottomSheetProps = {
    children?: React.ReactNode;
};

export type BottomSheetRefProps = {
    scrollTo: (destination: number) => void;
    isActive: () => boolean;
};

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
    ({ children }, ref) => {
        // 애니메이션 효과에 사용하는 변수를 선언합니다. (기본 값은 0)
        const translateY = useSharedValue(0);
        const active = useSharedValue(false);
        const context = useSharedValue({ y: 0 });

        const scrollTo = useCallback((destination: number) => {
            'worklet';
            active.value = destination !== 0;
            // 스프링 효과, 지속 시간을 지정할 수는 없다.
            translateY.value = withSpring(destination, { damping: 50 });
        }, []);

        const isActive = useCallback(() => {
            return active.value;
        }, []);

        // 부모 컴포넌트가 자식 컴포넌트의 함수를 사용할 수 있게 한다.
        useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
            scrollTo,
            isActive,
        ]);

        // Guesture은 Tap, Pan, LongPress, Fling, Pinch, Rotation, ForceTouch 등이 있다.
        const gesture = Gesture.Pan()
            // Is called when a gesture transitions to the ACTIVE state.
            .onStart(() => {
                // 시작할때 위치를 저장.
                console.log ('onStart _ translateY.value',translateY.value)
                context.value = { y: translateY.value };
            })
            // Is called every time a gesture is updated while it is in the ACTIVE state.
            .onUpdate((event) => {
                // console.log ('onUpdate _ event.translationY',event.translationY)
                // console.log ('onUpdate _ context.value.y',context.value.y)
                // event.translationY : y축 만큼 얼마나 이동했는지
                // context.value.y : 시작 위치
                translateY.value = event.translationY + context.value.y;
                // 최대 높이를 넘어가지 않도록 함. Math.max 가장 큰 수 리턴
                // console.log ('onUpdate _ translateY.value 전',translateY.value)
                // console.log ('onUpdate _ MAX_TRANSLATE_Y',MAX_TRANSLATE_Y)
                translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
                // console.log ('onUpdate _ translateY.value 후',translateY.value)

            })
            // Is called when a gesture transitions from the ACTIVE state to the END, FAILED, or CANCELLED state.
            // If the gesture transitions to the END state, the success argument is set to true otherwise it is set to false.
            .onEnd(() => {
                if (translateY.value > -SCREEN_HEIGHT / 3) {
                    scrollTo(0);
                } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
                    scrollTo(MAX_TRANSLATE_Y);
                }
            });

        // 애니메이션 효과를 주는 style 의 경우 useAnimatedStyle Hook 을 이용하여 따로 정의합니다.
        // 제스처를 할때마다 함수가 실행된다.
        const animatedStyles = useAnimatedStyle(() => {
            const borderRadius = interpolate(
                translateY.value,
                [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
                [25, 5],
                Extrapolate.CLAMP // 속성  EXTEND , CLAMP,  IDENTITY
            );
            console.log('borderRadius :', borderRadius) // 숫자 반환

            return {
                borderRadius,
                transform: [{ translateY: translateY.value }],
            };
        });

        return (
            <GestureDetector gesture={gesture}>
                {/* 애니메이션 효과를 위한 컴포넌트 정의하기 */}
                <Animated.View style={[styles.bottomSheetContainer, animatedStyles]}>
                    <View style={styles.line} />
                    {children}
                </Animated.View>
            </GestureDetector>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',   // 기본 값을 relevant. absolute로 설정하면 상위 컴포넌트 위치를 기준으로 배치된다.
        top: SCREEN_HEIGHT,     // top으로 부터 얼마나 떨어질지를 나태내는 값.
        borderRadius: 25,
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'grey',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
    },
});

export default BottomSheet;