declare module 'imapflow' {
  export class ImapFlow {
    constructor(opts: any);
    connect(): Promise<void>;
    logout(): Promise<void>;
    mailboxOpen(mailbox: string, opts?: any): Promise<any>;
    getMailboxLock(mailbox: string): Promise<{ release(): void }>;
    fetch(query: any, fields?: any, opts?: any): AsyncIterable<any>;
  }
}
