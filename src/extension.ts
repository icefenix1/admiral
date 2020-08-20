// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { InputBoxOptions } from 'vscode';
import { AdmiralEndPoint } from './AdmiralEndPoint';
import axios, { AxiosRequestConfig } from 'axios';
import YAML from 'yamljs';
import { AdmiralK8SDetails } from './AdmiralK8SDetails';
import { K8Sconfig, ClusterElement, ClusterCluster, UserElement, ContextElement, UserUser, ContextContext } from './k8sconfig';
import { AdmiralResponse } from './AdmiralResponse';
import fs from 'fs';

let currentConfig = new Array<AdmiralEndPoint>();
let k8sconfigLocation: string;
let k8syaml: K8Sconfig;
let myStatusBarItem: vscode.StatusBarItem;


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "admiral" is now active!');

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);	
	context.subscriptions.push(myStatusBarItem);

	let template: string = "apiVersion: v1\nclusters:\ncontexts:\ncurrent-context: \"\"\nkind: Config\npreferences: {}\nusers:";

	k8syaml = YAML.parse(template);

	updatek8s();

	loopConfig();

	updateStatusBarItem();

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {

		if (e.affectsConfiguration('conf.application.admiralK8SDetails')) {
			updatek8s();
		}

		if (e.affectsConfiguration('conf.application.admiralEndPoints')) {
			loopConfig();
		}

		updateStatusBarItem();
	}));

}

function updateStatusBarItem(): void {

		let loggedInCount = currentConfig.filter(loggedin => loggedin.notLoggedIn !== true).length;
	
		myStatusBarItem.text = `$(shield) Admiral logins ${loggedInCount}/${currentConfig.length}`;
		myStatusBarItem.show();
	
}

function updatek8s() {
	var config = vscode.workspace.getConfiguration('').get<AdmiralK8SDetails>('conf.application.admiralK8SDetails');
	if (config !== undefined) {
		if (config.kubeconfig === undefined) {
			vscode.window.showErrorMessage("kubeconfig location not set. \nConfig changes will not be saved. \nGive 'conf.application.admiralK8SDetails' a 'kubeconfig' property");
		} else {
			k8sconfigLocation = config.kubeconfig !== undefined ? config.kubeconfig : "";

			if(!fs.existsSync(k8sconfigLocation)){
				let output: string = YAML.stringify(k8syaml, 2, 2);
				fs.writeFileSync(k8sconfigLocation, output);
			}

			k8syaml = YAML.load(k8sconfigLocation);
		}
	}
};

async function loopConfig() {
	var config = vscode.workspace.getConfiguration('').get<Array<AdmiralEndPoint>>('conf.application.admiralEndPoints');

	if (config !== undefined) {
		console.log("Start login");
		let i = 0;
		while (i < config.length) {
			let element: AdmiralEndPoint = config[i];

			console.log("Enpoint" + element.name);

			let doLogin: boolean = true;

			if (currentConfig.length > 0) {
				let currentItem = currentConfig.find(item => item.name === element.name);
				if (currentItem !== undefined) {
					doLogin !== element.compare(currentItem);
				}
			}

			if (doLogin) {
				let j = 0;
				while (j < 3) {
					await logUserIn(element).then(lui => {
						element.notLoggedIn = !lui;
						if (lui) {							
							j = 3;
							i++;
						} else {
							j++;
						}
					});
				}
			}

		}
		currentConfig = config;
		updateStatusBarItem();
	};
}


async function logUserIn(element: AdmiralEndPoint): Promise<boolean> {
	let userprompt: string = "Password for User " + element.user + " :";
	let options: InputBoxOptions = {
		prompt: userprompt,
		password: true
	};

	await vscode.window.showInputBox(options).then(f => {

		if (f === undefined) {
			return false;
		}

		let creds: string = '{"username":' + element.user + ',"password:"' + f + '}';
		let b: Buffer = Buffer.from(creds);
		let endodedCreds: string = b.toString('base64');

		axios.get<AdmiralResponse>(element.endpoint + endodedCreds).then(async resp => {
			let token: string = resp.data.token;
	    //axios.get(element.endpoint + endodedCreds).then(async resp => {
		//	let token: string = endodedCreds;
			let username = element.user.toLowerCase().replace('.', '-');
			let contextNamespace: string = "dev-ops-box-" + username;
			let clusterName: string = element.name;
			let clusterUser: string = clusterName + "-user";
			let contextName: string = contextNamespace + "/" + clusterName + "/" + clusterUser;
			let insecureSkipTlsVerify: boolean = element.insecureSkipTlsVerify !== undefined ? element.insecureSkipTlsVerify : false; 
			

			if (k8syaml.clusters === undefined || k8syaml.clusters === null) {
				k8syaml.clusters = new Array<ClusterElement>();
			}
			if (k8syaml.users === undefined || k8syaml.users === null) {
				k8syaml.users = new Array<UserElement>();
			}
			if (k8syaml.contexts === undefined || k8syaml.contexts === null) {
				k8syaml.contexts = new Array<ContextElement>();
			}

			if (k8syaml.clusters.find(c => c.name === clusterName) !== undefined) {
				let index = k8syaml.clusters.findIndex(c => c.name === clusterName);
				k8syaml.clusters[index].cluster.server = element.k8sEndpoint;
				k8syaml.clusters[index].cluster["insecure-skip-tls-verify"] = insecureSkipTlsVerify;
			} else {
				let clusterDetails: ClusterCluster = new ClusterCluster(element.k8sEndpoint);
				clusterDetails["insecure-skip-tls-verify"] = insecureSkipTlsVerify;
				let cluster: ClusterElement = new ClusterElement(clusterName, clusterDetails);
				k8syaml.clusters.push(cluster);
			}

			if (k8syaml.users.find(c => c.name === clusterUser) !== undefined) {
				let index = k8syaml.users.findIndex(c => c.name === clusterUser);
				k8syaml.users[index].user.token = token;
			} else {
				let userDetails: UserUser = new UserUser();
				userDetails.username = username;
				userDetails.token = token;
				let user: UserElement = new UserElement(clusterUser, userDetails);
				k8syaml.users.push(user);
			}

			if (k8syaml.contexts.find(c => c.name === contextName) === undefined) {
				let contextDetails: ContextContext = new ContextContext(clusterUser, clusterName, contextNamespace);
				let context: ContextElement = new ContextElement(contextName, contextDetails);

				k8syaml.contexts.push(context);

			}

			let output: string = YAML.stringify(k8syaml, 2, 2);
			fs.writeFileSync(k8sconfigLocation, output);
			
			console.log(`Logged in to cluster ${element.name}`);
			

		}).catch(resp => {
			vscode.window.showErrorMessage("Error logging in");
			return false;
		});

	});

	return true;
}

// this method is called when your extension is deactivated
export function deactivate() { }
