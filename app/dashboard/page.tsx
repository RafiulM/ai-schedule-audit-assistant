import { ChartAreaInteractive } from "@//components/chart-area-interactive"
import { DataTable } from "@//components/data-table"
import { SectionCards } from "@//components/section-cards"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import data from "@/app/dashboard/data.json"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <Button variant="dark">
            <Plus />
            Start New Audit
          </Button>
        </div>
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}
