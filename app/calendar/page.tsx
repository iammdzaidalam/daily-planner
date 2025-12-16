import { Navigation } from "@/components/navigation"
import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 pb-24 md:pb-0">
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <h1 className="text-2xl font-semibold mb-6">Calendar</h1>
          <CalendarView />
        </div>
      </main>
    </div>
  )
}
