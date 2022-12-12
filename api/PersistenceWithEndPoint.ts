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
import { RocketChatAssociationModel, RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";

export class ApiWithPersistence extends ApiEndpoint {
    public path = "persistence_with_api";
    // let's declare how those data with associate.
    // here we do not have any room or user, 
    // so we'll associated it with a MISC value of 'persistence_with_api'
    public associations: Array<RocketChatAssociationRecord> = [
        new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'persistence_with_api'), 
    ];
    // let's handle POST
    /* you can run a command, such as
        curl --request POST \
       --url http://localhost:3000/api/apps/public/67a4e34b-5c04-4c9c-9358-3d0fd217cefd/persistence_with_api \
       --header 'Content-Type: application/json' \
       --data '{
        "some": "payload",
     	"other": {
     		    "more": "payload",
     		    "list": [1,2,3,4]
     	    }
        }'
    */
    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        // TODO: propose something like this:
        // public api_example_call = `curl --request POST --url ${api_url_path} --data '{"some": "payload","other": {"more": "payload","list": [1,2,3,4]}}'`
        // lets define the body of the message
        var body: any;
        // if there is a payload, let's format it to a string/message
        if (Object.entries(request.content).length) {
            body = request.content
        } else {
            body = { "default_text": "No Payload sent :(" }
        }
        // log it, if you want
        this.app.getLogger().info(["ENDPOINT WITH PERSITENCE POST CALLED: ", body]);
        console.log("ENDPOINT WITH PERSITENCE POST CALLED: ", body);
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
        await persis.updateByAssociations(this.associations, body, true);
        // lets construct the message
        const messageBuilder = modify
            .getCreator()
            .startMessage()
            .setText(JSON.stringify(body))
            .setRoom(room);
        // sent the message
        const messageId = await modify.getCreator().finish(messageBuilder);
        // return with success
        const persistenceRead = this.app.getAccessors().reader.getPersistenceReader();
        return this.success({
            success: true,
            messageId: messageId,
            result: request.content
        });
    }
    // lets handle GET
    // to get the data, you can run:
    // curl --request GET --url http://localhost:3000/api/apps/public/67a4e34b-5c04-4c9c-9358-3d0fd217cefd/persistence_with_api
    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse>{

        // log it, if you want
        this.app.getLogger().info(["ENDPOINT WITH PERSITENCE GET CALLED: ", request.content]);
        console.log("ENDPOINT WITH PERSITENCE GET CALLED: ", request.content);
        // now we get the data
        let result: any = {};
        const persistenceRead = this.app.getAccessors().reader.getPersistenceReader();
        try {
            const records: any = (await persistenceRead.readByAssociations(this.associations));

            if (records.length) {
                result = records;
            }else{
                result = {}
            }
        } catch (err) {
            console.warn(err);
        }
        
        return this.success({
            success: true,
            "result": result
        });

    }
    // lets handle DELETE
    // example call 
    // curl --request DELETE --url http://localhost:3000/api/apps/public/67a4e34b-5c04-4c9c-9358-3d0fd217cefd/persistence_with_api
    public async delete(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse>{
        this.app.getLogger().info(["ENDPOINT WITH PERSITENCE DELETE CALLED: ", request.content]);
        console.log("ENDPOINT WITH PERSITENCE POST CALLED: ", request.content);
        await persis.removeByAssociations(this.associations);
        return this.success({
            success: true,
        });
    }
}