import {
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function sendMessage(
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string
): Promise<string> {
    const msg = modify
        .getCreator()
        .startMessage()
        .setSender(sender)
        .setRoom(room)
        .setText(message);

    return await modify.getCreator().finish(msg);
}

export async function getDirectRoom(
    read: IRead,
    modify: IModify,
    appUser: IUser,
    username: string
) {
    const usernames = [appUser.username, username];
    let room: IRoom;
    try {
        room = await read.getRoomReader().getDirectByUsernames(usernames);
    } catch (error) {
        console.log(error);
        return;
    }

    if (room) {
        return room.id;
    } else {
        let roomId: string;

        // Create direct room between botUser and username
        const newRoom = modify
            .getCreator()
            .startRoom()
            .setType(RoomType.DIRECT_MESSAGE)
            .setCreator(appUser)
            .setMembersToBeAddedByUsernames(usernames);
        roomId = await modify.getCreator().finish(newRoom);
        return roomId;
    }
}
