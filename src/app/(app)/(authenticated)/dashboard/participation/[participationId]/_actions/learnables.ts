export type CurriculumItem = { type?: string; blockType?: string }

export function countLearnables(course: any): number {
  const cur: CurriculumItem[] = Array.isArray(course?.curriculum) ? course.curriculum : []
  return cur.filter((m) => m?.type !== 'certificate' && m?.blockType !== 'certificate').length
}
