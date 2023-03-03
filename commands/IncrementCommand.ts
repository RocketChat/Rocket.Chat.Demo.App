import { IHttp, IModify, IPersistence, IPersistenceRead, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands/index';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { sendMessage } from '../lib/sendMessage';       // this is a helper function to send a message
import { sendNotification } from '../lib/sendNotification';
export class IncrementCommand implements ISlashCommand {
    app: IApp;

    constructor(app) {
        this.app = app;
    }
    public command = 'increment';
    public i18nDescription = 'IncrementCommand_Description';
    public providesPreview = false;
    public i18nParamsExample = '';
    public associations: Array<RocketChatAssociationRecord> = [                     // this is the association that will be used to store the value
        new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'increment_command'),
    ];
    // debug function
    public testlogger = () => {
        console.log('test');
        return;
    }
    public async getValue(read: IRead): Promise<any> {                     // this function will read the value from the database
        let result: number;
        const persistenceRead = read.getPersistenceReader();
        try {
            const records: any = (await persistenceRead.readByAssociations(this.associations));

            if (records.length) {
                result = records[0].value;
                // this.testlogger();
            } else {
                result = 0;
            }
        } catch (err) {
            console.error(err);
            return ({
                success: false,
                error: err,
            });
        }

        return ({
            success: true,
            result,
        });
    }

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence,
    ): Promise<void> {

        const sender = context.getSender();             // the user who sent the command
        const room = context.getRoom();                 // the room where the command was sent
        const [subcommand] = context.getArguments();    // the subcommand
        const appBot = await read.getUserReader().getAppUser() as IUser; // the user(bot) who sends relevant message

        const helpText = `use \`/increment [number]\` to increment the value by a given integer. \n` +
            `use \`/increment [reset|r]\` to reset the value to 0\n` +
            `use \`/increment [help|h]\` to display this message`;
        if (!subcommand) {                              // no subcommand
            var message = `No Subcommand :thinking: \n ${helpText}`;
            await sendNotification(modify, room, sender, message);
        } else {
            switch (subcommand) {
                case 'reset':                           // reset subcommand
                case 'r':
                    await persistence.updateByAssociations(this.associations, { value: 0 }, true);
                    message = `@${sender.username} reset the value to 0.`;
                    await sendMessage(modify, room, appBot, message);
                    return;
                case 'help':                            // help subcommand
                case 'h':
                    await sendNotification(modify, room, sender, helpText);
                    return;
                default:
                    if (isNaN(parseInt(subcommand, 10))) {  // if the subcommand is not a number
                        message = `@${sender.username} you need to provide a number to increment the value by.`;
                        await sendNotification(modify, room, sender, message);
                        return;
                    } else {
                        const initialValue = parseInt(await this.getValue(read).then((value) => value.result), 10);     // get the current value
                        const finalValue = await initialValue + parseInt(subcommand, 10);                               // calculate the new value
                        await persistence.updateByAssociations(this.associations, { value: finalValue }, true);         // update the value
                        message = `@${sender.username} incremented the value of ${initialValue} by ${subcommand}.\n` +
                            `The new value is ${finalValue} `;
                        await sendMessage(modify, room, appBot, message);
                    }
            }
        }
    }
}
