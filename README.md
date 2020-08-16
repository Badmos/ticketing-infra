# Tigate

Tigate is a ticketing gateway infrastructure that lets organizations and users instantly create custom tickets, manage them and pay for the tickets without the need to deploy Human capital and Engineering time 

## Installation

Follow the steps to use this project locally 

1. Fork this repository and install Docker locally
2. Change the docker username name in the deployment files the infra/k8s folder
3. Build the docker image for each service and push to Docker Hub.
4. Install [skaffold](https://skaffold.dev/) and once you're all set setting up skaffold locally, run the command below

```bash
skaffold dev
```

## Tests

To test each endpoint, publisher and listener, run the command below locally:
```bash
npm run test
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)