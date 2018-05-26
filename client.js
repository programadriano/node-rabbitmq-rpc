const amqp = require('amqplib/callback_api');
const uuid = require('uuid');

const id = process.argv.slice(2);


amqp.connect('amqp://localhost:5672', (err, conn) => {

    conn.createChannel((err, ch) => {
        ch.assertQueue('', { exclusive: true }, (err, q) => {

            const corr = uuid();
            console.log(` [x] Requesting user ${id}`);

           
            ch.sendToQueue('rpc_queue',
                new Buffer(id.toString()),
                { correlationId: corr, replyTo: q.queue });

            ch.consume(q.queue, (msg) => {
                if (msg.properties.correlationId === corr) {
                    console.log(` [.] Got ${msg.content.toString()}`);
                    setTimeout(function () { conn.close(); process.exit(0) }, 500);
                }
            }, { noAck: true });


        });
    });


})