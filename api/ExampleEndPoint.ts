import {
    HttpStatusCode,
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";

export class ExampleEndpoint extends ApiEndpoint {
    public path = "example_api";

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        // lets define the body of the message
        var body: string;
        // if there is a payload, let's format it to a string/message
        if (Object.entries(request.content).length) {
            body = Object.entries(request.content)
                .map(([key, value]) => `**${key}**: ${JSON.stringify(value)}`)
                .join("\n");
        } else {
            body = "No Payload sent :(";
        }
        // log it, if you want
        this.app.getLogger().info("ENDPOINT CALLED: " + body);
        console.log("ENDPOINT CALLED: ", body);
        // now we get the GENERAL ROOM by ID
        // All Rocket.Chat workspaces will have by default a channel
        // with id GENERAL
        const room = await read.getRoomReader().getById("GENERAL");
        // Oh, no! no GENERAL room, return a not found error
        if (!room) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Room "#general" could not be found`,
            };
        }
        // lets construct the message
        const messageBuilder = modify
            .getCreator()
            .startMessage()
            .setText(body)
            .setRoom(room);
        // sent the message
        const messageId = await modify.getCreator().finish(messageBuilder);
        // return with success
        return this.success({
            success: true,
            messageId: messageId
        });
    }
}
