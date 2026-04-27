import { renderHook } from '@testing-library/react-native';
import { useAccessibility } from '../useAccessibility';
import { AccessibilityInfo } from 'react-native';

// Mock AccessibilityInfo
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isBoldTextEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    isHighContrastEnabled: jest.fn(),
    reduceTransparencyEnabled: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

describe('useAccessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(false);
    (AccessibilityInfo.isBoldTextEnabled as jest.Mock).mockResolvedValue(false);
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);
    (AccessibilityInfo.isHighContrastEnabled as jest.Mock).mockResolvedValue(false);
    (AccessibilityInfo.reduceTransparencyEnabled as jest.Mock).mockResolvedValue(false);
    (AccessibilityInfo.addEventListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
  });

  it('returns default accessibility state', async () => {
    const { result } = renderHook(() => useAccessibility());
    
    // Wait for async initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.isScreenReaderEnabled).toBe(false);
    expect(result.current.isBoldTextEnabled).toBe(false);
    expect(result.current.isReduceMotionEnabled).toBe(false);
  });

  it('detects screen reader enabled', async () => {
    (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useAccessibility());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.isScreenReaderEnabled).toBe(true);
  });

  it('returns font size multiplier', () => {
    const { result } = renderHook(() => useAccessibility());
    
    expect(result.current.fontSizeMultiplier).toBe(1);
  });
});
