---
description: Business functionality and API endpoints available to a "Webhook" client.
---

# Webhook clients

As of OpenCRVS v1.2.\*, OpenCRVS publishes the following civil registration events as webhooks that clients can subscribe to.  This is particularly useful for e-Gov systems if you wish to initiate a service for a citizen at the moment a Birth or Death is officially registered.

* Birth registration
* Death registration

Included in these webhooks is a **FHIR Resource type and unique ID** to the OpenCRVS resource associated and customisable **demographics, attachments and links to biometric data** for the registration in a SHA signed and encrypted payload.

{% hint style="warning" %}
Subscribing to an OpenCRVS webhook requires you to develop a service that exposes the standardised and required webhook endpoints associated with the [W3C WebSub](https://www.w3.org/TR/websub/) pattern.
{% endhint %}

{% hint style="info" %}
FYI: In OpenCRVS nomenclature, we have adopted the OpenHIM term "**Mediator**" to describe a 3rd party developed service that integrates with OpenCRVS using a client token.
{% endhint %}

Any mediator that subscribes to an OpenCRVS webhook must:

1. Expose endpoints on a secure server that can process HTTPS requests and respond to a webhook following the [WebSub](https://www.w3.org/TR/websub/) pattern.
2. Authenticate and query OpenCRVS to find a list of available event webhooks.
3. Authenticate and subscribe to the webhook of choice.
4. Respond to the webhook event as you wish internally, and request further details from OpenHIM to suit your business case. Refer to the [mediator](https://github.com/opencrvs/opencrvs.github.io/blob/master/website/docs/technology/mediators) page for examples of raw FHIR resources.

{% hint style="info" %}
You can use our [Postman collections](https://github.com/opencrvs/opencrvs-farajaland/tree/master/postman) to test webhook API functionality. [Postman](https://www.postman.com/) is a tool you can download to test API access before building your integrations.
{% endhint %}

{% hint style="info" %}
As an example 3rd party webhook client service, we have written [**this mediator**](https://github.com/opencrvs/mosip-mediator) that subscribes to a birth registration webhook and retrieves the data required by [MOSIP - the Modular Open Source Identity Platform](https://www.mosip.io/) to register a national ID in MOSIP at the moment a Birth is registered. This medator only works for a National ID client explained later, but you can refer to the code to replicate the sequence diagrams below regarding subscribing and handling webhooks.
{% endhint %}



### Sequence diagram

The following sequence diagram describes a Mediator that is developed to receive information from an OpenCRVS Webhook.

![](https://github.com/opencrvs/opencrvs.github.io/blob/master/website/static/img/mediator-sequence.png?raw=true)

### Creating a subscriber endpoint

Your microservice mediator must be able to process two types of HTTPS requests:&#x20;

* Verification Requests
* Event Notifications.&#x20;

Since both requests use HTTPs your server must have a valid TLS or SSL certificate correctly configured and installed.

The following sections explain what will be in each type of request to these endpoints and how to respond to them.

#### Verification Requests

Anytime you try to subscribe to a Webhook, OpenCRVS will send a GET request to this endpoint URL to confirm that your microservice is prepared to receive webhooks.

Sample:

```
  GET https://www.your-clever-domain-name.com/webhooks?
  mode=subscribe&
  challenge=&
  topic=BIRTH_REGISTERED
```

| Parameter   | Sample value       | Description                                                           |
| ----------- | ------------------ | --------------------------------------------------------------------- |
| `mode`      | `subscribe`        | This value will always be set to `subscribe`                          |
| `challenge` | `1158201444`       | A random cryptographic string that you must pass back to OpenCRVS     |
| `topic`     | `BIRTH_REGISTERED` | A supported OpenCRVS event type string that will trigger this webhook |

Note: The supported events and associated topic strings are explained later in this document when studying the subscription process.

#### **Validating Verification Requests**

Whenever your endpoint receives a verification request, it must:

Verify that the `topic` value matches the event you're trying to subscribe to. Respond with the following object:

```
{
    "challenge": "1158201444"
}
```

#### Event Notifications

When you configure your Webhooks product, you will subscribe to specific events. Whenever there's a a new event created, we will send your endpoint a POST request with a JSON payload describing the event **FHIR Compostion ID**.

For example, if you subscribed to the birth registration event, we would send you a POST request to the same URL as the **Verification request** URL that would look something like this:

The property `context` contains the FHIR bundles that are required for successfully processing an action. In our current birth registration webhook we have included all the required information that the [MOSIP - the Modular Open Source Identity Platform](https://www.mosip.io/) requires in order to create a National ID number as an example.

Links to biometric documents that are hosted by a 3rd party vendor service such as [Simprints](https://www.simprints.com/) could be contained here as additional DocumentReferences thus connecting OpenCRVS to a functional and foundational National ID system.

```
POST / HTTPS/1.1
Content-Type: application/json
X-Hub-Signature: sha1={super-long-SHA1-signature}

{
    "payload": {
        "id": "531e9275-40e4-4ab5-a12c-6fa74d7b5b61",
        "timestamp": "2019-12-12T10:53:43-08:00",
        "event": {
            "hub": {
                "topic": "BIRTH_REGISTERED"
            }
        }
    }
    "url": "",
    "hmac": "sha256=1d51fb6d-8636abe2-affb-4238-8bff-200ed3652d1et-dhrhd55",
    context: [{
        "resourceType": "Bundle",
        "entry": [
            {
            "resource": {
                "resourceType": "Task",
                "status": "requested",
                "code": {
                "coding": [
                    { "system": "http://opencrvs.org/specs/types", "code": "BIRTH" }
                ]
                },
                "focus": {
                "reference": "Composition/e9e2ff8d-1eac-412b-8bbc-408e90276a3f"
                },
                "identifier": [
                {
                    "system": "http://opencrvs.org/specs/id/draft-id",
                    "value": "53fe6974-6140-4e50-afc7-998a9018709b"
                },
                {
                    "system": "http://opencrvs.org/specs/id/birth-tracking-id",
                    "value": "B6E6YJB"
                },
                {
                    "system": "http://opencrvs.org/specs/id/birth-registration-number",
                    "value": "2020B6E6YJB"
                }
                ],
                "extension": [
                {
                    "url": "http://opencrvs.org/specs/extension/contact-person",
                    "valueString": "MOTHER"
                },
                {
                    "url": "http://opencrvs.org/specs/extension/contact-relationship",
                    "valueString": ""
                },
                {
                    "url": "http://opencrvs.org/specs/extension/contact-person-phone-number",
                    "valueString": "+260965656563"
                },
                {
                    "url": "http://opencrvs.org/specs/extension/timeLoggedMS",
                    "valueInteger": 52942
                },
                {
                    "url": "http://opencrvs.org/specs/extension/regLastUser",
                    "valueReference": {
                    "reference": "Practitioner/c3355b48-7790-43c7-b8f0-10c7316f9bed"
                    }
                },
                {
                    "url": "http://opencrvs.org/specs/extension/regLastLocation",
                    "valueReference": {
                    "reference": "Location/1b4092e0-d391-45cd-89d4-162a81f0f63f"
                    }
                },
                {
                    "url": "http://opencrvs.org/specs/extension/regLastOffice",
                    "valueReference": {
                    "reference": "Location/4ec9c980-0b2f-436a-b49e-203e1e601620"
                    }
                }
                ],
                "lastModified": "2020-09-27T09:15:20.015Z",
                "businessStatus": {
                "coding": [
                    {
                    "system": "http://opencrvs.org/specs/reg-status",
                    "code": "REGISTERED"
                    }
                ]
                },
                "meta": {
                "lastUpdated": "2020-09-27T09:15:20.040+00:00",
                "versionId": "cfbefeac-bda0-4339-9745-9d54e7816c7d"
                },
                "id": "60ec435c-1370-4314-ab0b-f44507f0db24"
            }
            },
            {
            "resource": {
                "resourceType": "Patient",
                "active": true,
                "name": [{ "use": "en", "given": ["esrgstg"], "family": ["srthsrt"] }],
                "gender": "male",
                "birthDate": "2019-12-23",
                "multipleBirthInteger": 1,
                "meta": {
                "lastUpdated": "2020-09-27T09:15:20.166+00:00",
                "versionId": "9f5f1a5e-7059-4f5b-bf2f-8aa4f641b37c"
                },
                "id": "1e9ca16b-7c9a-469d-8101-ddd0db229077",
                "identifier": [
                { "type": "BIRTH_REGISTRATION_NUMBER", "value": "2020B6E6YJB" }
                ]
            }
            },
            {
            "resource": {
                "resourceType": "DocumentReference",
                "masterIdentifier": {
                "system": "urn:ietf:rfc:3986",
                "value": "d3240515-3d90-4f1a-bbb6-6530477565bd"
                },
                "status": "current",
                "content": [
                {
                    "attachment": {
                    "contentType": "image/png",
                    "data": "data:image/png;base64,iVBORw0KJLX..."
                    }
                }
                ],
                "type": {
                "coding": [
                    {
                    "system": "http://opencrvs.org/specs/supporting-doc-type",
                    "code": "NATIONAL_ID_FRONT"
                    }
                ]
                },
                "subject": { "display": "MOTHER" },
                "meta": {
                "lastUpdated": "2020-09-27T09:15:20.042+00:00",
                "versionId": "0307d10f-f2c1-42be-a0d3-b09c268a38cf"
                },
                "id": "bf503f30-1d0a-40dc-908f-9c0d5e9cdf23"
            }
            }
        ]
        }]
}
```

| Parameter                 | Sample value                                                      | Description                                                                                                     |
| ------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `payload.id`              | `531e9275-40e4-4ab5-a12c-6fa74d7b5b61`                            | The unique `id` for this webhook. Helpful when debugging.                                                       |
| `payload.timestamp`       | `2019-12-12T10:53:43-08:00`                                       | A timestamp identifying the time that the webhook was created                                                   |
| `payload.event.hub.topic` | `BIRTH_REGISTERED`                                                | A supported OpenCRVS event type string that triggered this webhook.                                             |
| `url`                     | `https://www.your-clever-domain-name.com/webhooks`                | The URL that is notified by this webhook                                                                        |
| `hmac`                    | `sha256=d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f` | The request signature that is created using your `sha_secret` explained below.                                  |
| `context`                 | `[{ ... }]`                                                       | The [FHIR resources](https://www.hl7.org/fhir/resource.html) bundle associated with the target of this webhook. |

#### **Validating Payloads**

We sign all Event Notification payloads with an HMAC **SHA256** hash and include the hash in the request's `hmac` property, preceded with `sha256=`. You should validate this against your `sha_secret` environment variable.

This [method](https://github.com/opencrvs/opencrvs-core/blob/c20e50af197be8e4423746a3bb1d4eb6cbe64353/packages/webhooks/src/features/event/service.ts#L19) shows how we create the signature to help you understand how you might create a similar hash and compare. You can confirm that this data is genuine.

To validate the payload in a similar way to our method:

Generate a **SHA256** signature using the `context` array contents at position \[0] as the `rawBody` . `signingSecret` is your OpenCRVS `sha_secret`, available to you as an environment variable and generated via the register step. `requestSigningVersion` is `"sha256"` Compare your signature to the `hmac` prop. If the signatures match, the payload is genuine.

Please note that we generate the signature using an escaped unicode version of the payload, with lowercase hex digits. If you just calculate against the decoded bytes, you will end up with a different signature. For example, the string `äöå` should be escaped to `\u00e4\u00f6\u00e5`.

#### **Responding to Event Notifications**

Your endpoint should respond to all Event Notifications with `200 OK HTTPS`.

**Frequency:** Be sure to adjust your servers to handle each Webhook individually and at any time.

Unacknowledged responses are retried according to the capabilities of our library used [bullmq](https://docs.bullmq.io/what-is-bullmq).

### Subscription process

Firstly, ensure that you have correctly configured your subscriber endpoint above to respond to **Verification Requests** and **Event Notifications**.

Next, your subscription service must request an Authorization Bearer token using your `client_id` and `client_secret`.

#### List available webhooks

This API returns webhooks that are owned by the authenticated client service

**URL**

```
GET https://webhooks.<your-open-crvs-host.com>/webhooks
```

#### **Request headers**

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### **Response payload**

Example json

```
{
  "entries": [
    {
        "id": "531e9275-40e4-4ab5-a12c-6fa74d7b5b61",
        "callback": "https://www.your-clever-domain-name.com/webhooks",
        "createdAt": "2019-12-12T10:53:43-08:00",
        "createdBy": {
            "client_id": "8636abe2-affb-4238-8bff-200ed3652d1e",
            "type": "api",
            "username": "sys.admin",
            "name": "Euan Millar"
        }
        "topic": "BIRTH_REGISTERED"
    }
  ]
}
```

#### Subscribe to a webhook

This API subscribes a client service to an OpenCRVS webhook using a supported OpenCRVS event type string as a trigger.

#### **URL**

```
POST https://webhooks.<your-open-crvs-host.com>/webhooks
```

#### **Request headers**

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### **Request payload**

```
{
    "hub": {
        "callback": "https://www.your-clever-domain-name.com/webhooks",
        "mode": "subscribe",
        "topic": "BIRTH_REGISTERED",
        "secret": "d04aec67-1ef4-467a-a5a8-fa5c89ad71ce"
    }

}

```

Parameters contained within the `hub` object:

| Parameter  | Sample value                                       | Description                                                                                                                                                                                  |
| ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `callback` | `https://www.your-clever-domain-name.com/webhooks` | The URL address that will be requested when the event occurs.                                                                                                                                |
| `mode`     | `subscribe`                                        | Always set to `subscribe` for this action.                                                                                                                                                   |
| `topic`    | `BIRTH_REGISTERED`                                 | A supported OpenCRVS event type string that will trigger this webhook.                                                                                                                       |
| `secret`   | `d04aec67-1ef4-467a-a5a8-fa5c89ad71ce`             | Your OpenCRVS `sha_secret`, available to you via the mediator [register](https://github.com/opencrvs/opencrvs.github.io/blob/master/website/docs/technology/technicalInteroperability) step. |

The supported events and associated topic string:

| Webhook event        | trigger            |
| -------------------- | ------------------ |
| `Birth registration` | `BIRTH_REGISTERED` |
| `Death registration` | `DEATH_REGISTERED` |
| `Birth certified`    | `BIRTH_CERTIFIED`  |
| `Death certified`    | `DEATH_CERTIFIED`  |
| `Birth corrected`    | `BIRTH_CORRECTED`  |
| `Death corrected`    | `DEATH_CORRECTED`  |

#### **Response payload**

The subscribe process will test the authenticity of the `sha_secret` and additionally make a test GET request to the **Verification Request**

Provided all is successfully completeed, your webhook will be subscribed and you will receive a **202** status code and empty response.

#### Unsubscribe to a webhook

This API unsubscribes a client service to an OpenCRVS webhook using the webhook id.

#### **URL**

```
DELETE https://webhooks.<your-open-crvs-host.com>/webhooks/<your-webhook-id>
```

#### **Request headers**

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### **Response**

**204** status code and an empty response will be returned when the webhook has been successfully deleted.

### Requesting the FHIR Composition for a birth event

The payload of the birth registration event webhook contains the [FHIR Composition](https://www.hl7.org/fhir/composition.html) id, that can be used to retrieve all subsequent details for the registration. So, subscribing to this webhook is good way to access all other details in the [OpenCRVS FHIR Documents](https://app.gitbook.com/o/zub8C4BetmW3a9Bj4Cd4/s/qI5B1zX9fZVx3HCjIY12/\~/changes/6pHhtQvucSfdH5ndyWpd/technology/interoperability/opencrvs-fhir-documents)

####
