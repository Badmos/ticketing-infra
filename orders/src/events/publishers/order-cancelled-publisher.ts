import { Publisher, Subjects, OrderCancelledEvent } from "@coboard/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
