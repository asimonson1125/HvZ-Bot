import fetch from 'node-fetch';

export async function getJSON(url){
    let response, processed;
    response = await fetch(url)
    processed = await response.json()
    return(processed);
}