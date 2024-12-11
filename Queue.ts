import {  Message } from "./Database";

export class Queue {
    private messages: Message[];
    private lockedKeys: Set<string>; // Tracks Database Key currently being processed

    constructor() {
        this.messages = [];
        this.lockedKeys = new Set();
    }

    // Adds a new message to the queue
    Enqueue = (message: Message): void => {
        this.messages.push(message);
    };

    // dequeues a message for a worker if available and locks it
    Dequeue = (workerId: number): Message | undefined => {
        for (const message of this.messages) {
            // Skip if Database key is locked or the item is already being processed
            if (!this.lockedKeys.has(message.key)) {
                this.lockedKeys.add(message.key); // Lock the DB key
                return message;
            }
        }
        return undefined; // returns when there are no available messages left to process
    };

    // Confirms that the worker has finished processing of the message and removes it from the queue
    Confirm = (workerId: number, messageId: string): void => {
        const index = this.messages.findIndex(
            (message: Message) => message.id === messageId
        ); // finds the index of the message from messages array
        if (index !== -1) {
            const message = this.messages[index];
            this.lockedKeys.delete(message.key); // Unlock DB key so workers can process this DB key once again
            this.messages.splice(index, 1); // Remove the processed message
        }
    };

    // Returns the number of messages left
    Size = (): number => {
        return this.messages.length;
    };
}
