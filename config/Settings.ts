import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    AppDemoString = 'appdemo_string_id',
    AppDemoBoolean = 'appdemo_boolean',
    AppDemoCode = 'appdemo_code',
    AppDemoSelect = 'appdemo_select',
    //AppDemoColor = 'appdemo_color'
}

export const settings: Array<ISetting> = [
    {
        id: AppSetting.AppDemoBoolean,
        section: "demo",
        public: true,
        type: SettingType.BOOLEAN,
        value: true,
        packageValue: true,
        hidden: false,
        i18nLabel: 'AppDemo_Boolean',
        required: false,
    },
    {
        id: AppSetting.AppDemoCode,
        section: "demo",
        public: true,
        type: SettingType.CODE,
        value: "some code goes here",
        packageValue: "this is the package Value",
        hidden: false,
        i18nLabel: 'AppDemo_Code',
        required: false,
    },
    {
        id: AppSetting.AppDemoSelect,
        section: "demo",
        public: true,
        type: SettingType.SELECT,
        values: [{"key": "option1", "i18nLabel": "option_1_label"},{"key": "option2", "i18nLabel": "option_2_label"}],
        packageValue: "option2",
        hidden: false,
        i18nLabel: 'AppDemo_Select',
        required: false,
    },
    {
        id: AppSetting.AppDemoString,
        public: true,
        type: SettingType.STRING,
        value: "this is a value string",
        packageValue: "this is a value string",
        hidden: false,
        i18nLabel: 'AppDemo_String',
        required: false,
    },    
]