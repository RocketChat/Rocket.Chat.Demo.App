import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    AppDemoOutputChannel = 'appdemo_outputchannel',
    AppDemoString = 'appdemo_string_id',
    AppDemoBoolean = 'appdemo_boolean',
    AppDemoCode = 'appdemo_code',
    AppDemoSelect = 'appdemo_select'
}

export const settings: Array<ISetting> = [
    {
        id: AppSetting.AppDemoOutputChannel,
        section: "AppDemo_FeatureSettings",
        public: true,
        type: SettingType.STRING,
        value: "#General",
        packageValue: "",
        hidden: false,
        i18nLabel: 'AppDemo_OutputChannel',
        i18nDescription: 'AppDemo_OutputChannel_Desc',
        required: false,
    },
    {
        id: AppSetting.AppDemoBoolean,
        section: "AppDemo_DemoSection",
        public: true,
        type: SettingType.BOOLEAN,
        value: true,
        packageValue: '',
        hidden: false,
        i18nLabel: 'AppDemo_Boolean',
        required: false,
    },
    {
        id: AppSetting.AppDemoCode,
        section: "AppDemo_DemoSection",
        public: true,
        type: SettingType.CODE,
        value: "some code goes here",
        packageValue: "",
        hidden: false,
        i18nLabel: 'AppDemo_Code',
        required: false,
    },
    {
        id: AppSetting.AppDemoSelect,
        section: "AppDemo_DemoSection",
        public: true,
        type: SettingType.SELECT,
        values: [{"key": "option1", "i18nLabel": "option_1_label"},{"key": "option2", "i18nLabel": "option_2_label"}],
        packageValue: "",
        hidden: false,
        i18nLabel: 'AppDemo_Select',
        required: false,
    },
    {
        id: AppSetting.AppDemoString,
        section: "AppDemo_DemoSection",
        public: true,
        type: SettingType.STRING,
        value: "this is a value string",
        packageValue: "",
        hidden: false,
        i18nLabel: 'AppDemo_String',
        required: false,
    },
]