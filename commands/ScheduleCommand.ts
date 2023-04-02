import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { DemoAppApp } from "../DemoApp";
import { sendMessage } from "../lib/sendMessage";
import { sendNotification } from "../lib/sendNotification";
import { addJob } from "../modals/addJobModal";
import { addReminder } from "../modals/addReminderModal";

export class ScheduleCommand implements ISlashCommand {
    public command = "schedule"; // here is where you define the command name,
    // users will need to run /schedule to trigger this command
    public i18nParamsExample = "ScheduleCommand_Params";
    public i18nDescription = "ScheduleCommand_Description";
    public providesPreview = false;

    constructor(private readonly app: DemoAppApp) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        // lets log this slash command call
        this.app
            .getLogger()
            .info(
                `Slash Command /${
                    this.command
                } initiated. Trigger id: ${context.getTriggerId()} with arguments ${context.getArguments()}`
            );
        // let's discover if we have a subcommand
        const [subcommand] = context.getArguments();
        const room = context.getRoom();
        const sender = context.getSender();
        read.getUserReader();
        // lets define a default help message
        const helpMessage = `
            *You can schedule your tasks or reminders with this command*
            Schedule a reminder -> \`/schedule [reminder|r]\`
            Schedule a recurring reminer -> \`/schedule [job|j]\`
            Helper message for this command -> \`/schedule [help|h]\``;
        if (!subcommand) {
            // no subcommand, let's just show that
            var message = `No Subcommand :confounded:
             ${helpMessage}`;
            await sendNotification(modify, room, sender, message);
        } else {
            switch (
                subcommand // Try to match the argument in the list of allowed subcommands
            ) {
                case "r":
                case "reminder": // If Subcommand is reminder or r then
                    await addReminder(context, read, modify);
                    break;

                case "j":
                case "job": // If Subcommand is job or then
                    await addJob(context, read, modify);
                    break;

                case "delete":
                    await  modify.getScheduler().cancelAllJobs();
                    break;

                case "h":
                case "help":
                default: // If subcommand is some giberish or help or h is the subcommand then send help message
                    await sendNotification(modify, room, sender, helpMessage);
                    break;
            }
        }
    }
}
