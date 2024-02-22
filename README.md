# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn dev
```


yarn install --frozen-lockfile
yarn tsc
yarn build:backend --config ../../app-config.yaml
sudo docker image build . -f packages/backend/Dockerfile --tag backstage
sudo docker run -it -p 7007:7007 backstage