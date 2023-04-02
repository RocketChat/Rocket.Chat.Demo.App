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

    // Adding a datepicker input block
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: {
            actionId: actionId.DATE,
            type: "datepicker" as BlockElementType,
            placeholder: block.newPlainTextObject("Enter the date"),
        },
        label: block.newPlainTextObject("Date"),
    });
    // Adding a time input block
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: block.newPlainTextInputElement({
            actionId: actionId.TIME,
            placeholder: block.newPlainTextObject("Eg:- 10:45"),
        }),
        label: block.newPlainTextObject("Time"),
    });
    // Adding a time format input block which is a input to select among only AM and PM
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: block.newStaticSelectElement({
            actionId: actionId.FORMAT,
            placeholder: block.newPlainTextObject("Choose what time"), // A placeholder shown to user for input
            options: [
                {
                    text: block.newPlainTextObject("AM"), // Option text which user sees
                    value: "AM", // The value of the option we use in our app
                },
                {
                    text: block.newPlainTextObject("PM"),
                    value: "PM",
                },
            ],
        }),
        label: block.newPlainTextObject("AM/PM"),
    });
    // Adding a multiline input block for reminder message input
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
    // Adding the option input block to ask for which room to share the reminder message
    block.addInputBlock({
        blockId: blockId.REMINDER,
        element: block.newStaticSelectElement({
            actionId: actionId.ROOM,
            options: [
                {
                    text: block.newPlainTextObject("Room"),
                    value: context.getRoom().id, // Observer here the value ,
                    // the value here is the Id of the room
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
    /*
    After adding all blocks we now have to set the viewId to
    the modal and also provide a submit action button
    Once the user clicks on the submit button the viewSubmitHandler is
    triggered with id given here as view.REMINDER
    */
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
