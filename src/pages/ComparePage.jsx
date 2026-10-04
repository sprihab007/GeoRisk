import { useState } from 'react'
import CompareColumn from '../components/CompareColumn'

export default function ComparePage() {
  const [pointA, setPointA] = useState(null)
  const [pointB, setPointB] = useState(null)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Compare Locations</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            View two locations side by side. This presents each location's underlying data only —
            it does not rank or declare either location "safer."
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <CompareColumn label="Location A" point={pointA} onSelect={setPointA} />
          <CompareColumn label="Location B" point={pointB} onSelect={setPointB} />
        </div>
      </div>
    </div>
  )
}
