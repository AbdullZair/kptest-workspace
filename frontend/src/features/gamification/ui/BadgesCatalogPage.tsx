import React, { useState, useMemo } from 'react'
import { Card, Button, PageLoader, Tabs } from '@shared/components'
import { BadgeCard } from '../components/BadgeCard'
import {
  useGetVisibleBadgesQuery,
  useGetMyBadgesQuery,
  useGetBadgeStatsQuery,
} from '../api/badgeApi'

/**
 * BadgesCatalogPage Component
 *
 * Patient-facing page for viewing badge catalog and earned badges
 */
export const BadgesCatalogPage: React.FC = () => {
  // Mock patient ID - in real app, get from auth context
  const patientId = '00000000-0000-0000-0000-000000000000'

  const [activeTab, setActiveTab] = useState<'catalog' | 'my'>('catalog')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // RTK Query hooks
  const { data: allBadges = [], isLoading: isLoadingCatalog } = useGetVisibleBadgesQuery()
  const { data: myBadges = [], isLoading: isLoadingMy } = useGetMyBadgesQuery({ patientId })
  const { data: stats } = useGetBadgeStatsQuery({ patientId })

  // Create map of earned badges
  const earnedBadgeIds = useMemo(() => {
    const ids = new Set<string>()
    myBadges.forEach((b) => ids.add(b.badge_id))
    return ids
  }, [myBadges])

  // Filter badges by category
  const filteredBadges = useMemo(() => {
    const badges =
      activeTab === 'catalog' ? allBadges : myBadges.map((b) => ({ ...b, isEarned: true }))

    if (selectedCategory === 'ALL') {
      return badges
    }

    return badges.filter((b) => {
      const category = 'badge_category' in b ? b.badge_category : b.category
      return category === selectedCategory
    })
  }, [allBadges, myBadges, activeTab, selectedCategory])

  const categories = [
    { value: 'ALL', label: 'Wszystkie', count: allBadges.length },
    { value: 'ENGAGEMENT', label: 'Zaangażowanie', count: stats?.engagementBadges || 0 },
    { value: 'COMPLIANCE', label: 'Regularność', count: stats?.complianceBadges || 0 },
    { value: 'EDUCATION', label: 'Edukacja', count: stats?.educationBadges || 0 },
    { value: 'MILESTONE', label: 'Kamienie milowe', count: stats?.milestoneBadges || 0 },
  ]

  if (isLoadingCatalog || isLoadingMy) {
    return <PageLoader size="lg" text="Ładowanie odznak..." />
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Moje Odznaki</h1>
        <p className="text-gray-600">
          Zdobywaj odznaki za realizację celów terapeutycznych i edukacyjnych
        </p>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalBadges}</div>
            <div className="text-sm text-gray-600">Wszystkie</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.engagementBadges}</div>
            <div className="text-sm text-gray-600">Zaangażowanie</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.complianceBadges}</div>
            <div className="text-sm text-gray-600">Regularność</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.educationBadges}</div>
            <div className="text-sm text-gray-600">Edukacja</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.milestoneBadges}</div>
            <div className="text-sm text-gray-600">Kamienie</div>
          </Card>
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        className="mb-6"
        tabs={[
          { id: 'catalog', label: `Katalog (${allBadges.length})` },
          { id: 'my', label: `Moje (${myBadges.length})` },
        ]}
        onTabChange={(tab) => setActiveTab(tab as 'catalog' | 'my')}
      />

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            className="whitespace-nowrap"
            size="sm"
            variant={selectedCategory === cat.value ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label} {activeTab === 'catalog' && `(${cat.count})`}
          </Button>
        ))}
      </div>

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            {activeTab === 'my'
              ? 'Nie masz jeszcze żadnych odznak. Rozwiązuj quizy i realizuj cele, aby je zdobyć!'
              : 'Brak odznak w tej kategorii.'}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={'badge_id' in badge ? badge.badge_id : badge.id}
              badge={badge}
              earnedAt={'earned_at' in badge ? badge.earned_at : undefined}
              isEarned={'badge_id' in badge ? true : earnedBadgeIds.has(badge.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
