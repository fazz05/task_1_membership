"use client"

import { useState } from "react"
import { Participation } from "@/payload-types"
import NextButton from "./NextButton"
import { markProgress } from "../_actions/MarkProgress"
 

interface VideoModuleProps{
    module: any
    particaption: Participation
    onCompleted: (nextIndex: number) => void
}

export default function VideoModule({module, particaption, onCompleted}: VideoModuleProps){
    const [loading, setLoading] = useState(false)

    async function handleNextModule(){
        setLoading(true)
        try{
            let updateParticipation = await markProgress(particaption);
            if(updateParticipation && updateParticipation.progress){
                onCompleted(updateParticipation.progress);
            }else{
                console.error("Error updating participation progress")
            }
        } catch (err){
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <h2 className="text-2xl font-bold">{module.title}</h2>

            <div className="relative w-full aspect-video border border-white overflow-hidden">
                <iframe 
                    src={module.playerUrl}
                    style={{border: "none", position: "absolute", top: 0, left: 0,width: "100%", height: "100%"}}
                    allowFullScreen
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    />
            </div>

            <NextButton loading={loading} text="Next" onClick={handleNextModule}/>
        </div>
    )
}