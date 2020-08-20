export class K8Sconfig {
    apiVersion:        string;
    clusters?:          ClusterElement[];
    contexts?:          ContextElement[];
    "current-context"?: string;
    kind:              string;
    preferences?:       Preferences;
    users?:             UserElement[];

    constructor(){
        this.apiVersion = "v1";
        this.kind = "config";
    }
}

export class ClusterElement {
    cluster: ClusterCluster;
    name:    string;

    constructor(name: string,cluster: ClusterCluster){
        this.name = name;
        this.cluster = cluster;
    }
}

export class ClusterCluster {
    "certificate-authority"?:    string;
    server:                      string;
    "insecure-skip-tls-verify"?: boolean;

    constructor(server : string){
        this.server = server;
    }
}

export class ContextElement {
    context: ContextContext;
    name:    string;

    constructor(name: string,context: ContextContext){
        this.name = name;
        this.context = context;
    }
}

export class ContextContext {
    cluster:   string;
    namespace: string;
    user:      string;

    constructor(user: string,cluster: string,namespace: string){
        this.user = user;
        this.cluster = cluster;
        this.namespace = namespace;
    }
}

export class Preferences {
}

export class UserElement {
    name: string;
    user: UserUser;

    constructor(name: string,user: UserUser){
        this.user = user;
        this.name = name;
    }
}

export class UserUser {
    "client-certificate"?: string;
    "client-key"?:         string;
    password?:             string;
    username?:             string;
    token?:                string;
}