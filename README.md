# NodeJs Starter Auth

This project is a starter node that contain all endpoints for authentication management.

The elements that we used are:
- Docker for local development
- Postgresql for database management
- Redis for cache management
- JWT for authentication management
- Mailhog for email management
- Express for web server management
- Jest for testing
- gitlab ci for continuous integration

## Installation

In order to start this project, you just need to have docker installed and running.

And do the following commands:

```Bash
make install
make start
```

Then you can call all the endpoints.

## Testing

You can also run test with the following command:

```Bash
make test-back
```
