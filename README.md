# OSR Functions

These are the functions that deploy to firebase for the OurSongRequest App.

# Setup & Deploying

Install using `yarn install`

locally host using `firebase serve`

deploy functions using `firebase deploy`

# Docs

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/65dbfa745002e5881a11)

## /users/:handle

GET a user data by handle

## /login

a POST request with an email and password

## /signUp

a POST request made here with an example body of:

```
{
  stageName: "Joe & the Tests",
  name: "Joe Allen",
  socialLink: "Twitter.com/joe&theTests",
  email: "joeandthetests@band.com",
  password: "123456",
  confirmPassword: "123456",
}
```

will add the following to the user DB, and create a user:

```
    {
      createdAt: "020-07-15T16:29:17.693Z", //The time at writing
      email: "joeandthetests@band.com",
      handle: "Joe&TheTests", //generated from camelcasing the stagename
      name: "Joe Allen",
      sociallink: "Twitter.com/joe&theTests",
      stagename: "Joe & the Tests",
      userId: "Bljhf99YXbgI5vLmmIg5MdSl3rq1", //To access the user from friebase
    },
```

It also adds the following Artist Data:
```
        genres: "placeholderTag1, Tag2, Tag3",
        bio: "placeholder Bio",
        videoPrice: "50",
        videoResponseTime: "8",
        createdAt: new Date().toISOString(),
        isPublic: false,
```


## /createUser
Route for creating a user that is already signed up, for example if a user registers through Facebook they are already authorized, but we still need to generate their artist data.

## /signupCustomer
Customers do not need any Artist data stored when they sign up, we just need to check their inputs are valid, valid email and passwords for example.
