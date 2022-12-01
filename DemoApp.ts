import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting } from '@rocket.chat/apps-engine/definition/settings';
import { IUIKitResponse, UIKitActionButtonInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { ExampleCommand } from './commands/ExampleCommand';
import { buttons } from './config/Buttons';
import { settings } from './config/Settings';

export class DemoAppApp extends App {
    constructor(
        info: IAppInfo,
        logger: ILogger,
        accessors: IAppAccessors,
        public modify: IModify
    ) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        // Creating persistant app settings
        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
        // Providing additional commands
        await configuration.slashCommands.provideSlashCommand(new ExampleCommand());
        // Registering Action Buttons
        await Promise.all(buttons.map((button) => configuration.ui.registerButton(button)))
    }

    public async onSettingUpdated(setting: ISetting, configurationModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        // Monitoring settings change
        // this will show in ADMIN > APPS > INSTALLED APP > THIS APP > LOGS
        // Log from inside the app
        this.getLogger().info("Some Setting was Updated: " + JSON.stringify(setting))
        // this will show in sdtout, and also in WORSKPACE > VIEW LOGS 
        console.log("Some setting was Updated: " + JSON.stringify(setting))
        /* EXAMPLE OUTPUT
            rocketconnect-rocketchat-1  | Some setting was Updated: {"id":"appdemo_code","section":"AppDemo_DemoSection","public":true,"type":"code","value":"some code goes here!","packageValue":"","hidden":false,"i18nLabel":"AppDemo_Code","required":false,"createdAt":"2022-11-28T21:11:09.590Z","updatedAt":"2022-11-28T21:16:36.803Z"}
        */
        return super.onSettingUpdated(setting, configurationModify, read, http);
    }

    public async executeActionButtonHandler(
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const {
            buttonContext,
            actionId,
            triggerId,
            user,
            room,
            message,
        } = context.getInteractionData();

        

        // If you have multiple action buttons, use `actionId` to determine 
        // which one the user interacted with
        if (actionId === 'my-action-id-message') {
            const blockBuilder = modify.getCreator().getBlockBuilder();
            blockBuilder.addSectionBlock({
                text: blockBuilder.newMarkdownTextObject(
                `We received your interaction, thanks!\n` +
                `**Action ID**:  ${actionId}\n` + 
                `**Room**:  ${room.displayName || room.slugifiedName}\n` + 
                `**Room Type**:  ${room.type}\n` + 
                `**Message ID**:  ${message?.id}\n` + 
                `**Text**:  ${message?.text}\n` +
                `**Sender**:  ${message?.sender.username} at ${message?.createdAt}\n` +
                `**Total Messages at room**: ${room.messageCount}`)
            })
            // let's open a modal using openModalViewResponse with al those information
            return context.getInteractionResponder().openModalViewResponse({
                title: blockBuilder.newPlainTextObject('Button Action on a Message!'),
                blocks: blockBuilder.getBlocks(),
            });
        }

        if (actionId === 'my-action-id-room') {
            const blockBuilder = modify.getCreator().getBlockBuilder();

            // let's open a Contextual Bar using openContextualBarViewResponse, instead of a modal
            return context.getInteractionResponder().openContextualBarViewResponse({
                title: blockBuilder.newPlainTextObject('Button Action on a Room'),
                blocks: blockBuilder.addSectionBlock({
                    text: blockBuilder.newPlainTextObject('We received your interaction, thanks!')
                }).getBlocks(),
            });
        }

        return context.getInteractionResponder().successResponse();
    }


}
