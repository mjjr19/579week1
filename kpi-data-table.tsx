"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface KpiDefinition {
  Team: string
  Metric_Name: string
  Definition: string
}

interface KpiDataTableProps {
  data: KpiDefinition[]
}

export function KpiDataTable({ data }: KpiDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTeam, setFilterTeam] = useState<string | null>(null)

  // Get unique teams for filtering
  const teams = Array.from(new Set(data.map((item) => item.Team)))

  // Filter data based on search and team filter
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.Metric_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Definition.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTeam = filterTeam ? item.Team === filterTeam : true

    return matchesSearch && matchesTeam
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search metrics or definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filterTeam === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterTeam(null)}
          >
            All Teams
          </Badge>
          {teams.map((team) => (
            <Badge
              key={team}
              variant={filterTeam === team ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterTeam(team)}
            >
              {team}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Team</TableHead>
              <TableHead className="w-[200px]">Metric Name</TableHead>
              <TableHead>Definition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.Team}</TableCell>
                <TableCell>{item.Metric_Name}</TableCell>
                <TableCell>{item.Definition}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredData.length} of {data.length} KPI definitions
      </div>
    </div>
  )
}
