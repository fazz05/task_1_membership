"use server"

import { Participation } from "@/payload-types";
import { getPayload } from "payload";
import configPromise from '@payload-config';
import { getUser } from "@/app/(app)/(authenticated)/_actions/getUsers";

export async function markProgress(participation: Participation) {
    const payload = await getPayload({config: configPromise});
    const user = await getUser();

    if(!participation || typeof participation.progress !== "number"){
        console.error("Invalid participation data");
        return null;
    }

    const nextProgress = participation.progress + 1;

    try {
        const UpdateRes = await payload.update({
            collection: 'participation',
            id: participation.id,
            data: {
                progress: nextProgress
            },
            overrideAccess: false,
            user: user
        })

        return UpdateRes;
    } catch (err) {
        console.error("Error updating participation progress", err);
        return null;
    }
}