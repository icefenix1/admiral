# admiral README

Will log you into Admiral sites and configure k8s config for the assosiated cluster.

## Features

Admiral login

## Extension Settings

This extension contributes the following settings:

* `conf.application.admiralK8SDetails.kubeconfig` : Location of the default kubeconfig file                        }
* `conf.application.admiralEndPoints` : An Array Admiral endpoints

The endpoint object looks has the following:

* `endpoint` :  Endpoint Url
* `name` : Name of cluster
* `user` : User to login as
* `k8sendpoint` : k8s Api endpoint

## Release Notes

### 1.0.0

Initial release of ...

### 1.1.0 - 1.3.0

Minor bug fixes.

### 1.4.0

Minor UX updates.

* Added a command to allow user to trigger Login.

* Tied the added command to status bar. You can now click to login.

* Modified the Login loop to have a forced option to allow for the command.
