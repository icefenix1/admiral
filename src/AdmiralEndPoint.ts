export class AdmiralEndPoint {
  public endpoint: string;
  public k8sEndpoint: string;
  public insecureSkipTlsVerify: boolean;
  public name: string;
  public user: string;
  public notLoggedIn: boolean;

  constructor(endpoint: string, name: string, user: string, k8sEndpoint: string, insecureSkipTlsVerify: boolean) {
    this.endpoint = endpoint;
    this.k8sEndpoint = k8sEndpoint;
    this.insecureSkipTlsVerify = insecureSkipTlsVerify;
    this.name = name;
    this.user = user;
    this.notLoggedIn = true;
  }

  /**
   * returns if the objects are diffrent
   * compare toCompare :AdmiralEndPoint     */
  public compare(toCompare: AdmiralEndPoint): boolean {
    let toReturn: boolean = this.user === toCompare.user;
    toReturn = toReturn && this.name === toCompare.name;
    toReturn = toReturn && this.endpoint === toCompare.endpoint;
    toReturn = toReturn && this.k8sEndpoint === toCompare.k8sEndpoint;
    toReturn = toReturn && this.insecureSkipTlsVerify === toCompare.insecureSkipTlsVerify;
    return toReturn;
  }

}
