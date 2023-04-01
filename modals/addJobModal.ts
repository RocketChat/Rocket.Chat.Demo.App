import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { actionId } from "../enums/actionId";
import { blockId } from "../enums/blockId";
import { viewId } from "../enums/viewId";

export async function addJob(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify
) {
    // Setting the viewId to identify action after view submit
    const block = modify.getCreator().getBlockBuilder();

    block.addInputBlock({
        blockId: blockId.JOB,
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
        blockId: blockId.JOB,
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
    block.addInputBlock({
        blockId: blockId.JOB,
        element: block.newStaticSelectElement({
            actionId: actionId.INTERVAL,
            placeholder: block.newPlainTextObject("Interval"),
            options: [
                {
                    text: block.newPlainTextObject("Days"),
                    value: "days",
                },
                {
                    text: block.newPlainTextObject("Minutes"),
                    value: "minutes",
                },
                {
                    text: block.newPlainTextObject("Hours"),
                    value: "hours",
                },
            ],
        }),
        label: block.newPlainTextObject("Interval"),
    });

    block.addInputBlock({
        blockId: blockId.JOB,
        element: block.newPlainTextInputElement({
            actionId: actionId.FORMAT,
            placeholder: block.newPlainTextObject(
                "The interval in which you want to get reminded"
            ),
        }),
        label: block.newPlainTextObject("Number of intervals"),
    });
    const modal = {
        id: viewId.JOB,
        title: block.newPlainTextObject("Reminder"),
        close: block.newButtonElement({
            text: block.newPlainTextObject("Close"),
        }),
        submit: block.newButtonElement({
            actionId: actionId.JOB_SUBMIT,
            text: block.newPlainTextObject("Create"),
        }),
        blocks: block.getBlocks(),
    };
    const triggerId = context.getTriggerId()!;
    await modify
        .getUiController()
        .openModalView(modal, { triggerId }, context.getSender());
}
