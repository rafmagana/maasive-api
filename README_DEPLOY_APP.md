# Deploying MaaSive API

## Before starting

First of all, please read the guide to [deploy MaaSive Web](https://github.com/elc/maasive-web/blob/master/README_DEPLOY_APP.md), most of the requirements to deploy MaaSive API are the same in both projects.

## Servers

Define your servers in _config/deploy/{environment}.rb_

## Required software

* Node.js
* Git
* mySQL
* MongoDB

## Capistrano

### Environments

We use staging as our default environment, so:

To execute task in staging:

    cap deploy

or

	cap staging deploy
	
To execute task in production:

	cap production deploy

### Setting up

	cap deploy:setup
	
It shouldn't take too long since it only creates the directory structure.

Make sure you have Node.js installed before going further.

### Checking dependencies

Now we need to make sure our servers have all we need to deploy:

	cap deploy:check

If Capistrano did not complain about anything then it's time to do our first deployment.

### First deployment

Since it'll be our first time or in Capistrano words, a cold deployment, we need to execute the following task:

	cap deploy:cold
	
We're done, visit your servers and check if the app is running.  

From now on, every time you want to deploy you just have to execute:

	cap deploy
	
That's it!