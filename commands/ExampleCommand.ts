import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { DemoAppApp } from "../DemoApp";
import { sendMessage } from '../lib/sendMessage';
import { sendNotification } from '../lib/sendNotification';
import { sendDirect } from "../lib/sendDirectMessage";
export class ExampleCommand implements ISlashCommand {

    public command = "example"; // here is where you define the command name,
    // users will need to run /phone to trigger this command
    public i18nParamsExample = "ExampleCommand_Params";
    public i18nDescription = "ExampleCommand_Description";
    public providesPreview = false;

    constructor(private readonly app: DemoAppApp) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        
        // as we passed the App to the constructor, we can call it here
        // lets log this slash command call
        this.app.getLogger().info(`Slash Command /${this.command} initiated. Trigger id: ${context.getTriggerId()} with arguments ${context.getArguments()}`)
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
                    await sendDirect(context,read,modify,message,this.app)

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
}
