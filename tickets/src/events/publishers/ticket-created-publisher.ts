import { Subjects, Publisher, Listener, TicketCreatedEvent } from "@coboard/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
