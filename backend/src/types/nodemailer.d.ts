declare module 'nodemailer' {
  export function createTransport(options: any): any;
  export interface Transporter {
    sendMail(options: any): Promise<any>;
  }
}
