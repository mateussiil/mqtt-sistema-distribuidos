const mqtt = require('mqtt');
var fs = require('fs');

const broker = mqtt.connect('mqtt://test.mosquitto.org/');

var readlineSync = require('readline-sync');

var pedidos = []

const valorTotal = () => {
    console.log('Seu pedido está dando ' + pedidos.reduce((total, item) => {
        return total + (item.value);
    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
}

const delay = ms => new Promise(res => setTimeout(res, ms));

broker.on('connect', async () => {
    console.log("Conectado no broker MQTT");
    // while (true) {
    const order = connectionListener()
    console.log('Seu pedido')

    for ([index, item] of order.entries()) {
        console.log((index + 1) + '° - ' + item.name + ' de ' + item.value)
    }

    await broker.publish("sensor-temperatura", JSON.stringify(order));
    await delay(300); // 5 segundos
    broker.end()

});


const connectionListener = async () => {
    console.log("Estou conectado!");

    console.log("0 - Lista de comandos\n");
    comando = readlineSync.question('Digite o comando: ')

    while (true) {
        const order = fs.readFileSync('./foods.json');
        const foods = JSON.parse(order);

        if (comando === '0') {
            console.clear()

            console.log('--------Comandos--------');
            console.log("1 - Cardápio\n");
            console.log("2 - Carrinho\n");
            console.log("3 - Finalizar Pedido\n");
            console.log("\n");
            console.log("999 - Empresas\n");

            comando = readlineSync.question('Digite o comando: ')
        }
        if (comando === '1') {
            console.clear()
            console.log(`---------*Cardápio*---------`)
            let maiorName = 0
            let maiorValor = 0
            for (let i = 0; i < foods.length; i++) {
                if (maiorName < foods[i].name.length) {
                    maiorName = foods[i].name.length
                }
                if (maiorValor < foods[i].value.toString().length) {
                    maiorValor = foods[i].value.toString().length
                }
            }
            console.log(`Código - nome${' '.repeat(maiorName - 'nome'.length)} - valor\n`);
            for (let i = 0; i < foods.length; i++) {
                let value_extenso = foods[i].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                console.log(`${foods[i].index + 10}${' '.repeat(4)}- ${foods[i].name}${' '.repeat(maiorName - foods[i].name.length)} - ${value_extenso}${' '.repeat(maiorName - value_extenso.length)}`);
            }
            console.log(`\n`)
            comando = readlineSync.question('Escolha um item do cardapio, ou digite 0 para voltar para os comandos: ')
        }
        if (comando === '2') {
            console.clear()

            console.log(`---------*Carrinho*---------`)
            if (pedidos.length !== 0) {

                console.log('Você já comprou')
                pedidos = pedidos.filter(item => !!item.name)

                for (let i = 0; i < pedidos.length; i++) {
                    console.log(`${i} - ${pedidos[i].name}  ${pedidos[i].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
                }
                console.log(`\n`)

                valorTotal()

                console.log(`\n`)
                comando = readlineSync.question('Você deseja excluir algum item? Digite 4 para sim. Digite 0 para não: ')
            } else {
                console.log('Você ainda não comprou nada')
                console.log(`\n`)

                comando = readlineSync.question('Digite 0 para listar os comandos, ou 1 para comprar: ')
            }
        }
        if (comando === '3') {
            valorTotal()
            console.log(`\n`)
            break
        }

        if (comando === '5') {
            console.clear()

            console.log(`Qual você quer excluir\n`);

            for (let i = 0; i < pedidos.length; i++) {
                console.log(`${i + 100} - ${pedidos[i].name}`);
            }
            console.log(`\n`)
            comando = readlineSync.question('Qual item você deseja excluir: ')
        }

        if (comando >= 100 && comando < pedidos.length + 100) {
            console.clear()
            console.log(`Item ${pedidos[comando - 100].name} excluído`);
            pedidos.splice(comando - 100, 1)
            console.log("0 - Lista de comandos\n");
            console.log(`\n`)
            comando = readlineSync.question('Digite 0 para listar os comandos: ')
        }

        if ((comando >= 11) && (comando <= foods.length + 10)) {
            console.clear()

            console.log(`Otimo Pedido, um(a) ${foods[comando - 11].name} de ${foods[comando - 11].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
            pedidos.push(foods[comando - 11])
            console.log("\n");
            comando = readlineSync.question('Digite 0 para listar os comandos, ou 1 para comprar de novo: ')
        }
        if (comando === '999') {
            console.clear()
            console.log("-----**-Novo Item-**-----\n");
            console.log('Para um novo item basta digitar dessa forma "novo;nome;valor"\n');
            console.log("-----**-Remover Item-**-----\n");
            console.log('Para um remover item basta digitar  "remover"\n');
            console.log('Onde novas instruçoes serão dadas\n');
            comando = readlineSync.question('Digite 0 para listar os comandos, ou 1 para comprar de novo: ')
        }

        if (comando.match('novo')) {
            let array = comando.split(';');
            var numberPattern = /\d+/g;
            let food = {
                name: array[1],
                value: Number(array[2].match(numberPattern))
            };
            console.log(foods[foods.length -1 ])
            food.index = foods[foods.length -1 ].index + 1
            foods.push({ ...food })
            const jsonFood = JSON.stringify(foods)
            fs.writeFileSync('./foods.json', jsonFood, err => {
                if (err) {
                    console.log('Error writing file', err)
                } else {
                    console.log('Successfully wrote file')
                }
            })
            console.clear()
            for (let i = 0; i < foods.length; i++) {
                let value_extenso = foods[i].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                console.log(`${foods[i].index }- ${foods[i].name} - ${value_extenso}`);
            }
            comando = readlineSync.question('Digite 0 para listar os comandos:  ')
        }
        if (comando.match('remover')) {
            let array = comando.split(';');
            console.clear()
            console.log('Digito o codigo do produto\n');
            let maiorName = 0
            let maiorValor = 0
            for (let i = 0; i < foods.length; i++) {
                if (maiorName < foods[i].name.length) {
                    maiorName = foods[i].name.length
                }
                if (maiorValor < foods[i].value.toString().length) {
                    maiorValor = foods[i].value.toString().length
                }
            }
            
            console.log(`Código - nome${' '.repeat(maiorName - 'nome'.length)} - valor\n`);

            for (let i = 0; i < foods.length; i++) {
                let value_extenso = foods[i].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                console.log(`${foods[i].index + 200}${' '.repeat(4)}- ${foods[i].name}${' '.repeat(maiorName - foods[i].name.length)} - ${value_extenso}${' '.repeat(maiorName - value_extenso.length)}`);
            }
            comando = readlineSync.question('Digite o código do item pra remover ou 0 pra voltar:  ')
        }
        if (comando >= 200 && comando < foods.length + 200) {
            console.clear()
            console.log(`Item ${foods[comando - 201].name} excluído`);

            foods.splice(comando - 201, 1)
            const jsonFood = JSON.stringify(foods)
            fs.writeFileSync('./foods.json', jsonFood, err => {
                if (err) {
                    console.log('Error writing file', err)
                } else {
                    console.log('Successfully wrote file')
                }
            })
            console.clear()
            for (let i = 0; i < foods.length; i++) {
                let value_extenso = foods[i].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                console.log(`${foods[i].name} - ${value_extenso}`);
            }
            console.log("\n");
            console.log(`\n`);
            comando = readlineSync.question('Digite 0 para listar os comandos: ')
        }
    }

    const valor_total = pedidos.reduce((total, item) => {
        return total + (item.value);
    }, 0)

    return pedidos
}

