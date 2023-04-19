import { IModify,IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";


export async function sendDirect(
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
