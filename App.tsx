import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetRefProps } from './components/BottomSheet';

export default function App() {
  const ref = useRef<BottomSheetRefProps>(null);
  console.log ('ref :',ref)

  // @to-Check : useCallback은 왜 최초에 실행이 안되지?
  // 이 함수가 호출되서 ref 값만 바뀌었는데 왜 BottomSheet가 작동하는거지?
  const onPress = useCallback(() => {
    console.log ('ref_in_onPress :',ref)
    // 초기화 값을 null로 했는데 어떻게  {"current": {"isActive": [Function anonymous], "scrollTo": [Function _f]}} 값이 나오는거지?
    const isActive = ref?.current?.isActive();
    console.log ('isActive :',isActive)
    if (isActive) {
      ref?.current?.scrollTo(0);
    } else {
      ref?.current?.scrollTo(-200);
    }
  }, []);

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <TouchableOpacity style={styles.button} onPress={onPress} />
          <BottomSheet ref={ref}>
            <View style={{ flex: 1, backgroundColor: 'orange' }} />
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 50,
    borderRadius: 25,
    aspectRatio: 1,
    backgroundColor: 'green',
    opacity: 0.6,
  },
});