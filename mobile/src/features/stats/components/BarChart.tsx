import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';
import { colors, spacing, typography } from '@app/theme';
import type { ComplianceChartData } from '../api/types';

interface BarChartProps {
  data: ComplianceChartData[];
  height?: number;
  barColor?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

export function BarChart({
  data,
  height = 200,
  barColor = colors.primary,
  showGrid = true,
  showLabels = true,
}: BarChartProps): JSX.Element {
  const padding = { top: 20, bottom: 40, left: 10, right: 10 };
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = 100; // percentage

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]} accessibilityRole="text" accessibilityLabel="Brak danych do wyświetlenia" />
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 80 / data.length; // percentage
  const barGap = 20 / data.length; // percentage

  return (
    <View
      style={[styles.container, { height }]}
      accessibilityRole="image"
      accessibilityLabel="Wykres słupkowy compliance"
    >
      <Svg width="100%" height={height}>
        {/* Grid lines */}
        {showGrid && (
          <>
            <Line
              x1="0%"
              y1={padding.top}
              x2="100%"
              y2={padding.top}
              stroke={colors.border}
              strokeWidth="1"
            />
            <Line
              x1="0%"
              y1={padding.top + chartHeight / 2}
              x2="100%"
              y2={padding.top + chartHeight / 2}
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <Line
              x1="0%"
              y1={padding.top + chartHeight}
              x2="100%"
              y2={padding.top + chartHeight}
              stroke={colors.border}
              strokeWidth="1"
            />
          </>
        )}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = padding.left + index * (barWidth + barGap);
          const y = padding.top + chartHeight - barHeight;

          return (
            <G key={item.date}>
              <Rect
                x={`${x}%`}
                y={y}
                width={`${barWidth}%`}
                height={barHeight}
                fill={barColor}
                rx="4"
                ry="4"
              />
              {showLabels && (
                <SvgText
                  x={`${x + barWidth / 2}%`}
                  y={padding.top + chartHeight + 20}
                  fontSize={10}
                  fill={colors.textSecondary}
                  textAnchor="middle"
                >
                  {item.label}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default BarChart;
