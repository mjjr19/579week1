"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { KpiData, TeamAlignmentScore, MetricOverlap, MetricConflict } from "@/types/kpi-types"

interface AlignmentScorecardProps {
  kpiData: KpiData[]
}

export function AlignmentScorecard({ kpiData }: AlignmentScorecardProps) {
  const [alignmentScores, setAlignmentScores] = useState<TeamAlignmentScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Calculate alignment scores
    const scores = calculateAlignmentScores(kpiData)
    setAlignmentScores(scores)
    setLoading(false)
  }, [kpiData])

  if (loading) {
    return <div className="text-center py-6 text-sm text-gray-500">Calculating alignment scores...</div>
  }

  // Sort teams by score
  const sortedScores = [...alignmentScores].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-normal text-gray-800 mb-2">Team Alignment Scorecard</h2>
        <p className="text-xs text-gray-500 mb-6">Quantitative assessment of KPI alignment across teams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedScores.map((teamScore) => (
          <div key={teamScore.team} className="border border-gray-200 p-4 rounded-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{teamScore.team}</span>
              <Badge variant={getScoreBadgeVariant(teamScore.score)} className="text-xs">
                {teamScore.score.toFixed(1)}/100
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mb-2">{getScoreDescription(teamScore.score)}</p>
            <Progress value={teamScore.score} className="h-1 mb-2" />
            <div className="text-xs mt-3 text-gray-500 flex justify-between">
              <span>Overlaps: {teamScore.overlaps.length}</span>
              <span>Conflicts: {teamScore.conflicts.length}</span>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overlaps" className="mt-8">
        <TabsList className="border-b border-gray-200 w-full">
          <TabsTrigger value="overlaps" className="text-xs">
            Metric Overlaps
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="text-xs">
            Metric Conflicts
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs">
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overlaps" className="mt-4">
          <h3 className="text-base font-medium text-gray-700 mb-3">Metric Overlaps</h3>
          <p className="text-xs text-gray-500 mb-4">Areas where teams have metrics that overlap in scope</p>

          <div className="space-y-3">
            {getAllOverlaps(alignmentScores).length > 0 ? (
              getAllOverlaps(alignmentScores)
                .sort((a, b) => b.severity - a.severity)
                .slice(0, 10)
                .map((overlap, index) => (
                  <div key={index} className="border-l-2 border-gray-300 pl-3 py-2">
                    <p className="text-sm font-medium">
                      {overlap.team1}'s "{overlap.metric1}" overlaps with {overlap.team2}'s "{overlap.metric2}"
                    </p>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Common terms:</span> {overlap.commonTerms.join(", ")}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Severity:</span> {(overlap.severity * 100).toFixed(0)}%
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">No significant metric overlaps detected.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="mt-4">
          <h3 className="text-base font-medium text-gray-700 mb-3">Metric Conflicts</h3>
          <p className="text-xs text-gray-500 mb-4">Areas where teams define similar concepts differently</p>

          <div className="space-y-3">
            {getAllConflicts(alignmentScores).length > 0 ? (
              getAllConflicts(alignmentScores)
                .slice(0, 10)
                .map((conflict, index) => (
                  <div key={index} className="border-l-2 border-red-300 pl-3 py-2">
                    <p className="text-sm font-medium">Conflict in "{conflict.concept}" concept</p>
                    <div className="mt-2 space-y-2">
                      <div className="border-l border-gray-200 pl-2">
                        <div className="text-xs font-medium">
                          {conflict.team1}: {conflict.metric1}
                        </div>
                        <div className="text-xs text-gray-600">{conflict.definition1}</div>
                      </div>
                      <div className="border-l border-gray-200 pl-2">
                        <div className="text-xs font-medium">
                          {conflict.team2}: {conflict.metric2}
                        </div>
                        <div className="text-xs text-gray-600">{conflict.definition2}</div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">No significant metric conflicts detected.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <h3 className="text-base font-medium text-gray-700 mb-3">Recommendations</h3>
          <p className="text-xs text-gray-500 mb-4">Suggested actions to improve KPI alignment</p>

          {/* Teams needing attention */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Teams Needing Immediate Attention</h4>
            {alignmentScores.filter((score) => score.score < 70).length > 0 ? (
              <div className="space-y-2">
                {alignmentScores
                  .filter((score) => score.score < 70)
                  .sort((a, b) => a.score - b.score)
                  .map((teamScore, index) => (
                    <div key={index} className="border-l-2 border-amber-300 pl-3 py-2">
                      <p className="text-sm font-medium">{teamScore.team}</p>
                      <div className="text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Score:</span> {teamScore.score.toFixed(1)}/100
                        </div>
                        <div>
                          <span className="font-medium">Recommendation:</span> Schedule a metric review session to
                          address {teamScore.overlaps.length} overlaps and {teamScore.conflicts.length} conflicts.
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600 border-l-2 border-green-300 pl-3 py-2">
                All teams have acceptable alignment scores
              </div>
            )}
          </div>

          {/* Cross-team reviews */}
          <div>
            <h4 className="text-sm font-medium mb-2">Recommended Cross-Team Reviews</h4>
            {getTeamPairsWithMostOverlaps(alignmentScores).length > 0 ? (
              <div className="space-y-2">
                {getTeamPairsWithMostOverlaps(alignmentScores)
                  .slice(0, 3)
                  .map(([teams, count], index) => (
                    <div key={index} className="border-l-2 border-gray-300 pl-3 py-2">
                      <p className="text-sm font-medium">
                        {teams[0]} and {teams[1]}
                      </p>
                      <div className="text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Overlapping metrics:</span> {count}
                        </div>
                        <div>
                          <span className="font-medium">Recommendation:</span> Schedule a joint review session to align
                          on metric definitions and measurement approaches.
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">No significant team overlaps detected.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions
function calculateAlignmentScores(kpiData: KpiData[]): TeamAlignmentScore[] {
  const teams = Array.from(new Set(kpiData.map((kpi) => kpi.Team)))
  const scores: TeamAlignmentScore[] = []

  // Calculate overlaps
  const overlaps: Record<string, MetricOverlap[]> = {}
  teams.forEach((team) => {
    overlaps[team] = []
  })

  // Detect overlaps
  for (const team1 of teams) {
    const team1Metrics = kpiData.filter((kpi) => kpi.Team === team1)
    for (const metric1 of team1Metrics) {
      const terms1 = extractKeyTerms(metric1.Definition)
      for (const team2 of teams) {
        if (team1 !== team2) {
          const team2Metrics = kpiData.filter((kpi) => kpi.Team === team2)
          for (const metric2 of team2Metrics) {
            const terms2 = extractKeyTerms(metric2.Definition)
            const commonTerms = terms1.filter((term) => terms2.includes(term))
            if (commonTerms.length > 0) {
              const severity = commonTerms.length / Math.max(terms1.length, terms2.length)
              if (severity > 0.2) {
                // Only include significant overlaps
                overlaps[team1].push({
                  team1,
                  metric1: metric1.Metric_Name,
                  team2,
                  metric2: metric2.Metric_Name,
                  commonTerms,
                  severity,
                })
              }
            }
          }
        }
      }
    }
  }

  // Calculate conflicts
  const conflicts: Record<string, MetricConflict[]> = {}
  teams.forEach((team) => {
    conflicts[team] = []
  })

  // Group metrics by similar concepts
  const metricConcepts: Record<string, KpiData[]> = {}
  const conceptKeywords: Record<string, string[]> = {
    conversion: ["conversion", "convert", "signup", "trial"],
    engagement: ["engagement", "usage", "active", "login", "session"],
    quality: ["quality", "qualified", "score", "good"],
    churn: ["churn", "retention", "return", "attrition"],
    value: ["value", "revenue", "ltv", "lifetime"],
    satisfaction: ["satisfaction", "nps", "feedback", "survey"],
  }

  for (const kpi of kpiData) {
    for (const [concept, keywords] of Object.entries(conceptKeywords)) {
      if (
        keywords.some(
          (keyword) =>
            kpi.Metric_Name.toLowerCase().includes(keyword) || kpi.Definition.toLowerCase().includes(keyword),
        )
      ) {
        if (!metricConcepts[concept]) {
          metricConcepts[concept] = []
        }
        metricConcepts[concept].push(kpi)
      }
    }
  }

  // Find conflicts within each concept
  for (const [concept, metrics] of Object.entries(metricConcepts)) {
    if (metrics.length > 1) {
      for (let i = 0; i < metrics.length; i++) {
        for (let j = i + 1; j < metrics.length; j++) {
          const metric1 = metrics[i]
          const metric2 = metrics[j]
          if (metric1.Team !== metric2.Team) {
            const conflict: MetricConflict = {
              concept,
              team1: metric1.Team,
              metric1: metric1.Metric_Name,
              definition1: metric1.Definition,
              team2: metric2.Team,
              metric2: metric2.Metric_Name,
              definition2: metric2.Definition,
            }
            conflicts[metric1.Team].push(conflict)
            conflicts[metric2.Team].push(conflict)
          }
        }
      }
    }
  }

  // Calculate scores for each team
  for (const team of teams) {
    // Base score
    let score = 100

    // Penalty for overlaps
    const teamOverlaps = overlaps[team]
    if (teamOverlaps.length > 0) {
      const avgSeverity = teamOverlaps.reduce((sum, o) => sum + o.severity, 0) / teamOverlaps.length
      score -= teamOverlaps.length * 5 * avgSeverity
    }

    // Penalty for conflicts
    const teamConflicts = conflicts[team]
    score -= teamConflicts.length * 3

    // Bonus for clear definitions
    const teamMetrics = kpiData.filter((kpi) => kpi.Team === team)
    const clearDefinitions = teamMetrics.filter((metric) => metric.Definition.split(" ").length > 8).length
    score += clearDefinitions * 2

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score))

    scores.push({
      team,
      score,
      overlaps: teamOverlaps,
      conflicts: teamConflicts,
    })
  }

  return scores
}

function extractKeyTerms(definition: string): string[] {
  // Extract key terms and measurements from a definition
  const terms = definition
    .toLowerCase()
    .match(
      /\b(?:user|lead|customer|account|retention|engagement|conversion|feature|support|ticket|revenue|score|usage|onboarding|signup|click|active|session|trial|churn|satisfaction|nps)\b/g,
    )
  return terms ? Array.from(new Set(terms)) : []
}

function getAllOverlaps(scores: TeamAlignmentScore[]): MetricOverlap[] {
  // Get all unique overlaps
  const allOverlaps: MetricOverlap[] = []
  const seen = new Set<string>()

  scores.forEach((teamScore) => {
    teamScore.overlaps.forEach((overlap) => {
      const key = `${overlap.team1}-${overlap.metric1}-${overlap.team2}-${overlap.metric2}`
      const reverseKey = `${overlap.team2}-${overlap.metric2}-${overlap.team1}-${overlap.metric1}`
      if (!seen.has(key) && !seen.has(reverseKey)) {
        allOverlaps.push(overlap)
        seen.add(key)
      }
    })
  })

  return allOverlaps
}

function getAllConflicts(scores: TeamAlignmentScore[]): MetricConflict[] {
  // Get all unique conflicts
  const allConflicts: MetricConflict[] = []
  const seen = new Set<string>()

  scores.forEach((teamScore) => {
    teamScore.conflicts.forEach((conflict) => {
      const key = `${conflict.team1}-${conflict.metric1}-${conflict.team2}-${conflict.metric2}`
      const reverseKey = `${conflict.team2}-${conflict.metric2}-${conflict.team1}-${conflict.metric1}`
      if (!seen.has(key) && !seen.has(reverseKey)) {
        allConflicts.push(conflict)
        seen.add(key)
      }
    })
  })

  return allConflicts
}

function getTeamPairsWithMostOverlaps(scores: TeamAlignmentScore[]): [string[], number][] {
  // Count overlaps between team pairs
  const pairCounts: Record<string, number> = {}

  getAllOverlaps(scores).forEach((overlap) => {
    const pair = [overlap.team1, overlap.team2].sort().join("-")
    pairCounts[pair] = (pairCounts[pair] || 0) + 1
  })

  // Convert to array and sort
  return Object.entries(pairCounts)
    .map(([pair, count]) => [pair.split("-"), count] as [string[], number])
    .sort((a, b) => b[1] - a[1])
}

function getScoreBadgeVariant(score: number): "default" | "outline" | "secondary" | "destructive" {
  if (score >= 80) return "outline"
  if (score >= 60) return "secondary"
  return "destructive"
}

function getScoreDescription(score: number): string {
  if (score >= 80) return "Well-aligned metrics"
  if (score >= 60) return "Some alignment issues"
  return "Significant alignment problems"
}
