export const maxObjectImageSize = 200;

export const delay = delayTime => new Promise(res =>setTimeout(res, 1000 + delayTime * 1000));

export const until = conditionFn => {
    const poll = resolve => {
        if (conditionFn()) resolve();
        else setTimeout(_ => poll(resolve), 10);
    }
    return new Promise(poll);
};

export const getRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;