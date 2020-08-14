import { Message } from "node-nats-streaming";
import { Listener, TicketCreatedEvent, Subjects } from "@coboard/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
		const { title, price, id } = data;

		const ticket = Ticket.build({
			title,
			price,
			id,
		});

		await ticket.save();

		msg.ack();
	}
}
