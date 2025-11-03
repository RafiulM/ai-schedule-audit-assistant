import { ChartAreaInteractive } from "@//components/chart-area-interactive"
import { DataTable } from "@//components/data-table"
import { SectionCards } from "@//components/section-cards"
import { Button } from "@/components/ui/button"
import { Key } from "lucide-react"
import data from "@/app/dashboard/data.json"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Button variant="destructive">
            <Key className="mr-2 h-4 w-4" />
            Create New Key
          </Button>
        </div>
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}