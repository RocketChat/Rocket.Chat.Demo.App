import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiSecurity,
    ApiVisibility,
} from "@rocket.chat/apps-engine/definition/api";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { ISetting } from "@rocket.chat/apps-engine/definition/settings";
import {
    IUIKitResponse,
    UIKitActionButtonInteractionContext,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { ExampleEndpoint } from "./api/ExampleEndPoint";
import { ApiWithPersistence } from "./api/PersistenceWithEndPoint";
import { ExampleCommand } from "./commands/ExampleCommand";
import { buttons } from "./config/Buttons";
import { settings } from "./config/Settings";
import { ExampleActionButtonHandler } from "./handlers/ActionButton";
import { ExampleViewSubmitHandler } from "./handlers/ViewSubmit";

export class DemoAppApp extends App {
    constructor(
        info: IAppInfo,
        logger: ILogger,
        accessors: IAppAccessors,
    ) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        // Providing API Endpoints
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new ExampleEndpoint(this)],
        });
        // Providing API Endpoint with Persistence
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new ApiWithPersistence(this)],
        });        

        // Providing persistant app settings
        await Promise.all(
            settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            )
        );
        // Providing slash commands
        await configuration.slashCommands.provideSlashCommand(
            new ExampleCommand(this)
        );
        // Registering Action Buttons
        await Promise.all(
            buttons.map((button) => configuration.ui.registerButton(button))
        );
    }

    public async onSettingUpdated(
        setting: ISetting,
        configurationModify: IConfigurationModify,
        read: IRead,
        http: IHttp
    ): Promise<void> {
        // Monitoring settings change
        // this will show in ADMIN > APPS > INSTALLED APP > THIS APP > LOGS
        // Log from inside the app
        // note that you can pass both any or a list or any
        let list_to_log = ["Some Setting was Updated. SUCCESS MESSAGE: ", setting]
        // you can have a different type of logs:
        this.getLogger().success(list_to_log);        
        this.getLogger().info(list_to_log);
        this.getLogger().debug(list_to_log);
        this.getLogger().warn(list_to_log);
        this.getLogger().error(list_to_log);

        // this will show in sdtout, and also in WORSKPACE > VIEW LOGS
        console.log("Some setting was Updated: ", JSON.stringify(setting));
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
        // lets just move this execution to another file to keep DemoApp.ts clean.
        return new ExampleActionButtonHandler().executor(
            context,
            read,
            http,
            persistence,
            modify,
            this.getLogger()
        );
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ) {
        // same for View SubmitHandler, moving to another Class
        return new ExampleViewSubmitHandler().executor(
            context,
            read,
            http,
            persistence,
            modify,
            this.getLogger()
        );
    }
}
