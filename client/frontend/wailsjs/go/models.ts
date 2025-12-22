export namespace networking {
	
	export class Response {
	    statusCode: number;
	    body: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new Response(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.statusCode = source["statusCode"];
	        this.body = source["body"];
	        this.error = source["error"];
	    }
	}
	export class SecureWebSocket {
	    // Go type: websocket
	    Conn?: any;
	    IsConnected: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SecureWebSocket(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Conn = this.convertValues(source["Conn"], null);
	        this.IsConnected = source["IsConnected"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

