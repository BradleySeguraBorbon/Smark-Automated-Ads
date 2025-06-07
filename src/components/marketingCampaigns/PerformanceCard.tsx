import React from "react"
import { Progress } from "@/components/ui/progress" 
import { Badge } from "@/components/ui/badge"

interface PerformanceCardProps {
    title: string
    icon: React.ReactNode
    rate: number
    total: number
    sent: number
    isGeneral?: boolean
  }
  
  export function PerformanceCard({ title, icon, rate, total, sent, isGeneral = false }: PerformanceCardProps) {
    const getColorClass = (rate: number) => {
      if (rate >= 40) return "text-green-500"
      if (rate >= 20) return "text-amber-500"
      return "text-red-500"
    }
  
    const getProgressColor = (rate: number) => {
      if (rate >= 40) return "bg-green-500"
      if (rate >= 20) return "bg-amber-500"
      return "bg-red-500"
    }
  
    return (
      <div className="border rounded-lg p-4 flex flex-col bg-gray-200 dark:bg-[#171717] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>
          <h3 className="font-medium">{title}</h3>
        </div>
  
        <div className="mt-2 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-2xl font-bold ${getColorClass(rate)}`}>{rate.toFixed(1)}%</span>
            {isGeneral && <Badge variant="outline">Combined</Badge>}
          </div>
          <Progress value={rate} className={`h-2 ${getProgressColor(rate)}`} />
        </div>
  
        <div className="mt-auto grid grid-cols-2 gap-2 text-sm">
          <div className="border rounded p-2 text-center">
            <p className="text-muted-foreground">total</p>
            <p className="font-medium">{total.toLocaleString()}</p>
          </div>
          <div className="border rounded p-2 text-center">
            <p className="text-muted-foreground">sent</p>
            <p className="font-medium">{sent.toLocaleString()}</p>
          </div>
        </div>
      </div>
    )
  }