import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { actionId } from "../enums/actionId";
import { blockId } from "../enums/blockId";
import { viewId } from "../enums/viewId";
import { getDirectRoom, sendMessage } from "../lib/sendMessage";
import { sendNotification } from "../lib/sendNotification";

export class ExampleViewSubmitHandler {
    public async executor(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        logger?: ILogger
    ) {
        const { user, view } = context.getInteractionData();
        let roomId: string, room: IRoom;

        let response = "The request couldn't be performed";
        try {
            switch (view.id) {
                case viewId.REMINDER:
                    const date =
                        view.state?.[blockId.REMINDER]?.[actionId.DATE];
                    const time =
                        view.state?.[blockId.REMINDER]?.[actionId.TIME];
                    const message =
                        view.state?.[blockId.REMINDER]?.[actionId.MESSAGE];
                    const format =
                        view.state?.[blockId.REMINDER]?.[actionId.FORMAT];
                    roomId = view.state?.[blockId.REMINDER]?.[actionId.ROOM];
                    if (roomId === "DM") {
                        roomId = (await getDirectRoom(
                            read,
                            modify,
                            (await read.getUserReader().getAppUser())!,
                            context.getInteractionData().user.username
                        ))!;
                    }
                    console.log(roomId + "Roomid");
                    room = (await read.getRoomReader().getById(roomId))!;
                    const jobContext = {
                        time: date + " " + time + format,
                        message: message,
                        username: user.username,
                        room: roomId,
                    };
                    const reminder = {
                        id: "reminder",
                        when: date + time + format + user.utcOffset,
                        data: jobContext,
                    };
                    if (user.id) {
                        const jobId = await modify
                            .getScheduler()
                            .scheduleOnce(reminder);
                        response = `Yoohoo I have created a reminder to remind you at ${
                            date + " " + time + " " + format + " "
                        }\n
                        About
                        ${message}`;
                        if (
                            view.state?.[blockId.JOB]?.[actionId.ROOM] === "DM"
                        ) {
                            await sendMessage(
                                modify,
                                room!,
                                (await read.getUserReader().getAppUser())!,
                                response
                            );
                        } else {
                            await sendNotification(
                                modify,
                                room!,
                                (await read.getUserReader().getAppUser())!,
                                response
                            );
                        }
                    }
                    break;
                case viewId.JOB:
                    const text = view.state?.[blockId.JOB]?.[actionId.MESSAGE];
                    const interval =
                        view.state?.[blockId.JOB]?.[actionId.INTERVAL];
                    const number = view.state?.[blockId.JOB]?.[actionId.FORMAT];
                    const jobmessage =
                        view.state?.[blockId.JOB]?.[actionId.MESSAGE];
                    roomId = view.state?.[blockId.JOB]?.[actionId.ROOM];
                    if (roomId === "DM") {
                        roomId = (await getDirectRoom(
                            read,
                            modify,
                            (await read.getUserReader().getAppUser())!,
                            context.getInteractionData().user.username
                        ))!;
                    }
                    room = (await read.getRoomReader().getById(roomId))!;
                    const data = {
                        message: text,
                        interval:
                            number + " " + interval + " " + user.utcOffset,
                        username: user.username,
                    };
                    const job = {
                        id: "job",
                        interval: number + " " + interval,
                        data: data,
                        room: roomId,
                    };
                    if (user.id) {
                        let jobid = await modify
                            .getScheduler()
                            .scheduleRecurring(job);
                        console.log(jobid);
                        console.log(response);
                        response = `Yoohoo you have successfully created a recurring reminder of interval ${
                            number + " " + interval
                        }
                        About
                        ${jobmessage}`;
                        if (
                            view.state?.[blockId.JOB]?.[actionId.ROOM] === "DM"
                        ) {
                            await sendMessage(
                                modify,
                                room!,
                                (await read.getUserReader().getAppUser())!,
                                response
                            );
                        } else {
                            await sendNotification(
                                modify,
                                room!,
                                (await read.getUserReader().getAppUser())!,
                                response
                            );
                        }
                    }
                    break;
            }
        } catch (e) {
            console.log(e);
            console.log("Error submitting view");
        }
        return {
            success: true,
        };
    }
}
