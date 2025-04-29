import { KpiAlignmentDashboard } from "@/components/kpi-alignment-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <KpiAlignmentDashboard />
      </div>
    </main>
  )
}
