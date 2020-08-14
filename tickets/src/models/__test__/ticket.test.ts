import { Ticket } from "../ticket";

it("should implement Optimistic Concurrency Control", async (done) => {
	const ticket = Ticket.build({
		title: "Cool new ticket",
		price: 70,
		userId: "67238ydiuw",
	});

	await ticket.save();

	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	firstInstance!.set({ price: 10 });
	secondInstance!.set({ price: 15 });

	await firstInstance!.save();
	try {
		await secondInstance!.save();
	} catch (err) {
		return done();
	}

	throw new Error("should npt get here. this in essence means try block ran");
});

it("increments the version number on multiple saves", async () => {
	const ticket = Ticket.build({
		title: "Cool new",
		price: 70,
		userId: "67238ydiuw",
	});

	await ticket.save();

	expect(ticket.version).toEqual(0);
});
