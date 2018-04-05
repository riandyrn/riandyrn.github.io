# Haraj Chat User API

This API is used to modify user data.

List of available functions:

- [`Register Number`](#register-number)
- [`Resend Verification`](#resend-verification)
- [`Register User`](#register-user)
- [`Change Password`](#change-password)
- [`Change Number`](#change-number)
- [`Verify Number`](#verify-number)
- [`Get Profile`](#get-profile)

Haraj Chat user & Haraj user are the same. So if a user already have account in Haraj, he could use directly Haraj Chat service, vice versa.

When the user make modification to his profile in Haraj Chat, it will be reflected directly to his account in Haraj.

---

## Register Number

POST: `/chat/numbers`

This function is used to register new number to Haraj. If the call to this function successful, system will send sms containing verification code to the number. This function will return `registration_token` which need to be presented in header while user in the process of registering data to Haraj Chat. If registration token is expired, client should recall this function.

The format for number should be: `<code_area><number>`, for example like: `+966566342202`.

However format of `0<number>` (ex. `0566342202`) is also accepted, but it will be assumed directly as Saudi number (+966).

If `no_sms` being set to `true` then system won't send sms to number. This option only used for testing purpose.

**Body:**

```json
{
    "number": "+966566342202",
    "no_sms": true
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {,
        "number": "+966566342202",
        "vcode": 1234,
        "registration_token": "<registration_token>",
        "expires": "2018-02-02T08:40:39.987Z"
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Responses:**

```json
{
    "status": 400,
    "err": "ERR_INVALID_NUMBER",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if `number` is not in supposed format.

```json
{
    "status": 409,
    "err": "ERR_REGISTERED_NUMBER",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if `number` is already verified & registered.

```json
{
    "status": 500,
    "err": "ERR_SMS_FAILED",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if system unable to send sms containing verification code.

[Back to Top](#haraj-chat-user-api)

---

## Resend Verification

POST: `/chat/numbers/{number}`

This function is used to resend sms containing verification code to the number. If somehow the sms is not retrieved by user, client could use this function to resend it.

Supported formats for `{number}` is like `966566342202` (without plus mark) & like `0566342202` (started with 0).

If `no_sms` being set to `true`, system won't send sms to number. Used only for testing purpose.

**Header:**

```bash
Authorization: Bearer <registration_token>
```

**Body:**

```json
{
    "no_sms": true
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "number": "+966566342202",
        "vcode": 1234
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Response:**

```json
{
    "status": 401,
    "err": "ERR_INVALID_REGISTRATION_TOKEN",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `registration_token` is invalid (incorrect or has been expired).

```json
{
    "status": 500,
    "err": "ERR_SMS_FAILED",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if system unable to send sms containing verification code.

[Back to Top](#haraj-chat-user-api)

---

## Register User

POST: `/chat/users`

This function is used to register new user. This function is the final step of registering user.

**Header:**

```bash
Authorization: Bearer <registration_token>
```

**Body:**

```json
{
    "username": "riandyrn",
    "password": "123456",
    "vcode": 1234
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 23420,
        "access_token": "<access_token>",
        "expires": "2018-02-09T08:30:39.987Z",
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Responses:**

```json
{
    "status": 401,
    "err": "ERR_INVALID_REGISTRATION_TOKEN",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `registration_token` is invalid (incorrect or has been expired).

```json
{
    "status": 409,
    "err": "ERR_INVALID_VCODE",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `vcode` is invalid.

```json
{
    "status": 409,
    "err": "ERR_USERNAME_EXIST",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `username` is already exist on system.

```json
{
    "status": 409,
    "err": "ERR_PASSWORD_TOO_SHORT",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `password` is too short. Minimum length of `password` is 6.

```json
{
    "status": 409,
    "err": "ERR_PASSWORD_ILLEGAL_CHARS",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `password` contains illegal characters. Currently it's only space.

[Back to Top](#haraj-chat-user-api)

---

## Change Password

PUT: `/chat/users/{user_id}`

This function is used to change user password. Notice that the token used in header is no longer `registration_token` but `access_token` which client acquire when successfully registering user or login.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "what": "change_password",
    "password": "123456",
    "new_password": "123457"
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 23420,
        "what": "change_password"
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Responses:**

```json
{
    "status": 409,
    "err": "ERR_INVALID_PASSWORD",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `password` is wrong.

```json
{
    "status": 409,
    "err": "ERR_PASSWORD_TOO_SHORT",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `new_password` is too short. The minimum length of `new_password` is 6.

```json
{
    "status": 409,
    "err": "ERR_PASSWORD_ILLEGAL_CHARS",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `password` contains illegal characters. Currently it's only space.

[Back to Top](#haraj-chat-user-api)

---

## Change Number

PUT: `/chat/users/{user_id}`

This function is used to change existing user number. This function returns `number_token` which need to be presented in request body when client verifying the attempt.

If `number_token` is expired, client should recall this function.

If `no_sms` being set to true, system won't send sms to number. Used only for testing purpose.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "what": "change_number",
    "number": "+966566342202",
    "no_sms": true
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 23420,
        "what": "change_number",
        "number": "+966566342202",
        "vcode": 1234,
        "number_token": "<number_token>",
        "expires": "2018-02-02T08:40:39.987Z"
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Responses:**

```json
{
    "status": 409,
    "err": "ERR_EXISTING_NUMBER",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if `number` has been used by other user in system.

```json
{
    "status": 500,
    "err": "ERR_SMS_FAILED",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if system unable to send sms containing verification code.

[Back to Top](#haraj-chat-user-api)

---

## Verify Number

PUT: `/chat/users/{user_id}`

This function is used to verify user attempt to change number.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "what": "verify_number",
    "number_token": "<number_token>",
    "vcode": 1234
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 23420,
        "what": "verify_number",
        "number": "+966566342202"
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Responses:**

```json
{
    "status": 409,
    "err": "ERR_INVALID_NUMBER_TOKEN",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if `number_token` presented is invalid.

```json
{
    "status": 409,
    "err": "ERR_INVALID_VCODE",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if presented `vcode` is wrong.

```json
{
    "status": 409,
    "err": "ERR_EXISTING_NUMBER",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

Client will receive this error if `number` has been used by other user in system.

[Back to Top](#haraj-chat-user-api)

---

## Get Profile

GET: `/chat/users/{user_id}`

This function is used to get user profile.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 23420,
        "name": "riandyrn",
        "number": "+966566342202",
        "avatar": "https://someurl.com/avatar/riandyrn.jpg"
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Response:**

No specific error response

[Back to Top](#haraj-chat-user-api)

---

## Generic Errors

The generic errors for this API is the same like HTTP API. Please check corresponding document for details.

[Back to Top](#haraj-chat-user-api)

---