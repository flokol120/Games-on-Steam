import * as functions from 'firebase-functions';
import { dialogflow, SimpleResponse, RichResponse, Table, DialogflowConversation, Contexts } from 'actions-on-google';
const app = dialogflow(/*{ debug: true, }*/);

export const fulfillment = functions.https.onRequest(app);