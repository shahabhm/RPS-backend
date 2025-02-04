import mqtt from "mqtt";

const mqttClient = mqtt.connect(process.env.RABBIT_URI, {username: process.env.RABBIT_USER, password: process.env.RABBIT_PASSWORD});

interface IMQTTHandlers {
    capture_parameter(device_id: string, parameter: string, value: number): Promise<void>;
}

let applicationMethods: IMQTTHandlers;

const start = function (handlers: IMQTTHandlers) : void {
    applicationMethods = handlers;
    // Subscribe to a topic
    mqttClient.on('connect', () => {
        console.log('Connected to RabbitMQ MQTT');
        mqttClient.subscribe('testing', (err) => {
            if (!err) {
                console.log('Subscribed to topic');
            } else {
                console.error('Subscription error:', err);
            }
        });
    });
}

// Handle incoming messages
mqttClient.on('message', async (topic, message) => {
    try {
        const message_parts = message.toString().split(',');
        const [device_id, parameter, value] = message_parts;
        await applicationMethods.capture_parameter(device_id, parameter, parseFloat(value));
    } catch (e) {
        console.error(e);
    }
});