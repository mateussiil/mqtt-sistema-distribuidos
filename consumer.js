const mqtt = require('mqtt');
var fs = require('fs');

const orderdata = fs.readFileSync('./order.json');
const orders = JSON.parse(orderdata);

const broker = mqtt.connect('mqtt://test.mosquitto.org/');

broker.on('connect', () => {
    broker.subscribe("sensor-temperatura", () => {
        console.log("sensor-temperatura subscribed!");
    });
});

broker.on('message', (topic, pedido) => {
    broker.emit()
    
    let order = {
    }
    
    order.data = JSON.parse(pedido)

    order.nPedido = orders.length + 1

    orders.push({ ...order })

    const jsonString = JSON.stringify(orders)

    fs.writeFile('./order.json', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })

    console.log(`    >>>>>>> Mensagem recebida do tópico ${topic} - pedido ${pedido}º`);
});