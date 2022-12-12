import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";

export class ExampleCommand implements ISlashCommand {
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

        if (!subcommand) {
            // no subcommand, let's just show that
            var message = "No Subcommand :confounded:";
            await this.sendMessage(context, modify, message);
        } else {
            // lets define a deult help message
            const you_can_run =
                "You can run:\n" +
                "`/example [message|m]` to display a message\n" +
                "`/example [notification|n]` to display a notification\n" +
                "`/example [help|h]` to get help";
            switch (
                subcommand // Try to match the argument in the list of allowed subcommands
            ) {
                case "m":
                case "msg":
                case "message": // If Message, send a message
                    message =
                        "I am a **Message**. :envelope: \n Everyone in this channel can read it. :dark_sunglasses: ";
                    await this.sendMessage(context, modify, message);
                    break;

                case "n":
                case "notify":
                case "notification": // If Notification, well, notifiy!
                    message =
                        "I am a **Notification**. Only you can read me. :eyes: \n Also, I am ephemeral: if you reload, I'll be gone! :cry:";
                    await this.sendNotification(context, modify, message);
                    break;

                case "h":
                case "help":
                    await this.sendNotification(context, modify, you_can_run);
                    break;

                default: // subcommand not found, a good oportunity for a help message
                    message = `:warning: I was not able to identify your sub command: \`${subcommand}\` \n\n${you_can_run}`;
                    await this.sendNotification(context, modify, message);
                    break;
            }
        }
    }

    private async sendMessage(
        context: SlashCommandContext,
        modify: IModify,
        message: string
    ): Promise<void> {
        const messageStructure = modify.getCreator().startMessage();
        const sender = context.getSender(); // get the sender from context
        const room = context.getRoom(); // get the rom from context

        messageStructure.setSender(sender).setRoom(room).setText(message); // set the text message

        await modify.getCreator().finish(messageStructure); // sends the message in the room.
    }
    private async sendNotification(
        context: SlashCommandContext,
        modify: IModify,
        message: string
    ): Promise<void> {
        const sender = context.getSender(); // get the sender from context
        const room = context.getRoom(); // get the rom from context
        var messageStructure = modify.getCreator().startMessage().setRoom(room);
        // uncomment bellow if you want the notification to be sent by the sender
        // instead of the app bot user
        // messageStructure = messageStructure.setSender(sender)

        // lets build a really simple block (more on that on other Commands)
        const block = modify.getCreator().getBlockBuilder();
        // we want this block to have a Text supporting MarkDown
        block.addSectionBlock({
            text: block.newMarkdownTextObject(message),
        });

        // now let's set the blocks in our message
        messageStructure.setBlocks(block);
        // and finally, notify the user with the IMessage
        await modify
            .getNotifier()
            .notifyUser(sender, messageStructure.getMessage());
    }
}
