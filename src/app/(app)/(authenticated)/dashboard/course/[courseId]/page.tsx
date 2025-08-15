import { getPayload } from "payload";
import configPromise from '@payload-config';
import { getUser } from "../../../_actions/getUsers";
import { Course, Participation } from "@/payload-types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiPencilAlt, HiVideoCamera } from "react-icons/hi";
import Image from "next/image";
import StartCourseButton from "./_components/StartCourseButton";
import ResumeButton from "./_components/ResumeButton";


const CoursePage = async ({ params }: { params: { courseId: string } }) => {
    const { courseId } = await params;

    const payload = await getPayload({ config: configPromise  })
    
    const user = await getUser(); 

    let course: Course | null = null;

    try {
        const res = await payload.findByID({
            collection: 'courses',
            id: courseId,
            overrideAccess: false,
            user: user
        })

        course = res;
    } catch (err) {
        console.error(err); 
        return notFound ();
    }

    if (!course) {
        return notFound();
    }

    let participation: Participation | null = null;

    try {
        const participationRes = await payload.find({
            collection: "participation",
            where: {
                course: {
                    equals: courseId
                },
                customer: {
                    equals: user?.id
                }
            },
            overrideAccess: false,
            user: user
        })

        participation = participationRes?.docs[0] || null;
    } catch (err) {
        console.error(err);
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition duration-300 ease-in-out">
                <HiArrowLeft className="text-lg" />
                Back to Dashboard
            </Link>
            <div className="relative w-full aspect-video overflow-hidden border border-gray-700">
                <Image src={course.image.url} alt={'${course.title} thumbnail'} fill className="object-contain"/>
            </div>  

            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-300">{course.description}</p>

            <div>
                <h2 className="text-xl font-semibold mt-6 mb-2">Curriculum</h2>
                <div className="flex flex-col gap-4">
                    {course.curriculum.map((block, id) =>{
                        if (block.blockType === 'video') {
                            return (
                                <div key={id} className="p-4 border border-gray-700 rounded bg-gray-900">
                                    <div className="text-teal-400 font-semibold flex items-center gap=2">
                                        <HiVideoCamera className="text-xl" />
                                        {block.title}
                                    </div>
                                    <div className="text-sm text-gray-400">Duration: {block.duration} min</div>
                                </div>
                            )
                        }

                        if (block.blockType === 'quiz') {
                            return (
                                <div key={id} className="p-4 border border-gray-700 rounded bg-gray-900">
                                    <div className="text-yellow-400 font-semibold flex items-center gap=2">
                                        <HiPencilAlt className="text-xl" />
                                        {block.title}
                                    </div>
                                    <div className="text-sm text-gray-400">Questions: {block.questions?.length || 0}</div>
                                </div>
                            )
                        }
                        return null;
                    })}
                </div>
            </div>
            
            {participation ? (<div className="w-72"><ResumeButton participation={participation}/></div>) :   <StartCourseButton courseId={course.id} /> }
        </div>
    );
}

export default CoursePage;