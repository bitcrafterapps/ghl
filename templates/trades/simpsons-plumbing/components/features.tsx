import { Search, Database, FileEdit } from "lucide-react"

const features = [
  {
    title: "Feature 1",
    description:
      "Feature 1 description",
    icon: Search,
  },
  {
    title: "Feature 2",
    description:
      "Feature 2 description",
    icon: Database,
  },
  {
    title: "Feature 3",
    description: "Feature 3 description",
    icon: FileEdit,
  },
];

export function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="relative overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] p-6 transition-all hover:border-accent-border group"
        >
          <div className="flex flex-col gap-4">
            <feature.icon className="h-10 w-10 accent-text transition-transform group-hover:scale-110" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold accent-text">{feature.title}</h3>
              <p className="text-[#A1A1A1] leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 