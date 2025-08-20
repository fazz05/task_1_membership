import { Participation } from '@/payload-types'
import VideoModule from './VideoModule'
import QuizModule from './QuizModule'
import FinishModule from './FinishModule'

interface CourseModuleProps {
  module?: any | null
  participation: Participation
  onCompleted: (nextIndex: number) => void
}

export default function CourseModule({ module, participation, onCompleted }: CourseModuleProps) {
  const kind: string = (module?.blockType as string) ?? (module?.type as string) ?? 'finish'

  switch (kind) {
    case 'video':
      return <VideoModule module={module} participation={participation} onCompleted={onCompleted} />
    case 'quiz':
      return <QuizModule module={module} participation={participation} onCompleted={onCompleted} />
    case 'certificate':
    case 'finish':
      return <FinishModule participation={participation} />
    default:
      return <FinishModule participation={participation} />
  }
}
