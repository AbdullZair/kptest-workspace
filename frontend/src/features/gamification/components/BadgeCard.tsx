import React from 'react'
import { Card } from '@shared/components'
import type { Badge, PatientBadge } from '../types/badge.types'

/**
 * BadgeCard component props
 */
export interface BadgeCardProps {
  badge: Badge | PatientBadge
  isEarned?: boolean
  earnedAt?: string
  onClick?: () => void
  compact?: boolean
}

/**
 * BadgeCard component for displaying a badge
 */
export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  isEarned = 'earned_at' in badge,
  earnedAt,
  onClick,
  compact = false,
}) => {
  const isBadge = 'rules' in badge
  const category = 'badge_category' in badge ? badge.badge_category : badge.category

  const getCategoryColor = (): string => {
    const colors: Record<string, string> = {
      ENGAGEMENT: 'bg-blue-100 text-blue-800',
      COMPLIANCE: 'bg-green-100 text-green-800',
      EDUCATION: 'bg-purple-100 text-purple-800',
      MILESTONE: 'bg-yellow-100 text-yellow-800',
      STREAK: 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryLabel = (): string => {
    const labels: Record<string, string> = {
      ENGAGEMENT: 'Zaangażowanie',
      COMPLIANCE: 'Regularność',
      EDUCATION: 'Edukacja',
      MILESTONE: 'Kamień milowy',
      STREAK: 'Seria',
    }
    return labels[category] || category
  }

  const getBadgeIcon = (): JSX.Element => {
    if ('badge_icon_url' in badge && badge.badge_icon_url) {
      return (
        <img
          alt={badge.badge_name}
          className="h-16 w-16 object-contain"
          src={badge.badge_icon_url}
        />
      )
    }
    if ('icon_url' in badge && badge.icon_url) {
      return <img alt={badge.name} className="h-16 w-16 object-contain" src={badge.icon_url} />
    }

    // Default icons by category
    const icons: Record<string, string> = {
      ENGAGEMENT: '🎯',
      COMPLIANCE: '✓',
      EDUCATION: '📚',
      MILESTONE: '🏆',
      STREAK: '🔥',
    }
    return (
      <div className="flex h-16 w-16 items-center justify-center text-4xl">
        {icons[category] || '🏅'}
      </div>
    )
  }

  if (compact) {
    return (
      <Card
        className={`cursor-pointer p-4 text-center transition-transform hover:scale-105 ${
          !isEarned ? 'opacity-50 grayscale' : ''
        }`}
        onClick={onClick}
      >
        <div className="mb-2">{getBadgeIcon()}</div>
        <div className="text-sm font-semibold text-gray-900">
          {'badge_name' in badge ? badge.badge_name : badge.name}
        </div>
        {isEarned && earnedAt ? (
          <div className="mt-1 text-xs text-gray-500">
            {new Date(earnedAt).toLocaleDateString('pl-PL')}
          </div>
        ) : null}
      </Card>
    )
  }

  return (
    <Card
      className={`cursor-pointer p-6 transition-transform hover:scale-105 ${
        !isEarned ? 'opacity-50 grayscale' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              ('badge_color' in badge ? badge.badge_color : (badge as { color?: string }).color) ||
              '#f3f4f6',
          }}
        >
          {getBadgeIcon()}
        </div>

        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {'badge_name' in badge ? badge.badge_name : badge.name}
            </h3>
            {isEarned ? <span className="text-xl text-green-600">✓</span> : null}
          </div>

          <p className="mb-3 text-sm text-gray-600">
            {'badge_description' in badge ? badge.badge_description : badge.description}
          </p>

          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-xs ${getCategoryColor()}`}>
              {getCategoryLabel()}
            </span>
            {!isEarned && isBadge && 'rules' in badge && badge.rules?.[0] ? (
              <span className="text-xs text-gray-500">
                {badge.rules[0].threshold}{' '}
                {badge.rules[0].rule_type === 'EVENTS_COMPLETED'
                  ? 'wydarzeń'
                  : badge.rules[0].rule_type === 'QUIZ_PASSED'
                    ? 'quizów'
                    : badge.rules[0].rule_type === 'MATERIALS_READ'
                      ? 'materiałów'
                      : ''}
              </span>
            ) : null}
          </div>

          {isEarned && earnedAt ? (
            <div className="text-xs text-gray-500">
              Zdobyto:{' '}
              {new Date(earnedAt).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
