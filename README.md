# Handover Report Builder

The aim of this tool is to simplify the creation of the handover report
for the invoice that we send for processing every month.

Based on the configuration file, the application can create a PDF of the
report according to predefined parameters.

## Requirements

* Git
* [Node.js](https://nodejs.org/en/download) 18+
* [Yarn](https://yarnpkg.com)

## Installation

Clone repository and install packages.

```shell
git clone https://github.com/martinveverka/handover-report-builder
cd handover-report-builder
yarn install
```

## Run

Copy sample configuration file and edit the default parameters.

```shell
cp config.dist.yml config.yml
edit config.yml
```

Available options are described for each parameter directly
in the configuration file.

Then create a report using the build command.

```shell
yarn build
```

If you are going to create an order history, you can create a specific
report by specifying a parameter to the build command.

```shell
yarn build 2020-03
```
