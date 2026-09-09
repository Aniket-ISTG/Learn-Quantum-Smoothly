import { superpositionLesson } from "./superposition";
import type { Lesson } from "@/types/lesson";

export const lessons = [superpositionLesson];
export const getLesson = (category: string, id: string): Lesson | undefined =>
  lessons.find((lesson) => lesson.category === category && lesson.id === id);
