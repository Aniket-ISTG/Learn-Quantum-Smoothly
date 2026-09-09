import { QuantumLab } from "@/components/quantum-lab";
const valid = ["math", "fundamentals", "core", "algorithms", "nisq", "advanced"] as const;
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) { const { category } = await params; return <QuantumLab view="category" category={(valid.includes(category as typeof valid[number]) ? category : "fundamentals") as typeof valid[number]} />; }
