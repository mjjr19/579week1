"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, AlertTriangle, ArrowRightLeft, CheckCircle, FileText } from "lucide-react"

interface KpiAnalysisResultsProps {
  results: {
    summaries: any[]
    conflicts: any[]
    translations: any[]
    recommendations: any[]
  }
}

export function KpiAnalysisResults({ results }: KpiAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("summary")

  const handleExport = () => {
    // In a real implementation, this would generate a PDF or CSV export
    alert("In a real implementation, this would export the analysis as a PDF or CSV file.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-normal text-gray-800">KPI Alignment Analysis</h2>
        <Button onClick={handleExport} variant="outline" size="sm" className="flex items-center gap-2 text-xs">
          <Download size={14} />
          Export
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="summary" className="text-xs">
            <FileText size={14} className="mr-1" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="text-xs">
            <AlertTriangle size={14} className="mr-1" />
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="translations" className="text-xs">
            <ArrowRightLeft size={14} className="mr-1" />
            Translations
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs">
            <CheckCircle size={14} className="mr-1" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <h3 className="text-base font-medium text-gray-700 mb-3">📌 Summary of Each KPI</h3>
          {results.summaries.map((summary, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-base font-medium">{summary.metricName}</h4>
                  <p className="text-xs text-gray-500">Used by {summary.teams.join(", ")}</p>
                </div>
                <Badge variant={summary.teams.length > 1 ? "destructive" : "outline"} className="text-xs">
                  {summary.teams.length > 1 ? "Multiple Definitions" : "Single Definition"}
                </Badge>
              </div>
              <div className="space-y-3">
                {summary.definitions.map((def: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-sm font-medium">{def.team} Definition:</p>
                    <p className="text-xs text-gray-600">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <h3 className="text-base font-medium text-gray-700 mb-3">🚩 Conflicts or Misalignments</h3>
          {results.conflicts.length === 0 ? (
            <Alert>
              <AlertTitle className="text-sm">No conflicts detected</AlertTitle>
              <AlertDescription className="text-xs">
                All KPIs appear to be aligned across teams. This is rare - double check that teams are using the same
                terms in the same way.
              </AlertDescription>
            </Alert>
          ) : (
            results.conflicts.map((conflict, index) => (
              <Alert key={index} variant="destructive" className="bg-red-50 border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-sm text-red-700">{conflict.metricName} - Conflict Detected</AlertTitle>
                <AlertDescription className="text-xs text-red-600 mt-1">
                  <p>{conflict.description}</p>
                  <div className="mt-2 space-y-1">
                    {conflict.details.map((detail: any, idx: number) => (
                      <div key={idx}>
                        <span className="font-medium">{detail.team}:</span> {detail.definition}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Impact:</span> {conflict.impact}
                  </div>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <h3 className="text-base font-medium text-gray-700 mb-3">🔁 Translations Across Teams</h3>
          {results.translations.map((translation, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-sm">
              <div className="mb-2">
                <h4 className="text-base font-medium">{translation.metricName}</h4>
                <p className="text-xs text-gray-500">How this KPI translates across teams</p>
              </div>
              <div className="space-y-3">
                {translation.teamTranslations.map((trans: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-sm font-medium">
                      For {trans.team} ({trans.context}):
                    </p>
                    <p className="text-xs text-gray-600">
                      "{translation.metricName}" means: {trans.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <h3 className="text-base font-medium text-gray-700 mb-3">✅ Recommended Aligned Definitions</h3>
          {results.recommendations.map((recommendation, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-base font-medium">{recommendation.metricName}</h4>
                  <p className="text-xs text-gray-500">Proposed unified definition</p>
                </div>
                {recommendation.alternativeNames && recommendation.alternativeNames.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recommendation.alternativeNames.map((name: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Recommended Definition:</p>
                  <p className="text-xs text-gray-600">{recommendation.recommendedDefinition}</p>
                  <p className="text-xs text-gray-500 mt-1">Source: {recommendation.sourceTeam} team</p>
                </div>

                {recommendation.implementationSteps && (
                  <div>
                    <p className="text-sm font-medium">Implementation Steps:</p>
                    <ul className="list-disc pl-5 text-xs text-gray-600">
                      {recommendation.implementationSteps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
