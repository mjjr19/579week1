"use client"

import { useState, useEffect } from "react"
import { KpiDataTable } from "./kpi-data-table"
import { KpiAnalysisResults } from "./kpi-analysis-results"
import { KpiConflictAnalyzer } from "./kpi-conflict-analyzer"
import { KpiGlossary } from "./kpi-glossary"
import { KpiTranslator } from "./kpi-translator"
import { KpiScenarioCards } from "./kpi-scenario-cards"
import { FunnelAlignmentChart } from "./funnel-alignment-chart"
import { AlignmentScorecard } from "./alignment-scorecard"
import { KpiGlossaryGenerator } from "./kpi-glossary-generator"
import { LoadingSpinner } from "./loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analyzeKpis } from "@/lib/kpi-analyzer"
import { KpiPriorityIndex } from "./kpi-priority-index"

interface KpiDefinition {
  Team: string
  Metric_Name: string
  Definition: string
}

export function KpiAlignmentDashboard() {
  const [kpiData, setKpiData] = useState<KpiDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [conflicts, setConflicts] = useState({
    vague: [],
    overlapping: [],
    incompatible: [],
  })
  const [funnelStages, setFunnelStages] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState("data")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Week1%20-%20Problem_4_-_Conflicting_KPI_Definitions-tmE9ue38A5ffDk0slJzdXzLImOmIa6.csv",
        )
        const csvText = await response.text()

        // Parse CSV
        const lines = csvText.split("\n")
        const headers = lines[0].split(",")

        const parsedData = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          const values = lines[i].split(",")
          const entry: Record<string, string> = {}

          headers.forEach((header, index) => {
            entry[header.trim()] = values[index]?.trim() || ""
          })

          parsedData.push(entry as KpiDefinition)
        }

        setKpiData(parsedData)

        // Generate analysis
        const analysis = analyzeKpis(parsedData)
        setAnalysisResults(analysis)

        // Analyze conflicts
        analyzeConflicts(parsedData)

        // Generate funnel stages
        generateFunnelStages(parsedData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load KPI data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const generateFunnelStages = (data: KpiDefinition[]) => {
    const stages: Record<string, any> = {}

    data.forEach((kpi) => {
      const key = `${kpi.Team}-${kpi.Metric_Name}`
      const definition = kpi.Definition.toLowerCase()

      // Determine funnel stage based on keywords
      if (
        definition.includes("brand") ||
        definition.includes("reach") ||
        definition.includes("visit") ||
        kpi.Metric_Name.toLowerCase().includes("awareness") ||
        kpi.Metric_Name.toLowerCase().includes("reach")
      ) {
        stages[key] = { stage: "Awareness", description: "Top of funnel metrics" }
      } else if (
        definition.includes("engagement") ||
        definition.includes("click") ||
        definition.includes("lead") ||
        definition.includes("session") ||
        kpi.Metric_Name.toLowerCase().includes("engagement")
      ) {
        stages[key] = { stage: "Consideration", description: "Middle of funnel metrics" }
      } else if (
        definition.includes("conversion") ||
        definition.includes("signup") ||
        definition.includes("purchase") ||
        definition.includes("trial") ||
        kpi.Metric_Name.toLowerCase().includes("conversion")
      ) {
        stages[key] = { stage: "Conversion", description: "Bottom of funnel metrics" }
      } else if (
        definition.includes("retention") ||
        definition.includes("churn") ||
        definition.includes("satisfaction") ||
        definition.includes("nps") ||
        kpi.Metric_Name.toLowerCase().includes("retention")
      ) {
        stages[key] = { stage: "Retention", description: "Post-conversion metrics" }
      } else {
        stages[key] = { stage: "Unknown", description: "Unclassified metrics" }
      }
    })

    setFunnelStages(stages)
  }

  const analyzeConflicts = (kpiData: KpiDefinition[]) => {
    const conflicts = {
      vague: [],
      overlapping: [],
      incompatible: [],
    }

    // Check for vague definitions
    kpiData.forEach((kpi) => {
      const definition = kpi.Definition.toLowerCase()
      // Flags for vagueness
      const isVague =
        // No specific time frame mentioned
        !definition.match(/\d+\s*(day|week|month|hour|minute|second|year)/i) ||
        // Has vague terms without criteria
        definition.match(/\b(varies|multiple|various|different|sometimes|possibly|any)\b/i) ||
        // Uses OR without clear criteria
        (definition.includes("or") && !definition.match(/score >|nps <|\d+/i))

      if (isVague) {
        conflicts.vague.push({
          ...kpi,
          issue: getVagueIssue(definition),
        })
      }
    })

    // Check for overlapping definitions
    for (let i = 0; i < kpiData.length; i++) {
      for (let j = i + 1; j < kpiData.length; j++) {
        const kpi1 = kpiData[i]
        const kpi2 = kpiData[j]
        // Check if metrics have similar names or definitions
        const overlap = checkOverlap(kpi1, kpi2)
        if (overlap) {
          conflicts.overlapping.push({
            kpi1: kpi1,
            kpi2: kpi2,
            issue: overlap,
          })
        }
      }
    }

    // Check for incompatible definitions
    findIncompatibilities(kpiData, conflicts)

    setConflicts(conflicts)
  }

  const getVagueIssue = (definition: string) => {
    const issues = []
    if (!definition.match(/\d+\s*(day|week|month|hour|minute|second|year)/i)) {
      issues.push("No specific time frame")
    }
    if (definition.match(/\b(varies|multiple|various|different)\b/i)) {
      issues.push("Contains variable conditions without criteria")
    }
    if (definition.includes("or") && !definition.match(/score >|nps <|\d+/i)) {
      issues.push("OR condition without numerical thresholds")
    }
    return issues.join("; ")
  }

  const checkOverlap = (kpi1: KpiDefinition, kpi2: KpiDefinition) => {
    const name1 = kpi1.Metric_Name.toLowerCase()
    const name2 = kpi2.Metric_Name.toLowerCase()
    const def1 = kpi1.Definition.toLowerCase()
    const def2 = kpi2.Definition.toLowerCase()

    // Check for similar metric names
    const similarNames = [
      ["engagement", "interaction"],
      ["churn", "retention"],
      ["conversion", "close"],
      ["lead", "prospect"],
      ["satisfaction", "nps"],
      ["value", "worth"],
    ]

    for (const [term1, term2] of similarNames) {
      if ((name1.includes(term1) && name2.includes(term2)) || (name1.includes(term2) && name2.includes(term1))) {
        return `Similar concepts: ${term1}/${term2}`
      }
    }

    // Check for overlapping scope in definitions
    if (def1.includes("user") && def2.includes("user") && def1.includes("feature") && def2.includes("feature")) {
      return "Both measure user feature interactions"
    }
    if (def1.includes("lead") && def2.includes("lead")) {
      return "Both involve lead qualification/scoring"
    }
    if (def1.includes("revenue") && def2.includes("revenue")) {
      return "Both measure revenue-related metrics"
    }

    return null
  }

  const findIncompatibilities = (kpiData: KpiDefinition[], conflicts: any) => {
    // Find metrics with same name but different definitions
    const metricByName: Record<string, KpiDefinition[]> = {}
    kpiData.forEach((kpi) => {
      const name = kpi.Metric_Name
      if (!metricByName[name]) {
        metricByName[name] = []
      }
      metricByName[name].push(kpi)
    })

    Object.entries(metricByName).forEach(([name, kpis]) => {
      if (kpis.length > 1) {
        // Check if definitions conflict
        const methodologies = kpis.map((kpi) => {
          const def = kpi.Definition.toLowerCase()
          return {
            kpi: kpi,
            hasTimeFrame: def.match(/\d+\s*(day|week|month)/i),
            hasExclusions: def.includes("exclud"),
            hasDenominator: def.includes("÷") || def.includes("/"),
            hasOR: def.includes("or"),
            hasThreshold: def.match(/score >|nps <|\d+/i),
          }
        })

        // Check for conflicts
        const timeFramesVary = methodologies.some((m) => m.hasTimeFrame) && methodologies.some((m) => !m.hasTimeFrame)
        const calculationDiffers =
          methodologies.some((m) => m.hasDenominator) && methodologies.some((m) => !m.hasDenominator)

        if (timeFramesVary || calculationDiffers) {
          conflicts.incompatible.push({
            name: name,
            kpis: kpis,
            issue: timeFramesVary ? "Inconsistent time frames" : "Different calculation methods",
          })
        }
      }
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="bg-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-gray-800 mb-2">KPI Alignment Tool</h1>
        <p className="text-sm text-gray-500">
          Align metrics across teams to prevent miscommunication and ensure everyone is working toward the same goals.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full border-b border-gray-200 mb-6 overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="data" className="text-sm">
            KPI Data
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-sm">
            Analysis
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="text-sm">
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="text-sm">
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="funnel" className="text-sm">
            Funnel
          </TabsTrigger>
          <TabsTrigger value="scorecard" className="text-sm">
            Scorecard
          </TabsTrigger>
          <TabsTrigger value="priority" className="text-sm">
            Priority
          </TabsTrigger>
          <TabsTrigger value="glossary" className="text-sm">
            Glossary
          </TabsTrigger>
          <TabsTrigger value="translator" className="text-sm">
            Translator
          </TabsTrigger>
          <TabsTrigger value="generator" className="text-sm">
            Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <KpiDataTable data={kpiData} />
        </TabsContent>

        <TabsContent value="analysis">
          {analysisResults && <KpiAnalysisResults results={analysisResults} />}
        </TabsContent>

        <TabsContent value="conflicts">
          <KpiConflictAnalyzer conflicts={conflicts} />
        </TabsContent>

        <TabsContent value="scenarios">
          <KpiScenarioCards kpiData={kpiData} />
        </TabsContent>

        <TabsContent value="funnel">
          <FunnelAlignmentChart kpiData={kpiData} funnelStages={funnelStages} />
        </TabsContent>

        <TabsContent value="scorecard">
          <AlignmentScorecard kpiData={kpiData} />
        </TabsContent>

        <TabsContent value="priority">
          <KpiPriorityIndex kpiData={kpiData} />
        </TabsContent>

        <TabsContent value="glossary">
          <KpiGlossary kpiData={kpiData} />
        </TabsContent>

        <TabsContent value="translator">
          <KpiTranslator kpiData={kpiData} />
        </TabsContent>

        <TabsContent value="generator">
          <KpiGlossaryGenerator kpiData={kpiData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
