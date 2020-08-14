import { Subjects, Publisher, TicketUpdatedEvent } from "@coboard/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
