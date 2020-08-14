import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order } from "./orders";
import { OrderStatus } from "@coboard/common";

//add an id attribute to ticketAttr so we can assign it as a value to _id
// Assigning value to _id will stop us from
interface TicketAttrs {
	title: string;
	price: number;
	id: string;
}

export interface TicketDoc extends mongoose.Document {
	title: string;
	price: number;
	version: number;
	isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
	findByEvent(event: { id: string; version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

//add an _id (emitted by event) field so mongoose does not automatically create a new _id
ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket({
		_id: attrs.id,
		title: attrs.title,
		price: attrs.price,
	});
};

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
	return Ticket.findOne({
		_id: event.id,
		version: event.version - 1,
	});
};

ticketSchema.methods.isReserved = async function () {
	const exisitingOrder = await Order.findOne({
		ticket: this,
		status: {
			$in: [OrderStatus.AwaitingPayment, OrderStatus.Created, OrderStatus.Complete],
		},
	});

	return !!exisitingOrder; // you can also use the Boolean(existingOrder) notation.
	//That's more readable
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
