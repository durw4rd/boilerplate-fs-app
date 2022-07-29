import express from 'express';
import cors from 'cors';
import * as ld from 'launchdarkly-node-server-sdk';
import { join } from 'path';

import { App_Name } from '@my-app/common';
const clientPath = '../../client/build';
const app = express();
app.use(cors());
const port = 8080; // default port to listen

// Serve static resources from the "public" folder (ex: when there are images to display)
app.use(express.static(join(__dirname, clientPath)));

app.get('/api', (req, res) => {
    res.send(`Hello ${App_Name}, From server`);
});

// Serve the HTML page
app.get('*', (req: any, res: any) => {
    res.sendFile(join(__dirname, clientPath, 'index.html'));
});

// start the Express server
app.listen(port, () => {
    console.log(`app ${App_Name} started at http://localhost:${port}` );

    const LDClient = ld.init('sdk-b9bfe0c9-8339-4bcc-83bc-3c42830a6b2e');
    let user = {
        "key": "hash#123",
        "name": "Server User One"
    };

    LDClient.waitForInitialization().then( () => {
        console.log("LD Client is ready");
        const allFlags = LDClient.allFlagsState(user, { "withReasons": true }, (err, LDFlagsState) => {
            console.log(LDFlagsState);
            const flagsJSON = LDFlagsState.toJSON();
            console.log(flagsJSON);

            console.log(LDFlagsState.getFlagReason("multivariate-flag"));
        });
        const singleFlag = LDClient.variation("multivariate-flag", user, false, (err, flagValue) => {
            console.log(flagValue);
        });
    }).catch(function(error) {
        console.log("SDK failed to initialize: " + error);
        process.exit(1);
    });;
});