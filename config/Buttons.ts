import { IUIActionButtonDescriptor, RoomTypeFilter, UIActionButtonContext } from "@rocket.chat/apps-engine/definition/ui";


export const buttons: Array<IUIActionButtonDescriptor> = [
    {
        actionId: 'my-action-id-message', // this identifies your button in the interaction event
        labelI18n: 'MyActionNameMessage', // key of the i18n string containing the name of the button
        context: UIActionButtonContext.MESSAGE_ACTION, // in what context the action button will be displayed in the UI
        // If you want to choose `when` the button should be displayed
        when: {
            roomTypes: [
                RoomTypeFilter.PUBLIC_CHANNEL, 
                RoomTypeFilter.PRIVATE_CHANNEL, 
                RoomTypeFilter.DIRECT,
            ],
            // hasAllPermissions: ['create-d']
            // hasOnePermission: ['create-d'],
            // hasAllRoles: ['admin', 'moderator'],
            // hasOneRole: ['admin', 'moderator']
        }
    },
    {
        actionId: 'my-action-id-room', // this identifies your button in the interaction event
        labelI18n: 'MyActionNameRoom', // key of the i18n string containing the name of the button
        context: UIActionButtonContext.ROOM_ACTION, // in what context the action button will be displayed in the UI
    }

]