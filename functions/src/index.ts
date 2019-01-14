import * as functions from 'firebase-functions';
import { dialogflow, SimpleResponse, RichResponse, Table, DialogflowConversation, Contexts, BrowseCarouselItem, Image, BrowseCarousel } from 'actions-on-google';
import * as request from 'request-promise-native';
import { BASE_URL, STEAM_URL, IMAGE_URL, TOP_GAMES } from './constants';
const app = dialogflow({ debug: true, });

const getTopGames = async (number: number) => {
    try{
        const response = JSON.parse(await request.get(BASE_URL + TOP_GAMES));
        const games = [];
        let carouselItems = [];
        let counter = 0;
        for(const appId of response){
            const game = response.appId;
            if(counter < number){
                const image = new Image({
                    url: IMAGE_URL.replace('~appid~', appId),
                    alt: game.name,
                });
                carouselItems.push(new BrowseCarouselItem({
                    title: game.name,
                    description: `${game.name} was developed by ${game.developer} and published by ${game.publisher} and costs ${game.price / 100}$. The current score rank is ${game.score_rank}`,
                    url: STEAM_URL + appId,
                    image,
                }));
                counter++;
            }else{
                break;
            }
            if(counter % 10 === 0){
                games.push(new BrowseCarousel({
                    items: carouselItems,
                }));
                carouselItems = [];
            }
        }
        return games;
    }catch(e){
        return e.message;
    }
}

app.intent('top 10', async (conv: DialogflowConversation, { number }) => {
    if(number > 0 && number <= 100){
        const games = await getTopGames(number as number);
        if(typeof games !== 'string'){
            conv.add(new RichResponse({
                items: games,
            }));
        }else{
            conv.close(new SimpleResponse({
                speech: games.toString() + 'https',
                text: games.toString() + 'https',
            }));
        }
    }else{
        conv.ask(new SimpleResponse({
            text: 'I am sorry. I can only give you the top games between 1 and 100 😞',
            speech: 'I am sorry. I can only give you the top games between 1 and 100',
        }));
    }
});

export const fulfillment = functions.https.onRequest(app);