import { IHttp, IModify, IPersistence, IPersistenceRead, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands/index';
import { sendMessage } from '../lib/sendMessage';
export class IncrementCommand implements ISlashCommand {
    app: IApp;

    constructor(app) {
        this.app = app;
    }
    public command = 'increment';
    public i18nDescription = 'IncrementCommand_Description';
    public providesPreview = false;
    public i18nParamsExample = '';
    public associations: Array<RocketChatAssociationRecord> = [
        new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'increment_command'),
    ];
    // debug function
    public testlogger = () => {
        console.log('test');
        return;
    }
    public async getValue(read: IRead): Promise<any> {
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

        const sender = context.getSender();
        const room = context.getRoom();
        const [subcommand] = context.getArguments();

        const helpText = `use \`/increment [number]\` to increment the value by a given integer. \n` +
            `use \`/increment [reset|r]\` to reset the value to 0\n` +
            `use \`/increment [help|h]\` to display this message`;
        if (!subcommand) {
            var message = `No Subcommand :thinking: \n ${helpText}`;
            await sendMessage(modify, room, sender, message);
        } else {
            switch (subcommand) {
                case 'reset':
                case 'r':
                    await persistence.updateByAssociations(this.associations, { value: 0 }, true);
                    message = `@${sender.username} reset the value to 0.`;
                    await sendMessage(modify, room, sender, message);
                    return;
                case 'help':
                case 'h':
                    await sendMessage(modify, room, sender, helpText);
                    return;
                default:
                    if (isNaN(parseInt(subcommand, 10))) {
                        message = `@${sender.username} you need to provide a number to increment the value by.`;
                        await sendMessage(modify, room, sender, message);
                        return;
                    } else {
                        const initialValue = parseInt(await this.getValue(read).then((value) => value.result), 10);
                        const finalValue = await initialValue + parseInt(subcommand, 10);
                        await persistence.updateByAssociations(this.associations, { value: finalValue }, true);
                        message = `@${sender.username} incremented the value of ${initialValue} by ${subcommand}.\nThe new value is ${finalValue} `;
                        await sendMessage(modify, room, sender, message);
                    }
            }
        }
    }
}
