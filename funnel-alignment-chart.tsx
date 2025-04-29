"use client"

import type { KpiData, FunnelStage } from "@/types/kpi-types"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface FunnelAlignmentChartProps {
  kpiData: KpiData[]
  funnelStages: Record<string, FunnelStage>
}

export function FunnelAlignmentChart({ kpiData, funnelStages }: FunnelAlignmentChartProps) {
  // Count KPIs by funnel stage
  const stageNames = ["Awareness", "Consideration", "Conversion", "Retention", "Unknown"]
  const stageCounts = stageNames.map((stage) => Object.values(funnelStages).filter((s) => s.stage === stage).length)

  // Count KPIs by team and funnel stage
  const teams = [...new Set(kpiData.map((kpi) => kpi.Team))]
  const teamData = teams.map((team) => {
    const teamKpis = kpiData.filter((kpi) => kpi.Team === team)
    return stageNames.map(
      (stage) => teamKpis.filter((kpi) => funnelStages[`${kpi.Team}-${kpi.Metric_Name}`]?.stage === stage).length,
    )
  })

  // Chart data for overall funnel
  const overallChartData = {
    labels: stageNames,
    datasets: [
      {
        label: "Number of KPIs",
        data: stageCounts,
        backgroundColor: [
          "rgba(107, 114, 128, 0.7)", // Awareness (gray)
          "rgba(107, 114, 128, 0.6)", // Consideration (gray)
          "rgba(107, 114, 128, 0.5)", // Conversion (gray)
          "rgba(107, 114, 128, 0.4)", // Retention (gray)
          "rgba(209, 213, 219, 0.3)", // Unknown (light gray)
        ],
        borderColor: [
          "rgb(107, 114, 128)",
          "rgb(107, 114, 128)",
          "rgb(107, 114, 128)",
          "rgb(107, 114, 128)",
          "rgb(209, 213, 219)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Chart data for team breakdown
  const teamChartData = {
    labels: stageNames,
    datasets: teams.map((team, index) => ({
      label: team,
      data: teamData[index],
      backgroundColor: `rgba(107, 114, 128, ${0.8 - index * 0.1})`,
      borderColor: "rgb(107, 114, 128)",
      borderWidth: 1,
    })),
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw} KPIs`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of KPIs",
          font: {
            size: 11,
          },
        },
        ticks: {
          precision: 0,
          font: {
            size: 10,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Funnel Stage",
          font: {
            size: 11,
          },
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-normal text-gray-800 mb-6">Funnel Alignment Chart</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-3">Overall Funnel Distribution</h3>
            <div className="h-64 border border-gray-100 p-4">
              <Bar data={overallChartData} options={options} />
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-700 mb-3">Team Breakdown</h3>
            <div className="h-64 border border-gray-100 p-4">
              <Bar data={teamChartData} options={options} />
            </div>
          </div>

          <div className="bg-gray-50 p-4 text-xs">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Funnel Stage Definitions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 mt-1 rounded-full bg-gray-500"></div>
                <div>
                  <span className="font-medium">Awareness</span>
                  <p className="text-gray-600">
                    KPIs related to brand visibility, reach, and initial customer touchpoints
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 mt-1 rounded-full bg-gray-500"></div>
                <div>
                  <span className="font-medium">Consideration</span>
                  <p className="text-gray-600">KPIs related to engagement, lead generation, and product evaluation</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 mt-1 rounded-full bg-gray-500"></div>
                <div>
                  <span className="font-medium">Conversion</span>
                  <p className="text-gray-600">KPIs related to purchases, sign-ups, and becoming a customer</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 mt-1 rounded-full bg-gray-500"></div>
                <div>
                  <span className="font-medium">Retention</span>
                  <p className="text-gray-600">KPIs related to customer satisfaction, loyalty, and repeat business</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
