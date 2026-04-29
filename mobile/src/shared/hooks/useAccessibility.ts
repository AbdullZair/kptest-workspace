import { useState, useEffect } from 'react';
import { AccessibilityInfo, Dimensions } from 'react-native';

export interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isBoldTextEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  reduceTransparencyEnabled: boolean;
  fontSizeMultiplier: number;
}

export function useAccessibility(): AccessibilityState {
  const [state, setState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isBoldTextEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    reduceTransparencyEnabled: false,
    fontSizeMultiplier: 1,
  });

  useEffect(() => {
    const updateState = async () => {
      try {
        const [
          screenReader,
          boldText,
          reduceMotion,
          highContrast,
          reduceTransparency,
        ] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isBoldTextEnabled?.() ?? Promise.resolve(false),
          AccessibilityInfo.isReduceMotionEnabled?.() ?? Promise.resolve(false),
          // High-contrast detection isn't part of RN's AccessibilityInfo API
          // on either platform yet — fall back to false.
          Promise.resolve(false),
          AccessibilityInfo.isReduceTransparencyEnabled?.() ?? Promise.resolve(false),
        ]);

        setState((prev) => ({
          ...prev,
          isScreenReaderEnabled: screenReader,
          isBoldTextEnabled: boldText,
          isReduceMotionEnabled: reduceMotion,
          isHighContrastEnabled: highContrast,
          reduceTransparencyEnabled: reduceTransparency,
        }));
      } catch (error) {
        console.error('Failed to get accessibility state:', error);
      }
    };

    updateState();

    const subscriptions = [
      AccessibilityInfo.addEventListener('screenReaderChanged', (screenReader) => {
        setState((prev) => ({ ...prev, isScreenReaderEnabled: screenReader }));
      }),
      AccessibilityInfo.addEventListener('boldTextChanged', (boldText) => {
        setState((prev) => ({ ...prev, isBoldTextEnabled: boldText }));
      }),
      AccessibilityInfo.addEventListener('reduceMotionChanged', (reduceMotion) => {
        setState((prev) => ({ ...prev, isReduceMotionEnabled: reduceMotion }));
      }),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.remove());
    };
  }, []);

  return state;
}

export default useAccessibility;
