const mqtt = require('mqtt');
var fs = require('fs');


const broker = mqtt.connect('mqtt://test.mosquitto.org/');

broker.on('connect', () => {
    broker.subscribe("mqtt", () => {
        console.log("mqtt subscribed!");
    });
});

broker.on('message', (topic, pedido) => {

    const orderdata = fs.readFileSync('./order.json');
    const orders = JSON.parse(orderdata);

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
            console.log(`Pedido cadastrado!`);
        }
    })
   
});