import { QuantumLab } from "@/components/quantum-lab";
const valid = ["math", "fundamentals", "core", "algorithms", "nisq", "advanced"] as const;
export default async function LessonPage({ params }: { params: Promise<{ category: string; lesson: string }> }) { 
    const { category, lesson } = await params; 
    return <QuantumLab 
        view="lesson" 
        lesson={lesson} 
        category={(valid.includes(category as typeof valid[number]) ? category : "fundamentals") as typeof valid[number]} 
    />; 
}
