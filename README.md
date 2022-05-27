# iot-adapter

*iot-adapter* is a component, part of *iot-pmed-workspace*

For more details about the *iot-pmed-workspace* check [iot-pmed-workspace](https://github.com/PharmaLedger-ImI/iot-pmed-workspace).

## Installation
### Step 1: Clone the repository

```sh
$ git clone https://github.com/PharmaLedger-IMI/iot-adapter.git
```
After the repository was cloned, you must install all the dependencies.

```sh
$ npm run dev-install 
```

### Step 2: Customize the env.json
There are no defaults for **STORAGE_API_BASE_URL**, **STORAGE_API_APP_ID** and **STORAGE_API_REST_API_KEY**. Please fill them with provided configs from your business.

### Step 3: Start the iot-adapter

```sh
$ npm run iot-adapter-server 
```