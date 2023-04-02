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
    // We start building the modal by getting an instance of block builder
    // We can build a modal using blocks and elements in the block
    const block = modify.getCreator().getBlockBuilder();
/*
    We now add blocks to the block builder using various methods
    Here we are adding an input block
    A block must have an element and a label , other are optional
    blockId is an identifier for the block and actionId is an identifier for the element
    Also an action is triggered for the action block and can be handled using the
    actionId of the element
    We use enums for blockIds or actionIds which eliminates the redundancy and
    errors in the code
    */

    // Adding multiline input block for reminder message
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

    // Adding option block for selecting the room to send the reminder
    block.addInputBlock({
        blockId: blockId.JOB,
        element: block.newStaticSelectElement({
            actionId: actionId.ROOM,
            options: [
                {
                    text: block.newPlainTextObject("Room"),
                    value: context.getRoom().id, // Here the value is the roomId which we will use in further configuration
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

    // Adding option input block for time interval selection
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

    // Adding an input block for geting the number of interval
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

    /*
    After adding all blocks we now have to set the viewId to
    the modal and also provide a submit action button
    Once the user clicks on the submit button the viewSubmitHandler is
    triggered with id given here as view.JOB
    */
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
    /*
    Once all this is configured we open the view with the help of
    UI controller by providing modal, triggerId and the sender details
    This opens a view for the user
    */
    await modify
        .getUiController()
        .openModalView(modal, { triggerId }, context.getSender());
    // Now if the user submmits the view the ../handlers/ViewSubmit where we have the
    // viewsubmithandler gets triggered
}
