# Deriv API BFF Example

This repository provides an example configuration for the Deriv API Backend for Frontend (BFF) service. It offers a simple way to start working with this service, including setup instructions and configuration management.

## Getting Started

### Start the Service Locally

To start the service locally using Docker Compose, run the following command:

```sh
docker compose up
```

### Update Configuration

If you need to update the API configuration, you can upload the new configuration without restarting the service. Use the following command:

```sh 
docker compose run upload-api-config
```

### Example API Call

You can test the API using a WebSocket client. Here is an example of how to call the API:

```sh
wsget 'ws://localhost:8080?app_id=1089&l=en'
```

Use Enter to input the request and send it, and Ctrl+C to exit.

Example request:

```json
{
  "method": "aggregate",
  "params": {
    "country": "ru"
  }
}
```
