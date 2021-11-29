## Description

\-

### Endpoint path

```
GET /endpoint/path/{id}
```

### Query Parameters

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| paramname | required |`integer` | param description |

### Headers

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| Authorization | required |`string` | Bearer JWT |

### Request body

```jsonc
{
  "foo": "bar"
}
```

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| foo | required |`string` | param description |

### Responses

#### 200 Response
```jsonc
{
  "foo": "bar"
}
```

| Property | Type | Description |
|----------|------|-------------|
| foo | `string` | field description |


#### 404 Response

```jsonc
{
    "message": "Error message", // FR: Message d'erreur
    "code": "error-code",
    "statusCode": 404
}
```

## Business Value

### What BV does the feature/change delivers to our Product and the Customer?
\-

### Who is the stakeholder for the feature/change?
\-

### Why the feature/change should be implemented?
\-

## Implementation Details

### Implementation Plan

\-

### 3rd Party Integrations

\-

### Devops / Architecture

\-

## For QA

**[ADN Documentation](https://vizmediaeurope.gitlab.io/adn-api-documentation/)**

\-

## DOR & DOD

### Definition of Ready (DOR)

Ticket is ready to develop when:

* [ ]  All points are filled.
* [ ]  Ticket estimated.
* [ ]  All dependencies are fulfilled.


### Definition of Done (DOD)

Ticket can be done when:

* [ ]  CR approved by at least 2 developers (one from ADN and one from NG)
* [ ]  Documentation is updated
* [ ]  Ticket is approved by QA and Client

/label ~backend ~"for grooming"
