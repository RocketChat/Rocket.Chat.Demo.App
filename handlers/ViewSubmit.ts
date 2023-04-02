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
import { IOnetimeSchedule, IRecurringSchedule } from "@rocket.chat/apps-engine/definition/scheduler";

export class ExampleViewSubmitHandler {
    public async executor(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        logger?: ILogger
    ) {
        // Once view is submitted the conntrol of the app is here
        // We get the user details who submitted the view
        // and the view object which contains details related to the view
        const { user, view } = context.getInteractionData();
        let roomId: string, room: IRoom;

        let response = "The request couldn't be performed";
        try {
            // We handle which view is submitted on the basis of viewId configured in enums/viewId

            /*
            The view object has a state object which contains all data related to the
            view blocks and elements which user has entered in the input block or
            the app has set
            The object is constructed like this for example:
            view ={
                state:{
                    blockId1:{
                        actionId1:data1,
                        actionId2:data2,
                        .
                        .
                    },
                    blockId2:{
                        actionId:data1,
                        actionId:data2,
                    },
                    .
                    .
                    .
                }
            }

            We can access the data as as shown below
            */
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
                        //  Retrieving the roomId of the direct message
                        roomId = (await getDirectRoom(
                            read,
                            modify,
                            (await read.getUserReader().getAppUser())!,
                            context.getInteractionData().user.username
                        ))!;
                    }
                    room = (await read.getRoomReader().getById(roomId))!;
                    // Configuring the job context for the scheduler processor
                    const jobContext = {
                        time: date + " " + time + format,
                        message: message,
                        username: user.username,
                        room: roomId,
                    };
                    // Creating a one time scheduler
                    const reminder: IOnetimeSchedule = {
                        id: "reminder",
                        when: date + time + format + user.utcOffset,
                        data: jobContext,
                    };
                    if (user.id) {
                        // Now we schedule the process using the scheduler and it returns us the jobId for the process
                        const jobId = await modify
                            .getScheduler()
                            .scheduleOnce(reminder);
                        response = `Yoohoo I have created a reminder to remind you at ${date + " " + time + " " + format + " "
                            }\n
                        About
                        ${message}`;
                        // once it is configured we send a message for confimation
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
                    // Configuring the job context for the scheduler processor
                    const data = {
                        message: text,
                        interval:
                            number + " " + interval + " " + user.utcOffset,
                        username: user.username,
                        room: roomId,
                    };
                    // Creating a recurring scheduler
                    const job: IRecurringSchedule = {
                        id: "job",
                        interval: number + " " + interval,
                        data: data,
                    };
                    if (user.id) {
                        // Now we schedule the process using the scheduler and it returns us the jobId for the process

                        let jobid = await modify
                            .getScheduler()
                            .scheduleRecurring(job);
                        response = `Yoohoo you have successfully created a recurring reminder of interval ${number + " " + interval
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
