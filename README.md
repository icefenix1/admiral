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