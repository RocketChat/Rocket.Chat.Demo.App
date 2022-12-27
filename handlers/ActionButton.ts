import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IUIKitResponse,
    UIKitActionButtonInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";

export class ExampleActionButtonHandler {
    public async executor(
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        logger: ILogger
    ): Promise<IUIKitResponse> {
        const { buttonContext, actionId, triggerId, user, room, message } =
            context.getInteractionData();
        console.log("ACTION ID", actionId);

        const blockBuilder = modify.getCreator().getBlockBuilder();
        switch (actionId) {
            case "my-action-id-room":
                console.log("action on room selected");

                var text = `${actionId} was clicked!`;
                // logging the message using app logger
                logger.info(text);
                // loggin the message to stdout
                console.log(text);
                // let's open a Contextual Bar using openContextualBarViewResponse, instead of a modal
                return context
                    .getInteractionResponder()
                    .openContextualBarViewResponse({
                        title: blockBuilder.newPlainTextObject(
                            "Button Action on a Room"
                        ),
                        blocks: blockBuilder
                            .addSectionBlock({
                                text: blockBuilder.newPlainTextObject(
                                    "We received your interaction, thanks!"
                                ),
                            })
                            .getBlocks(),
                    });
                break;
            case "my-action-id-message":
                console.log("action on message selected");
                var text =
                    `We received your interaction, thanks!\n` +
                    `**Action ID**:  ${actionId}\n` +
                    `**Room**:  ${room.displayName || room.slugifiedName}\n` +
                    `**Room Type**:  ${room.type}\n` +
                    `**Message ID**:  ${message?.id}\n` +
                    `**Text**:  ${message?.text}\n` +
                    `**Sender**:  ${message?.sender.username} at ${message?.createdAt}\n` +
                    `**Total Messages at room**: ${room.messageCount}`;
                // logging the message using app logger
                logger.info(text);
                // loggin the message to stdout
                console.log(text);
                // passing it to the Block
                blockBuilder.addSectionBlock({
                    text: blockBuilder.newMarkdownTextObject(text),
                });
                // let's open a modal using openModalViewResponse with all those information
                return context.getInteractionResponder().openModalViewResponse({
                    title: blockBuilder.newPlainTextObject(
                        "Button Action on a Message!"
                    ),
                    blocks: blockBuilder.getBlocks(),
                    submit: blockBuilder.newButtonElement({
                        text: blockBuilder.newPlainTextObject('Submit'),
                    }),
                    close: blockBuilder.newButtonElement({
                        text: blockBuilder.newPlainTextObject('Close'),
                    }),
                });

        }

        return context.getInteractionResponder().successResponse();
    }
}
