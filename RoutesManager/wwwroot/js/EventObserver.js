
const EventType = {
    // layer/drawing events
    BEFORE_SAVE_LAYER: 'BEFORE_SAVE_LAYER',
    SAVE_LAYER: 'SAVE_LAYER',
    LAYER_SAVED: 'LAYER_SAVED',
    CLICK_LAYER: 'CLICK_LAYER',

    // map events
    MAP_LOADED: 'MAP_LOADED',

    // menu events
    SHOW_ALL_LAYERS: 'SHOW_ALL_LAYERS'
}

class EventObserver {
    constructor() {
        this.subscribers = {
            BEFORE_SAVE_LAYER: [],
            SAVE_LAYER: [],
            LAYER_SAVED: [],
            CLICK_LAYER: [],

            MAP_LOADED: [],

            SHOW_ALL_LAYERS: []
        };
    }

    subscribe(fn, eventType) {
        this.subscribers[eventType].push(fn);
    }

    broadcast(eventType, args) {
        console.log(`${eventType} event broadcast by EventObserver`);
        var eventSubscribers = this.subscribers[eventType];
        for (var i = 0; i < eventSubscribers.length; i++) {
            eventSubscribers[i](args);
        }
    }
}