"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface KpiDefinition {
  Team: string
  Metric_Name: string
  Definition: string
}

interface MetricFamily {
  name: string
  keywords: string[]
  metrics: string[]
  teams: string[]
  standardDefinition: string
  conflicts: {
    type: string[]
    severity: string
    description: string
  }
}

interface KpiGlossaryGeneratorProps {
  kpiData: KpiDefinition[]
}

export function KpiGlossaryGenerator({ kpiData }: KpiGlossaryGeneratorProps) {
  const [metricFamilies, setMetricFamilies] = useState<MetricFamily[]>([])
  const [activeTab, setActiveTab] = useState("families")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  // Function to identify metric families
  const identifyMetricFamilies = () => {
    setIsGenerating(true)

    // Define the metric families based on domain knowledge
    const familyDefinitions = {
      Engagement: {
        keywords: ["engagement", "interact", "usage", "activity", "logins", "clicks", "opens", "webinar"],
        metrics: [],
        teams: [],
      },
      Conversion: {
        keywords: ["conversion", "lead", "qualified", "close", "pipeline", "deal", "sales", "cta", "sign up"],
        metrics: [],
        teams: [],
      },
      Retention: {
        keywords: ["retention", "churn", "return", "attrition", "loyalty", "time to value"],
        metrics: [],
        teams: [],
      },
      Satisfaction: {
        keywords: ["satisfaction", "nps", "feedback", "survey", "happy", "sentiment"],
        metrics: [],
        teams: [],
      },
      "Product Usage": {
        keywords: ["feature", "adoption", "activation", "onboarding", "user", "power user"],
        metrics: [],
        teams: [],
      },
      Financial: {
        keywords: ["revenue", "cost", "cac", "ltv", "roi", "mrr", "arr", "clv"],
        metrics: [],
        teams: [],
      },
    }

    // Assign metrics to families
    kpiData.forEach((kpi) => {
      const metricName = kpi.Metric_Name.toLowerCase()
      const definition = kpi.Definition.toLowerCase()
      const team = kpi.Team

      for (const [familyName, family] of Object.entries(familyDefinitions)) {
        const keywords = family.keywords
        if (
          keywords.some((keyword) => metricName.includes(keyword)) ||
          keywords.some((keyword) => definition.includes(keyword))
        ) {
          family.metrics.push(kpi.Metric_Name)
          if (!family.teams.includes(team)) {
            family.teams.push(team)
          }
        }
      }
    })

    // Create standard definitions and analyze conflicts
    const families: MetricFamily[] = []
    for (const [familyName, family] of Object.entries(familyDefinitions)) {
      if (family.metrics.length > 0) {
        // Analyze conflicts
        const conflicts = analyzeConflicts(familyName, family.metrics, family.teams)

        // Create standard definition
        const standardDefinition = createStandardDefinition(familyName)

        families.push({
          name: familyName,
          keywords: family.keywords,
          metrics: family.metrics,
          teams: family.teams,
          standardDefinition,
          conflicts,
        })
      }
    }

    setMetricFamilies(families)
    setIsGenerating(false)
    setIsGenerated(true)
  }

  // Function to analyze conflicts
  const analyzeConflicts = (familyName: string, metrics: string[], teams: string[]) => {
    const conflictTypes: string[] = []
    let conflictSeverity = "Low"
    let conflictDescription = "No significant conflicts detected."

    // Check for team conflicts
    if (teams.length > 1) {
      conflictTypes.push("Team Conflict")
      conflictDescription = `Metrics within the ${familyName} family are owned by different teams: ${teams.join(", ")}.`
      conflictSeverity = "Medium"
    }

    // Check for definition conflicts
    const familyMetrics = kpiData.filter((kpi) => metrics.includes(kpi.Metric_Name))
    const metricsByName: Record<string, KpiDefinition[]> = {}

    familyMetrics.forEach((kpi) => {
      if (!metricsByName[kpi.Metric_Name]) {
        metricsByName[kpi.Metric_Name] = []
      }
      metricsByName[kpi.Metric_Name].push(kpi)
    })

    // Look for same metric name with different definitions
    let definitionConflicts = false
    for (const [name, kpis] of Object.entries(metricsByName)) {
      if (kpis.length > 1) {
        const definitions = new Set(kpis.map((kpi) => kpi.Definition))
        if (definitions.size > 1) {
          definitionConflicts = true
          conflictTypes.push("Definition Conflict")
          conflictDescription += ` '${name}' has different definitions across teams.`
          conflictSeverity = "High"
        }
      }
    }

    return {
      type: conflictTypes,
      severity: conflictSeverity,
      description: conflictDescription,
    }
  }

  // Function to create standard definition
  const createStandardDefinition = (familyName: string) => {
    const standardDefinitions: Record<string, string> = {
      Engagement:
        "A composite measure of user interaction with the product or content, measured across multiple channels. Combines both frequency and depth of interaction.",
      Conversion:
        "A sequential funnel measuring prospect progression from awareness to closed deal, with standardized stages and qualification criteria.",
      Retention:
        "A comprehensive view of user retention that incorporates both time-to-value and ongoing engagement patterns over time.",
      Satisfaction:
        "A multi-dimensional assessment of user happiness and product experience using both explicit feedback and implicit behavioral signals.",
      "Product Usage":
        "A unified approach to measuring product adoption across the user lifecycle, from initial activation to power usage.",
      Financial:
        "A comprehensive framework for measuring business financial health with standardized calculations and consistent customer definitions.",
    }

    return standardDefinitions[familyName] || "Standard definition not available."
  }

  // Function to handle export
  const handleExport = () => {
    // In a real implementation, this would generate a CSV file
    alert("In a real implementation, this would export the glossary as a CSV file.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-normal text-gray-800 mb-2">KPI Glossary Generator</h2>
          <p className="text-xs text-gray-500">Generate a standardized glossary of KPIs grouped by metric families</p>
        </div>
        {isGenerated && (
          <Button onClick={handleExport} variant="outline" size="sm" className="flex items-center gap-2 text-xs">
            <Download size={14} />
            Export Glossary
          </Button>
        )}
      </div>

      {!isGenerated ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 border border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">Generate a standardized glossary based on your KPI definitions</p>
          <Button
            onClick={identifyMetricFamilies}
            disabled={isGenerating}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          >
            {isGenerating ? "Generating..." : "Generate Glossary"}
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="border-b border-gray-200 w-full">
            <TabsTrigger value="families" className="text-xs">
              Metric Families
            </TabsTrigger>
            <TabsTrigger value="standards" className="text-xs">
              Standard Definitions
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="text-xs">
              Conflicts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="families" className="space-y-4">
            {metricFamilies.map((family) => (
              <div key={family.name} className="border border-gray-200 p-4 rounded-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-medium">{family.name}</h3>
                    <p className="text-xs text-gray-500">
                      {family.metrics.length} metrics across {family.teams.length} teams
                    </p>
                  </div>
                  <Badge variant={family.conflicts.severity === "High" ? "destructive" : "outline"} className="text-xs">
                    {family.conflicts.severity} Conflict
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Keywords:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {family.keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Teams:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {family.teams.map((team, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {team}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Metrics:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {family.metrics.map((metric, i) => (
                        <div key={i} className="text-xs text-gray-600 border-l border-gray-200 pl-2">
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="standards" className="space-y-4">
            {metricFamilies.map((family) => (
              <div key={family.name} className="border border-gray-200 p-4 rounded-sm">
                <div className="mb-3">
                  <h3 className="text-base font-medium">{family.name} Standard</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Standard Definition:</p>
                    <p className="text-xs text-gray-600 mt-1">{family.standardDefinition}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Team Translations:</p>
                    <div className="space-y-2 mt-1">
                      {family.teams.map((team, i) => (
                        <div key={i} className="text-xs border-l border-gray-200 pl-2">
                          <span className="font-medium">{team}:</span> Focus on{" "}
                          {family.metrics
                            .filter((metric) => {
                              const kpi = kpiData.find((k) => k.Metric_Name === metric && k.Team === team)
                              return !!kpi
                            })
                            .join(", ")}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            {metricFamilies
              .filter((family) => family.conflicts.type.length > 0)
              .map((family) => (
                <div key={family.name} className="border border-gray-200 p-4 rounded-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-medium">{family.name} Conflicts</h3>
                    <Badge
                      variant={family.conflicts.severity === "High" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {family.conflicts.severity}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Conflict Types:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {family.conflicts.type.map((type, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Description:</p>
                      <p className="text-xs text-gray-600 mt-1">{family.conflicts.description}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Recommendation:</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {family.conflicts.type.includes("Team Conflict")
                          ? "Establish a cross-team working group to align on definitions and ownership."
                          : family.conflicts.type.includes("Definition Conflict")
                            ? "Standardize definitions across teams using the proposed standard definition."
                            : "Review and align metrics within this family."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {metricFamilies.filter((family) => family.conflicts.type.length > 0).length === 0 && (
              <div className="text-center py-6 text-sm text-gray-500">
                No significant conflicts detected in the metric families.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
