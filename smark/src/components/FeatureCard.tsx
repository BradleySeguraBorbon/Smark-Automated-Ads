export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg border dark:border-gray-700">
      <div className="mb-4 text-primary">{icon}</div>
      <h4 className="text-xl font-semibold mb-2 dark:text-white">{title}</h4>
      <p className="text-muted-foreground dark:text-gray-300">{description}</p>
    </div>
  )
}