export type LessonSectionType = "visualization" | "interaction" | "experiment" | "prediction" | "explanation" | "mathematics" | "circuit" | "result" | "code" | "challenge";
export type LessonSection = { 
    id: string; 
    type: LessonSectionType; 
    title: string; 
    description: string; 
    component?: string 
};
export type Lesson = { 
    id: string; 
    title: string; 
    description: string; 
    category: string; 
    difficulty: "beginner" | "intermediate" | "advanced"; 
    estimatedTime: number; 
    prerequisites: string[]; 
    sections: LessonSection[] 
};
