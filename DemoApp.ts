import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IHttp,
    ILogger,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting } from '@rocket.chat/apps-engine/definition/settings';
import { settings } from './config/Settings';

export class DemoAppApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        // Creating persistant app settings
        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
    }

    public async onSettingUpdated(setting: ISetting, configurationModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        // Monitoring settings change
        // this will show in ADMIN > APPS > INSTALLED APP > THIS APP > LOGS
        // Log from inside the app
        this.getLogger().info("Do something here. It will be shown in App logs")
        // Log to sdtout
        console.log("Some setting was updated! " + JSON.stringify(setting))
        return super.onSettingUpdated(setting, configurationModify, read, http);
    }

}
