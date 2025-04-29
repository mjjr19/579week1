"use client"

import { AlertTriangle, AlertOctagon, AlertCircle } from "lucide-react"

interface KpiDefinition {
  Team: string
  Metric_Name: string
  Definition: string
  issue?: string
}

interface KpiConflictAnalyzerProps {
  conflicts: {
    vague: KpiDefinition[]
    overlapping: any[]
    incompatible: any[]
  }
}

export function KpiConflictAnalyzer({ conflicts }: KpiConflictAnalyzerProps) {
  const renderConflictSection = (title: string, conflicts: any[], type: string) => {
    if (conflicts.length === 0) return null

    const getIcon = () => {
      switch (type) {
        case "vague":
          return <AlertCircle className="text-yellow-600" />
        case "overlapping":
          return <AlertTriangle className="text-orange-600" />
        case "incompatible":
          return <AlertOctagon className="text-red-600" />
        default:
          return null
      }
    }

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {getIcon()}
          {title}
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y">
            {conflicts.map((conflict, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                {type === "vague" && (
                  <>
                    <div className="font-semibold text-gray-900">
                      {conflict.Team} - {conflict.Metric_Name}
                    </div>
                    <div className="text-gray-700 mt-1">{conflict.Definition}</div>
                    <div className="text-sm text-yellow-600 mt-2">Issues: {conflict.issue}</div>
                  </>
                )}
                {type === "overlapping" && (
                  <>
                    <div className="flex justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {conflict.kpi1.Team}: {conflict.kpi1.Metric_Name}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          {conflict.kpi2.Team}: {conflict.kpi2.Metric_Name}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-orange-600 mt-2">Overlap: {conflict.issue}</div>
                  </>
                )}
                {type === "incompatible" && (
                  <>
                    <div className="font-semibold text-gray-900">
                      {conflict.name} - Multiple definitions across teams:
                    </div>
                    {conflict.kpis.map((kpi: KpiDefinition, i: number) => (
                      <div key={i} className="mt-2 ml-4">
                        <span className="font-medium">{kpi.Team}:</span>
                        <span className="text-gray-700 ml-2">{kpi.Definition}</span>
                      </div>
                    ))}
                    <div className="text-sm text-red-600 mt-2">Issue: {conflict.issue}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">KPI Conflict Analysis</h1>
      {renderConflictSection("Vague Definitions", conflicts.vague, "vague")}
      {renderConflictSection("Overlapping Definitions", conflicts.overlapping, "overlapping")}
      {renderConflictSection("Incompatible Definitions", conflicts.incompatible, "incompatible")}
      {conflicts.vague.length === 0 && conflicts.overlapping.length === 0 && conflicts.incompatible.length === 0 && (
        <div className="text-center py-8 text-gray-500">No conflicts detected in the KPI definitions.</div>
      )}
    </div>
  )
}
