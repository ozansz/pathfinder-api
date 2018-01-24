# pathfinder-api
A minimal RESTful API service based on Node.js with Express.js, powering our learning-path-finder algorithm

**API Version** : v0.7-beta

## Installation and Starting
Clone the repo and cd into the project directory. To install the required packages, just type and run the commands below
```
$ npm init -y
$ npm install
```

To start the server, use
```
$ npm start
```
or use `nodemon` instead.

## Used Packages
**expressjs**, has always been a good friend.
**mongoose**, for an easier and faster communication with MongoDB database.
**jsonwebtoken**, to not to use sessions and avoid using cookies; we're using JWTs instead.
**bcryptjs**, to hash passwords.
**body-parser**, to handle application/json requests efficiently.

## API Endpoints
In our RESTful API design, the response schema is strictly defined, which always uses right HTTP response codes with a appropriate JSON document, as must always be in every RESTful API.

Frequenty used HTTP response codes could be listed as: `200` and `201`, for successful requests; `307` for most redirects; `400`, `401`, `403`, `404` and `409` when the client has done something wrong; and `500` for almost every mistake which has been made by the server.

### User Registration and Authentication

#### /users/register
**Method** : POST

**Required Body Fields** : `name`, `email` and `password`

**Response** : For a valid request, the server responds with a JSON document `{success: true, msg: <success-message>}` with the HTTP response code set to 200. In invalid requests, i.e. invalid body fields (for example when the client don't define one of the required body fields), the server responds with a JSON document `{success: false, msg: <failure-message>}` with the HTTP response code set to 409.

After a successful request, the hash of *password* will be stored in the database's `users` collection by the `User` mongoose model, besides the *name* and  *email* fields which client has sent as well.

Note that all email fields in the `users` collection are **unique**, and **cannot** be used to register more than one user.

#### /auth/local
**Method** : POST

**Required Body Fields** : `email` and `password`

**Response** : For a valid request when client has sent the correct credentials, the server responds with a JSON document `{success: true, token: <new-jwt>, name: <user-name>}` with the HTTP response code set to 200. In invalid requests, i.e wrong password, the server responds with a JSON document `{success: false, msg: <failure-message>}` with the HTTP response code set to either one of 401 and 404.

The object structure of the created JWT is defined as `{authorization: 'user', uid: found_user._id}` in **routes/admin.js**. The client **has to** keep that token in a safe place and send it to the server in the *Authorizaion* header  **every time** one needs to request a service / api call that requires user authorization.

### Fetching Subject Data

#### /pf/subjects
**Method** : GET

**Required Headers** : `Authorizaion`, the unique JWT which sent by server

**Response** : For a valid request when client has set the `Authorizaion` header to right token, the server responds with a JSON document `{success: true, subjects: [<each-subject>]}` with the HTTP response code set to `200`. In case of an invalid request, when the `Authorizaion` header is not set or is set to a wrong value, or when the token is expired, the server responds with a JSON document `{success: false, msg: <failure-message>}` with the HTTP response code set to `404`.

The object structure of the sent `subject` JSON document field is an array of JSON representation of `Subject` objects defined in **models/subject.js**
