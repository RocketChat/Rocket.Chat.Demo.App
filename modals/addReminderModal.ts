import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    BlockElementType,
    TextObjectType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitModalViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";
import { actionId } from "../enums/actionId";
import { blockId } from "../enums/blockId";
import { viewId } from "../enums/viewId";

export async function addReminder(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify
) {
    // Setting the viewId to identify action after view submit
    const block = modify.getCreator().getBlockBuilder();
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: {
            actionId: actionId.DATE,
            type: "datepicker" as BlockElementType,
            placeholder: block.newPlainTextObject("Enter the date"),
        },
        label: block.newPlainTextObject("Date"),
    });
    // block.addInputBlock({
    //     blockId: blockId.REMINDER,
    //     element: block.newStaticSelectElement({
    //         actionId: actionId.TIME,
    //         placeholder: block.newPlainTextObject("Choose what time"),
    //         options: [
    //             {
    //                 text: block.newPlainTextObject("10:45"),
    //                 value: "10:45",
    //             },
    //         ],
    //     }),
    //     label: block.newPlainTextObject("Time"),
    // });
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: block.newPlainTextInputElement({
            actionId: actionId.TIME,
            placeholder: block.newPlainTextObject("Eg:- 10:45"),
        }),
        label: block.newPlainTextObject("Time"),
    });
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: block.newStaticSelectElement({
            actionId: actionId.FORMAT,
            placeholder: block.newPlainTextObject("Choose what time"),
            options: [
                {
                    text: block.newPlainTextObject("AM"),
                    value: "AM",
                },
                {
                    text: block.newPlainTextObject("PM"),
                    value: "PM",
                },
            ],
        }),
        label: block.newPlainTextObject("AM/PM"),
    });
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: block.newPlainTextInputElement({
            actionId: actionId.MESSAGE,
            multiline: !0,
            placeholder: block.newPlainTextObject(
                "Message to get reminded about"
            ),
        }),
        label: block.newPlainTextObject("Reminder message"),
    });
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: block.newStaticSelectElement({
            actionId: actionId.ROOM,
            options: [
                {
                    text: block.newPlainTextObject("Room"),
                    value: context.getRoom().id,
                },
                {
                    text: block.newPlainTextObject("Direct message"),
                    value: "DM",
                },
            ],
            placeholder: block.newPlainTextObject("Room"),
        }),
        label: block.newPlainTextObject("Room"),
    });
    const modal = {
        id: viewId.REMINDER,
        title: block.newPlainTextObject("Reminder"),
        close: block.newButtonElement({
            text: block.newPlainTextObject("Close"),
        }),
        submit: block.newButtonElement({
            actionId: actionId.REMINDER_SUBMIT,
            text: block.newPlainTextObject("Create"),
        }),
        blocks: block.getBlocks(),
    };
    const triggerId = context.getTriggerId()!;
    await modify
        .getUiController()
        .openModalView(modal, { triggerId }, context.getSender());
}
