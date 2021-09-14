import fetch from 'node-fetch';

export async function getJSON(url) {
    let response, processed;
    let success = false;
    while (!success) {
        try {
            response = await fetch(url);
            processed = await response.json();
            success = true;
        }
        catch (e) {
            console.log(`API err: ${e}`);
        }
    }

    return (processed);
}