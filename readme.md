# Documentation for Organizations

#### Index

- [Introduction](#introduction)
- [Import this module](#import-this-module)
- [Storage engine](#storage-engine)
- [Customizing membership profiles](#customizing-membership-profiles)
- [Access the API](#access-the-api)
- [Github repository](https://github.com/layeredapps/organizations)
- [NPM package](https://npmjs.org/layeredapps/organizations)

# Introduction

Dashboard bundles everything a web app needs, all the "boilerplate" like signing in and changing passwords, into a parallel server so you can write a much smaller web app.

The Organizations module allows users to create organizations and invitations other users can accept to join.  Users must share the invitations themselves with the recipients.  Your application server can use the Organizations module's API to fetch what organizations a user is in and use that data to allow shared access or assign ownership or whatever other purpose.  A complete UI is provided for users to create and manage their organizations and memberships, and a basic administrator UI is provided for oversight.

## Import this module

On your Dashboard server you need to install this module with NPM:

    $ npm install @layeredapps/organizations

Edit your `package.json` to activate the module:

    "dashboard": {
      "modules": [
        "@layeredapps/organizations"
      ]
    }

## Storage engine

By default this module will share whatever storage you use for Dashboard.  You can specify nothing, specify an alternate storage backend, or specify the same type with a separate database.

    ORGANIZATIONS_STORAGE=postgresql
    ORGANIZATIONS_POSTGRESQL_DATABASE_URL=postgres://localhost:5432/organizations

# Customizing membership profiles

Memberships designate a Profile which you can configure to collect the information relevant to your organizations.  You specify the fields you want in an environment variable:

    MEMBERSHIP_PROFILE_FIELDS="any,of,the,below"

| Field          | 
|----------------|
| display-name   |
| display-email  |
| contact-email  |
| full-name      |
| dob            |
| phone          |
| occupation     |
| location       |
| location       |     
| company-name   |
| website        |


### Access the API

Dashboard and official modules are completely API-driven and you can access the same APIs on behalf of the user making requests.  You perform `GET`, `POST`, `PATCH`, and `DELETE` HTTP requests against the API endpoints to fetch or modify data.  This example fetches the user's country information using NodeJS, you can do this with any language:

You can view API documentation within the NodeJS modules' `api.txt` files, or on the [documentation site](https://layeredapps.github.io/organizations-api).

    const memberships = await proxy(`/api/user/organizations/memberships?accountid=${accountid}&all=true`, accountid, sessionid)

    const proxy = util.promisify((path, accountid, sessionid, callback) => {
        const requestOptions = {
            host: 'dashboard.example.com',
            path: path,
            port: '443',
            method: 'GET',
            headers: {
                'x-application-server': 'application.example.com',
                'x-application-server-token': process.env.APPLICATION_SERVER_TOKEN,
                'x-accountid': accountid,
                'x-sessionid': sessionid
            }
        }
        const proxyRequest = require('https').request(requestOptions, (proxyResponse) => {
            let body = ''
            proxyResponse.on('data', (chunk) => {
                body += chunk
            })
            return proxyResponse.on('end', () => {
                return callback(null, JSON.parse(body))
            })
        })
        proxyRequest.on('error', (error) => {
            return callback(error)
        })
        return proxyRequest.end()
      })
    }
