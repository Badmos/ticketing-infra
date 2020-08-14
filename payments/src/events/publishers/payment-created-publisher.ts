import { Publisher, PaymentCreatedEvent, Subjects } from "@coboard/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
