import { Request as WailsRequest } from "../../wailsjs/go/main/App";
import { networking } from "../../wailsjs/go/models";

export async function ApiRequest(method: string, url: string, headers: {[key: string]: string} = {}, body: string = ""): Promise<networking.Response> {
    try {
        const response = await WailsRequest(method, url, headers, body);
        
        if (response.statusCode === 401) {
            window.dispatchEvent(new Event("auth:logout"));
            // Return response anyway in case caller wants to handle it, 
            // but the event will trigger logout process.
        }

        return response;
    } catch (e: any) {
        // Handle network errors or other exceptions
        console.error("API Request failed", e);
        throw e;
    }
}
