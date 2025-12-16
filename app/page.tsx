import { Navigation } from "@/components/navigation"
import { DailyForm } from "@/components/daily-form"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 pb-24 md:pb-0 "  >
        <div className="max-w-2xl mx-auto p-4 md:p-8" >
          <DailyForm />
        </div>
      </main>
    </div>
  )
}
