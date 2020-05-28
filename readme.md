# Node.js/MySQL with token authentication (JWT) starter project

This project can be used as a starting template to create a Node.js WebAPI backend.


## Users API calls

* __POST /users__
Create a new user (register)
Will return the new user profile and an idToken object.

* __POST /users/login__
Login a user
Will return the new user profile and an idToken object.

* __POST /users/logout__
Logout a user (remove a token from the user's token collection).
The amount of tokens removed is sent back with an HTTP code of 200.
(i.e {"tokens_removed": 1})

* __POST /users/logoutAll__
Logout a user (remove __ALL__ tokens from the user's token collection).
It's basically a "logout from all devices".
The amount of tokens removed is sent back with an HTTP code of 200.
(i.e {"tokens_removed": 6})

* __GET /users/me__
Get user's profile
Returns the user's profile.

* __PATCH /users/me__
Update a user's profile.
Allowed field for update: name, email, password
Returns the user's profile.

* __DELETE /users/me__
Delete a user.
Returns the user's profile.

## NOTE

On creation of a user or login, the following JSON will be returned (user object and a idToken object):

``` javascript
{
    "user": {
        "userId": "12",
        "name": "Mickey Mouse",
        "email": "mickey@mouse.com"
    },
    "idToken": {
        "token": "xxxxxxxx.xxxxxxxxxxxx.xxxxxxxxxxx",
        "iat": 1586116855,
        "exp": 1594670455,
        "expiresIn": 8553600
    }
}
```

## The database

```

CREATE TABLE `users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `createdDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `id_UNIQUE` (`userId`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;

CREATE TABLE `users_tokens` (
  `tokenId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `token` varchar(200) NOT NULL,
  `exp` int(11) NOT NULL,
  PRIMARY KEY (`tokenId`),
  UNIQUE KEY `tokenId_UNIQUE` (`tokenId`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8;

```

## The environment variables

We expect the environment variables to be in the folder ```./config```.


Example configuration for __dev.env__
```
DB_HOST=myhostip
DB_USER=username
DB_PASSWORD=password
DB_DATABASE=database
JWT_SECRET=this is a JWT secret
JWT_EXPIRE=7d
PORT=5000
ENV=dev
```

