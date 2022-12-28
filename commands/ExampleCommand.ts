import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IApp } from "@rocket.chat/apps-engine/definition/IApp";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendMessage } from '../lib/sendMessage';
import { sendNotification } from '../lib/sendNotification';

export class ExampleCommand implements ISlashCommand {
    app: IApp;

    constructor(app) {
        this.app = app;
    }
    public command = "example"; // here is where you define the command name,
    // users will need to run /phone to trigger this command
    public i18nParamsExample = "ExampleCommand_Params";
    public i18nDescription = "ExampleCommand_Description";
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        // let's discover if we have a subcommand
        const [subcommand] = context.getArguments();
        const room = context.getRoom();
        const sender = context.getSender();
        read.getUserReader();
        // lets define a deult help message
        const you_can_run =
            "You can run:\n" +
            "`/example [message|m]` to display a message\n" +
            "`/example [notification|n]` to display a notification\n" +
            "`/example [direct|d]` to send a direct message\n" +
            "`/example [help|h]` to get help";
        if (!subcommand) {
            // no subcommand, let's just show that
            var message = `No Subcommand :confounded: \n ${you_can_run}`;
            await sendNotification(modify, room, sender, message);
        } else {
            switch (
                subcommand // Try to match the argument in the list of allowed subcommands
            ) {
                case "m":
                case "msg":
                case "message": // If Message, send a message
                    message =
                        "I am a **Message**. :envelope: \n Everyone in this channel can read it. :dark_sunglasses: ";
                    await sendMessage(modify, room, sender, message);
                    break;

                case "n":
                case "notify":
                case "notification": // If Notification, well, notifiy!
                    message =
                        "I am a **Notification**. Only you can read me. :eyes: \n Also, I am ephemeral: if you reload, I'll be gone! :cry:";
                    await sendNotification(modify, room, sender, message);
                    break;

                case "d":
                case "direct": // If Direct, send a direct message
                    message =
                        "I am a **DIRECT Message**. I was created for you, and only you! :heart_decoration:";
                    await this.sendDirect(context, read, modify, message);
                    break;

                case "h":
                case "help":
                    await sendNotification(modify, room, sender, you_can_run);
                    break;

                default: // subcommand not found, a good oportunity for a help message
                    message = `:warning: I was not able to identify your sub command: \`${subcommand}\` \n\n${you_can_run}`;
                    await sendNotification(modify, room, sender, message);
                    break;
            }
        }
    }

    private async getOrCreateDirectRoom(
        read: IRead,
        modify: IModify,
        usernames: Array<string>,
        creator?: IUser
    ) {
        let room;
        // first, let's try to get the direct room for given usernames
        try {
            room = await read.getRoomReader().getDirectByUsernames(usernames);
        } catch (error) {
            this.app.getLogger().log(error);
            return;
        }
        // nice, room exist already, lets return it.
        if (room) {
            return room;
        } else {
            // no room for the given users. Lets create a room now!
            // for flexibility, we might allow different creators
            // if no creator, use app user bot
            if (!creator) {
                creator = await read.getUserReader().getAppUser();
                if (!creator) {
                    throw new Error("Error while getting AppUser");
                }
            }

            let roomId: string;
            // Create direct room
            const newRoom = modify
                .getCreator()
                .startRoom()
                .setType(RoomType.DIRECT_MESSAGE)
                .setCreator(creator)
                .setMembersToBeAddedByUsernames(usernames);
            roomId = await modify.getCreator().finish(newRoom);
            return await read.getRoomReader().getById(roomId);
        }
    }

    private async sendDirect(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        message: string
    ): Promise<void> {
        const messageStructure = modify.getCreator().startMessage();
        const sender = context.getSender(); // get the sender from context
        // get the appUser username
        const appUser = await read.getUserReader().getAppUser();
        if (!appUser) {
            throw new Error("Something went wrong getting App User!");
        }
        // lets use a function we created to get or create direct room
        let room = (await this.getOrCreateDirectRoom(read, modify, [
            sender.username,
            appUser.username,
        ])) as IRoom;
        messageStructure.setRoom(room).setText(message); // set the text message
        await modify.getCreator().finish(messageStructure); // sends the message in the room.
    }
}
