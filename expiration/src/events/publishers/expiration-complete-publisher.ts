import { Publisher, ExpirationCompleteEvent, Subjects } from "@coboard/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
