## Setting up MaaSive

## Before starting

First of all, install [MaaSive Web](https://github.com/elc/maasive-web/blob/master/README_APP_SETUP.md)

Although we recommend you to install the software specific versions mentioned in this guide, if you already have MongoDB, mySQL and Node.js working in your system skip to [Clone repository](#clonerepo)

## Getting MaaSive API (Node.js) application running

### Install NVM (https://github.com/creationix/nvm)

    git clone git://github.com/creationix/nvm.git ~/.nvm

To activate NVM, you need to source it from your bash shell:

    . ~/nvm/nvm.sh

You can add this line to .bash\_profile, .profile, .bashrc, etc.

### Node.js 0.4.12

    $ nvm install v0.4.12
    $ node -v
	  v0.4.12

If you want to come back to the Node version installed in your system

    $ nvm deactivate

### <a name='clonerepo'></a> Clone repository

    $ git clone git@github.com:elc/maasive-api.git
    $ cd maasive-web

### Install dependencies using NPM (Node Package Manager)

	$ npm install
	
### Setup the database

Edit your database users in *config.json*

### Run your server

	$ node server.js
	
### Configure frameworks

Point your iOS, Android and Windows Phone frameworks to

	http://localhost:3001/