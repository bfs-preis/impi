import * as xmlbuilder from 'xmlbuilder';
import * as moment from 'moment';
import { v1 as uuid } from 'uuid';

/*
<?xml version="1.0" encoding="UTF-8"?>
    <eCH-0090:envelope version="1.0" xmlns:eCH-0090="http://www.ech.ch/xmlns/eCH-0090/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.ech.ch/xmlns/eCH-0090/1 http://www.ech.ch/xmlns/eCH-0090/1/eCH-0090-1-0.xsd">
        <eCH-0090:messageId>35150721878051</eCH-0090:messageId>
        <eCH-0090:messageType>1025</eCH-0090:messageType>
        <eCH-0090:messageClass>0</eCH-0090:messageClass>
        <eCH-0090:senderId>4-802346-0</eCH-0090:senderId>
        <eCH-0090:recipientId>4-213246-6</eCH-0090:recipientId>
        <eCH-0090:eventDate>2018-02-19T02:23:07</eCH-0090:eventDate>
        <eCH-0090:messageDate>2018-02-19T02:23:07</eCH-0090:messageDate>
    </eCH-0090:envelope>

*/
export function createSedexEnvelope(senderId: string, messageId: string) {

    let messageDate = moment().format('YYYY-MM-DD[T]HH:mm:ss');

    let env = xmlbuilder.create('eCH-0090:envelope', { encoding: 'utf-8' })
        .att({
            'xmlns:eCH-0090': 'http://www.ech.ch/xmlns/eCH-0090/1',
            'version': '1.0',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': 'http://www.ech.ch/xmlns/eCH-0090/1 http://www.ech.ch/xmlns/eCH-0090/1/eCH-0090-1-0.xsd'
        })
        .ele('eCH-0090:messageId', messageId).up()
        .ele('eCH-0090:messageType', '1086').up()
        .ele('eCH-0090:messageClass', '0').up()
        .ele('eCH-0090:senderId', senderId).up()
        .ele('eCH-0090:recipientId', '4-213246-6').up()
        .ele('eCH-0090:eventDate', messageDate).up()
        .ele('eCH-0090:messageDate', messageDate).up()

    return env.end({ pretty: true });
}